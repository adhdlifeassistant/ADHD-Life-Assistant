'use client';

import React, { useState } from 'react';
import { useProfile } from '@/hooks/useProfile';
import { useAppSettings } from '@/hooks/useAppSettings';

export function DataSection() {
  const { profile, clearProfile, importProfile } = useProfile();
  const { settings, exportSettings, importSettings, resetSettings } = useAppSettings();
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleExportProfile = () => {
    const profileData = JSON.stringify(profile, null, 2);
    const blob = new Blob([profileData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `adhd-assistant-profil-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportSettings = () => {
    const settingsData = exportSettings();
    const blob = new Blob([settingsData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `adhd-assistant-parametres-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportComplete = () => {
    const completeData = {
      profile,
      settings,
      exportDate: new Date().toISOString(),
      version: "1.0"
    };
    
    const dataJson = JSON.stringify(completeData, null, 2);
    const blob = new Blob([dataJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `adhd-assistant-complet-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>, type: 'profile' | 'settings' | 'complete') => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        
        switch (type) {
          case 'profile':
            importProfile(data);
            setImportStatus('success');
            break;
          case 'settings':
            if (importSettings(JSON.stringify(data))) {
              setImportStatus('success');
            } else {
              setImportStatus('error');
            }
            break;
          case 'complete':
            if (data.profile) importProfile(data.profile);
            if (data.settings && importSettings(JSON.stringify(data.settings))) {
              setImportStatus('success');
            } else {
              setImportStatus('error');
            }
            break;
        }
        
        setTimeout(() => setImportStatus('idle'), 3000);
      } catch (error) {
        console.error('Erreur import:', error);
        setImportStatus('error');
        setTimeout(() => setImportStatus('idle'), 3000);
      }
    };
    
    reader.readAsText(file);
    event.target.value = ''; // Reset input
  };

  const handleResetAll = () => {
    clearProfile();
    resetSettings();
    setShowConfirmReset(false);
    // Optionally redirect to onboarding
    window.location.href = '/onboarding';
  };

  const formatFileSize = (bytes: number) => {
    const kb = bytes / 1024;
    return `${kb.toFixed(1)} KB`;
  };

  const getDataSize = () => {
    const profileSize = new Blob([JSON.stringify(profile)]).size;
    const settingsSize = new Blob([JSON.stringify(settings)]).size;
    return {
      profile: formatFileSize(profileSize),
      settings: formatFileSize(settingsSize),
      total: formatFileSize(profileSize + settingsSize)
    };
  };

  const dataSize = getDataSize();

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">💾 Gestion des Données</h2>
        <p className="text-gray-600">Exportez, importez et gérez vos données personnelles</p>
      </div>

      {/* Statut des imports */}
      {importStatus !== 'idle' && (
        <div className={`p-4 rounded-lg border ${
          importStatus === 'success' 
            ? 'bg-green-50 border-green-200 text-green-700' 
            : 'bg-red-50 border-red-200 text-red-700'
        }`}>
          <div className="flex items-center gap-2">
            <span className="text-lg">
              {importStatus === 'success' ? '✅' : '❌'}
            </span>
            <span className="font-medium">
              {importStatus === 'success' 
                ? 'Import réussi ! Données mises à jour.'
                : 'Erreur lors de l\'import. Vérifiez le format du fichier.'
              }
            </span>
          </div>
        </div>
      )}

      {/* Aperçu des données */}
      <div className="bg-blue-50 p-6 rounded-xl">
        <h3 className="text-lg font-semibold text-blue-800 mb-4">📊 Aperçu de vos données</h3>
        
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg border border-blue-200">
            <div className="text-2xl font-bold text-blue-600 mb-1">{profile.medications?.length || 0}</div>
            <div className="text-sm text-blue-700">Médications</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-blue-200">
            <div className="text-2xl font-bold text-purple-600 mb-1">{profile.challenges?.length || 0}</div>
            <div className="text-sm text-blue-700">Défis ADHD</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-blue-200">
            <div className="text-2xl font-bold text-green-600 mb-1">{dataSize.total}</div>
            <div className="text-sm text-blue-700">Taille totale</div>
          </div>
        </div>

        <div className="text-sm text-blue-600 space-y-1">
          <p>• Profil: {dataSize.profile} (nom, médications, préférences)</p>
          <p>• Paramètres: {dataSize.settings} (interface, notifications)</p>
          <p>• Dernière mise à jour: {new Date(Math.max(profile.updatedAt || 0, settings.updatedAt || 0)).toLocaleDateString('fr-FR')}</p>
        </div>
      </div>

      {/* Export */}
      <div className="bg-green-50 p-6 rounded-xl">
        <h3 className="text-lg font-semibold text-green-800 mb-4">📤 Exporter vos données</h3>
        <p className="text-sm text-green-700 mb-6">
          Créez des sauvegardes de vos données pour les conserver ou les transférer vers un autre appareil
        </p>
        
        <div className="grid md:grid-cols-3 gap-4">
          <button
            onClick={handleExportProfile}
            className="p-4 bg-white border-2 border-green-200 rounded-lg hover:border-green-300 transition-colors"
          >
            <div className="text-2xl mb-2">👤</div>
            <div className="font-medium text-green-800 mb-1">Profil seul</div>
            <div className="text-xs text-green-600">Médications, défis, chronotype</div>
          </button>
          
          <button
            onClick={handleExportSettings}
            className="p-4 bg-white border-2 border-green-200 rounded-lg hover:border-green-300 transition-colors"
          >
            <div className="text-2xl mb-2">⚙️</div>
            <div className="font-medium text-green-800 mb-1">Paramètres seuls</div>
            <div className="text-xs text-green-600">Interface, notifications, thème</div>
          </button>
          
          <button
            onClick={handleExportComplete}
            className="p-4 bg-white border-2 border-green-300 rounded-lg hover:border-green-400 transition-colors"
          >
            <div className="text-2xl mb-2">📦</div>
            <div className="font-medium text-green-800 mb-1">Export complet</div>
            <div className="text-xs text-green-600">Tout : profil + paramètres</div>
          </button>
        </div>
      </div>

      {/* Import */}
      <div className="bg-orange-50 p-6 rounded-xl">
        <h3 className="text-lg font-semibold text-orange-800 mb-4">📥 Importer des données</h3>
        <p className="text-sm text-orange-700 mb-6">
          Restaurez une sauvegarde ou transférez vos données depuis un autre appareil
        </p>
        
        <div className="grid md:grid-cols-3 gap-4">
          <div className="p-4 bg-white border-2 border-orange-200 rounded-lg">
            <div className="text-2xl mb-2">👤</div>
            <div className="font-medium text-orange-800 mb-2">Profil</div>
            <input
              type="file"
              accept=".json"
              onChange={(e) => handleFileImport(e, 'profile')}
              className="hidden"
              id="import-profile"
            />
            <label
              htmlFor="import-profile"
              className="block w-full px-3 py-2 text-sm bg-orange-100 text-orange-700 rounded cursor-pointer hover:bg-orange-200 transition-colors text-center"
            >
              Choisir fichier
            </label>
          </div>
          
          <div className="p-4 bg-white border-2 border-orange-200 rounded-lg">
            <div className="text-2xl mb-2">⚙️</div>
            <div className="font-medium text-orange-800 mb-2">Paramètres</div>
            <input
              type="file"
              accept=".json"
              onChange={(e) => handleFileImport(e, 'settings')}
              className="hidden"
              id="import-settings"
            />
            <label
              htmlFor="import-settings"
              className="block w-full px-3 py-2 text-sm bg-orange-100 text-orange-700 rounded cursor-pointer hover:bg-orange-200 transition-colors text-center"
            >
              Choisir fichier
            </label>
          </div>
          
          <div className="p-4 bg-white border-2 border-orange-300 rounded-lg">
            <div className="text-2xl mb-2">📦</div>
            <div className="font-medium text-orange-800 mb-2">Complet</div>
            <input
              type="file"
              accept=".json"
              onChange={(e) => handleFileImport(e, 'complete')}
              className="hidden"
              id="import-complete"
            />
            <label
              htmlFor="import-complete"
              className="block w-full px-3 py-2 text-sm bg-orange-100 text-orange-700 rounded cursor-pointer hover:bg-orange-200 transition-colors text-center"
            >
              Choisir fichier
            </label>
          </div>
        </div>
      </div>

      {/* Zone dangereuse */}
      <div className="bg-red-50 p-6 rounded-xl border-2 border-red-200">
        <h3 className="text-lg font-semibold text-red-800 mb-4">⚠️ Zone de danger</h3>
        <p className="text-sm text-red-700 mb-6">
          Ces actions sont irréversibles. Assurez-vous d'avoir exporté vos données importantes.
        </p>
        
        {!showConfirmReset ? (
          <button
            onClick={() => setShowConfirmReset(true)}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            🗑️ Réinitialiser toutes les données
          </button>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-white border-2 border-red-300 rounded-lg">
              <div className="font-medium text-red-800 mb-2">⚠️ Confirmation requise</div>
              <p className="text-sm text-red-700 mb-4">
                Cette action supprimera définitivement :
              </p>
              <ul className="text-sm text-red-600 mb-4 list-disc list-inside space-y-1">
                <li>Votre profil personnel (nom, âge, avatar)</li>
                <li>Toutes vos médications et leurs paramètres</li>
                <li>Vos préférences (chronotype, défis ADHD)</li>
                <li>Tous les paramètres de l'application</li>
              </ul>
              <p className="text-sm text-red-700 font-medium">
                Vous serez redirigé vers l'onboarding pour recommencer.
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmReset(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={handleResetAll}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Oui, tout supprimer
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Conseils */}
      <div className="bg-blue-50 p-6 rounded-xl">
        <h4 className="font-semibold text-blue-800 mb-3">💡 Conseils pour la gestion des données</h4>
        <div className="text-sm text-blue-700 space-y-2">
          <p>• <strong>Sauvegarde régulière :</strong> Exportez vos données chaque semaine pour éviter les pertes</p>
          <p>• <strong>Transfert d'appareil :</strong> Utilisez l'export complet pour migrer vers un nouveau téléphone</p>
          <p>• <strong>Confidentialité :</strong> Toutes vos données restent locales, rien n'est envoyé sur Internet</p>
          <p>• <strong>Formats :</strong> Les fichiers sont au format JSON standard, lisibles par d'autres applications</p>
        </div>
      </div>
    </div>
  );
}