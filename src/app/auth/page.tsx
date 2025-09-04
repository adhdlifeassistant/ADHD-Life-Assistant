'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/modules/auth/AuthContext';
import AuthSelector from '@/components/auth/AuthSelector';

export default function AuthPage() {
  const { isAuthenticated, isLoading, signIn, error } = useAuth();
  const router = useRouter();

  // Débogage des query parameters au chargement
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state');
      const error = urlParams.get('error');
      
      console.log('🔍 DEBUG AUTH PAGE - Query params:', {
        code: code ? 'présent' : 'absent',
        state: state ? 'présent' : 'absent', 
        error: error || 'absent',
        url: window.location.href
      });

      // Si on a un code OAuth, c'est un callback
      if (code && state) {
        console.log('🎯 DEBUG AUTH PAGE - Callback OAuth détecté, traitement en cours...');
        console.log('🔍 DEBUG AUTH PAGE - Code OAuth:', code.substring(0, 20) + '...');
        console.log('🔍 DEBUG AUTH PAGE - État OAuth:', state.substring(0, 10) + '...');
      } else if (error) {
        console.log('❌ DEBUG AUTH PAGE - Erreur OAuth:', error);
      } else {
        console.log('🔍 DEBUG AUTH PAGE - Page auth normale (pas de callback)');
      }
    }
  }, []);

  useEffect(() => {
    console.log('🔍 DEBUG AUTH PAGE - État auth:', { isAuthenticated, isLoading });
    
    if (isAuthenticated && !isLoading) {
      console.log('🎯 DEBUG AUTH PAGE - Utilisateur connecté, redirection vers /settings...');
      router.push('/settings');
    }
  }, [isAuthenticated, isLoading, router]);

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
            Vérification de votre session...
          </h2>
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-300 border-t-blue-600 mr-3"></div>
            <span className="text-gray-600">Un instant</span>
          </div>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-green-500 rounded-2xl flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Déjà connecté ! 🎉
          </h2>
          <p className="text-gray-600 mb-4">
            Redirection vers votre tableau de bord...
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50" id="main-content">
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-lg">
          {/* En-tête de page */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Connexion
            </h1>
            <p className="text-gray-600">
              Accédez à votre assistant ADHD personnalisé
            </p>
          </div>

          {/* Composant de sélection d'authentification */}
          <AuthSelector
            onProviderSelect={signIn}
            isLoading={isLoading}
            error={error}
          />

          {/* Informations additionnelles */}
          <div className="mt-8 text-center">
            <div className="bg-white rounded-2xl p-6 border-2 border-blue-100">
              <h3 className="font-semibold text-gray-900 mb-3">
                Pourquoi se connecter ? 🤔
              </h3>
              <div className="space-y-3 text-sm text-gray-600 text-left">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span><strong>Synchronisation :</strong> Vos données suivent tous vos appareils</span>
                </div>
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span><strong>Sauvegarde :</strong> Jamais de perte de vos progrès et réglages</span>
                </div>
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span><strong>Personnalisation :</strong> Assistant adapté à votre profil unique</span>
                </div>
              </div>
            </div>
          </div>

          {/* Lien de retour */}
          <div className="mt-6 text-center">
            <button
              onClick={() => router.push('/')}
              className="text-gray-500 hover:text-gray-700 text-sm font-medium transition-colors duration-200"
            >
              ← Retour à l'accueil
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}