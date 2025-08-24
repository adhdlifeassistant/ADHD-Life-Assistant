'use client';

import React, { useState, useEffect } from 'react';
import { useMood } from '@/modules/mood/MoodContext';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export default function PWAInstall() {
  const { getMoodConfig } = useMood();
  const moodConfig = getMoodConfig();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Vérifie si l'app est déjà installée
    const checkInstalled = () => {
      if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled(true);
      } else if (window.navigator && 'standalone' in window.navigator) {
        // @ts-ignore - Safari standalone mode
        setIsInstalled(window.navigator.standalone === true);
      }
    };

    checkInstalled();

    // Écoute l'événement beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Affiche le bouton après 30 secondes d'utilisation
      setTimeout(() => {
        if (!isInstalled) {
          setShowInstallPrompt(true);
        }
      }, 30000);
    };

    // Écoute l'installation
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [isInstalled]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('PWA installation accepted');
    } else {
      console.log('PWA installation dismissed');
    }
    
    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    
    // Re-propose dans 24h
    setTimeout(() => {
      if (!isInstalled && deferredPrompt) {
        setShowInstallPrompt(true);
      }
    }, 24 * 60 * 60 * 1000);
  };

  // Ne pas afficher si déjà installé ou pas de prompt disponible
  if (isInstalled || !showInstallPrompt || !deferredPrompt) {
    return null;
  }

  return (
    <div 
      className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 z-50 animate-slide-up"
      style={{
        background: `linear-gradient(135deg, ${moodConfig.bgColor || '#3b82f6'}, ${moodConfig.color || '#1d4ed8'})`,
      }}
    >
      <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <span className="text-white text-xl">📱</span>
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 
              className="font-semibold text-sm mb-1"
              style={{ color: moodConfig.color || '#1f2937' }}
            >
              Installer ADHD Assistant
            </h3>
            <p 
              className="text-xs opacity-80 leading-relaxed"
              style={{ color: moodConfig.textColor || '#374151' }}
            >
              Accédez rapidement à votre assistant depuis votre écran d'accueil
            </p>
          </div>
          
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 w-6 h-6 rounded-full hover:bg-black/10 flex items-center justify-center transition-colors"
          >
            <span className="text-xs opacity-60">✕</span>
          </button>
        </div>
        
        <div className="flex gap-2 mt-4">
          <button
            onClick={handleDismiss}
            className="flex-1 px-3 py-2 text-xs font-medium rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
            style={{ color: moodConfig.textColor || '#374151' }}
          >
            Plus tard
          </button>
          <button
            onClick={handleInstallClick}
            className="flex-1 px-3 py-2 text-xs font-medium text-white rounded-lg shadow-sm hover:shadow-md transform hover:scale-105 transition-all duration-200"
            style={{
              background: `linear-gradient(135deg, ${moodConfig.color || '#3b82f6'}, ${moodConfig.bgColor || '#1d4ed8'})`,
            }}
          >
            Installer
          </button>
        </div>
      </div>
    </div>
  );
}