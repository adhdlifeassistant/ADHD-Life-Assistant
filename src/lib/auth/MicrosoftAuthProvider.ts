import { PublicClientApplication, Configuration, LogLevel, AuthenticationResult, SilentRequest, RedirectRequest, PopupRequest } from '@azure/msal-browser';
import { BaseAuthProvider } from './BaseAuthProvider';
import { User, AuthError } from '@/types/auth';

export class MicrosoftAuthProvider extends BaseAuthProvider {
  private msalInstance: PublicClientApplication;
  private loginRequest: PopupRequest & RedirectRequest;

  constructor() {
    super();

    const msalConfig: Configuration = {
      auth: {
        clientId: process.env.NEXT_PUBLIC_MICROSOFT_CLIENT_ID || '',
        authority: `https://login.microsoftonline.com/${process.env.NEXT_PUBLIC_MICROSOFT_TENANT_ID || 'common'}`,
        redirectUri: typeof window !== 'undefined' ? window.location.origin : '',
        postLogoutRedirectUri: typeof window !== 'undefined' ? window.location.origin : '',
      },
      cache: {
        cacheLocation: 'localStorage',
        storeAuthStateInCookie: false,
      },
      system: {
        loggerOptions: {
          loggerCallback: (level: LogLevel, message: string) => {
            if (level === LogLevel.Error) {
              console.error('[MSAL Error]', message);
            }
          },
          logLevel: LogLevel.Warning,
        },
      },
    };

    this.msalInstance = new PublicClientApplication(msalConfig);

    this.loginRequest = {
      scopes: [
        'User.Read',
        'openid',
        'profile',
        'email'
      ],
      prompt: 'select_account'
    };

    if (typeof window !== 'undefined') {
      this.initializeMsal();
    }
  }

  private async initializeMsal() {
    try {
      await this.msalInstance.initialize();
      
      // Vérifier s'il y a une session active
      const accounts = this.msalInstance.getAllAccounts();
      if (accounts.length > 0) {
        this.msalInstance.setActiveAccount(accounts[0]);
        await this.setCurrentUserFromAccount(accounts[0]);
      }

      // Gérer les redirections après connexion
      try {
        const response = await this.msalInstance.handleRedirectPromise();
        if (response) {
          this.msalInstance.setActiveAccount(response.account);
          await this.setCurrentUserFromAccount(response.account);
        }
      } catch (error) {
        console.error('Erreur lors de la gestion de la redirection:', error);
      }

    } catch (error) {
      console.error('Erreur lors de l\'initialisation de MSAL:', error);
    }
  }

  private async setCurrentUserFromAccount(account: any) {
    try {
      const user: User = {
        id: account.localAccountId,
        email: account.username,
        name: account.name || account.username,
        provider: 'microsoft'
      };

      this._currentUser = user;
      this._isAuthenticated = true;

      localStorage.setItem('auth_user', JSON.stringify(user));
      localStorage.setItem('auth_provider', 'microsoft');

      // Essayer d'obtenir des informations supplémentaires via Graph API
      try {
        const tokenRequest: SilentRequest = {
          scopes: ['User.Read'],
          account: account,
        };

        const response = await this.msalInstance.acquireTokenSilent(tokenRequest);
        this._accessToken = response.accessToken;
        
        // Récupérer les informations utilisateur depuis Microsoft Graph
        const graphResponse = await fetch('https://graph.microsoft.com/v1.0/me', {
          headers: {
            'Authorization': `Bearer ${response.accessToken}`
          }
        });

        if (graphResponse.ok) {
          const graphData = await graphResponse.json();
          this._currentUser = {
            ...user,
            name: graphData.displayName || user.name,
            picture: graphData.photo ? `data:image/jpeg;base64,${graphData.photo}` : undefined
          };

          localStorage.setItem('auth_user', JSON.stringify(this._currentUser));
        }

        localStorage.setItem('auth_token', response.accessToken);

      } catch (error) {
        console.error('Erreur lors de la récupération du token ou des infos utilisateur:', error);
      }

    } catch (error) {
      throw this.handleError(error);
    }
  }

  async signIn(): Promise<User> {
    try {
      let response: AuthenticationResult;

      try {
        // Essayer d'abord une connexion silencieuse
        const accounts = this.msalInstance.getAllAccounts();
        if (accounts.length > 0) {
          const silentRequest: SilentRequest = {
            scopes: this.loginRequest.scopes,
            account: accounts[0],
          };

          response = await this.msalInstance.acquireTokenSilent(silentRequest);
        } else {
          throw new Error('Aucun compte trouvé, connexion popup nécessaire');
        }
      } catch (error) {
        // Si la connexion silencieuse échoue, utiliser popup
        try {
          response = await this.msalInstance.loginPopup(this.loginRequest);
        } catch (popupError) {
          // Fallback vers redirect si popup échoue
          await this.msalInstance.loginRedirect(this.loginRequest);
          return new Promise((resolve, reject) => {
            // La résolution se fera via handleRedirectPromise dans initializeMsal
            setTimeout(() => {
              if (this._currentUser) {
                resolve(this._currentUser);
              } else {
                reject(this.createAuthError('redirect_timeout', 'Timeout lors de la redirection'));
              }
            }, 10000);
          });
        }
      }

      this.msalInstance.setActiveAccount(response.account);
      await this.setCurrentUserFromAccount(response.account);
      this._accessToken = response.accessToken;

      localStorage.setItem('auth_token', response.accessToken);

      if (!this._currentUser) {
        throw new Error('Utilisateur non trouvé après authentification');
      }

      return this._currentUser;

    } catch (error) {
      throw this.handleError(error);
    }
  }

  async signOut(): Promise<void> {
    try {
      const accounts = this.msalInstance.getAllAccounts();
      
      if (accounts.length > 0) {
        await this.msalInstance.logoutPopup({
          account: accounts[0],
          postLogoutRedirectUri: window.location.origin
        });
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
      // En cas d'erreur, nettoyer quand même les données locales
      this._currentUser = null;
      this._isAuthenticated = false;
      this._accessToken = null;
      this._refreshToken = null;

      localStorage.removeItem('auth_user');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_refresh_token');
      localStorage.removeItem('auth_provider');

      throw this.handleError(error);
    }
  }

  async refreshAccessToken(): Promise<string> {
    try {
      const accounts = this.msalInstance.getAllAccounts();
      
      if (accounts.length === 0) {
        throw new Error('Aucun compte trouvé pour le refresh');
      }

      const silentRequest: SilentRequest = {
        scopes: this.loginRequest.scopes,
        account: accounts[0],
      };

      const response = await this.msalInstance.acquireTokenSilent(silentRequest);
      this._accessToken = response.accessToken;
      
      localStorage.setItem('auth_token', response.accessToken);

      return response.accessToken;

    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Méthode pour restaurer l'état depuis le localStorage et MSAL cache
  restoreSession(): boolean {
    try {
      const user = localStorage.getItem('auth_user');
      const token = localStorage.getItem('auth_token');
      const provider = localStorage.getItem('auth_provider');

      if (user && provider === 'microsoft') {
        const accounts = this.msalInstance.getAllAccounts();
        if (accounts.length > 0) {
          this._currentUser = JSON.parse(user);
          this._accessToken = token;
          this._isAuthenticated = true;
          this.msalInstance.setActiveAccount(accounts[0]);
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error('Erreur lors de la restauration de session:', error);
      return false;
    }
  }

  protected handleError(error: any): AuthError {
    console.error('Microsoft Auth error:', error);

    // Erreurs spécifiques à MSAL
    if (error.errorCode) {
      switch (error.errorCode) {
        case 'user_cancelled':
          return this.createAuthError('popup_closed_by_user', error.errorMessage);
        case 'access_denied':
          return this.createAuthError('access_denied', error.errorMessage);
        case 'server_error':
        case 'temporarily_unavailable':
          return this.createAuthError('server_error', error.errorMessage);
        case 'invalid_grant':
        case 'token_expired':
          return this.createAuthError('token_expired', error.errorMessage);
        default:
          return this.createAuthError(error.errorCode, error.errorMessage);
      }
    }

    return super.handleError(error);
  }
}