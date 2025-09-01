'use client';

import { ConflictResolution } from '@/lib/sync/SyncManager';

interface ConflictResolutionModalProps {
  conflict: ConflictResolution;
  onResolve: (conflictId: string, useLocal: boolean) => void;
  onClose: () => void;
}

export function ConflictResolutionModal({ conflict, onResolve, onClose }: ConflictResolutionModalProps) {
  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getModuleDisplayName = (module: string) => {
    const moduleNames: Record<string, string> = {
      profile: 'Profil',
      health: 'Santé & Médicaments',
      mood: 'Humeur & Émotions',
      reminders: 'Rappels',
      checklists: 'Listes de tâches',
      finance: 'Finances',
      cooking: 'Cuisine'
    };
    return moduleNames[module] || module;
  };

  const renderDataComparison = (localData: any, remoteData: any) => {
    if (Array.isArray(localData) && Array.isArray(remoteData)) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">Sur cet appareil</h4>
            <div className="text-sm text-blue-700">
              {localData.length} éléments
              {localData.length > 0 && (
                <div className="mt-2 space-y-1 max-h-32 overflow-y-auto">
                  {localData.slice(0, 5).map((item: any, index: number) => (
                    <div key={index} className="truncate bg-white p-2 rounded text-xs">
                      {typeof item === 'object' ? (item.name || item.title || JSON.stringify(item).slice(0, 50) + '...') : item}
                    </div>
                  ))}
                  {localData.length > 5 && <div className="text-xs italic">... et {localData.length - 5} autres</div>}
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-medium text-green-800 mb-2">Sur le cloud</h4>
            <div className="text-sm text-green-700">
              {remoteData.length} éléments
              {remoteData.length > 0 && (
                <div className="mt-2 space-y-1 max-h-32 overflow-y-auto">
                  {remoteData.slice(0, 5).map((item: any, index: number) => (
                    <div key={index} className="truncate bg-white p-2 rounded text-xs">
                      {typeof item === 'object' ? (item.name || item.title || JSON.stringify(item).slice(0, 50) + '...') : item}
                    </div>
                  ))}
                  {remoteData.length > 5 && <div className="text-xs italic">... et {remoteData.length - 5} autres</div>}
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    // Pour les objets simples
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2">Version locale</h4>
          <pre className="text-xs text-blue-700 bg-white p-2 rounded overflow-auto max-h-32">
            {JSON.stringify(localData, null, 2)}
          </pre>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg">
          <h4 className="font-medium text-green-800 mb-2">Version cloud</h4>
          <pre className="text-xs text-green-700 bg-white p-2 rounded overflow-auto max-h-32">
            {JSON.stringify(remoteData, null, 2)}
          </pre>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="p-6">
          {/* Header bienveillant */}
          <div className="text-center mb-6">
            <div className="text-4xl mb-2">🤝</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Pas de panique ! On va résoudre ça ensemble
            </h2>
            <p className="text-gray-600">
              Tes données sont en sécurité. On a juste trouvé deux versions différentes de tes <strong>{getModuleDisplayName(conflict.module)}</strong>
            </p>
          </div>

          {/* Explication simple */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <div className="text-yellow-600 mr-3">💡</div>
              <div>
                <h3 className="font-medium text-yellow-800 mb-1">Que s'est-il passé ?</h3>
                <p className="text-sm text-yellow-700">
                  Tu as modifié tes {getModuleDisplayName(conflict.module).toLowerCase()} sur cet appareil, 
                  mais une version différente existe aussi dans le cloud. C'est normal quand tu utilises 
                  plusieurs appareils !
                </p>
              </div>
            </div>
          </div>

          {/* Comparaison des données */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Quelle version veux-tu garder ?</h3>
            {renderDataComparison(conflict.localData, conflict.remoteData)}
          </div>

          {/* Information sur le timestamp */}
          <div className="bg-gray-50 p-3 rounded-lg mb-6 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Version locale : {formatTimestamp(conflict.timestamp)}</span>
              <span>Détecté le {formatTimestamp(conflict.timestamp)}</span>
            </div>
          </div>

          {/* Boutons de résolution */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => onResolve(conflict.id, true)}
              className="flex-1 bg-blue-600 text-white px-6 py-4 rounded-xl font-medium hover:bg-blue-700 transition-colors focus:ring-4 focus:ring-blue-200 focus:outline-none"
            >
              <div className="flex items-center justify-center">
                <span className="mr-2">📱</span>
                <div className="text-left">
                  <div>Garder la version de cet appareil</div>
                  <div className="text-sm opacity-90">Elle écrasera la version cloud</div>
                </div>
              </div>
            </button>
            
            <button
              onClick={() => onResolve(conflict.id, false)}
              className="flex-1 bg-green-600 text-white px-6 py-4 rounded-xl font-medium hover:bg-green-700 transition-colors focus:ring-4 focus:ring-green-200 focus:outline-none"
            >
              <div className="flex items-center justify-center">
                <span className="mr-2">☁️</span>
                <div className="text-left">
                  <div>Garder la version du cloud</div>
                  <div className="text-sm opacity-90">Elle remplacera celle-ci</div>
                </div>
              </div>
            </button>
          </div>

          {/* Message rassurant */}
          <div className="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
            <div className="flex items-start">
              <div className="text-purple-600 mr-3">🛡️</div>
              <div className="text-sm text-purple-700">
                <strong>Tes données sont protégées :</strong> Peu importe ton choix, 
                rien ne sera perdu définitivement. Une sauvegarde reste toujours dans le cloud.
              </div>
            </div>
          </div>

          {/* Bouton fermer */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
}