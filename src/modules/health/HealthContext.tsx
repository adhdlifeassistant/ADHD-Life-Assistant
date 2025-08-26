'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Medication,
  MedicationEntry,
  WellbeingEntry,
  ActivityEntry,
  MedicalAppointment,
  HealthStats,
  HealthPattern,
  ExportData,
  HealthContextType,
  WellbeingMetric,
  WellbeingMetricConfig,
  ActivityType,
  ActivityTypeConfig,
  AppointmentType,
  AppointmentTypeConfig,
  SideEffect
} from '@/types/health';
import { MoodType } from '@/types/mood';
import { syncHealthMedicationToProfile } from '@/lib/medicationSync';

// Configuration des métriques de bien-être
const WELLBEING_METRICS: Record<WellbeingMetric, WellbeingMetricConfig> = {
  sleep: {
    id: 'sleep',
    name: 'Sommeil',
    emoji: '😴',
    description: 'Qualité de votre sommeil',
    scale: {
      1: { label: 'Très mauvais', color: 'text-red-600' },
      2: { label: 'Mauvais', color: 'text-orange-600' },
      3: { label: 'Correct', color: 'text-yellow-600' },
      4: { label: 'Bon', color: 'text-green-600' },
      5: { label: 'Excellent', color: 'text-emerald-600' }
    }
  },
  energy: {
    id: 'energy',
    name: 'Énergie',
    emoji: '⚡',
    description: 'Niveau d\'énergie général',
    scale: {
      1: { label: 'Épuisé', color: 'text-red-600' },
      2: { label: 'Fatigué', color: 'text-orange-600' },
      3: { label: 'Normal', color: 'text-yellow-600' },
      4: { label: 'Énergique', color: 'text-green-600' },
      5: { label: 'Débordant', color: 'text-emerald-600' }
    }
  },
  focus: {
    id: 'focus',
    name: 'Concentration',
    emoji: '🎯',
    description: 'Capacité de concentration',
    scale: {
      1: { label: 'Impossible', color: 'text-red-600' },
      2: { label: 'Difficile', color: 'text-orange-600' },
      3: { label: 'Variable', color: 'text-yellow-600' },
      4: { label: 'Bonne', color: 'text-green-600' },
      5: { label: 'Excellente', color: 'text-emerald-600' }
    }
  },
  anxiety: {
    id: 'anxiety',
    name: 'Anxiété',
    emoji: '😰',
    description: 'Niveau d\'anxiété ressenti',
    reverse: true,
    scale: {
      1: { label: 'Très serein', color: 'text-emerald-600' },
      2: { label: 'Calme', color: 'text-green-600' },
      3: { label: 'Un peu stressé', color: 'text-yellow-600' },
      4: { label: 'Anxieux', color: 'text-orange-600' },
      5: { label: 'Très anxieux', color: 'text-red-600' }
    }
  }
};

// Configuration des types d'activité
const ACTIVITY_TYPES: Record<ActivityType, ActivityTypeConfig> = {
  walk: {
    id: 'walk',
    name: 'Marche',
    emoji: '🚶‍♂️',
    description: 'Promenade, balade',
    color: 'blue-500',
    mentalBenefit: 'Apaisement et clarté mentale'
  },
  sport: {
    id: 'sport',
    name: 'Sport',
    emoji: '🏃‍♂️',
    description: 'Activité sportive intense',
    color: 'red-500',
    mentalBenefit: 'Libération d\'endorphines'
  },
  cleaning: {
    id: 'cleaning',
    name: 'Ménage',
    emoji: '🧹',
    description: 'Tâches ménagères',
    color: 'green-500',
    mentalBenefit: 'Satisfaction d\'accomplir'
  },
  garden: {
    id: 'garden',
    name: 'Jardinage',
    emoji: '🌱',
    description: 'Jardiner, plantes',
    color: 'emerald-500',
    mentalBenefit: 'Connexion à la nature'
  },
  dance: {
    id: 'dance',
    name: 'Danse',
    emoji: '💃',
    description: 'Danser, bouger en musique',
    color: 'purple-500',
    mentalBenefit: 'Expression créative et joie'
  },
  other: {
    id: 'other',
    name: 'Autre',
    emoji: '🏃',
    description: 'Autre activité physique',
    color: 'gray-500',
    mentalBenefit: 'Bien-être général'
  }
};

// Configuration des types de RDV
const APPOINTMENT_TYPES: Record<AppointmentType, AppointmentTypeConfig> = {
  psychiatrist: {
    id: 'psychiatrist',
    name: 'Psychiatre',
    emoji: '👨‍⚕️',
    color: 'blue-500',
    defaultDuration: 60,
    defaultReminders: [7, 1]
  },
  psychologist: {
    id: 'psychologist',
    name: 'Psychologue',
    emoji: '🧠',
    color: 'purple-500',
    defaultDuration: 50,
    defaultReminders: [3, 1]
  },
  general: {
    id: 'general',
    name: 'Médecin généraliste',
    emoji: '⚕️',
    color: 'green-500',
    defaultDuration: 30,
    defaultReminders: [1]
  },
  specialist: {
    id: 'specialist',
    name: 'Spécialiste',
    emoji: '👩‍⚕️',
    color: 'orange-500',
    defaultDuration: 45,
    defaultReminders: [7, 1]
  },
  other: {
    id: 'other',
    name: 'Autre',
    emoji: '🏥',
    color: 'gray-500',
    defaultDuration: 30,
    defaultReminders: [1]
  }
};

// Effets secondaires courants
const COMMON_SIDE_EFFECTS: SideEffect[] = [
  { id: 'insomnia', name: 'Insomnie', severity: 3, category: 'sleep' },
  { id: 'drowsiness', name: 'Somnolence', severity: 2, category: 'sleep' },
  { id: 'appetite_loss', name: 'Perte d\'appétit', severity: 3, category: 'appetite' },
  { id: 'nausea', name: 'Nausées', severity: 2, category: 'physical' },
  { id: 'headache', name: 'Maux de tête', severity: 2, category: 'physical' },
  { id: 'irritability', name: 'Irritabilité', severity: 3, category: 'mental' },
  { id: 'anxiety', name: 'Anxiété', severity: 4, category: 'mental' },
  { id: 'mood_swings', name: 'Sautes d\'humeur', severity: 3, category: 'mental' }
];

const HealthContext = createContext<HealthContextType | undefined>(undefined);

export function HealthProvider({ children }: { children: React.ReactNode }) {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [medicationEntries, setMedicationEntries] = useState<MedicationEntry[]>([]);
  const [wellbeingEntries, setWellbeingEntries] = useState<WellbeingEntry[]>([]);
  const [activities, setActivities] = useState<ActivityEntry[]>([]);
  const [appointments, setAppointments] = useState<MedicalAppointment[]>([]);

  // Charger les données sauvegardées
  useEffect(() => {
    const savedMedications = localStorage.getItem('adhd-health-medications');
    const savedMedicationEntries = localStorage.getItem('adhd-health-medication-entries');
    const savedWellbeingEntries = localStorage.getItem('adhd-health-wellbeing');
    const savedActivities = localStorage.getItem('adhd-health-activities');
    const savedAppointments = localStorage.getItem('adhd-health-appointments');

    if (savedMedications) setMedications(JSON.parse(savedMedications));
    if (savedMedicationEntries) setMedicationEntries(JSON.parse(savedMedicationEntries));
    if (savedWellbeingEntries) setWellbeingEntries(JSON.parse(savedWellbeingEntries));
    if (savedActivities) setActivities(JSON.parse(savedActivities));
    if (savedAppointments) setAppointments(JSON.parse(savedAppointments));
  }, []);

  // Sauvegarder automatiquement
  useEffect(() => {
    localStorage.setItem('adhd-health-medications', JSON.stringify(medications));
  }, [medications]);

  useEffect(() => {
    localStorage.setItem('adhd-health-medication-entries', JSON.stringify(medicationEntries));
  }, [medicationEntries]);

  useEffect(() => {
    localStorage.setItem('adhd-health-wellbeing', JSON.stringify(wellbeingEntries));
  }, [wellbeingEntries]);

  useEffect(() => {
    localStorage.setItem('adhd-health-activities', JSON.stringify(activities));
  }, [activities]);

  useEffect(() => {
    localStorage.setItem('adhd-health-appointments', JSON.stringify(appointments));
  }, [appointments]);

  // Actions - Medications
  const addMedication = useCallback((medicationData: Omit<Medication, 'id'>) => {
    const newMedication: Medication = {
      ...medicationData,
      id: `med_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
    setMedications(prev => [...prev, newMedication]);
  }, []);

  const updateMedication = useCallback((id: string, updates: Partial<Medication>) => {
    setMedications(prev =>
      prev.map(med => med.id === id ? { ...med, ...updates } : med)
    );
  }, []);

  const deleteMedication = useCallback((id: string) => {
    setMedications(prev => prev.filter(med => med.id !== id));
    setMedicationEntries(prev => prev.filter(entry => entry.medicationId !== id));
  }, []);

  const logMedication = useCallback((entryData: Omit<MedicationEntry, 'id'>) => {
    const newEntry: MedicationEntry = {
      ...entryData,
      id: `entry_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
    setMedicationEntries(prev => [...prev, newEntry]);
  }, []);

  // Actions - Wellbeing
  const logWellbeing = useCallback((entryData: Omit<WellbeingEntry, 'id' | 'completedAt'>) => {
    const existingEntry = wellbeingEntries.find(entry => 
      new Date(entry.date).toDateString() === new Date(entryData.date).toDateString()
    );

    if (existingEntry) {
      // Mettre à jour l'entrée existante
      setWellbeingEntries(prev =>
        prev.map(entry =>
          entry.id === existingEntry.id
            ? { ...entry, ...entryData, completedAt: Date.now() }
            : entry
        )
      );
    } else {
      // Créer nouvelle entrée
      const newEntry: WellbeingEntry = {
        ...entryData,
        id: `wellbeing_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        completedAt: Date.now()
      };
      setWellbeingEntries(prev => [...prev, newEntry]);
    }
  }, [wellbeingEntries]);

  const updateWellbeing = useCallback((id: string, updates: Partial<WellbeingEntry>) => {
    setWellbeingEntries(prev =>
      prev.map(entry => entry.id === id ? { ...entry, ...updates } : entry)
    );
  }, []);

  // Actions - Activities
  const logActivity = useCallback((activityData: Omit<ActivityEntry, 'id'>) => {
    const newActivity: ActivityEntry = {
      ...activityData,
      id: `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
    setActivities(prev => [...prev, newActivity]);
  }, []);

  const updateActivity = useCallback((id: string, updates: Partial<ActivityEntry>) => {
    setActivities(prev =>
      prev.map(activity => activity.id === id ? { ...activity, ...updates } : activity)
    );
  }, []);

  const deleteActivity = useCallback((id: string) => {
    setActivities(prev => prev.filter(activity => activity.id !== id));
  }, []);

  // Actions - Appointments
  const addAppointment = useCallback((appointmentData: Omit<MedicalAppointment, 'id'>) => {
    const newAppointment: MedicalAppointment = {
      ...appointmentData,
      id: `apt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
    setAppointments(prev => [...prev, newAppointment]);
  }, []);

  const updateAppointment = useCallback((id: string, updates: Partial<MedicalAppointment>) => {
    setAppointments(prev =>
      prev.map(apt => apt.id === id ? { ...apt, ...updates } : apt)
    );
  }, []);

  const deleteAppointment = useCallback((id: string) => {
    setAppointments(prev => prev.filter(apt => apt.id !== id));
  }, []);

  // Utils
  const getStats = useCallback((): HealthStats => {
    const today = new Date();
    const startOfToday = new Date(today.setHours(0, 0, 0, 0)).getTime();
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay())).getTime();

    const todayWellbeing = wellbeingEntries.find(entry =>
      new Date(entry.date).toDateString() === new Date().toDateString()
    );

    const todayActivities = activities.filter(activity =>
      new Date(activity.date).toDateString() === new Date().toDateString()
    );

    const activeMedications = medications.filter(med => med.isActive);
    const todayMedicationEntries = medicationEntries.filter(entry =>
      entry.takenAt >= startOfToday
    );

    const weekWellbeingEntries = wellbeingEntries.filter(entry => entry.date >= startOfWeek);
    const weekActivities = activities.filter(activity => activity.date >= startOfWeek);

    // Calculer moyennes bien-être semaine
    const avgWellbeing = weekWellbeingEntries.length > 0
      ? {
          sleep: weekWellbeingEntries.reduce((sum, entry) => sum + entry.metrics.sleep, 0) / weekWellbeingEntries.length,
          energy: weekWellbeingEntries.reduce((sum, entry) => sum + entry.metrics.energy, 0) / weekWellbeingEntries.length,
          focus: weekWellbeingEntries.reduce((sum, entry) => sum + entry.metrics.focus, 0) / weekWellbeingEntries.length,
          anxiety: weekWellbeingEntries.reduce((sum, entry) => sum + entry.metrics.anxiety, 0) / weekWellbeingEntries.length
        }
      : { sleep: 0, energy: 0, focus: 0, anxiety: 0 };

    return {
      today: {
        wellbeingLogged: !!todayWellbeing,
        activityLogged: todayActivities.length > 0,
        medicationsTaken: new Set(todayMedicationEntries.map(e => e.medicationId)).size,
        totalMedications: activeMedications.length
      },
      week: {
        wellbeingDays: weekWellbeingEntries.length,
        activityDays: new Set(weekActivities.map(a => new Date(a.date).toDateString())).size,
        avgWellbeing,
        totalActivities: weekActivities.length
      },
      month: {
        wellbeingDays: wellbeingEntries.filter(entry => 
          entry.date >= Date.now() - 30 * 24 * 60 * 60 * 1000
        ).length,
        patterns: [],
        medicationConsistency: 85 // TODO: calculer réellement
      }
    };
  }, [medications, medicationEntries, wellbeingEntries, activities]);

  const getTodayWellbeing = useCallback((): WellbeingEntry | null => {
    return wellbeingEntries.find(entry =>
      new Date(entry.date).toDateString() === new Date().toDateString()
    ) || null;
  }, [wellbeingEntries]);

  const getTodayActivities = useCallback((): ActivityEntry[] => {
    return activities.filter(activity =>
      new Date(activity.date).toDateString() === new Date().toDateString()
    );
  }, [activities]);

  const getUpcomingAppointments = useCallback((): MedicalAppointment[] => {
    const now = Date.now();
    return appointments
      .filter(apt => apt.date >= now && !apt.isCompleted)
      .sort((a, b) => a.date - b.date)
      .slice(0, 5);
  }, [appointments]);

  const getMedicationPattern = useCallback((medicationId: string, days: number): HealthPattern => {
    const startDate = Date.now() - days * 24 * 60 * 60 * 1000;
    const entries = medicationEntries
      .filter(entry => entry.medicationId === medicationId && entry.takenAt >= startDate)
      .sort((a, b) => a.takenAt - b.takenAt);

    return {
      id: `med_pattern_${medicationId}`,
      name: 'Prise de médication',
      description: 'Régularité de la prise',
      data: entries.map(entry => ({
        date: entry.takenAt,
        value: 1,
        context: entry.notes
      }))
    };
  }, [medicationEntries]);

  const getWellbeingPattern = useCallback((metric: WellbeingMetric, days: number): HealthPattern => {
    const startDate = Date.now() - days * 24 * 60 * 60 * 1000;
    const entries = wellbeingEntries
      .filter(entry => entry.date >= startDate)
      .sort((a, b) => a.date - b.date);

    return {
      id: `wellbeing_pattern_${metric}`,
      name: WELLBEING_METRICS[metric].name,
      description: `Évolution ${WELLBEING_METRICS[metric].description.toLowerCase()}`,
      data: entries.map(entry => ({
        date: entry.date,
        value: entry.metrics[metric],
        context: entry.notes
      }))
    };
  }, [wellbeingEntries]);

  const exportHealthData = useCallback((period: 'week' | 'month' | 'quarter'): ExportData => {
    const now = Date.now();
    const periodDays = period === 'week' ? 7 : period === 'month' ? 30 : 90;
    const startDate = now - periodDays * 24 * 60 * 60 * 1000;

    return {
      period,
      startDate,
      endDate: now,
      medications: medications.filter(med => med.isActive),
      medicationEntries: medicationEntries.filter(entry => entry.takenAt >= startDate),
      wellbeingEntries: wellbeingEntries.filter(entry => entry.date >= startDate),
      activities: activities.filter(activity => activity.date >= startDate),
      appointments: appointments.filter(apt => apt.date >= startDate),
      patterns: [
        getWellbeingPattern('sleep', periodDays),
        getWellbeingPattern('energy', periodDays),
        getWellbeingPattern('focus', periodDays),
        getWellbeingPattern('anxiety', periodDays)
      ],
      notes: ''
    };
  }, [medications, medicationEntries, wellbeingEntries, activities, appointments, getWellbeingPattern]);

  const generatePDFReport = useCallback(async (data: ExportData): Promise<string> => {
    // TODO: Implémenter la génération PDF réelle
    // Pour l'instant, retourner une chaîne base64 factice
    return 'data:application/pdf;base64,JVBERi0xLjQKJeLjz9MKNCAwIG9iajw8L0ZpbHRlci9GbGF0ZURlY29kZS9MZW5ndGggMTAxPj5zdHJlYW0K...';
  }, []);

  return (
    <HealthContext.Provider value={{
      medications,
      medicationEntries,
      wellbeingEntries,
      activities,
      appointments,
      addMedication,
      updateMedication,
      deleteMedication,
      logMedication,
      logWellbeing,
      updateWellbeing,
      logActivity,
      updateActivity,
      deleteActivity,
      addAppointment,
      updateAppointment,
      deleteAppointment,
      getStats,
      getTodayWellbeing,
      getTodayActivities,
      getUpcomingAppointments,
      getMedicationPattern,
      getWellbeingPattern,
      exportHealthData,
      generatePDFReport
    }}>
      {children}
    </HealthContext.Provider>
  );
}

export function useHealth() {
  const context = useContext(HealthContext);
  if (context === undefined) {
    throw new Error('useHealth must be used within a HealthProvider');
  }
  return context;
}

export {
  WELLBEING_METRICS,
  ACTIVITY_TYPES,
  APPOINTMENT_TYPES,
  COMMON_SIDE_EFFECTS
};