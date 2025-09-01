import React, { useState, useEffect } from 'react';
import { ADHDStorageManager, useADHDStorageManager } from './ADHDStorageManager';

// Exemple d'utilisation de l'interface de stockage ADHD-optimisée
export const StorageExampleApp: React.FC = () => {
  // État de l'application exemple
  const [userData, setUserData] = useState({
    name: 'Alex',
    tasks: ['Prendre médicaments', 'Réviser présentation', 'Appeler médecin'],
    notes: 'Aujourd\'hui c\'est un bon jour pour se concentrer !',
    lastModified: new Date()
  });

  // Simuler des services de sync
  const syncToCloud = async (): Promise<void> => {
    // Simuler appel API
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simuler erreur parfois (à des fins de démonstration)
    if (Math.random() < 0.1) {
      throw new Error('Network timeout');
    }
    
    console.log('✅ Données synchronisées vers le cloud');
  };

  const exportData = async (): Promise<void> => {
    // Simuler génération de fichier
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const dataStr = JSON.stringify(userData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    // Créer un lien de téléchargement
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `adhd-data-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    // Nettoyer
    URL.revokeObjectURL(url);
    
    console.log('📁 Données exportées');
  };

  const saveLocally = async (): Promise<void> => {
    // Sauvegarder dans localStorage
    localStorage.setItem('adhd_user_data', JSON.stringify(userData));
    console.log('💾 Données sauvées localement');
  };

  // Utiliser le hook du storage manager
  const {
    hasUnsavedChanges,
    isOnline,
    markAsChanged,
    markAsSaved,
    storageManagerProps
  } = useADHDStorageManager({
    onSync: syncToCloud,
    onExport: exportData,
    onSave: saveLocally,
    userData
  });

  // Charger les données au démarrage
  useEffect(() => {
    const savedData = localStorage.getItem('adhd_user_data');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setUserData({ ...parsed, lastModified: new Date(parsed.lastModified) });
      } catch (error) {
        console.warn('Erreur lors du chargement des données sauvées');
      }
    }
  }, []);

  // Fonctions pour modifier les données (marquer comme modifié)
  const updateUserData = (updates: Partial<typeof userData>) => {
    setUserData(prev => ({
      ...prev,
      ...updates,
      lastModified: new Date()
    }));
    markAsChanged();
  };

  const addTask = () => {
    const newTask = prompt('Nouvelle tâche :');
    if (newTask) {
      updateUserData({
        tasks: [...userData.tasks, newTask]
      });
    }
  };

  const removeTask = (index: number) => {
    updateUserData({
      tasks: userData.tasks.filter((_, i) => i !== index)
    });
  };

  const updateNotes = (notes: string) => {
    updateUserData({ notes });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          🧠 Assistant ADHD - Interface de Stockage Ultra-Intuitive
        </h1>

        {/* Gestionnaire de stockage ADHD */}
        <ADHDStorageManager
          {...storageManagerProps}
          className="mb-8"
          enableKeyboardShortcuts={true}
          enableSwipeGestures={true}
          enableAutoSync={true}
          autoSyncInterval={30000} // 30 secondes pour la démo
        />

        {/* Interface utilisateur exemple */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Profil utilisateur */}
          <div className="bg-white rounded-xl shadow-sm p-6 border">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              👤 Profil
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom
                </label>
                <input
                  type="text"
                  value={userData.name}
                  onChange={(e) => updateUserData({ name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes du jour
                </label>
                <textarea
                  value={userData.notes}
                  onChange={(e) => updateNotes(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Comment te sens-tu aujourd'hui ?"
                />
              </div>

              <div className="text-sm text-gray-500">
                Dernière modification : {userData.lastModified.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Liste des tâches */}
          <div className="bg-white rounded-xl shadow-sm p-6 border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                ✅ Mes Tâches
              </h2>
              <button
                onClick={addTask}
                className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium"
              >
                + Ajouter
              </button>
            </div>
            
            <div className="space-y-3">
              {userData.tasks.map((task, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <span className="flex-1">{task}</span>
                  <button
                    onClick={() => removeTask(index)}
                    className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded"
                  >
                    ❌
                  </button>
                </div>
              ))}
              
              {userData.tasks.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  Aucune tâche pour le moment.<br />
                  <span className="text-sm">Clique sur "Ajouter" pour commencer ! 🎯</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Informations sur l'état */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-2">
            🔧 État de l'application
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="font-medium text-blue-700">Connexion</div>
              <div className={isOnline ? 'text-green-600' : 'text-red-600'}>
                {isOnline ? '🟢 En ligne' : '🔴 Hors ligne'}
              </div>
            </div>
            <div>
              <div className="font-medium text-blue-700">Modifications</div>
              <div className={hasUnsavedChanges ? 'text-orange-600' : 'text-green-600'}>
                {hasUnsavedChanges ? '⚠️ Non sauvées' : '✅ À jour'}
              </div>
            </div>
            <div>
              <div className="font-medium text-blue-700">Raccourcis</div>
              <div className="text-gray-600">Ctrl+S pour sync</div>
            </div>
            <div>
              <div className="font-medium text-blue-700">Mobile</div>
              <div className="text-gray-600">Swipe down = refresh</div>
            </div>
          </div>
        </div>

        {/* Guide d'utilisation */}
        <div className="mt-8 bg-gray-100 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            📖 Guide d'utilisation ADHD
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <h4 className="font-medium text-gray-800 mb-2">🎯 Fonctionnalités Principales</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Sync automatique toutes les 30 secondes</li>
                <li>• Messages d'erreur bienveillants</li>
                <li>• Feedback visuel temps réel</li>
                <li>• Bouton sync flottant toujours accessible</li>
                <li>• Mode hors-ligne fonctionnel</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-800 mb-2">⌨️ Raccourcis Clavier</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• <kbd className="px-1 bg-white rounded">Ctrl+S</kbd> : Sync maintenant</li>
                <li>• <kbd className="px-1 bg-white rounded">Ctrl+E</kbd> : Export données</li>
                <li>• <kbd className="px-1 bg-white rounded">Ctrl+Q</kbd> : Sauvegarde locale</li>
                <li>• <kbd className="px-1 bg-white rounded">Ctrl+I</kbd> : Info statut</li>
                <li>• <kbd className="px-1 bg-white rounded">Échap</kbd> : Fermer modales</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-800 mb-2">📱 Gestes Tactiles</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Swipe down : Actualiser/Sync</li>
                <li>• Pull to refresh : Sync forcée</li>
                <li>• Feedback haptique sur actions</li>
                <li>• Animations adaptatives selon performance</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-800 mb-2">🧠 Optimisations ADHD</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Messages encourageants, pas stressants</li>
                <li>• Couleurs apaisantes (pas de rouge agressif)</li>
                <li>• Actions en 2 clics maximum</li>
                <li>• Temps d'attente précis affichés</li>
                <li>• Preload intelligent des données fréquentes</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Exemple d'intégration simple
export const SimpleStorageExample: React.FC = () => {
  const {
    hasUnsavedChanges,
    markAsChanged,
    storageManagerProps
  } = useADHDStorageManager({
    onSync: async () => {
      // Votre logique de sync
      await new Promise(resolve => setTimeout(resolve, 1000));
    },
    onExport: async () => {
      // Votre logique d'export
      console.log('Exporté !');
    },
    userData: { example: 'data' }
  });

  return (
    <div className="p-4">
      <ADHDStorageManager {...storageManagerProps} />
      
      <button 
        onClick={markAsChanged}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
      >
        Simuler une modification
      </button>
    </div>
  );
};

export default StorageExampleApp;