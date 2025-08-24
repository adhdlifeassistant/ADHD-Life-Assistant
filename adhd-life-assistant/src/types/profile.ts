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
  
  // Métadonnées
  createdAt: number;
  updatedAt: number;
  onboardingCompleted: boolean;
}

export interface ProfileMedication {
  id: string;
  name: string;
  time: string; // Format HH:MM
  frequency: 'daily' | 'twice-daily' | 'weekly' | 'as-needed';
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

// Types pour l'onboarding
export interface OnboardingStep {
  id: number;
  title: string;
  component: React.ComponentType<OnboardingStepProps>;
  isValid: (data: Partial<UserProfile>) => boolean;
  isOptional?: boolean;
}

export interface OnboardingStepProps {
  data: Partial<UserProfile>;
  updateData: (updates: Partial<UserProfile>) => void;
  onNext: () => void;
  onPrevious: () => void;
  isFirst: boolean;
  isLast: boolean;
}