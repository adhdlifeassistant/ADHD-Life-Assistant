'use client';

import { useState } from 'react';
import * as React from 'react';
import { AuthProviderType } from '@/types/auth';

interface AuthSelectorProps {
  onProviderSelect: (provider: AuthProviderType) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export default function AuthSelector({ onProviderSelect, isLoading, error }: AuthSelectorProps) {
  const [selectedProvider, setSelectedProvider] = useState<AuthProviderType | null>(null);
  const [oauthError, setOauthError] = useState<string | null>(null);

  // Vérifier les erreurs OAuth au chargement
  React.useEffect(() => {
    const storedOauthError = localStorage.getItem('oauth_error');
    if (storedOauthError) {
      setOauthError(storedOauthError);
      localStorage.removeItem('oauth_error');
    }
  }, []);

  const handleProviderClick = async (provider: AuthProviderType) => {
    setSelectedProvider(provider);
    try {
      await onProviderSelect(provider);
    } catch (err) {
      setSelectedProvider(null);
    }
  };

  const providers = [
    {
      id: 'google' as AuthProviderType,
      name: 'Google',
      icon: (
        <svg viewBox="0 0 24 24" className="w-6 h-6">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
      ),
      description: 'Continuez avec votre compte Google',
      bgColor: 'bg-white hover:bg-gray-50 border-gray-300',
      textColor: 'text-gray-900',
      isLoading: selectedProvider === 'google' && isLoading
    },
    {
      id: 'microsoft' as AuthProviderType,
      name: 'Microsoft',
      icon: (
        <svg viewBox="0 0 24 24" className="w-6 h-6">
          <path fill="#F35325" d="M1 1h10v10H1z"/>
          <path fill="#81BC06" d="M13 1h10v10H13z"/>
          <path fill="#05A6F0" d="M1 13h10v10H1z"/>
          <path fill="#FFBA08" d="M13 13h10v10H13z"/>
        </svg>
      ),
      description: 'Continuez avec votre compte Microsoft',
      bgColor: 'bg-white hover:bg-gray-50 border-gray-300',
      textColor: 'text-gray-900',
      isLoading: selectedProvider === 'microsoft' && isLoading
    }
  ];

  return (
    <div className="w-full max-w-md mx-auto p-8 bg-white rounded-3xl shadow-lg border-2 border-blue-100">
      {/* En-tête bienveillant */}
      <div className="text-center mb-8">
        <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl flex items-center justify-center">
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          Bienvenue ! 👋
        </h2>
        <p className="text-gray-600 leading-relaxed">
          Connectez-vous pour synchroniser vos données et accéder à toutes les fonctionnalités
        </p>
      </div>

      {/* Message d'erreur bienveillant */}
      {(error || oauthError) && (
        <div className="mb-6 p-4 bg-red-50 border-2 border-red-100 rounded-2xl">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-red-400 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-700 text-sm leading-relaxed">
              {oauthError || error}
            </p>
          </div>
          {oauthError && (
            <button
              onClick={() => setOauthError(null)}
              className="mt-3 text-xs text-red-600 hover:text-red-800 underline"
            >
              Réessayer
            </button>
          )}
        </div>
      )}

      {/* Boutons de connexion */}
      <div className="space-y-4">
        {providers.map((provider) => (
          <button
            key={provider.id}
            onClick={() => handleProviderClick(provider.id)}
            disabled={isLoading}
            className={`
              w-full flex items-center justify-center px-6 py-4 
              border-2 rounded-2xl font-medium text-base
              transition-all duration-200 ease-in-out
              ${provider.bgColor} ${provider.textColor}
              ${isLoading ? 'cursor-not-allowed opacity-60' : 'hover:scale-[1.02] hover:shadow-md focus:outline-none focus:ring-4 focus:ring-blue-200'}
              ${provider.isLoading ? 'ring-4 ring-blue-200' : ''}
            `}
          >
            {provider.isLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-300 border-t-blue-600 mr-3"></div>
                <span>Connexion en cours...</span>
              </div>
            ) : (
              <div className="flex items-center">
                <div className="mr-3 flex-shrink-0">
                  {provider.icon}
                </div>
                <span>{provider.description}</span>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Message de rassurance */}
      <div className="mt-8 pt-6 border-t border-gray-100">
        <div className="flex items-start">
          <svg className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <div>
            <p className="text-sm text-gray-600 leading-relaxed">
              <span className="font-medium text-gray-900">Vos données sont sécurisées.</span><br />
              Nous utilisons uniquement votre email et nom pour personnaliser votre expérience.
            </p>
          </div>
        </div>
      </div>

      {/* État de chargement global */}
      {isLoading && (
        <div className="mt-6 flex items-center justify-center">
          <div className="flex items-center text-blue-600">
            <div className="animate-pulse mr-2">⚡</div>
            <span className="text-sm font-medium">Préparation de votre espace...</span>
          </div>
        </div>
      )}
    </div>
  );
}