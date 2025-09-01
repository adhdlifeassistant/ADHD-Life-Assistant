'use client';

import { createContext, useContext, useEffect, ReactNode } from 'react';
import { SyncManager } from '@/lib/sync/SyncManager';
import { SyncToast } from './SyncToast';
import { ErrorHandler } from '@/lib/sync/ErrorHandler';

interface SyncProviderProps {
  children: ReactNode;
  enableAutoSync?: boolean;
}

const SyncContext = createContext<SyncManager | null>(null);

export function SyncProvider({ children, enableAutoSync = true }: SyncProviderProps) {
  useEffect(() => {
    if (!enableAutoSync) return;

    const syncManager = SyncManager.getInstance();
    
    // Écouter les erreurs et les traiter avec l'ErrorHandler
    syncManager.onStatusChange((status) => {
      if (status.errorCount > 0) {
        // Log les erreurs de façon ADHD-friendly
        console.info('🔄 Quelques petits soucis de sync, mais on gère ! Pas de panique.');
      }
    });

    // Check initial des changements distants au démarrage
    setTimeout(() => {
      if (navigator.onLine) {
        syncManager.forceSync();
      }
    }, 3000);

    // Nettoyage au démontage du composant
    return () => {
      syncManager.destroy();
    };
  }, [enableAutoSync]);

  return (
    <SyncContext.Provider value={SyncManager.getInstance()}>
      {children}
      <SyncToast />
    </SyncContext.Provider>
  );
}

export function useSyncManager() {
  const context = useContext(SyncContext);
  if (!context) {
    throw new Error('useSyncManager must be used within a SyncProvider');
  }
  return context;
}