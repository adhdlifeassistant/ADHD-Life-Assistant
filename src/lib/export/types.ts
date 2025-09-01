export interface ExportPeriod {
  value: string;
  label: string;
  days: number;
}

export interface ExportOptions {
  period: ExportPeriod;
  format: 'pdf' | 'json' | 'csv';
  anonymize: boolean;
  includeGraphs: boolean;
  includeNotes: boolean;
  sections: ExportSection[];
}

export interface ExportSection {
  id: string;
  name: string;
  enabled: boolean;
  data?: any;
}

export interface MedicalExportData {
  metadata: {
    generatedAt: string;
    period: {
      start: string;
      end: string;
      days: number;
    };
    patient: {
      name: string;
      age?: number;
      anonymized: boolean;
    };
    version: string;
  };
  profile: {
    medications: Array<{
      name: string;
      dosage: string;
      frequency: string;
      adherence?: number;
      notes?: string;
    }>;
    challenges: string[];
    chronotype: string;
  };
  mood: {
    entries: Array<{
      date: string;
      mood: number;
      energy: number;
      focus: number;
      anxiety: number;
      notes?: string;
    }>;
    averages: {
      mood: number;
      energy: number;
      focus: number;
      anxiety: number;
    };
    trends: {
      mood: 'improving' | 'stable' | 'declining';
      energy: 'improving' | 'stable' | 'declining';
      focus: 'improving' | 'stable' | 'declining';
      anxiety: 'improving' | 'stable' | 'declining';
    };
  };
  habits: {
    sleep: Array<{
      date: string;
      bedtime: string;
      wakeup: string;
      quality: number;
      duration: number;
    }>;
    exercise: Array<{
      date: string;
      type: string;
      duration: number;
      intensity: number;
    }>;
    medication: Array<{
      date: string;
      taken: boolean;
      time: string;
      medication: string;
    }>;
  };
  observations: {
    userNotes: Array<{
      date: string;
      category: string;
      note: string;
    }>;
    patterns: Array<{
      pattern: string;
      frequency: number;
      impact: 'positive' | 'negative' | 'neutral';
    }>;
  };
}

export interface ExportProgress {
  step: string;
  percentage: number;
  message: string;
}

export const EXPORT_PERIODS: ExportPeriod[] = [
  { value: '1w', label: '1 semaine', days: 7 },
  { value: '1m', label: '1 mois', days: 30 },
  { value: '3m', label: '3 mois', days: 90 },
  { value: '6m', label: '6 mois', days: 180 },
  { value: '1y', label: '1 an', days: 365 }
];

export const DEFAULT_EXPORT_SECTIONS: ExportSection[] = [
  { id: 'profile', name: 'Profil et médicaments', enabled: true },
  { id: 'mood', name: 'Humeur et émotions', enabled: true },
  { id: 'habits', name: 'Habitudes et routines', enabled: true },
  { id: 'observations', name: 'Observations personnelles', enabled: true },
  { id: 'graphs', name: 'Graphiques et tendances', enabled: true }
];