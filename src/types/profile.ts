export interface UserProfile {
  // Identité
  name: string;
  age?: number;
  
  // Médications
  medications: ProfileMedication[];
  
  // Chronotype
  chronotype: 'morning' | 'evening' | 'flexible';
  
  // Défis ADHD
  challenges: ADHDChallenge[];
  
  // Modules préférés
  favoriteModules: string[];
  
  // Métadonnées
  createdAt: number;
  updatedAt: number;
}

export interface ProfileMedication {
  id: string;
  name: string;
  time: string; // Format HH:MM
  frequency: 'daily' | 'twice-daily' | 'weekly' | 'as-needed';
  quantity?: number; // Dosage amount (e.g., 10, 0.5, 2)
  unit?: string; // Unit of measurement (e.g., 'mg', 'comprimés', 'ml')
  notes?: string;
}

export type ADHDChallenge = 
  | 'organization'
  | 'time-management'
  | 'procrastination'
  | 'hyperfocus-distraction'
  | 'emotional-regulation'
  | 'sleep-routine'
  | 'impulse-spending'
  | 'social-relationships'
  | 'cleaning-tidying'
  | 'memory-forgetting';

export const ADHD_CHALLENGES: Record<ADHDChallenge, { label: string; icon: string; description: string }> = {
  'organization': {
    label: 'Organisation quotidienne',
    icon: '📋',
    description: 'Planifier et structurer ses journées'
  },
  'time-management': {
    label: 'Gestion du temps',
    icon: '⏰',
    description: 'Estimer et respecter les durées'
  },
  'procrastination': {
    label: 'Procrastination',
    icon: '⏳',
    description: 'Commencer et finir les tâches'
  },
  'hyperfocus-distraction': {
    label: 'Hyperfocus vs distractions',
    icon: '🎯',
    description: 'Équilibrer concentration et attention'
  },
  'emotional-regulation': {
    label: 'Gestion émotions/stress',
    icon: '💙',
    description: 'Réguler ses émotions au quotidien'
  },
  'sleep-routine': {
    label: 'Routine sommeil',
    icon: '😴',
    description: 'Maintenir un rythme de sommeil'
  },
  'impulse-spending': {
    label: 'Achats impulsifs',
    icon: '💸',
    description: 'Contrôler les dépenses spontanées'
  },
  'social-relationships': {
    label: 'Relations sociales',
    icon: '👥',
    description: 'Maintenir et développer ses relations'
  },
  'cleaning-tidying': {
    label: 'Ménage/rangement',
    icon: '🧹',
    description: 'Maintenir un environnement organisé'
  },
  'memory-forgetting': {
    label: 'Mémoire/oublis',
    icon: '🧠',
    description: 'Se souvenir des tâches importantes'
  }
};

export const CHRONOTYPES = {
  morning: {
    label: 'Lève-tôt énergique',
    icon: '🌅',
    description: 'Je suis plus productif le matin',
    peakHours: [7, 8, 9, 10, 11]
  },
  evening: {
    label: 'Couche-tard productif',
    icon: '🦉',
    description: 'Je suis plus productif le soir',
    peakHours: [19, 20, 21, 22, 23]
  },
  flexible: {
    label: 'Ça dépend des jours',
    icon: '😴',
    description: 'Mon rythme varie selon les périodes',
    peakHours: [9, 10, 14, 15, 16]
  }
};

export const MEDICATION_FREQUENCIES = {
  'daily': 'Une fois par jour',
  'twice-daily': 'Deux fois par jour',
  'weekly': 'Une fois par semaine',
  'as-needed': 'Si besoin'
};

export const MEDICATION_UNITS = {
  'mg': 'mg (milligrammes)',
  'g': 'g (grammes)',
  'mcg': 'mcg (microgrammes)',
  'comprimés': 'comprimé(s)',
  'gélules': 'gélule(s)',
  'capsules': 'capsule(s)',
  'ml': 'ml (millilitres)',
  'cl': 'cl (centilitres)',
  'l': 'l (litres)',
  'gouttes': 'goutte(s)',
  'sachets': 'sachet(s)',
  'cuillères': 'cuillère(s)',
  'doses': 'dose(s)',
  'puffs': 'puff(s)', // pour les inhalateurs
  'UI': 'UI (unités internationales)'
} as const;

export type MedicationUnit = keyof typeof MEDICATION_UNITS;

