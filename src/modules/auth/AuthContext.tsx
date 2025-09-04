'use client';

import { createContext, useContext, useEffect, useReducer, useState, ReactNode } from 'react';
import { GoogleAuthProvider } from '@/lib/auth/GoogleAuthProvider';
import { MicrosoftAuthProvider } from '@/lib/auth/MicrosoftAuthProvider';
import { BaseAuthProvider } from '@/lib/auth/BaseAuthProvider';
import { AuthState, User, AuthError, AuthProviderType } from '@/types/auth';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  error: string | null;
  accessToken: string | null;
  signIn: (provider: AuthProviderType) => Promise<void>;
  signOut: () => Promise<void>;
  refreshToken: () => Promise<void>;
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  isLoading: true,
  error: null,
  accessToken: null,
  refreshToken: null,
};

type AuthAction =
  | { type: 'SIGN_IN_START' }
  | { type: 'SIGN_IN_SUCCESS'; payload: { user: User; accessToken: string; refreshToken?: string } }
  | { type: 'SIGN_IN_ERROR'; payload: string }
  | { type: 'SIGN_OUT' }
  | { type: 'REFRESH_TOKEN_SUCCESS'; payload: string }
  | { type: 'REFRESH_TOKEN_ERROR'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'CLEAR_ERROR' }
  | { type: 'RESTORE_SESSION'; payload: { user: User; accessToken: string; refreshToken?: string } };

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SIGN_IN_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'SIGN_IN_SUCCESS':
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        accessToken: action.payload.accessToken,
        refreshToken: action.payload.refreshToken || null,
        isLoading: false,
        error: null,
      };
    case 'SIGN_IN_ERROR':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        accessToken: null,
        refreshToken: null,
        isLoading: false,
        error: action.payload,
      };
    case 'SIGN_OUT':
      return {
        ...initialState,
        isLoading: false,
      };
    case 'REFRESH_TOKEN_SUCCESS':
      return {
        ...state,
        accessToken: action.payload,
        error: null,
      };
    case 'REFRESH_TOKEN_ERROR':
      return {
        ...state,
        error: action.payload,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    case 'RESTORE_SESSION':
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        accessToken: action.payload.accessToken,
        refreshToken: action.payload.refreshToken || null,
        isLoading: false,
        error: null,
      };
    default:
      return state;
  }
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  
  // Instancier les providers dès le début pour permettre le traitement des callbacks
  const [providers] = useState(() => {
    console.log('🔍 DEBUG AUTH CONTEXT - Instanciation des providers...');
    return {
      google: new GoogleAuthProvider(),
      microsoft: new MicrosoftAuthProvider(),
    };
  });

  const currentProvider = state.user?.provider ? providers[state.user.provider] : null;

  // Restaurer la session au démarrage et traiter les callbacks OAuth
  useEffect(() => {
    const restoreSession = async () => {
      dispatch({ type: 'SET_LOADING', payload: true });

      try {
        console.log('🔍 DEBUG AUTH CONTEXT - Tentative de restauration de session...');
        
        // Essayer de restaurer depuis chaque provider
        for (const [providerType, provider] of Object.entries(providers)) {
          console.log(`🔍 DEBUG AUTH CONTEXT - Test restore pour ${providerType}...`);
          
          const restored = await provider.restoreSession();
          if (restored) {
            const user = await provider.getCurrentUser();
            if (user) {
              console.log(`🎯 DEBUG AUTH CONTEXT - Session restaurée pour ${providerType}:`, user.email);
              dispatch({
                type: 'RESTORE_SESSION',
                payload: {
                  user,
                  accessToken: provider.getAccessToken() || '',
                  refreshToken: (provider as any)._refreshToken || '',
                },
              });
              return;
            }
          }
        }
        
        console.log('🔍 DEBUG AUTH CONTEXT - Aucune session à restaurer');
      } catch (error) {
        console.error('❌ DEBUG AUTH CONTEXT - Erreur lors de la restauration de session:', error);
      }

      dispatch({ type: 'SET_LOADING', payload: false });
    };

    // Écouter les changements d'état d'authentification (callback OAuth)
    const handleAuthStateChanged = async (event: CustomEvent) => {
      console.log('🎯 DEBUG AUTH CONTEXT - Événement authStateChanged reçu:', event.detail);
      
      if (event.detail.type === 'signIn') {
        // Forcer une nouvelle restauration de session
        await restoreSession();
      }
    };

    // Restaurer la session au démarrage
    restoreSession();
    
    // Écouter les événements de changement d'état
    window.addEventListener('authStateChanged', handleAuthStateChanged as EventListener);
    
    return () => {
      window.removeEventListener('authStateChanged', handleAuthStateChanged as EventListener);
    };
  }, [providers]);

  const signIn = async (providerType: AuthProviderType) => {
    dispatch({ type: 'SIGN_IN_START' });

    try {
      const provider = providers[providerType];
      const user = await provider.signIn();
      
      dispatch({
        type: 'SIGN_IN_SUCCESS',
        payload: {
          user,
          accessToken: (provider as any)._accessToken || '',
          refreshToken: (provider as any)._refreshToken || '',
        },
      });

      // Annoncer la connexion réussie pour l'accessibilité
      const announcement = `Connexion réussie ! Bienvenue ${user.name} 🎉`;
      announceToScreenReader(announcement);

    } catch (error: any) {
      const authError = error as AuthError;
      dispatch({
        type: 'SIGN_IN_ERROR',
        payload: authError.userFriendlyMessage || 'Erreur de connexion',
      });

      // Annoncer l'erreur pour l'accessibilité
      announceToScreenReader(`Erreur de connexion : ${authError.userFriendlyMessage}`);
    }
  };

  const signOut = async () => {
    try {
      if (currentProvider) {
        await currentProvider.signOut();
      }
      
      dispatch({ type: 'SIGN_OUT' });

      // Annoncer la déconnexion pour l'accessibilité
      announceToScreenReader('Déconnexion réussie. À bientôt ! 👋');

    } catch (error: any) {
      console.error('Erreur lors de la déconnexion:', error);
      // En cas d'erreur, forcer quand même la déconnexion locale
      dispatch({ type: 'SIGN_OUT' });
    }
  };

  const refreshToken = async () => {
    if (!currentProvider) {
      dispatch({
        type: 'REFRESH_TOKEN_ERROR',
        payload: 'Aucun provider disponible pour le refresh token',
      });
      return;
    }

    try {
      const newAccessToken = await currentProvider.refreshAccessToken();
      dispatch({
        type: 'REFRESH_TOKEN_SUCCESS',
        payload: newAccessToken,
      });
    } catch (error: any) {
      const authError = error as AuthError;
      dispatch({
        type: 'REFRESH_TOKEN_ERROR',
        payload: authError.userFriendlyMessage || 'Erreur lors du renouvellement du token',
      });
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  // Refresh automatique du token avant expiration
  useEffect(() => {
    if (!state.isAuthenticated || !state.accessToken) return;

    const refreshInterval = setInterval(async () => {
      try {
        await refreshToken();
      } catch (error) {
        console.error('Erreur lors du refresh automatique:', error);
      }
    }, 50 * 60 * 1000); // Refresh toutes les 50 minutes

    return () => clearInterval(refreshInterval);
  }, [state.isAuthenticated, state.accessToken]);

  const contextValue: AuthContextType = {
    isAuthenticated: state.isAuthenticated,
    user: state.user,
    isLoading: state.isLoading,
    error: state.error,
    accessToken: state.accessToken,
    signIn,
    signOut,
    refreshToken,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// Fonction utilitaire pour les annonces d'accessibilité
function announceToScreenReader(message: string) {
  if (typeof window === 'undefined') return;
  
  const liveRegion = document.getElementById('live-region');
  if (liveRegion) {
    liveRegion.textContent = message;
    // Effacer après 3 secondes pour éviter la répétition
    setTimeout(() => {
      liveRegion.textContent = '';
    }, 3000);
  }
}