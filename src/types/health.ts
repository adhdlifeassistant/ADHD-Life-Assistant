import { MoodType } from './mood';

export type WellbeingMetric = 'sleep' | 'energy' | 'focus' | 'anxiety';

export type ActivityType = 'walk' | 'sport' | 'cleaning' | 'garden' | 'dance' | 'other';

export type AppointmentType = 'psychiatrist' | 'psychologist' | 'general' | 'specialist' | 'other';

export interface MedicationEntry {
  id: string;
  medicationId: string;
  takenAt: number;
  dose?: string;
  notes?: string;
  sideEffects?: SideEffect[];
  mood?: MoodType;
  effectiveness?: number; // 1-5
}

export interface SideEffect {
  id: string;
  name: string;
  severity: 1 | 2 | 3 | 4 | 5; // 1 = léger, 5 = sévère
  category: 'physical' | 'mental' | 'sleep' | 'appetite' | 'other';
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string; // "1x/jour", "2x/jour", etc.
  prescribedBy: string;
  startDate: number;
  endDate?: number;
  isActive: boolean;
  color: string;
  icon: string;
  notes?: string;
}

export interface WellbeingEntry {
  id: string;
  date: number; // timestamp du jour (minuit)
  metrics: {
    sleep: number;    // 1-5
    energy: number;   // 1-5
    focus: number;    // 1-5
    anxiety: number;  // 1-5
  };
  notes?: string;
  mood?: MoodType;
  completedAt: number;
}

export interface ActivityEntry {
  id: string;
  date: number;
  type: ActivityType;
  customName?: string;
  duration?: number; // en minutes
  enjoyment?: number; // 1-5
  notes?: string;
  mood?: MoodType;
}

export interface MedicalAppointment {
  id: string;
  type: AppointmentType;
  doctorName: string;
  date: number;
  duration?: number; // en minutes
  location?: string;
  notes?: string;
  questionsToAsk?: string[];
  followUpNotes?: string;
  isCompleted: boolean;
  reminders: {
    daysBefore: number;
    isEnabled: boolean;
  }[];
}

export interface HealthPattern {
  id: string;
  name: string;
  description: string;
  data: {
    date: number;
    value: number | boolean;
    context?: string;
  }[];
  insights?: string[];
}

export interface HealthStats {
  today: {
    wellbeingLogged: boolean;
    activityLogged: boolean;
    medicationsTaken: number;
    totalMedications: number;
  };
  week: {
    wellbeingDays: number;
    activityDays: number;
    avgWellbeing: {
      sleep: number;
      energy: number;
      focus: number;
      anxiety: number;
    };
    totalActivities: number;
  };
  month: {
    wellbeingDays: number;
    patterns: HealthPattern[];
    medicationConsistency: number; // 0-100%
  };
}

export interface ExportData {
  period: 'week' | 'month' | 'quarter';
  startDate: number;
  endDate: number;
  medications: Medication[];
  medicationEntries: MedicationEntry[];
  wellbeingEntries: WellbeingEntry[];
  activities: ActivityEntry[];
  appointments: MedicalAppointment[];
  patterns: HealthPattern[];
  notes: string;
}

export interface HealthContextType {
  // Medications
  medications: Medication[];
  medicationEntries: MedicationEntry[];
  
  // Wellbeing
  wellbeingEntries: WellbeingEntry[];
  
  // Activities
  activities: ActivityEntry[];
  
  // Appointments
  appointments: MedicalAppointment[];

  // Actions - Medications
  addMedication: (medication: Omit<Medication, 'id'>) => void;
  updateMedication: (id: string, updates: Partial<Medication>) => void;
  deleteMedication: (id: string) => void;
  logMedication: (entry: Omit<MedicationEntry, 'id'>) => void;
  
  // Actions - Wellbeing
  logWellbeing: (entry: Omit<WellbeingEntry, 'id' | 'completedAt'>) => void;
  updateWellbeing: (id: string, updates: Partial<WellbeingEntry>) => void;
  
  // Actions - Activities
  logActivity: (activity: Omit<ActivityEntry, 'id'>) => void;
  updateActivity: (id: string, updates: Partial<ActivityEntry>) => void;
  deleteActivity: (id: string) => void;
  
  // Actions - Appointments
  addAppointment: (appointment: Omit<MedicalAppointment, 'id'>) => void;
  updateAppointment: (id: string, updates: Partial<MedicalAppointment>) => void;
  deleteAppointment: (id: string) => void;
  
  // Utils
  getStats: () => HealthStats;
  getTodayWellbeing: () => WellbeingEntry | null;
  getTodayActivities: () => ActivityEntry[];
  getUpcomingAppointments: () => MedicalAppointment[];
  getMedicationPattern: (medicationId: string, days: number) => HealthPattern;
  getWellbeingPattern: (metric: WellbeingMetric, days: number) => HealthPattern;
  exportHealthData: (period: 'week' | 'month' | 'quarter') => ExportData;
  generatePDFReport: (data: ExportData) => Promise<string>; // Returns base64 PDF
}

export interface WellbeingMetricConfig {
  id: WellbeingMetric;
  name: string;
  emoji: string;
  description: string;
  scale: {
    1: { label: string; color: string };
    2: { label: string; color: string };
    3: { label: string; color: string };
    4: { label: string; color: string };
    5: { label: string; color: string };
  };
  reverse?: boolean; // true pour anxiety (5 = très mauvais)
}

export interface ActivityTypeConfig {
  id: ActivityType;
  name: string;
  emoji: string;
  description: string;
  color: string;
  mentalBenefit: string;
}

export interface AppointmentTypeConfig {
  id: AppointmentType;
  name: string;
  emoji: string;
  color: string;
  defaultDuration: number;
  defaultReminders: number[]; // jours avant
}

// Props des composants
export interface QuickWellbeingProps {
  onComplete: (entry: Omit<WellbeingEntry, 'id' | 'completedAt'>) => void;
  existingEntry?: WellbeingEntry;
}

export interface MedicationTrackerProps {
  medications: Medication[];
  entries: MedicationEntry[];
  onLogMedication: (entry: Omit<MedicationEntry, 'id'>) => void;
}

export interface ActivityLoggerProps {
  activities: ActivityEntry[];
  onLogActivity: (activity: Omit<ActivityEntry, 'id'>) => void;
}

export interface HealthVisualizationProps {
  patterns: HealthPattern[];
  period: 'week' | 'month';
  metric?: WellbeingMetric;
}

export interface AppointmentManagerProps {
  appointments: MedicalAppointment[];
  onAdd: (appointment: Omit<MedicalAppointment, 'id'>) => void;
  onUpdate: (id: string, updates: Partial<MedicalAppointment>) => void;
  onDelete: (id: string) => void;
}