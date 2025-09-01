import { useState, useEffect, useRef } from 'react';
import { SyncManager, SyncStatus, ConflictResolution } from '@/lib/sync/SyncManager';

export function useSyncStatus() {
  const syncManager = useRef(SyncManager.getInstance());
  const [status, setStatus] = useState<SyncStatus>(syncManager.current.getStatus());
  const [conflicts, setConflicts] = useState<ConflictResolution[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const manager = syncManager.current;
    
    // Callback pour les changements de statut
    const handleStatusChange = (newStatus: SyncStatus) => {
      setStatus(newStatus);
    };
    
    // Callback pour les conflits
    const handleConflict = (conflict: ConflictResolution) => {
      setConflicts(prev => [...prev, conflict]);
    };
    
    manager.onStatusChange(handleStatusChange);
    manager.onConflict(handleConflict);
    
    // Charger les conflits existants
    setConflicts(manager.getPendingConflicts());
    setIsInitialized(true);
    
    // Pas de nettoyage des callbacks car le SyncManager est singleton
    return () => {};
  }, []);

  const resolveConflict = (conflictId: string, useLocal: boolean) => {
    syncManager.current.resolveConflict(conflictId, useLocal);
    setConflicts(prev => prev.filter(c => c.id !== conflictId));
  };

  const forceSync = () => {
    syncManager.current.forceSync();
  };

  const getSyncIcon = () => {
    switch (status.status) {
      case 'synced': return '🟢';
      case 'syncing': return '🟡';
      case 'offline': return '🔴';
      case 'error': return '❌';
      default: return '🔴';
    }
  };

  const getSyncLabel = () => {
    switch (status.status) {
      case 'synced': return 'Synchronisé';
      case 'syncing': return 'Synchronisation...';
      case 'offline': return 'Hors ligne';
      case 'error': return 'Erreur de sync';
      default: return 'Déconnecté';
    }
  };

  return {
    status,
    conflicts,
    isInitialized,
    resolveConflict,
    forceSync,
    getSyncIcon,
    getSyncLabel,
    hasPendingChanges: status.pendingOperations > 0,
    hasErrors: status.errorCount > 0,
    hasConflicts: conflicts.length > 0
  };
}