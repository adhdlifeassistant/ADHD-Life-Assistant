import { BaseAuthProvider } from './BaseAuthProvider';
import { User } from '@/types/auth';

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
    console.log('🔍 FRONTEND DEBUG: handleOAuthCallback() called');
    console.log('🔍 FRONTEND DEBUG: Current URL:', window.location.href);
    console.log('🔍 FRONTEND DEBUG: Search params:', window.location.search);
    
    // Vérifier si on revient d'OAuth callback
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    const error = urlParams.get('error');

    console.log('🔍 FRONTEND DEBUG: URL params - code:', !!code, 'state:', !!state, 'error:', error);

    if (error) {
      console.error('❌ FRONTEND DEBUG: OAuth error in URL:', error);
      this.handleOAuthError(error);
      return;
    }

    if (code && state) {
      console.log('✅ FRONTEND DEBUG: OAuth callback detected! Starting token exchange...');
      console.log('✅ FRONTEND DEBUG: Code length:', code.length);
      this.exchangeCodeForToken(code, state);
    } else {
      console.log('ℹ️ FRONTEND DEBUG: No OAuth callback detected (no code/state in URL)');
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
    
    // Plus besoin de rediriger vers /auth - l'erreur sera gérée sur /settings
    console.log('🔍 DEBUG: OAuth error stored, will be handled by current page');
  }

  private async exchangeCodeForToken(code: string, state: string) {
    try {
      console.log('🔄 FRONTEND DEBUG: Starting exchangeCodeForToken');
      console.log('🔄 FRONTEND DEBUG: Code length:', code?.length);
      console.log('🔄 FRONTEND DEBUG: State:', state);
      
      // Vérifier le state pour la sécurité
      const storedState = localStorage.getItem('oauth_state');
      console.log('🔄 FRONTEND DEBUG: Stored state:', storedState);
      console.log('🔄 FRONTEND DEBUG: Received state:', state);
      console.log('🔄 FRONTEND DEBUG: State match:', state === storedState);
      
      if (state !== storedState) {
        console.error('❌ FRONTEND DEBUG: CSRF State mismatch!');
        throw new Error('État OAuth invalide - possible attaque CSRF');
      }

      const requestBody = {
        code,
        state,
        redirect_uri: this.getRedirectUri()
      };
      
      console.log('📤 FRONTEND DEBUG: Sending request to /api/auth/callback/google/');
      console.log('📤 FRONTEND DEBUG: Request body:', requestBody);

      const response = await fetch('/api/auth/callback/google/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      console.log('📡 FRONTEND DEBUG: Response status:', response.status);
      console.log('📡 FRONTEND DEBUG: Response ok:', response.ok);

      if (!response.ok) {
        console.error('❌ FRONTEND DEBUG: Response not ok');
        const errorData = await response.json().catch(e => {
          console.error('❌ FRONTEND DEBUG: Failed to parse error response:', e);
          return { error: 'Failed to parse error response' };
        });
        console.error('❌ FRONTEND DEBUG: Error data from server:', errorData);
        throw new Error(errorData.error || 'Erreur lors de l\'échange du code');
      }

      console.log('✅ FRONTEND DEBUG: Response OK, parsing JSON...');
      const data = await response.json();
      console.log('📥 FRONTEND DEBUG: Received data from server:', {
        success: data.success,
        user: !!data.user,
        access_token: !!data.access_token,
        refresh_token: !!data.refresh_token
      });
      console.log('👤 FRONTEND DEBUG: Creating user object...');
      const user: User = {
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
        picture: data.user.picture,
        provider: 'google'
      };
      console.log('👤 FRONTEND DEBUG: User object created:', user);

      console.log('💾 FRONTEND DEBUG: Updating internal state...');
      this._currentUser = user;
      this._isAuthenticated = true;
      this._accessToken = data.access_token;
      this._refreshToken = data.refresh_token;
      console.log('💾 FRONTEND DEBUG: Internal state updated - isAuthenticated:', this._isAuthenticated);

      console.log('💾 FRONTEND DEBUG: Saving to localStorage...');
      // Sauvegarder dans localStorage avec timestamp
      localStorage.setItem('auth_user', JSON.stringify(user));
      localStorage.setItem('auth_token', data.access_token);
      localStorage.setItem('auth_refresh_token', data.refresh_token || '');
      localStorage.setItem('auth_provider', 'google');
      localStorage.setItem('auth_token_timestamp', Date.now().toString());
      console.log('💾 FRONTEND DEBUG: Data saved to localStorage with timestamp:', Date.now());
      
      // Vérification immédiate localStorage
      console.log('🔍 FRONTEND DEBUG: Verification localStorage after save:');
      console.log('🔍 FRONTEND DEBUG: auth_user:', !!localStorage.getItem('auth_user'));
      console.log('🔍 FRONTEND DEBUG: auth_token:', !!localStorage.getItem('auth_token'));
      console.log('🔍 FRONTEND DEBUG: auth_provider:', localStorage.getItem('auth_provider'));
      
      console.log('🧹 FRONTEND DEBUG: Cleaning temporary data...');
      // Nettoyer les données temporaires
      localStorage.removeItem('oauth_state');
      localStorage.removeItem('oauth_error');
      localStorage.removeItem('oauth_return_url');

      // Nettoyer l'URL
      console.log('🧹 FRONTEND DEBUG: Cleaning URL...');
      window.history.replaceState({}, document.title, window.location.pathname);

      console.log('✅ FRONTEND DEBUG: Authentication successful - all data saved!');
      console.log('📢 FRONTEND DEBUG: Dispatching authStateChanged event...');
      
      // Forcer la mise à jour de l'AuthContext en émettant un événement
      const customEvent = new CustomEvent('authStateChanged', { 
        detail: { type: 'signIn', user, accessToken: data.access_token } 
      });
      window.dispatchEvent(customEvent);
      console.log('📢 FRONTEND DEBUG: authStateChanged event dispatched!');

    } catch (error) {
      console.error('💥 FRONTEND DEBUG: Token exchange CRASHED:', error);
      console.error('💥 FRONTEND DEBUG: Error message:', error instanceof Error ? error.message : 'Unknown error');
      console.error('💥 FRONTEND DEBUG: Error stack:', error instanceof Error ? error.stack : 'No stack');
      this.handleOAuthError('server_error');
    }
  }

  private getRedirectUri(): string {
    return `${window.location.origin}/settings`;
  }

  private generateOAuthUrl(): string {
    const state = this.generateRandomString(32);
    localStorage.setItem('oauth_state', state);
    // Plus besoin de stocker l'URL de retour - on reste sur /settings

    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.getRedirectUri(),
      response_type: 'code',
      scope: 'openid email profile https://www.googleapis.com/auth/drive.appdata https://www.googleapis.com/auth/drive.file',
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
      localStorage.removeItem('auth_token_timestamp');
      localStorage.removeItem('oauth_state');
      localStorage.removeItem('oauth_return_url');
      localStorage.removeItem('oauth_pending');

    } catch (error) {
      throw this.handleError(error);
    }
  }

  // NOUVEAU : Forcer reconnexion avec nouveaux scopes
  async forceReauthWithNewScopes(): Promise<void> {
    console.log('🔄 SCOPE DEBUG: Forcer reconnexion avec nouveaux scopes...');
    
    // Déconnexion complète d'abord
    await this.signOut();
    
    // Ajouter un délai pour s'assurer que le localStorage est nettoyé
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Forcer prompt=consent pour redemander toutes les permissions
    const state = this.generateRandomString(32);
    localStorage.setItem('oauth_state', state);

    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.getRedirectUri(),
      response_type: 'code',
      scope: 'openid email profile https://www.googleapis.com/auth/drive.appdata https://www.googleapis.com/auth/drive.file',
      state,
      access_type: 'offline',
      prompt: 'consent', // Force redemander les permissions
      include_granted_scopes: 'false' // Ne pas inclure les anciens scopes
    });

    const oauthUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    console.log('🔄 SCOPE DEBUG: Redirection OAuth avec nouveaux scopes:', params.get('scope'));
    
    // Marquer qu'on force une reconnexion
    localStorage.setItem('oauth_force_reauth', 'true');
    
    window.location.href = oauthUrl;
  }

  async refreshAccessToken(): Promise<string> {
    try {
      console.log('🔄 REFRESH DEBUG: refreshAccessToken() appelé');
      console.log('🔄 REFRESH DEBUG: this._refreshToken présent:', !!this._refreshToken);
      
      if (!this._refreshToken) {
        console.log('❌ REFRESH DEBUG: Pas de refresh token disponible');
        throw new Error('Pas de refresh token disponible');
      }

      console.log('📡 REFRESH DEBUG: Envoi requête à /api/auth/refresh/google/');
      const requestBody = {
        refresh_token: this._refreshToken
      };
      console.log('📡 REFRESH DEBUG: Request body:', { refresh_token: '***masked***' });

      const response = await fetch('/api/auth/refresh/google/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      console.log('📡 REFRESH DEBUG: Response status:', response.status);
      console.log('📡 REFRESH DEBUG: Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ REFRESH DEBUG: Response error:', errorText);
        throw new Error('Erreur lors du renouvellement du token');
      }

      const data = await response.json();
      console.log('✅ REFRESH DEBUG: Nouveau token reçu, length:', data.access_token?.length || 0);
      
      this._accessToken = data.access_token;
      
      localStorage.setItem('auth_token', data.access_token);
      localStorage.setItem('auth_token_timestamp', Date.now().toString());
      console.log('✅ REFRESH DEBUG: Token sauvé avec nouveau timestamp');

      return data.access_token;
    } catch (error) {
      console.error('❌ REFRESH DEBUG: Erreur complète:', error);
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