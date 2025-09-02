import { useEffect, useState, useCallback } from 'react';
import { EncryptionService } from '../lib/security/EncryptionService';
import { BiometricService } from '../lib/security/BiometricService';
import { PrivacyModeService } from '../lib/security/PrivacyModeService';
import { SecurityMonitorService } from '../lib/security/SecurityMonitorService';
import { GDPRService } from '../lib/security/GDPRService';

interface SecurityState {
  isEncryptionReady: boolean;
  isBiometricAvailable: boolean;
  isPrivacyModeActive: boolean;
  hasSecurityAlerts: boolean;
  sessionTimeRemaining: number;
  securityLevel: 'low' | 'medium' | 'high';
}

export const useSecurity = () => {
  const [state, setState] = useState<SecurityState>({
    isEncryptionReady: false,
    isBiometricAvailable: false,
    isPrivacyModeActive: false,
    hasSecurityAlerts: false,
    sessionTimeRemaining: 0,
    securityLevel: 'low'
  });

  const encryptionService = EncryptionService.getInstance();
  const biometricService = BiometricService.getInstance();
  const privacyService = PrivacyModeService.getInstance();
  const securityMonitor = SecurityMonitorService.getInstance();
  const gdprService = GDPRService.getInstance();

  // Initialisation sécurité
  const initializeSecurity = useCallback(async () => {
    try {
      // Vérifier capacités biométriques
      const biometricCaps = await biometricService.checkCapabilities();
      
      // Calculer niveau de sécurité
      let level: 'low' | 'medium' | 'high' = 'low';
      if (encryptionService.isReady() && biometricCaps.available) {
        level = 'high';
      } else if (encryptionService.isReady()) {
        level = 'medium';
      }

      setState(prev => ({
        ...prev,
        isEncryptionReady: encryptionService.isReady(),
        isBiometricAvailable: biometricCaps.available,
        isPrivacyModeActive: privacyService.isPrivacyModeEnabled(),
        securityLevel: level
      }));

    } catch (error) {
      console.error('Erreur initialisation sécurité:', error);
    }
  }, []);

  // Setup master password
  const setupMasterPassword = useCallback(async (password: string) => {
    try {
      await encryptionService.initializeWithPassword(password);
      await initializeSecurity();
      return true;
    } catch (error) {
      console.error('Erreur setup password:', error);
      return false;
    }
  }, [initializeSecurity]);

  // Authentification biométrique
  const authenticateWithBiometric = useCallback(async () => {
    try {
      const success = await biometricService.authenticateWithBiometric();
      return success;
    } catch (error) {
      console.error('Erreur auth biométrique:', error);
      return false;
    }
  }, []);

  // Chiffrement données
  const encryptData = useCallback(async (data: any, category: string = 'general') => {
    if (!encryptionService.isReady()) {
      throw new Error('Service de chiffrement non initialisé');
    }
    
    const encrypted = await encryptionService.encryptData(JSON.stringify(data), category);
    return encrypted;
  }, []);

  // Déchiffrement données
  const decryptData = useCallback(async (encryptedData: any, category: string = 'general') => {
    if (!encryptionService.isReady()) {
      throw new Error('Service de chiffrement non initialisé');
    }
    
    const decrypted = await encryptionService.decryptData(encryptedData, 'temp_password');
    return decrypted;
  }, []);

  // Gestion mode privé
  const togglePrivacyMode = useCallback(() => {
    if (privacyService.isPrivacyModeEnabled()) {
      privacyService.disablePrivacyMode();
    } else {
      privacyService.enablePrivacyMode(false, 'manual');
    }
    
    setState(prev => ({
      ...prev,
      isPrivacyModeActive: privacyService.isPrivacyModeEnabled()
    }));
  }, []);

  // Extension session
  const extendSession = useCallback((minutes: number = 30) => {
    privacyService.extendSession(minutes);
  }, []);

  // Export RGPD
  const exportGDPRData = useCallback(async (format: 'json' | 'csv' | 'xml' = 'json') => {
    const exportData = await gdprService.generateDataPortabilityExport(format);
    
    // Créer et télécharger le fichier
    const blob = new Blob([JSON.stringify(exportData)], { type: 'application/' + format });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `adhd-data-export.${format}`;
    link.click();
    URL.revokeObjectURL(url);
    
    return exportData;
  }, []);

  // Suppression RGPD
  const requestDataDeletion = useCallback(async (categories: string[] = ['all']) => {
    const result = await gdprService.exerciseRightToErasure(categories.includes('all') ? 'all_data_deletion' : categories.join(','));
    
    // Réinitialiser état si suppression complète
    if (categories.includes('all')) {
      setState({
        isEncryptionReady: false,
        isBiometricAvailable: false,
        isPrivacyModeActive: false,
        hasSecurityAlerts: false,
        sessionTimeRemaining: 0,
        securityLevel: 'low'
      });
    }
    
    return result;
  }, []);

  // Listeners événements sécurité
  useEffect(() => {
    const handlePrivacyEvent = (event: string, data?: any) => {
      setState(prev => ({
        ...prev,
        isPrivacyModeActive: event === 'privacy_mode_enabled'
      }));
    };

    const handleSecurityAlert = (alert: any) => {
      setState(prev => ({
        ...prev,
        hasSecurityAlerts: true
      }));
    };

    privacyService.onPrivacyEvent(handlePrivacyEvent);
    securityMonitor.onSecurityAlert(handleSecurityAlert);

    return () => {
      // Cleanup listeners si nécessaire
    };
  }, []);

  // Initialisation au mount
  useEffect(() => {
    initializeSecurity();
  }, [initializeSecurity]);

  return {
    // État
    ...state,
    
    // Actions
    setupMasterPassword,
    authenticateWithBiometric,
    encryptData,
    decryptData,
    togglePrivacyMode,
    extendSession,
    exportGDPRData,
    requestDataDeletion,
    
    // Services (pour usage avancé)
    services: {
      encryption: encryptionService,
      biometric: biometricService,
      privacy: privacyService,
      monitor: securityMonitor,
      gdpr: gdprService
    }
  };
};