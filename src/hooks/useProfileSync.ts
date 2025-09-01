'use client';

import { useEffect } from 'react';
import { useProfile } from './useProfile';
import { useAutoSync } from './useAutoSync';

/**
 * Hook qui synchronise automatiquement le profil utilisateur
 * Exemple d'intégration du système de sync avec un module existant
 */
export function useProfileSync() {
  const { profile } = useProfile();
  
  // Auto-sync du profil à chaque modification
  const { forceSync } = useAutoSync({
    module: 'profile',
    data: profile,
    enabled: true,
    maxRetries: 3
  });

  // Effect pour démontrer l'usage
  useEffect(() => {
    // Quand le profil change significativement, on peut forcer une sync immédiate
    if (profile.name && profile.updatedAt > Date.now() - 5000) {
      // Profil mis à jour dans les 5 dernières secondes
      console.log('🔄 Profil modifié récemment, sync programmée');
    }
  }, [profile]);

  return {
    forceSync,
    profileData: profile
  };
}