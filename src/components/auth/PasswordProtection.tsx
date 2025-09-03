'use client';

import React, { useState, useEffect } from 'react';
import LoginPage from './LoginPage';

interface PasswordProtectionProps {
  children: React.ReactNode;
}

export default function PasswordProtection({ children }: PasswordProtectionProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [error, setError] = useState('');

  // Hash simple pour obfusquer le mot de passe
  const EXPECTED_HASH = 'ad60e303b9d18f9936dfd9613d095030'; // MD5 de "fYnkUShy513ZNF"
  
  useEffect(() => {
    // Vérifier si déjà connecté dans cette session
    const sessionAuth = sessionStorage.getItem('adhd-app-authenticated');
    if (sessionAuth === 'true') {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  const handleLogin = (password: string) => {
    // Simple hash MD5 côté client (pour obfuscation basique)
    const hash = require('crypto-js/md5')(password).toString();
    
    // Debug: afficher les hashs pour vérification
    console.log('Hash saisi:', hash);
    console.log('Hash attendu:', EXPECTED_HASH);
    
    if (hash === EXPECTED_HASH) {
      setIsAuthenticated(true);
      setError('');
      sessionStorage.setItem('adhd-app-authenticated', 'true');
    } else {
      setError('Mot de passe incorrect. Veuillez réessayer.');
      setIsAuthenticated(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('adhd-app-authenticated');
  };

  // Loading state pendant la vérification initiale
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Afficher la page de login si pas authentifié
  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} error={error} />;
  }

  // Afficher l'app avec un bouton de déconnexion
  return (
    <div className="relative">
      {/* Bouton de déconnexion discret */}
      <button
        onClick={handleLogout}
        className="fixed top-4 right-4 z-50 bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800 p-2 rounded-full shadow-sm transition-colors duration-200"
        title="Se déconnecter"
        aria-label="Se déconnecter"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
      </button>
      
      {children}
    </div>
  );
}