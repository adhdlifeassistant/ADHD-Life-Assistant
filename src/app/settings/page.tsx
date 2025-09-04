'use client';

import React, { useEffect, useState } from 'react';
import { SettingsInterface } from '@/components/settings/SettingsInterface';

export default function SettingsPage() {
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  // Traiter les callbacks OAuth et afficher les notifications
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state');
      const error = urlParams.get('error');
      
      console.log('🔍 DEBUG SETTINGS - Query params:', {
        code: code ? 'présent' : 'absent',
        state: state ? 'présent' : 'absent', 
        error: error || 'absent',
        url: window.location.href
      });

      if (code && state) {
        console.log('🎯 DEBUG SETTINGS - Callback OAuth Google détecté');
        // Le callback sera traité par GoogleAuthProvider dans AuthContext
        
        // Nettoyer l'URL pour éviter la réapparition
        window.history.replaceState({}, document.title, window.location.pathname);
        
        // Afficher notification success après un délai pour laisser le temps au callback
        setTimeout(() => {
          setNotification({
            type: 'success',
            message: '🎉 Connexion Google réussie ! Vos données seront synchronisées avec Google Drive.'
          });
        }, 2000);
        
      } else if (error) {
        console.log('❌ DEBUG SETTINGS - Erreur OAuth:', error);
        
        // Nettoyer l'URL
        window.history.replaceState({}, document.title, window.location.pathname);
        
        const errorMessages: { [key: string]: string } = {
          'access_denied': 'Connexion annulée par l\'utilisateur',
          'invalid_request': 'Requête OAuth invalide',
          'server_error': 'Erreur serveur Google temporaire',
        };
        
        setNotification({
          type: 'error',
          message: `❌ Erreur de connexion : ${errorMessages[error] || 'Connexion échouée'}`
        });
      }
      
      // Auto-masquer la notification après 5 secondes
      if (notification) {
        const timer = setTimeout(() => setNotification(null), 5000);
        return () => clearTimeout(timer);
      }
    }
  }, [notification]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Notification en haut de page */}
      {notification && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-md w-full px-4">
          <div className={`p-4 rounded-lg shadow-lg border-2 ${
            notification.type === 'success' 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <div className="flex items-start justify-between">
              <p className="text-sm font-medium">{notification.message}</p>
              <button
                onClick={() => setNotification(null)}
                className={`ml-3 text-lg ${
                  notification.type === 'success' ? 'text-green-400 hover:text-green-600' : 'text-red-400 hover:text-red-600'
                }`}
              >
                ×
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        <SettingsInterface />
      </div>
    </div>
  );
}