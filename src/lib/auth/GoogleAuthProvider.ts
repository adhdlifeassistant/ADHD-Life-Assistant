import { BaseAuthProvider } from './BaseAuthProvider';
import { User, AuthError } from '@/types/auth';

export class GoogleAuthProvider extends BaseAuthProvider {
  private clientId: string;

  constructor() {
    super();
    this.clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';
    
    if (typeof window !== 'undefined') {
      this.initializeGoogleAuth();
    }
  }

  private async initializeGoogleAuth() {
    try {
      // Charger le SDK Google Identity Services
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      document.head.appendChild(script);

      await new Promise((resolve) => {
        script.onload = resolve;
      });

      // Initialiser Google Identity Services
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: this.clientId,
          callback: this.handleCredentialResponse.bind(this)
        });
      }
    } catch (error) {
      console.error('Erreur lors de l\'initialisation de Google Auth:', error);
    }
  }

  private async handleCredentialResponse(response: any) {
    try {
      const credential = response.credential;
      const decoded = JSON.parse(atob(credential.split('.')[1]));
      
      const user: User = {
        id: decoded.sub,
        email: decoded.email,
        name: decoded.name,
        picture: decoded.picture,
        provider: 'google'
      };

      this._currentUser = user;
      this._isAuthenticated = true;
      this._accessToken = credential;

      localStorage.setItem('auth_user', JSON.stringify(user));
      localStorage.setItem('auth_token', credential);
      localStorage.setItem('auth_provider', 'google');

    } catch (error) {
      throw this.handleError(error);
    }
  }

  async signIn(): Promise<User> {
    return new Promise((resolve, reject) => {
      try {
        if (!window.google) {
          throw new Error('Google SDK non chargé');
        }

        window.google.accounts.id.prompt((notification: any) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            // Fallback vers popup si la promesse native ne fonctionne pas
            this.signInWithPopup().then(resolve).catch(reject);
          }
        });

        // Timeout pour éviter d'attendre indéfiniment
        setTimeout(() => {
          if (!this._isAuthenticated) {
            this.signInWithPopup().then(resolve).catch(reject);
          }
        }, 3000);

        // Écouter les changements d'état d'authentification
        const checkAuth = () => {
          if (this._isAuthenticated && this._currentUser) {
            resolve(this._currentUser);
          }
        };

        const interval = setInterval(() => {
          checkAuth();
          if (this._isAuthenticated) {
            clearInterval(interval);
          }
        }, 100);

        // Nettoyer après 10 secondes
        setTimeout(() => {
          clearInterval(interval);
        }, 10000);

      } catch (error) {
        reject(this.handleError(error));
      }
    });
  }

  private async signInWithPopup(): Promise<User> {
    return new Promise((resolve, reject) => {
      try {
        if (!window.google) {
          throw new Error('Google SDK non chargé');
        }

        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: this.clientId,
          scope: 'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile',
          callback: async (tokenResponse: any) => {
            try {
              const userInfo = await this.fetchUserInfo(tokenResponse.access_token);
              const user: User = {
                id: userInfo.id,
                email: userInfo.email,
                name: userInfo.name,
                picture: userInfo.picture,
                provider: 'google'
              };

              this._currentUser = user;
              this._isAuthenticated = true;
              this._accessToken = tokenResponse.access_token;
              this._refreshToken = tokenResponse.refresh_token;

              localStorage.setItem('auth_user', JSON.stringify(user));
              localStorage.setItem('auth_token', tokenResponse.access_token);
              localStorage.setItem('auth_refresh_token', tokenResponse.refresh_token || '');
              localStorage.setItem('auth_provider', 'google');

              resolve(user);
            } catch (error) {
              reject(this.handleError(error));
            }
          },
          error_callback: (error: any) => {
            reject(this.handleError(error));
          }
        });

        client.requestAccessToken();
      } catch (error) {
        reject(this.handleError(error));
      }
    });
  }

  private async fetchUserInfo(accessToken: string): Promise<any> {
    const response = await fetch(`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${accessToken}`);
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des informations utilisateur');
    }
    return response.json();
  }

  async signOut(): Promise<void> {
    try {
      if (window.google) {
        window.google.accounts.id.disableAutoSelect();
      }

      this._currentUser = null;
      this._isAuthenticated = false;
      this._accessToken = null;
      this._refreshToken = null;

      localStorage.removeItem('auth_user');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_refresh_token');
      localStorage.removeItem('auth_provider');

    } catch (error) {
      throw this.handleError(error);
    }
  }

  async refreshAccessToken(): Promise<string> {
    try {
      if (!this._refreshToken) {
        throw new Error('Pas de refresh token disponible');
      }

      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: this.clientId,
          refresh_token: this._refreshToken,
          grant_type: 'refresh_token',
        }),
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
  restoreSession(): boolean {
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

// Déclarations TypeScript pour les APIs Google
declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          prompt: (callback?: (notification: any) => void) => void;
          disableAutoSelect: () => void;
        };
        oauth2: {
          initTokenClient: (config: any) => any;
        };
      };
    };
  }
}