'use client';

import { SyncStatusIndicator } from './SyncStatusIndicator';
import { SyncProgressBar } from './SyncProgressBar';
import { AirplaneModeToggle } from './AirplaneModeToggle';
import { useSyncStatus } from '@/hooks/useSyncStatus';
import { useState } from 'react';

export function SyncDashboard() {
  const { status } = useSyncStatus();
  const [showDetails, setShowDetails] = useState(false);

  const formatDataSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">Synchronisation</h2>
          <p className="text-sm text-gray-600">État de tes données entre appareils</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <AirplaneModeToggle />
          <SyncStatusIndicator showDetails={false} />
        </div>
      </div>

      {/* Progress bar si sync en cours */}
      {(status.isSyncing || status.pendingOperations > 0) && (
        <div className="mb-6">
          <SyncProgressBar />
        </div>
      )}

      {/* Statistiques de sync */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-gray-800">{status.pendingOperations}</div>
          <div className="text-sm text-gray-600">En attente</div>
        </div>
        
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-gray-800">{status.errorCount}</div>
          <div className="text-sm text-gray-600">Erreurs</div>
        </div>
        
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">
            {status.lastSync ? '✓' : '○'}
          </div>
          <div className="text-sm text-gray-600">
            {status.lastSync ? 'Synchronisé' : 'Jamais sync'}
          </div>
        </div>
        
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">
            {status.isOnline ? '🌐' : '📱'}
          </div>
          <div className="text-sm text-gray-600">
            {status.isOnline ? 'En ligne' : 'Hors ligne'}
          </div>
        </div>
      </div>

      {/* Dernière synchronisation */}
      {status.lastSync && (
        <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200 mb-4">
          <div className="flex items-center space-x-3">
            <div className="text-green-600">✅</div>
            <div>
              <div className="font-medium text-green-800">Dernière synchronisation</div>
              <div className="text-sm text-green-600">
                {new Date(status.lastSync).toLocaleString('fr-FR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Messages d'état contextuels */}
      {!status.isOnline && (
        <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg border border-blue-200 mb-4">
          <div className="text-blue-600">📱</div>
          <div>
            <div className="font-medium text-blue-800">Mode hors-ligne actif</div>
            <div className="text-sm text-blue-600">
              L'app fonctionne normalement ! Tout sera synchronisé dès que tu seras reconnecté.
            </div>
          </div>
        </div>
      )}

      {status.errorCount > 0 && (
        <div className="flex items-start space-x-3 p-4 bg-yellow-50 rounded-lg border border-yellow-200 mb-4">
          <div className="text-yellow-600">🔄</div>
          <div>
            <div className="font-medium text-yellow-800">Quelques petits soucis</div>
            <div className="text-sm text-yellow-600">
              Pas de panique ! On réessaye automatiquement. Tes données sont en sécurité.
            </div>
          </div>
        </div>
      )}

      {status.status === 'synced' && status.pendingOperations === 0 && (
        <div className="flex items-start space-x-3 p-4 bg-green-50 rounded-lg border border-green-200 mb-4">
          <div className="text-green-600">🎉</div>
          <div>
            <div className="font-medium text-green-800">Tout est à jour !</div>
            <div className="text-sm text-green-600">
              Tes données sont synchronisées sur tous tes appareils. Tu peux utiliser l'app en toute tranquillité !
            </div>
          </div>
        </div>
      )}

      {/* Boutons d'action */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          {showDetails ? 'Masquer' : 'Voir'} les détails
        </button>
        
        <button
          onClick={() => {
            console.log('🔄 SYNC DEBUG: Bouton cliqué');
            console.log('🔄 SYNC DEBUG: Status.isOnline:', status.isOnline);
            console.log('🔄 SYNC DEBUG: Status.isSyncing:', status.isSyncing);
            
            if (status.isOnline) {
              try {
                console.log('🔄 SYNC DEBUG: Importing SyncManager...');
                const { SyncManager } = require('@/lib/sync/SyncManager');
                console.log('🔄 SYNC DEBUG: Getting SyncManager instance...');
                const syncManager = SyncManager.getInstance();
                console.log('🔄 SYNC DEBUG: Calling forceSync()...');
                syncManager.forceSync();
                console.log('🔄 SYNC DEBUG: forceSync() appelé avec succès');
              } catch (error) {
                console.error('❌ SYNC DEBUG: Erreur lors de forceSync:', error);
              }
            } else {
              console.log('❌ SYNC DEBUG: Pas en ligne, sync ignorée');
            }
          }}
          disabled={!status.isOnline || status.isSyncing}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {status.isSyncing ? 'Sync en cours...' : 'Synchroniser maintenant'}
        </button>
      </div>

      {/* Détails techniques (cachés par défaut) */}
      {showDetails && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-800 mb-3">Détails techniques</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-gray-600">Statut</div>
              <div className="font-mono text-gray-800">{status.status}</div>
            </div>
            <div>
              <div className="text-gray-600">En ligne</div>
              <div className="font-mono text-gray-800">{status.isOnline ? 'Oui' : 'Non'}</div>
            </div>
            <div>
              <div className="text-gray-600">Synchronisation active</div>
              <div className="font-mono text-gray-800">{status.isSyncing ? 'Oui' : 'Non'}</div>
            </div>
            <div>
              <div className="text-gray-600">Opérations en attente</div>
              <div className="font-mono text-gray-800">{status.pendingOperations}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}