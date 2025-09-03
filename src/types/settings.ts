export interface AppSettings {
  // Notifications
  notificationLevel: 'calm' | 'normal' | 'active';
  soundEnabled: boolean;
  discreetMode: boolean;
  medicationReminders: MedicationReminderSettings;
  
  // Interface
  theme: 'auto' | 'light' | 'dark';
  textSize: 'sm' | 'base' | 'lg' | 'xl';
  animations: boolean;
  
  // Personnalisation
  avatar?: string; // emoji
  
  // Données
  autoBackup: boolean;
  backupFrequency: 'daily' | 'weekly' | 'monthly';
  
  // Métadonnées
  createdAt: number;
  updatedAt: number;
}

export interface MedicationReminderSettings {
  enabled: boolean;
  frequency: 'once' | 'persistent' | 'smart'; // smart = adapté selon chronotype
  advanceNotice: number; // minutes avant l'heure
  snoozeEnabled: boolean;
  snoozeInterval: number; // minutes
  perMedicationSettings: Record<string, MedicationNotificationSettings>;
}

export interface MedicationNotificationSettings {
  enabled: boolean;
  customSound?: string;
  urgencyLevel: 'low' | 'normal' | 'high';
  reminderText?: string;
}

export const NOTIFICATION_LEVELS = {
  calm: {
    label: 'Calme',
    description: 'Notifications discrètes et espacées',
    icon: '🌸',
    frequency: 'minimal',
    sound: false
  },
  normal: {
    label: 'Normal',
    description: 'Notifications équilibrées',
    icon: '🔔',
    frequency: 'balanced',
    sound: true
  },
  active: {
    label: 'Actif',
    description: 'Notifications fréquentes et motivantes',
    icon: '⚡',
    frequency: 'frequent',
    sound: true
  }
};

export const AVATAR_EMOJIS = [
  '😊', '😄', '🤔', '😌', '🧠', '🌟', '⚡', '🎯', 
  '🌈', '🦋', '🌸', '🍀', '💫', '🎨', '🎭', '🎪',
  '🚀', '🎲', '🎨', '🎯', '🌙', '☀️', '🌊', '🔥',
  '💜', '💙', '💚', '🧡', '❤️', '💛', '🤍', '🖤'
];

export const THEME_OPTIONS = {
  auto: {
    label: 'Automatique',
    description: 'Suit votre humeur du moment',
    icon: '🎨'
  },
  light: {
    label: 'Clair',
    description: 'Thème clair permanent',
    icon: '☀️'
  },
  dark: {
    label: 'Sombre',
    description: 'Thème sombre permanent',
    icon: '🌙'
  }
};

// Paramètres IA
export type AIProvider = 'claude' | 'gpt-4' | 'gemini-pro';

export interface AISettings {
  provider?: AIProvider;
  apiKey?: string;
  isConnected: boolean;
  lastTested?: number;
}

// Export complet des données
export interface DataExport {
  version: string;
  exportedAt: number;
  profile: any; // UserProfile
  settings: AppSettings;
  moduleData: {
    mood: any;
    finance: any;
    cleaning: any;
    health: any;
    reminders: any;
    analytics?: any;
  };
  metadata: {
    appVersion: string;
    deviceInfo?: string;
    totalDataPoints: number;
  };
}