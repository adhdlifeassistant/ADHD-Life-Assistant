'use client';

import { useState } from 'react';
import { useAuth } from '@/modules/auth/AuthContext';

interface UserProfileProps {
  showFullProfile?: boolean;
  className?: string;
}

export default function UserProfile({ showFullProfile = false, className = '' }: UserProfileProps) {
  const { user, signOut, isLoading } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  if (!user) {
    return null;
  }

  const handleSignOut = async () => {
    try {
      await signOut();
      setIsMenuOpen(false);
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  if (showFullProfile) {
    return (
      <div className={`bg-white rounded-2xl p-6 border-2 border-blue-100 ${className}`}>
        <div className="flex items-center mb-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center mr-4">
            {user.picture ? (
              <img
                src={user.picture}
                alt={user.name}
                className="w-full h-full rounded-2xl object-cover"
              />
            ) : (
              <span className="text-white text-xl font-semibold">
                {user.name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
            <p className="text-gray-600 text-sm">{user.email}</p>
            <div className="flex items-center mt-1">
              <div className={`w-2 h-2 rounded-full mr-2 ${
                user.provider === 'google' ? 'bg-red-500' : 'bg-blue-500'
              }`}></div>
              <span className="text-xs text-gray-500 capitalize">{user.provider}</span>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-4">
          <button
            onClick={handleSignOut}
            disabled={isLoading}
            className="w-full flex items-center justify-center px-4 py-3 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-red-300 border-t-red-700 mr-2"></div>
                <span className="text-sm font-medium">Déconnexion...</span>
              </div>
            ) : (
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="text-sm font-medium">Se déconnecter</span>
              </div>
            )}
          </button>
        </div>
      </div>
    );
  }

  // Version compacte avec menu déroulant
  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="flex items-center p-2 rounded-2xl hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-4 focus:ring-blue-200"
      >
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
          {user.picture ? (
            <img
              src={user.picture}
              alt={user.name}
              className="w-full h-full rounded-xl object-cover"
            />
          ) : (
            <span className="text-white text-sm font-semibold">
              {user.name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <div className="ml-3 text-left hidden sm:block">
          <p className="text-sm font-medium text-gray-900 truncate max-w-32">
            {user.name}
          </p>
          <p className="text-xs text-gray-500 capitalize">
            {user.provider}
          </p>
        </div>
        <svg 
          className={`ml-2 h-4 w-4 text-gray-500 transition-transform duration-200 ${
            isMenuOpen ? 'rotate-180' : ''
          }`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isMenuOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-lg border-2 border-gray-100 z-50">
          <div className="p-4 border-b border-gray-100">
            <p className="font-medium text-gray-900">{user.name}</p>
            <p className="text-sm text-gray-600">{user.email}</p>
          </div>
          <div className="p-2">
            <button
              onClick={handleSignOut}
              disabled={isLoading}
              className="w-full flex items-center px-4 py-3 text-left text-red-700 hover:bg-red-50 rounded-xl transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-red-300 border-t-red-700 mr-3"></div>
                  <span className="text-sm">Déconnexion...</span>
                </div>
              ) : (
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span className="text-sm">Se déconnecter</span>
                </div>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Overlay pour fermer le menu */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsMenuOpen(false)}
        ></div>
      )}
    </div>
  );
}