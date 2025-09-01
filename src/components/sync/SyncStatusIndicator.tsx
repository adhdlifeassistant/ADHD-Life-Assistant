'use client';

import { useSyncStatus } from '@/hooks/useSyncStatus';
import { ConflictResolutionModal } from './ConflictResolutionModal';
import { useState } from 'react';

interface SyncStatusIndicatorProps {
  className?: string;
  showDetails?: boolean;
}

export function SyncStatusIndicator({ className = '', showDetails = true }: SyncStatusIndicatorProps) {
  const { 
    status, 
    conflicts, 
    resolveConflict, 
    forceSync, 
    getSyncIcon, 
    getSyncLabel, 
    hasPendingChanges, 
    hasErrors, 
    hasConflicts 
  } = useSyncStatus();
  
  const [selectedConflict, setSelectedConflict] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  const currentConflict = conflicts.find(c => c.id === selectedConflict);

  const getProgressWidth = () => {
    if (!status.isSyncing) return '0%';
    // Animation simple de progress
    return '75%';
  };

  const formatLastSync = () => {
    if (!status.lastSync) return 'Jamais synchronisé';
    
    const now = Date.now();
    const diff = now - status.lastSync;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'À l\'instant';
    if (minutes < 60) return `Il y a ${minutes}min`;
    if (hours < 24) return `Il y a ${hours}h`;
    return `Il y a ${days}j`;
  };

  return (
    <>
      <div className={`relative ${className}`}>
        {/* Indicateur principal */}
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors relative"
          title={getSyncLabel()}
        >
          <span className="text-lg">{getSyncIcon()}</span>
          
          {showDetails && (
            <div className="hidden sm:block">
              <div className="text-sm font-medium text-gray-700">{getSyncLabel()}</div>
              {status.isSyncing && (
                <div className="w-20 h-1 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 transition-all duration-1000 ease-out"
                    style={{ width: getProgressWidth() }}
                  />
                </div>
              )}
            </div>
          )}

          {/* Badge pour les notifications importantes */}
          {(hasConflicts || hasErrors || hasPendingChanges) && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
          )}
        </button>

        {/* Dropdown avec détails */}
        {showDropdown && (
          <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 p-4 z-50">
            <div className="space-y-4">
              {/* Statut détaillé */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Statut</span>
                  <span className="text-xs text-gray-500">{formatLastSync()}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{getSyncIcon()}</span>
                  <span className="text-sm text-gray-600">{getSyncLabel()}</span>
                </div>
              </div>

              {/* Progress bar si en cours de sync */}
              {status.isSyncing && (
                <div>
                  <div className="text-xs text-gray-500 mb-1">Synchronisation en cours...</div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 transition-all duration-1000 ease-out animate-pulse"
                      style={{ width: getProgressWidth() }}
                    />
                  </div>
                </div>
              )}

              {/* Statistiques */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-500">En attente</div>
                  <div className="font-medium">{status.pendingOperations}</div>
                </div>
                <div>
                  <div className="text-gray-500">Erreurs</div>
                  <div className="font-medium text-red-600">{status.errorCount}</div>
                </div>
              </div>

              {/* Conflits */}
              {hasConflicts && (
                <div className="border-t pt-4">
                  <div className="text-sm font-medium text-red-600 mb-2">
                    ⚠️ {conflicts.length} conflit{conflicts.length > 1 ? 's' : ''} à résoudre
                  </div>
                  <div className="space-y-2">
                    {conflicts.map(conflict => (
                      <button
                        key={conflict.id}
                        onClick={() => setSelectedConflict(conflict.id)}
                        className="w-full text-left p-2 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                      >
                        <div className="text-sm font-medium text-red-800">
                          {conflict.module}
                        </div>
                        <div className="text-xs text-red-600">
                          Détecté le {new Date(conflict.timestamp).toLocaleString('fr-FR')}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="border-t pt-4 space-y-2">
                <button
                  onClick={forceSync}
                  disabled={!status.isOnline || status.isSyncing}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  {status.isSyncing ? 'Synchronisation...' : 'Forcer la synchronisation'}
                </button>
                
                {!status.isOnline && (
                  <div className="text-xs text-red-600 text-center">
                    Connexion internet requise pour synchroniser
                  </div>
                )}
              </div>

              {/* Messages ADHD-friendly */}
              {status.status === 'synced' && (
                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="flex items-center text-green-700">
                    <span className="mr-2">✅</span>
                    <span className="text-sm">Tout est synchronisé ! Tes données sont safe.</span>
                  </div>
                </div>
              )}

              {status.status === 'offline' && (
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="flex items-center text-blue-700">
                    <span className="mr-2">📱</span>
                    <span className="text-sm">Mode hors-ligne. Pas de stress, tout sera sync plus tard !</span>
                  </div>
                </div>
              )}

              {hasErrors && (
                <div className="bg-yellow-50 p-3 rounded-lg">
                  <div className="flex items-center text-yellow-700">
                    <span className="mr-2">🔄</span>
                    <span className="text-sm">Quelques petits soucis, mais on réessaye automatiquement.</span>
                  </div>
                </div>
              )}
            </div>

            {/* Bouton fermer */}
            <button
              onClick={() => setShowDropdown(false)}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-100"
            >
              ×
            </button>
          </div>
        )}
      </div>

      {/* Modal de résolution des conflits */}
      {currentConflict && (
        <ConflictResolutionModal
          conflict={currentConflict}
          onResolve={(id, useLocal) => {
            resolveConflict(id, useLocal);
            setSelectedConflict(null);
          }}
          onClose={() => setSelectedConflict(null)}
        />
      )}
    </>
  );
}