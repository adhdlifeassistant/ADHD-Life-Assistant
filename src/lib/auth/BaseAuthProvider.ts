import { AuthProvider, User, AuthError } from '@/types/auth';

export abstract class BaseAuthProvider implements AuthProvider {
  protected _isAuthenticated: boolean = false;
  protected _currentUser: User | null = null;
  protected _accessToken: string | null = null;
  protected _refreshToken: string | null = null;

  abstract signIn(): Promise<User>;
  abstract signOut(): Promise<void>;
  abstract refreshAccessToken(): Promise<string>;
  
  async getCurrentUser(): Promise<User | null> {
    return this._currentUser;
  }

  async restoreSession(): Promise<boolean> {
    return false;
  }

  isAuthenticated(): boolean {
    return this._isAuthenticated;
  }

  getAccessToken(): string | null {
    return this._accessToken;
  }

  protected createAuthError(code: string, message: string): AuthError {
    const userFriendlyMessages: Record<string, string> = {
      'popup_closed_by_user': 'Vous avez fermé la fenêtre de connexion. Réessayez quand vous êtes prêt·e 😊',
      'network_error': 'Problème de connexion internet. Vérifiez votre réseau et réessayez 📶',
      'invalid_credentials': 'Identifiants incorrects. Vérifiez vos informations de connexion 🔑',
      'access_denied': 'Accès refusé. Vous pouvez réessayer ou choisir un autre compte 🚫',
      'server_error': 'Petit souci technique de notre côté. Réessayez dans quelques instants ⚙️',
      'token_expired': 'Votre session a expiré. Reconnectez-vous pour continuer 🔄',
      'unknown_error': 'Quelque chose s\'est mal passé. Pas de panique, réessayez ! 💪'
    };

    return {
      code,
      message,
      userFriendlyMessage: userFriendlyMessages[code] || userFriendlyMessages['unknown_error']
    };
  }

  protected handleError(error: any): AuthError {
    console.error('Auth error:', error);
    
    if (error.code) {
      return this.createAuthError(error.code, error.message);
    }
    
    if (error.message?.includes('popup')) {
      return this.createAuthError('popup_closed_by_user', error.message);
    }
    
    if (error.message?.includes('network')) {
      return this.createAuthError('network_error', error.message);
    }
    
    return this.createAuthError('unknown_error', error.message || 'Une erreur inattendue s\'est produite');
  }
}