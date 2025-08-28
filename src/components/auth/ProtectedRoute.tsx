'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useAuth } from '@/modules/auth/AuthContext';
import AuthSelector from './AuthSelector';

interface ProtectedRouteProps {
  children: ReactNode;
  fallback?: ReactNode;
  requireAuth?: boolean;
}

export default function ProtectedRoute({ 
  children, 
  fallback,
  requireAuth = true 
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, signIn, error } = useAuth();
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    if (!isLoading && requireAuth && !isAuthenticated) {
      setShowAuth(true);
    } else {
      setShowAuth(false);
    }
  }, [isLoading, isAuthenticated, requireAuth]);

  // Affichage pendant le chargement
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl flex items-center justify-center animate-pulse">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Chargement de votre espace...
          </h2>
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-300 border-t-blue-600 mr-3"></div>
            <span className="text-gray-600">Préparation en cours</span>
          </div>
        </div>
      </div>
    );
  }

  // Si l'authentification n'est pas requise, afficher directement le contenu
  if (!requireAuth) {
    return <>{children}</>;
  }

  // Si authentifié, afficher le contenu protégé
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // Si non authentifié et authentification requise, afficher l'écran de connexion
  if (showAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        {fallback || (
          <AuthSelector
            onProviderSelect={signIn}
            isLoading={isLoading}
            error={error}
          />
        )}
      </div>
    );
  }

  // Fallback par défaut
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-2xl flex items-center justify-center">
          <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Accès restreint
        </h2>
        <p className="text-gray-600">
          Cette section nécessite une connexion.
        </p>
      </div>
    </div>
  );
}