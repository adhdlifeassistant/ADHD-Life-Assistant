'use client';

import { useSyncStatus } from '@/hooks/useSyncStatus';

interface SyncProgressBarProps {
  className?: string;
  showLabel?: boolean;
}

export function SyncProgressBar({ className = '', showLabel = true }: SyncProgressBarProps) {
  const { status } = useSyncStatus();

  if (!status.isSyncing && status.pendingOperations === 0) {
    return null;
  }

  // Calcul du pourcentage approximatif
  const getProgress = () => {
    if (!status.isSyncing) return 0;
    
    // Animation simple qui simule le progrès
    // Dans une vraie implémentation, on pourrait tracker les opérations plus finement
    return Math.min(85, Date.now() % 10000 / 100);
  };

  const progress = getProgress();

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">
            {status.isSyncing ? 'Synchronisation en cours...' : `${status.pendingOperations} en attente`}
          </span>
          <span className="text-xs text-gray-500">
            {status.isSyncing ? `${Math.round(progress)}%` : ''}
          </span>
        </div>
      )}
      
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div
          className={`h-full transition-all duration-500 ease-out rounded-full ${
            status.isSyncing 
              ? 'bg-gradient-to-r from-blue-400 to-blue-600 animate-pulse' 
              : 'bg-yellow-400'
          }`}
          style={{
            width: status.isSyncing 
              ? `${progress}%` 
              : `${Math.max(10, (status.pendingOperations / 10) * 100)}%`
          }}
        />
      </div>
      
      {status.pendingOperations > 0 && !status.isSyncing && (
        <div className="text-xs text-gray-500 mt-1">
          {status.isOnline 
            ? 'En attente de synchronisation...'
            : 'Sera synchronisé quand tu seras en ligne'
          }
        </div>
      )}
    </div>
  );
}