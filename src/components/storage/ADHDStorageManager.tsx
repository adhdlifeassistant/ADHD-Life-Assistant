import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Import des composants existants
import { CloudStatusIndicator, useCloudStatus, CloudSyncStatus } from './CloudStatusIndicator';
import { ADHDProgressBar, useRealisticProgress } from './ADHDProgressBar';
import { ADHDToast, ADHDToastManager, useStorageToasts } from './ADHDToast';
import { QuickSyncButton } from './QuickSyncButton';
import { OfflineModeBanner, OfflineModeBadge } from './OfflineModeBanner';

// Import des hooks
import { useStorageShortcuts, useNavigationShortcuts, useADHDProductivityShortcuts } from '../../hooks/useKeyboardShortcuts';
import { useADHDNavigationSwipes, PullToRefreshIndicator } from '../../hooks/useSwipeGestures';
import { useSmartPreloader, useAdaptiveAnimations, useBackgroundOptimization } from '../../hooks/useOptimizedPerformance';

// Import des utilitaires
import { ADHDMessageService } from '../../utils/adhdMessages';

interface ADHDStorageManagerProps {
  // Données et état
  userData?: any;
  hasUnsavedChanges?: boolean;
  isOnline?: boolean;
  
  // Callbacks pour les actions
  onSync?: () => Promise<void>;
  onExport?: () => Promise<void>;
  onSave?: () => Promise<void>;
  onRestore?: () => Promise<void>;
  
  // Configuration
  enableKeyboardShortcuts?: boolean;
  enableSwipeGestures?: boolean;
  enableAutoSync?: boolean;
  autoSyncInterval?: number; // en millisecondes
  
  // Style et position
  className?: string;
  quickSyncPosition?: 'bottom-right' | 'bottom-center' | 'bottom-left';
  toastPosition?: 'top-right' | 'top-center' | 'bottom-right' | 'bottom-center';
}

export const ADHDStorageManager: React.FC<ADHDStorageManagerProps> = ({
  userData,
  hasUnsavedChanges = false,
  isOnline = navigator.onLine,
  onSync,
  onExport,
  onSave,
  onRestore,
  enableKeyboardShortcuts = true,
  enableSwipeGestures = true,
  enableAutoSync = true,
  autoSyncInterval = 5 * 60 * 1000, // 5 minutes par défaut
  className = '',
  quickSyncPosition = 'bottom-right',
  toastPosition = 'top-right'
}) => {
  // État local
  const [isSyncing, setIsSyncing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [currentOperation, setCurrentOperation] = useState<string | null>(null);
  const [showOfflineBanner, setShowOfflineBanner] = useState(!isOnline);
  const [lastSyncTime, setLastSyncTime] = useState<Date | undefined>();
  
  // Hooks pour les composants
  const { status: cloudStatus, startSync: startCloudSync, setError: setCloudError } = useCloudStatus();
  const { toasts, addToast, removeToast, showSyncSuccess, showSyncError, showOfflineMode, showQuotaFull } = useStorageToasts();
  const { shouldAnimate, getAnimationDuration } = useAdaptiveAnimations();
  const { shouldSkipExpensiveOperation, getOptimizedInterval } = useBackgroundOptimization();
  
  // Hook pour progression réaliste
  const syncProgress = useRealisticProgress(3000, () => {
    setIsSyncing(false);
    setCurrentOperation(null);
    showSyncSuccess();
    setLastSyncTime(new Date());
  });
  
  const exportProgress = useRealisticProgress(2000, () => {
    setIsExporting(false);
    setCurrentOperation(null);
    addToast(ADHDMessageService.getSuccessMessage('export'));
  });

  // Pré-chargement intelligent des données
  const { getData, isLoading } = useSmartPreloader({
    userData: async () => userData,
    userSettings: async () => localStorage.getItem('adhd_settings'),
    recentFiles: async () => JSON.parse(localStorage.getItem('recent_files') || '[]')
  }, {
    userData: 10, // Priorité élevée
    userSettings: 8,
    recentFiles: 5
  });

  // Actions principales
  const handleSync = useCallback(async () => {
    if (isSyncing || !onSync) return;

    try {
      setIsSyncing(true);
      setCurrentOperation('synchronisation');
      startCloudSync();
      syncProgress.start();
      
      await onSync();
      
      // Le succès sera géré par le hook de progression
    } catch (error: any) {
      setIsSyncing(false);
      setCurrentOperation(null);
      syncProgress.stop();
      setCloudError();
      showSyncError(error.message || 'Erreur de synchronisation');
    }
  }, [isSyncing, onSync, startCloudSync, syncProgress, setCloudError, showSyncError]);

  const handleExport = useCallback(async () => {
    if (isExporting || !onExport) return;

    try {
      setIsExporting(true);
      setCurrentOperation('export');
      exportProgress.start();
      
      await onExport();
      
      // Le succès sera géré par le hook de progression
    } catch (error: any) {
      setIsExporting(false);
      setCurrentOperation(null);
      exportProgress.stop();
      addToast(ADHDMessageService.getStorageErrorMessage(error.message || 'Erreur export'));
    }
  }, [isExporting, onExport, exportProgress, addToast]);

  const handleQuickSave = useCallback(async () => {
    if (!onSave) return;
    
    try {
      await onSave();
      addToast({
        title: 'Sauvegardé ! 💾',
        description: 'Tes données sont en sécurité sur cet appareil',
        emoji: '✅',
        type: 'success',
        autoClose: 2000
      });
      
      // Feedback haptique
      if ('vibrate' in navigator) {
        navigator.vibrate(50);
      }
    } catch (error: any) {
      addToast(ADHDMessageService.getStorageErrorMessage(error.message || 'Erreur sauvegarde locale'));
    }
  }, [onSave, addToast]);

  // Auto-sync intelligent
  useEffect(() => {
    if (!enableAutoSync || !onSync || shouldSkipExpensiveOperation()) return;

    const interval = setInterval(() => {
      if (hasUnsavedChanges && isOnline && !isSyncing) {
        handleSync();
      }
    }, getOptimizedInterval(autoSyncInterval));

    return () => clearInterval(interval);
  }, [enableAutoSync, onSync, hasUnsavedChanges, isOnline, isSyncing, shouldSkipExpensiveOperation, getOptimizedInterval, autoSyncInterval, handleSync]);

  // Gestion du statut offline/online
  useEffect(() => {
    if (!isOnline && !showOfflineBanner) {
      setShowOfflineBanner(true);
      showOfflineMode();
    } else if (isOnline && showOfflineBanner) {
      setShowOfflineBanner(false);
    }
  }, [isOnline, showOfflineBanner, showOfflineMode]);

  // Raccourcis clavier
  useStorageShortcuts({
    onSyncNow: enableKeyboardShortcuts ? handleSync : undefined,
    onExportData: enableKeyboardShortcuts ? handleExport : undefined,
    onQuickSave: enableKeyboardShortcuts ? handleQuickSave : undefined,
    onShowStatus: enableKeyboardShortcuts ? () => {
      addToast({
        title: 'État synchronisation 📊',
        description: `Dernière sync: ${lastSyncTime ? lastSyncTime.toLocaleString() : 'Jamais'} • ${hasUnsavedChanges ? 'Modifications non sauvées' : 'Tout à jour'}`,
        emoji: 'ℹ️',
        type: 'info',
        autoClose: 5000
      });
    } : undefined
  });

  // Gestes tactiles
  const swipeState = useADHDNavigationSwipes({
    onRefresh: enableSwipeGestures ? () => {
      if (isOnline && !isSyncing) {
        handleSync();
      }
    } : undefined
  });

  // Calculer le nombre de modifications non sauvées
  const unsavedChangesCount = hasUnsavedChanges ? (typeof hasUnsavedChanges === 'number' ? hasUnsavedChanges : 1) : 0;

  return (
    <div className={`relative ${className}`}>
      {/* Indicateur Pull to Refresh pour mobile */}
      <PullToRefreshIndicator
        isActive={swipeState.isPullingToRefresh}
        progress={swipeState.pullProgress}
        distance={swipeState.pullDistance}
      />

      {/* Banner hors-ligne */}
      <AnimatePresence>
        {showOfflineBanner && (
          <OfflineModeBanner
            isOffline={!isOnline}
            unsavedChangesCount={unsavedChangesCount}
            onRetry={handleSync}
            onDismiss={() => setShowOfflineBanner(false)}
            className="mb-4"
          />
        )}
      </AnimatePresence>

      {/* Indicateur de statut principal */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <CloudStatusIndicator
            status={
              isSyncing ? 'syncing' :
              !isOnline ? 'offline' :
              hasUnsavedChanges ? 'network_issue' :
              'connected'
            }
            lastSyncTime={lastSyncTime}
            onSyncNow={handleSync}
          />
          
          {/* Badge mode hors-ligne compact */}
          <OfflineModeBadge
            isOffline={!isOnline}
            unsavedChangesCount={unsavedChangesCount}
            onClick={() => setShowOfflineBanner(true)}
          />
        </div>

        {/* Actions rapides */}
        <div className="flex items-center gap-2">
          {/* Bouton export */}
          {onExport && (
            <motion.button
              onClick={handleExport}
              disabled={isExporting}
              className="px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 disabled:opacity-50 disabled:cursor-wait"
              whileHover={shouldAnimate('low') ? { scale: 1.02 } : {}}
              whileTap={shouldAnimate('low') ? { scale: 0.98 } : {}}
            >
              {isExporting ? '⏳ Export...' : '📤 Exporter'}
            </motion.button>
          )}
          
          {/* Bouton sauvegarde locale */}
          {onSave && hasUnsavedChanges && (
            <motion.button
              onClick={handleQuickSave}
              className="px-3 py-2 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
              whileHover={shouldAnimate('low') ? { scale: 1.02 } : {}}
              whileTap={shouldAnimate('low') ? { scale: 0.98 } : {}}
            >
              💾 Sauver
            </motion.button>
          )}
        </div>
      </div>

      {/* Barres de progression */}
      <AnimatePresence>
        {isSyncing && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: getAnimationDuration(200) / 1000 }}
            className="mb-4"
          >
            <ADHDProgressBar
              progress={syncProgress.progress}
              operation="synchronisation"
              estimatedTimeRemaining={syncProgress.timeRemaining}
              onCancel={() => {
                syncProgress.stop();
                setIsSyncing(false);
                setCurrentOperation(null);
              }}
              showEncouragement={shouldAnimate('medium')}
            />
          </motion.div>
        )}

        {isExporting && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: getAnimationDuration(200) / 1000 }}
            className="mb-4"
          >
            <ADHDProgressBar
              progress={exportProgress.progress}
              operation="export"
              estimatedTimeRemaining={exportProgress.timeRemaining}
              onCancel={() => {
                exportProgress.stop();
                setIsExporting(false);
                setCurrentOperation(null);
              }}
              showEncouragement={shouldAnimate('medium')}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bouton de sync rapide flottant */}
      <QuickSyncButton
        onSync={handleSync}
        isSyncing={isSyncing}
        lastSyncTime={lastSyncTime}
        hasUnsavedChanges={hasUnsavedChanges}
        position={quickSyncPosition}
        showTooltip={true}
      />

      {/* Gestionnaire de toasts */}
      <ADHDToastManager
        toasts={toasts}
        onRemove={removeToast}
        position={toastPosition}
        maxToasts={3}
      />

      {/* Informations pour le développeur (en mode debug uniquement) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 left-4 text-xs text-gray-500 bg-white p-2 rounded border opacity-75 max-w-xs">
          <div>Status: {cloudStatus}</div>
          <div>Online: {isOnline ? '✅' : '❌'}</div>
          <div>Unsaved: {hasUnsavedChanges ? '⚠️' : '✅'}</div>
          <div>Last sync: {lastSyncTime?.toLocaleTimeString() || 'Never'}</div>
          <div>Operation: {currentOperation || 'None'}</div>
        </div>
      )}
    </div>
  );
};

// Hook pour faciliter l'utilisation
export const useADHDStorageManager = (config: {
  onSync?: () => Promise<void>;
  onExport?: () => Promise<void>;
  onSave?: () => Promise<void>;
  userData?: any;
}) => {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Détection de connexion
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Tracker les modifications
  const markAsChanged = useCallback(() => {
    setHasUnsavedChanges(true);
  }, []);

  const markAsSaved = useCallback(() => {
    setHasUnsavedChanges(false);
  }, []);

  // Wrapper des callbacks pour marquer comme sauvé
  const wrappedCallbacks = {
    onSync: config.onSync ? async () => {
      await config.onSync!();
      markAsSaved();
    } : undefined,
    
    onSave: config.onSave ? async () => {
      await config.onSave!();
      markAsSaved();
    } : undefined,
    
    onExport: config.onExport
  };

  return {
    // État
    hasUnsavedChanges,
    isOnline,
    
    // Actions
    markAsChanged,
    markAsSaved,
    
    // Props pour le composant
    storageManagerProps: {
      ...wrappedCallbacks,
      hasUnsavedChanges,
      isOnline,
      userData: config.userData
    }
  };
};

export default ADHDStorageManager;