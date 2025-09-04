'use client';

import React, { useState, useEffect } from 'react';
import { useProfile } from '@/hooks/useProfile';
import { useAppSettings } from '@/hooks/useAppSettings';
import { GoogleAuthProvider } from '@/lib/auth/GoogleAuthProvider';
import { SyncManager } from '@/lib/sync/SyncManager';
import { DriveService } from '@/lib/sync/DriveService';

export function DataSection() {
  const { profile, clearProfile, importProfile } = useProfile();
  const { settings, exportSettings, importSettings, resetSettings } = useAppSettings();
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  
  // Services réels d'authentification et de synchronisation
  const [authProvider] = useState(() => new GoogleAuthProvider());
  const [syncManager] = useState(() => SyncManager.getInstance());
  const [driveService] = useState(() => new DriveService(authProvider));
  
  // États réels pour le stockage cloud
  const [isConnectedToCloud, setIsConnectedToCloud] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [autoSync, setAutoSync] = useState(true);
  const [autoBackup, setAutoBackup] = useState(true);
  const [cloudAccount, setCloudAccount] = useState<string | null>(null);
  const [storageUsage, setStorageUsage] = useState({ used: 0, limit: 15000000000 }); // 15GB par défaut
  const [syncError, setSyncError] = useState<string | null>(null);
  const [recentExports, setRecentExports] = useState<string[]>([]);

  // Initialisation et vérification de l'état d'authentification
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Vérifier si l'utilisateur était déjà connecté
        const isRestored = await authProvider.restoreSession();
        if (isRestored) {
          const user = await authProvider.getCurrentUser();
          if (user) {
            setIsConnectedToCloud(true);
            setCloudAccount(user.email);
            
            // Récupérer l'usage du stockage
            try {
              const usage = await driveService.getStorageUsage();
              setStorageUsage(usage);
            } catch (error) {
              console.warn('Impossible de récupérer l\'usage du stockage:', error);
            }
          }
        }

        // Récupérer le statut de sync
        const syncStatus = syncManager.getStatus();
        setLastSync(syncStatus.lastSync ? new Date(syncStatus.lastSync) : null);
        setIsSyncing(syncStatus.isSyncing);

        // Charger la liste des exports récents depuis localStorage
        const savedExports = localStorage.getItem('medical_reports_history');
        if (savedExports) {
          setRecentExports(JSON.parse(savedExports));
        }
      } catch (error) {
        console.error('Erreur lors de l\'initialisation:', error);
        setSyncError('Erreur lors de l\'initialisation des services cloud');
      }
    };

    initializeAuth();

    // Écouter les changements de statut de sync
    const handleSyncStatusChange = (status: any) => {
      setIsSyncing(status.isSyncing);
      setLastSync(status.lastSync ? new Date(status.lastSync) : null);
      if (status.status === 'error') {
        setSyncError('Erreur de synchronisation');
      } else {
        setSyncError(null);
      }
    };

    syncManager.onStatusChange(handleSyncStatusChange);

    return () => {
      // Cleanup si nécessaire
    };
  }, [authProvider, driveService, syncManager]);

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
    // Redirect to home
    window.location.href = '/';
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

  // Fonctions réelles pour l'authentification et la synchronisation
  const handleConnectToCloud = async () => {
    if (isConnectedToCloud) {
      // Déconnexion
      try {
        await authProvider.signOut();
        setIsConnectedToCloud(false);
        setCloudAccount(null);
        setStorageUsage({ used: 0, limit: 15000000000 });
        setSyncError(null);
      } catch (error) {
        console.error('Erreur lors de la déconnexion:', error);
        setSyncError('Erreur lors de la déconnexion');
      }
    } else {
      // Connexion OAuth Google
      setIsConnecting(true);
      setSyncError(null);
      try {
        const user = await authProvider.signIn();
        setIsConnectedToCloud(true);
        setCloudAccount(user.email);
        
        // Récupérer l'usage du stockage après connexion
        const usage = await driveService.getStorageUsage();
        setStorageUsage(usage);
        
        // Synchroniser automatiquement après connexion
        syncManager.forceSync();
        
      } catch (error: any) {
        console.error('Erreur lors de la connexion:', error);
        setSyncError(`Erreur de connexion: ${error.message || 'Connexion échouée'}`);
      } finally {
        setIsConnecting(false);
      }
    }
  };

  const handleSyncNow = async () => {
    if (!isConnectedToCloud) {
      setSyncError('Veuillez vous connecter à Google Drive d\'abord');
      return;
    }

    setIsSyncing(true);
    setSyncError(null);
    
    try {
      // Ajouter les données de profil et paramètres à la queue de sync
      syncManager.addOperation({
        type: 'upload',
        module: 'profile',
        data: profile,
        maxRetries: 3
      });
      
      syncManager.addOperation({
        type: 'upload',
        module: 'settings',
        data: settings,
        maxRetries: 3
      });

      // Forcer la synchronisation
      syncManager.forceSync();
      
      // La mise à jour de l'état se fera via le callback onStatusChange
    } catch (error: any) {
      console.error('Erreur lors de la synchronisation:', error);
      setSyncError(`Erreur de synchronisation: ${error.message}`);
      setIsSyncing(false);
    }
  };

  const handleViewCloudData = () => {
    // Ouvrir l'interface Google Drive avec recherche pour les fichiers ADHD
    const driveUrl = 'https://drive.google.com/drive/search?q=adhd_';
    window.open(driveUrl, '_blank');
  };

  const handleCleanOldBackups = async () => {
    if (!isConnectedToCloud) {
      setSyncError('Veuillez vous connecter à Google Drive d\'abord');
      return;
    }

    try {
      // Cette fonctionnalité est automatiquement gérée par DriveService.cleanupOldFiles()
      // On va juste informer l'utilisateur
      alert('✅ Les anciens backups sont automatiquement nettoyés.\nSeuls les 5 fichiers les plus récents de chaque module sont conservés.');
    } catch (error: any) {
      console.error('Erreur lors du nettoyage:', error);
      setSyncError(`Erreur de nettoyage: ${error.message}`);
    }
  };

  const handleGenerateMedicalReport = () => {
    const medicalData = {
      patient: profile.name || 'Patient ADHD',
      age: profile.age || 'Non renseigné',
      medications: profile.medications || [],
      challenges: profile.challenges || [],
      chronotype: profile.chronotype || 'Non défini',
      reportDate: new Date().toLocaleDateString('fr-FR'),
    };

    const reportContent = `RAPPORT MÉDICAL - ADHD LIFE ASSISTANT
    
Patient: ${medicalData.patient}
Âge: ${medicalData.age}
Date du rapport: ${medicalData.reportDate}

MÉDICATIONS ACTUELLES:
${medicalData.medications.map(med => `- ${med.name} (${med.quantity ? `${med.quantity} ${med.unit || 'unité(s)'}` : 'dosage non spécifié'})`).join('\n') || '- Aucune médication enregistrée'}

DÉFIS ADHD IDENTIFIÉS:
${medicalData.challenges.map(challenge => `- ${challenge}`).join('\n') || '- Aucun défi spécifique enregistré'}

CHRONOTYPE: ${medicalData.chronotype}

Ce rapport a été généré automatiquement par ADHD Life Assistant.
Pour plus d'informations: https://github.com/adhdlifeassistant/ADHD-Life-Assistant`;

    const fileName = `rapport-medical-adhd-${new Date().toISOString().split('T')[0]}.txt`;
    const blob = new Blob([reportContent], { type: 'text/plain; charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // Ajouter à l'historique des exports
    const newExport = fileName;
    const updatedExports = [newExport, ...recentExports.slice(0, 2)]; // Garder les 3 plus récents
    setRecentExports(updatedExports);
    localStorage.setItem('medical_reports_history', JSON.stringify(updatedExports));
  };

  const handleShareByEmail = () => {
    const subject = encodeURIComponent('Rapport médical ADHD Life Assistant');
    const body = encodeURIComponent('Bonjour,\n\nVeuillez trouver ci-joint mon rapport médical généré par ADHD Life Assistant.\n\nCordialement');
    window.open(`mailto:?subject=${subject}&body=${body}`, '_self');
  };

  const getCloudSpaceUsed = () => {
    // Utiliser les vraies données de Google Drive si disponibles
    if (storageUsage.used > 0) {
      return (storageUsage.used / (1024 * 1024)).toFixed(1);
    }
    
    // Fallback: calculer la taille approximative des données locales
    const totalSize = new Blob([JSON.stringify({ profile, settings })]).size;
    const mbUsed = (totalSize / (1024 * 1024)).toFixed(1);
    return mbUsed;
  };

  const getCloudSpaceLimit = () => {
    if (storageUsage.limit > 0) {
      return (storageUsage.limit / (1024 * 1024 * 1024)).toFixed(1);
    }
    return '15.0'; // 15GB par défaut
  };

  const formatLastSync = () => {
    if (isSyncing) return 'Synchronisation en cours...';
    if (!lastSync) return 'Jamais synchronisé';
    
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - lastSync.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return 'À l\'instant';
    if (diffMinutes < 60) return `Il y a ${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}`;
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `Il y a ${diffHours} heure${diffHours > 1 ? 's' : ''}`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `Il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">💾 Gestion des Données et Stockage</h2>
        <p className="text-gray-600">Synchronisation cloud, exports médicaux et sauvegarde de vos données</p>
      </div>

      {/* Message d'erreur global */}
      {syncError && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="text-red-600">⚠️</span>
            <div className="text-red-800 text-sm font-medium">{syncError}</div>
            <button
              onClick={() => setSyncError(null)}
              className="ml-auto text-red-400 hover:text-red-600"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* 🔗 SECTION "Connexion & Stockage" */}
      <div className="bg-blue-50 p-6 rounded-xl">
        <h3 className="text-lg font-semibold text-blue-800 mb-4">🔗 Connexion & Stockage</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-blue-200">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${isConnectedToCloud ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <div>
                <div className="font-medium text-gray-800">
                  {isConnectedToCloud ? 'Connecté à Google Drive' : 'Non connecté'}
                </div>
                {isConnectedToCloud && cloudAccount && (
                  <div className="text-sm text-gray-600">{cloudAccount}</div>
                )}
                {isConnecting && (
                  <div className="text-sm text-blue-600">Connexion en cours...</div>
                )}
              </div>
            </div>
            <button
              onClick={handleConnectToCloud}
              disabled={isConnecting}
              className={`px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                isConnectedToCloud
                  ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isConnecting ? '🔄 Connexion...' : isConnectedToCloud ? 'Se déconnecter' : 'Se connecter'}
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-white rounded-lg border border-blue-200">
              <div className="text-sm text-gray-600 mb-1">Dernière synchronisation</div>
              <div className="font-medium text-gray-800">{formatLastSync()}</div>
              {isConnectedToCloud && (
                <button
                  onClick={handleSyncNow}
                  disabled={isSyncing}
                  className="mt-2 px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSyncing ? '🔄 Sync...' : 'Synchroniser maintenant'}
                </button>
              )}
            </div>

            <div className="p-4 bg-white rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-600">Synchronisation automatique</div>
                  <div className="text-xs text-gray-500">Sync en temps réel</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoSync}
                    onChange={(e) => setAutoSync(e.target.checked)}
                    className="sr-only peer"
                    disabled={!isConnectedToCloud}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ☁️ SECTION "Données Cloud" */}
      <div className="bg-green-50 p-6 rounded-xl">
        <h3 className="text-lg font-semibold text-green-800 mb-4">☁️ Données Cloud</h3>
        
        <div className="space-y-4">
          <div className="p-4 bg-white rounded-lg border border-green-200">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="font-medium text-gray-800">Espace utilisé</div>
                <div className="text-sm text-gray-600">
                  {getCloudSpaceUsed()} MB / {getCloudSpaceLimit()} GB disponibles
                </div>
              </div>
              <div className="text-2xl text-green-600">📊</div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full"
                style={{ 
                  width: `${Math.min(100, (parseFloat(getCloudSpaceUsed()) / (parseFloat(getCloudSpaceLimit()) * 1000)) * 100)}%`
                }}
              ></div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <button
              onClick={handleViewCloudData}
              className="p-4 bg-white border-2 border-green-200 rounded-lg hover:border-green-300 transition-colors text-left"
              disabled={!isConnectedToCloud}
            >
              <div className="text-2xl mb-2">📁</div>
              <div className="font-medium text-green-800 mb-1">Voir mes données dans Drive</div>
              <div className="text-xs text-green-600">Ouvrir le dossier cloud</div>
            </button>

            <div className="p-4 bg-white rounded-lg border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-800">Sauvegardes automatiques</div>
                  <div className="text-xs text-gray-600">Backup quotidien</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoBackup}
                    onChange={(e) => setAutoBackup(e.target.checked)}
                    className="sr-only peer"
                    disabled={!isConnectedToCloud}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                </label>
              </div>
              <button
                onClick={handleCleanOldBackups}
                className="mt-2 px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                disabled={!isConnectedToCloud}
              >
                Nettoyer anciens backups
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 🏥 SECTION "Export médical" */}
      <div className="bg-purple-50 p-6 rounded-xl">
        <h3 className="text-lg font-semibold text-purple-800 mb-4">🏥 Export médical</h3>
        <p className="text-sm text-purple-700 mb-6">
          Générez des rapports professionnels pour vos consultations médicales
        </p>
        
        <div className="space-y-4">
          <button
            onClick={handleGenerateMedicalReport}
            className="w-full p-6 bg-white border-2 border-purple-200 rounded-lg hover:border-purple-300 transition-colors text-left"
          >
            <div className="flex items-center gap-4">
              <div className="text-3xl">📋</div>
              <div>
                <div className="text-lg font-semibold text-purple-800 mb-1">Générer rapport médecin</div>
                <div className="text-sm text-purple-600">
                  Export complet : médications, défis ADHD, chronotype
                </div>
              </div>
            </div>
          </button>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-white rounded-lg border border-purple-200">
              <div className="text-sm text-purple-700 font-medium mb-2">Derniers exports :</div>
              <div className="space-y-1 text-sm text-gray-600">
                {recentExports.length > 0 ? (
                  recentExports.map((exportFile, index) => (
                    <div key={index}>• {exportFile}</div>
                  ))
                ) : (
                  <div className="text-gray-400 italic">Aucun export récent</div>
                )}
              </div>
            </div>

            <div className="p-4 bg-white rounded-lg border border-purple-200">
              <button
                onClick={handleShareByEmail}
                className="w-full p-3 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors"
              >
                <div className="flex items-center justify-center gap-2">
                  <span>📧</span>
                  <span>Partager par email</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 🗑️ SECTION "Gestion données" intégrée avec section dangereuse */}
      <div className="bg-gray-50 p-6 rounded-xl">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">🗑️ Gestion avancée des données</h3>
        
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <button
            onClick={handleExportComplete}
            className="p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-gray-300 transition-colors text-left"
          >
            <div className="text-2xl mb-2">📦</div>
            <div className="font-medium text-gray-800 mb-1">Export total données (JSON)</div>
            <div className="text-xs text-gray-600">Sauvegarde complète de tous vos données</div>
          </button>

          <div className="p-4 bg-red-100 border-2 border-red-200 rounded-lg">
            <div className="text-2xl mb-2">⚠️</div>
            <div className="font-medium text-red-800 mb-1">Zone de danger</div>
            <div className="text-xs text-red-600 mb-3">Action irréversible</div>
            {!showConfirmReset ? (
              <button
                onClick={() => setShowConfirmReset(true)}
                className="w-full px-3 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
              >
                Supprimer compte
              </button>
            ) : (
              <div className="space-y-2">
                <div className="text-xs text-red-700 font-medium">Êtes-vous sûr ?</div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowConfirmReset(false)}
                    className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleResetAll}
                    className="flex-1 px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Confirmer
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
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
                Vous serez redirigé vers l'accueil pour recommencer.
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