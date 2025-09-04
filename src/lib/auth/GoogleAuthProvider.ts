import { BaseAuthProvider } from './BaseAuthProvider';
import { User, AuthError } from '@/types/auth';

export class GoogleAuthProvider extends BaseAuthProvider {
  private clientId: string;

  constructor() {
    super();
    this.clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';
    
    if (typeof window !== 'undefined') {
      this.handleOAuthCallback();
    }
  }

  private handleOAuthCallback() {
    // Vérifier si on revient d'OAuth callback
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    const error = urlParams.get('error');

    if (error) {
      console.error('OAuth error:', error);
      this.handleOAuthError(error);
      return;
    }

    if (code && state) {
      console.log('🔍 DEBUG: OAuth callback detected with code:', code);
      this.exchangeCodeForToken(code, state);
    }
  }

  private handleOAuthError(error: string) {
    const errorMessages: { [key: string]: string } = {
      'access_denied': 'Connexion annulée par l\'utilisateur',
      'invalid_request': 'Requête OAuth invalide',
      'unsupported_response_type': 'Configuration OAuth incorrecte',
      'invalid_scope': 'Permissions demandées invalides',
      'server_error': 'Erreur serveur Google temporaire',
      'temporarily_unavailable': 'Service Google temporairement indisponible'
    };

    const userMessage = errorMessages[error] || 'Erreur de connexion Google';
    console.error('OAuth Error:', userMessage);
    
    // Nettoyer l'URL et rediriger vers la page auth avec erreur
    window.history.replaceState({}, document.title, window.location.pathname);
    
    // Stocker l'erreur pour l'affichage
    localStorage.setItem('oauth_error', userMessage);
    
    if (window.location.pathname !== '/auth') {
      window.location.href = '/auth';
    }
  }

  private async exchangeCodeForToken(code: string, state: string) {
    try {
      console.log('🔍 DEBUG: Exchanging code for token');
      
      // Vérifier le state pour la sécurité
      const storedState = localStorage.getItem('oauth_state');
      if (state !== storedState) {
        throw new Error('État OAuth invalide - possible attaque CSRF');
      }

      const response = await fetch('/api/auth/callback/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          redirect_uri: this.getRedirectUri()
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de l\'échange du code');
      }

      const data = await response.json();
      const user: User = {
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
        picture: data.user.picture,
        provider: 'google'
      };

      this._currentUser = user;
      this._isAuthenticated = true;
      this._accessToken = data.access_token;
      this._refreshToken = data.refresh_token;

      // Sauvegarder dans localStorage
      localStorage.setItem('auth_user', JSON.stringify(user));
      localStorage.setItem('auth_token', data.access_token);
      localStorage.setItem('auth_refresh_token', data.refresh_token || '');
      localStorage.setItem('auth_provider', 'google');
      
      // Nettoyer les données temporaires
      localStorage.removeItem('oauth_state');
      localStorage.removeItem('oauth_error');

      // Nettoyer l'URL
      window.history.replaceState({}, document.title, window.location.pathname);

      console.log('🔍 DEBUG: Authentication successful, redirecting...');
      
      // Rediriger vers la page d'origine ou l'accueil
      const returnUrl = localStorage.getItem('oauth_return_url') || '/';
      localStorage.removeItem('oauth_return_url');
      window.location.href = returnUrl;

    } catch (error) {
      console.error('Token exchange error:', error);
      this.handleOAuthError('server_error');
    }
  }

  private getRedirectUri(): string {
    return `${window.location.origin}/auth`;
  }

  private generateOAuthUrl(): string {
    const state = this.generateRandomString(32);
    localStorage.setItem('oauth_state', state);
    localStorage.setItem('oauth_return_url', window.location.pathname);

    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.getRedirectUri(),
      response_type: 'code',
      scope: 'openid email profile https://www.googleapis.com/auth/drive.file',
      state,
      access_type: 'offline',
      prompt: 'consent'
    });

    const oauthUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    console.log('🔍 DEBUG: Generated OAuth URL:', oauthUrl);
    console.log('🎯 REDIRECT_URI UTILISÉ:', this.getRedirectUri());
    console.log('🔑 SCOPES DEMANDÉS:', params.get('scope'));
    console.log('📋 URL QUERY PARAMS:', params.toString());
    
    return oauthUrl;
  }

  private generateRandomString(length: number): string {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return result;
  }

  async signIn(): Promise<User> {
    return new Promise((resolve, reject) => {
      try {
        console.log('🔍 DEBUG: Starting Google OAuth redirect flow');
        console.log('🔍 DEBUG: Client ID:', this.clientId);
        console.log('🔍 DEBUG: Redirect URI:', this.getRedirectUri());

        // Vérifier si on a déjà une session active
        if (this._isAuthenticated && this._currentUser) {
          console.log('🔍 DEBUG: Already authenticated, returning current user');
          resolve(this._currentUser);
          return;
        }

        const oauthUrl = this.generateOAuthUrl();
        
        // Stocker les callbacks pour après la redirection
        localStorage.setItem('oauth_pending', 'true');
        
        console.log('🔍 DEBUG: Redirecting to Google OAuth...');
        
        // Redirection complète vers Google OAuth
        window.location.href = oauthUrl;
        
        // Cette partie ne s'exécutera pas car on redirige
        // mais on la garde pour la compatibilité avec l'interface
        setTimeout(() => {
          if (!this._isAuthenticated) {
            reject(new Error('Timeout - redirection OAuth'));
          }
        }, 1000);

      } catch (error) {
        console.error('Sign in error:', error);
        reject(this.handleError(error));
      }
    });
  }

  async signOut(): Promise<void> {
    try {
      this._currentUser = null;
      this._isAuthenticated = false;
      this._accessToken = null;
      this._refreshToken = null;

      localStorage.removeItem('auth_user');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_refresh_token');
      localStorage.removeItem('auth_provider');
      localStorage.removeItem('oauth_state');
      localStorage.removeItem('oauth_return_url');
      localStorage.removeItem('oauth_pending');

    } catch (error) {
      throw this.handleError(error);
    }
  }

  async refreshAccessToken(): Promise<string> {
    try {
      if (!this._refreshToken) {
        throw new Error('Pas de refresh token disponible');
      }

      const response = await fetch('/api/auth/refresh/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refresh_token: this._refreshToken
        })
      });

      if (!response.ok) {
        throw new Error('Erreur lors du renouvellement du token');
      }

      const data = await response.json();
      this._accessToken = data.access_token;
      
      localStorage.setItem('auth_token', data.access_token);

      return data.access_token;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Méthode pour restaurer l'état depuis le localStorage
  async restoreSession(): Promise<boolean> {
    try {
      const user = localStorage.getItem('auth_user');
      const token = localStorage.getItem('auth_token');
      const refreshToken = localStorage.getItem('auth_refresh_token');
      const provider = localStorage.getItem('auth_provider');

      if (user && token && provider === 'google') {
        this._currentUser = JSON.parse(user);
        this._accessToken = token;
        this._refreshToken = refreshToken;
        this._isAuthenticated = true;
        return true;
      }

      return false;
    } catch (error) {
      console.error('Erreur lors de la restauration de session:', error);
      return false;
    }
  }
}