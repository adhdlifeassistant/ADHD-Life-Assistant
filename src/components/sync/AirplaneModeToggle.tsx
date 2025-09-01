'use client';

import { useState, useEffect } from 'react';
import { useSyncStatus } from '@/hooks/useSyncStatus';

export function AirplaneModeToggle() {
  const { status } = useSyncStatus();
  const [airplaneMode, setAirplaneMode] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    // Charger l'état depuis localStorage
    const saved = localStorage.getItem('adhd_airplane_mode');
    if (saved === 'true') {
      setAirplaneMode(true);
    }
  }, []);

  const toggleAirplaneMode = () => {
    const newMode = !airplaneMode;
    setAirplaneMode(newMode);
    localStorage.setItem('adhd_airplane_mode', newMode.toString());
    
    // Dans une vraie implémentation, on informerait le SyncManager
    // SyncManager.getInstance().setAirplaneMode(newMode);
  };

  return (
    <div className="relative">
      <button
        onClick={toggleAirplaneMode}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className={`flex items-center space-x-2 px-3 py-2 rounded-lg font-medium transition-all duration-200 ${
          airplaneMode
            ? 'bg-orange-100 text-orange-800 border border-orange-300'
            : 'bg-gray-100 text-gray-600 border border-gray-300 hover:bg-gray-200'
        }`}
        title={airplaneMode ? 'Mode avion activé' : 'Activer le mode avion'}
      >
        <span className="text-lg">
          {airplaneMode ? '✈️' : '🌐'}
        </span>
        <span className="text-sm hidden sm:inline">
          {airplaneMode ? 'Mode avion' : 'En ligne'}
        </span>
      </button>

      {/* Tooltip explicatif */}
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg whitespace-nowrap z-50">
          <div className="text-center">
            {airplaneMode ? (
              <div>
                <div className="font-medium">Mode avion activé</div>
                <div className="opacity-90">Sync désactivée temporairement</div>
              </div>
            ) : (
              <div>
                <div className="font-medium">Désactiver la sync</div>
                <div className="opacity-90">Pour économiser batterie/data</div>
              </div>
            )}
          </div>
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
        </div>
      )}

      {/* Indicateur visuel subtil quand mode avion actif */}
      {airplaneMode && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-400 rounded-full border-2 border-white">
          <div className="w-full h-full bg-orange-400 rounded-full animate-pulse"></div>
        </div>
      )}
    </div>
  );
}

// Composant modal d'explication du mode avion pour les nouveaux utilisateurs
export function AirplaneModeExplanationModal({ 
  isOpen, 
  onClose 
}: { 
  isOpen: boolean; 
  onClose: () => void 
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <div className="text-center mb-6">
          <div className="text-4xl mb-3">✈️</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Mode Avion = Mode Tranquille
          </h2>
          <p className="text-gray-600">
            Parfait pour les moments où tu veux juste te concentrer !
          </p>
        </div>

        <div className="space-y-4 mb-6">
          <div className="flex items-start space-x-3">
            <div className="text-green-600 mt-0.5">✅</div>
            <div>
              <h3 className="font-medium text-gray-800">L'app fonctionne normalement</h3>
              <p className="text-sm text-gray-600">Tu peux continuer à utiliser toutes les fonctionnalités</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="text-blue-600 mt-0.5">🔋</div>
            <div>
              <h3 className="font-medium text-gray-800">Économise ta batterie</h3>
              <p className="text-sm text-gray-600">Pas de synchronisation en arrière-plan</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="text-purple-600 mt-0.5">📱</div>
            <div>
              <h3 className="font-medium text-gray-800">Économise tes données mobiles</h3>
              <p className="text-sm text-gray-600">Idéal quand tu n'es pas en WiFi</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="text-orange-600 mt-0.5">🛡️</div>
            <div>
              <h3 className="font-medium text-gray-800">Tes données sont safe</h3>
              <p className="text-sm text-gray-600">Tout sera sync quand tu réactives le mode en ligne</p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg mb-6 border border-blue-200">
          <div className="flex items-start">
            <div className="text-blue-600 mr-3 mt-0.5">💡</div>
            <div className="text-sm text-blue-700">
              <strong>Astuce :</strong> Active le mode avion quand tu veux te concentrer sans distractions, 
              ou pour économiser ta batterie lors de longues sessions d'utilisation.
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Compris ! 👍
        </button>
      </div>
    </div>
  );
}