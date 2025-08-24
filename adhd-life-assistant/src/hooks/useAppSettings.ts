'use client';

import { useState, useEffect } from 'react';
import { AppSettings } from '@/types/settings';

const SETTINGS_KEY = 'adhd-app-settings';

const DEFAULT_SETTINGS: AppSettings = {
  notificationLevel: 'normal',
  soundEnabled: true,
  discreetMode: false,
  medicationReminders: {
    enabled: true,
    frequency: 'smart',
    advanceNotice: 15,
    snoozeEnabled: true,
    snoozeInterval: 5,
    perMedicationSettings: {}
  },
  theme: 'auto',
  textSize: 'base',
  animations: true,
  avatar: '😊',
  autoBackup: true,
  backupFrequency: 'weekly',
  createdAt: Date.now(),
  updatedAt: Date.now()
};

export function useAppSettings() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  // Charger les paramètres
  useEffect(() => {
    try {
      const stored = localStorage.getItem(SETTINGS_KEY);
      if (stored) {
        const parsedSettings = JSON.parse(stored) as AppSettings;
        // Merger avec les defaults pour les nouveaux champs
        setSettings({ ...DEFAULT_SETTINGS, ...parsedSettings });
      }
    } catch (error) {
      console.error('Erreur lors du chargement des paramètres:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Sauvegarder les paramètres
  const updateSettings = (updates: Partial<AppSettings>) => {
    const updatedSettings = {
      ...settings,
      ...updates,
      updatedAt: Date.now()
    };
    
    setSettings(updatedSettings);
    
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(updatedSettings));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des paramètres:', error);
    }
  };

  // Méthodes spécifiques
  const updateNotificationLevel = (level: AppSettings['notificationLevel']) => {
    updateSettings({ notificationLevel: level });
  };

  const toggleSound = () => {
    updateSettings({ soundEnabled: !settings.soundEnabled });
  };

  const toggleDiscreetMode = () => {
    updateSettings({ discreetMode: !settings.discreetMode });
  };

  const updateTheme = (theme: AppSettings['theme']) => {
    updateSettings({ theme });
  };

  const updateTextSize = (size: AppSettings['textSize']) => {
    updateSettings({ textSize: size });
    
    // Appliquer immédiatement
    document.documentElement.classList.remove('text-size-sm', 'text-size-base', 'text-size-lg', 'text-size-xl');
    document.documentElement.classList.add(`text-size-${size}`);
  };

  const toggleAnimations = () => {
    updateSettings({ animations: !settings.animations });
  };

  const updateAvatar = (emoji: string) => {
    updateSettings({ avatar: emoji });
  };

  const updateMedicationReminders = (updates: Partial<AppSettings['medicationReminders']>) => {
    updateSettings({
      medicationReminders: {
        ...settings.medicationReminders,
        ...updates
      }
    });
  };

  const updateMedicationNotificationSettings = (medicationId: string, settings: Partial<any>) => {
    updateMedicationReminders({
      perMedicationSettings: {
        ...settings.medicationReminders.perMedicationSettings,
        [medicationId]: {
          ...settings.medicationReminders.perMedicationSettings[medicationId],
          ...settings
        }
      }
    });
  };

  const toggleAutoBackup = () => {
    updateSettings({ autoBackup: !settings.autoBackup });
  };

  const updateBackupFrequency = (frequency: AppSettings['backupFrequency']) => {
    updateSettings({ backupFrequency: frequency });
  };

  const resetSettings = () => {
    const resetSettings = {
      ...DEFAULT_SETTINGS,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    setSettings(resetSettings);
    localStorage.removeItem(SETTINGS_KEY);
  };

  // Getters utiles
  const isNotificationEnabled = settings.medicationReminders.enabled && !settings.discreetMode;
  const shouldPlaySound = settings.soundEnabled && !settings.discreetMode;
  
  // Export/Import des paramètres
  const exportSettings = () => {
    return JSON.stringify(settings, null, 2);
  };

  const importSettings = (settingsJson: string) => {
    try {
      const importedSettings = JSON.parse(settingsJson) as AppSettings;
      // Valider les données importées
      const validatedSettings = {
        ...DEFAULT_SETTINGS,
        ...importedSettings,
        updatedAt: Date.now()
      };
      setSettings(validatedSettings);
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(validatedSettings));
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'import des paramètres:', error);
      return false;
    }
  };

  return {
    // État
    settings,
    isLoading,
    isNotificationEnabled,
    shouldPlaySound,
    
    // Actions générales
    updateSettings,
    resetSettings,
    exportSettings,
    importSettings,
    
    // Actions spécifiques
    updateNotificationLevel,
    toggleSound,
    toggleDiscreetMode,
    updateTheme,
    updateTextSize,
    toggleAnimations,
    updateAvatar,
    updateMedicationReminders,
    updateMedicationNotificationSettings,
    toggleAutoBackup,
    updateBackupFrequency
  };
}