import { ExportOptions, MedicalExportData } from './types';
import { format, subDays, parseISO, isWithinInterval } from 'date-fns';
import { fr } from 'date-fns/locale';

export class DataProcessor {
  async processData(options: ExportOptions): Promise<MedicalExportData> {
    const endDate = new Date();
    const startDate = subDays(endDate, options.period.days);

    // Récupérer les données de tous les modules
    const profileData = this.getProfileData();
    const moodData = this.getMoodData(startDate, endDate);
    const habitsData = this.getHabitsData(startDate, endDate);
    const observationsData = this.getObservationsData(startDate, endDate);

    return {
      metadata: {
        generatedAt: new Date().toISOString(),
        period: {
          start: format(startDate, 'yyyy-MM-dd', { locale: fr }),
          end: format(endDate, 'yyyy-MM-dd', { locale: fr }),
          days: options.period.days
        },
        patient: {
          name: options.anonymize ? this.anonymizeName(profileData.name) : profileData.name,
          age: profileData.age,
          anonymized: options.anonymize
        },
        version: '1.0'
      },
      profile: {
        medications: profileData.medications.map((med: any) => ({
          name: med.name,
          dosage: med.dosage || 'Non spécifié',
          frequency: med.frequency,
          adherence: this.calculateAdherence(med.name, startDate, endDate),
          notes: options.includeNotes ? med.notes : undefined
        })),
        challenges: profileData.challenges,
        chronotype: profileData.chronotype
      },
      mood: this.processMoodData(moodData, startDate, endDate),
      habits: this.processHabitsData(habitsData, startDate, endDate),
      observations: options.includeNotes ? this.processObservationsData(observationsData, options.anonymize) : {
        userNotes: [],
        patterns: []
      }
    };
  }

  private getProfileData(): any {
    try {
      const stored = localStorage.getItem('adhd-user-profile');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Erreur lors de la récupération du profil:', error);
    }

    return {
      name: 'Utilisateur',
      age: undefined,
      medications: [],
      challenges: [],
      chronotype: 'flexible'
    };
  }

  private getMoodData(startDate: Date, endDate: Date): any[] {
    try {
      const stored = localStorage.getItem('adhd-mood-entries');
      if (stored) {
        const entries = JSON.parse(stored);
        return entries.filter((entry: any) => {
          const entryDate = parseISO(entry.date);
          return isWithinInterval(entryDate, { start: startDate, end: endDate });
        });
      }
    } catch (error) {
      console.warn('Erreur lors de la récupération des données d\'humeur:', error);
    }

    return this.generateSampleMoodData(startDate, endDate);
  }

  private getHabitsData(startDate: Date, endDate: Date): any {
    // Simuler des données d'habitudes
    return {
      sleep: this.generateSampleSleepData(startDate, endDate),
      exercise: this.generateSampleExerciseData(startDate, endDate),
      medication: this.generateSampleMedicationTracking(startDate, endDate)
    };
  }

  private getObservationsData(startDate: Date, endDate: Date): any {
    try {
      const stored = localStorage.getItem('adhd-user-notes');
      if (stored) {
        const notes = JSON.parse(stored);
        return notes.filter((note: any) => {
          const noteDate = parseISO(note.date);
          return isWithinInterval(noteDate, { start: startDate, end: endDate });
        });
      }
    } catch (error) {
      console.warn('Erreur lors de la récupération des observations:', error);
    }

    return [];
  }

  private processMoodData(moodData: any[], startDate: Date, endDate: Date): any {
    if (moodData.length === 0) {
      return {
        entries: [],
        averages: { mood: 0, energy: 0, focus: 0, anxiety: 0 },
        trends: { mood: 'stable', energy: 'stable', focus: 'stable', anxiety: 'stable' }
      };
    }

    const entries = moodData.map(entry => ({
      date: entry.date,
      mood: entry.mood || 5,
      energy: entry.energy || 5,
      focus: entry.focus || 5,
      anxiety: entry.anxiety || 5,
      notes: entry.notes
    }));

    const averages = {
      mood: this.calculateAverage(entries, 'mood'),
      energy: this.calculateAverage(entries, 'energy'),
      focus: this.calculateAverage(entries, 'focus'),
      anxiety: this.calculateAverage(entries, 'anxiety')
    };

    const trends = {
      mood: this.calculateTrend(entries, 'mood'),
      energy: this.calculateTrend(entries, 'energy'),
      focus: this.calculateTrend(entries, 'focus'),
      anxiety: this.calculateTrend(entries, 'anxiety')
    };

    return { entries, averages, trends };
  }

  private processHabitsData(habitsData: any, startDate: Date, endDate: Date): any {
    return {
      sleep: habitsData.sleep || [],
      exercise: habitsData.exercise || [],
      medication: habitsData.medication || []
    };
  }

  private processObservationsData(observationsData: any[], anonymize: boolean): any {
    const userNotes = observationsData.map(note => ({
      date: note.date,
      category: note.category || 'Général',
      note: anonymize ? this.anonymizeText(note.content) : note.content
    }));

    // Analyser les patterns (simulation)
    const patterns = [
      { pattern: 'Meilleure concentration le matin', frequency: 0.8, impact: 'positive' as const },
      { pattern: 'Fatigue en fin d\'après-midi', frequency: 0.6, impact: 'negative' as const },
      { pattern: 'Amélioration avec routine régulière', frequency: 0.7, impact: 'positive' as const }
    ];

    return { userNotes, patterns };
  }

  private calculateAdherence(medicationName: string, startDate: Date, endDate: Date): number {
    // Simulation du calcul d'adhérence
    return Math.round((Math.random() * 0.3 + 0.7) * 100) / 100; // Entre 70% et 100%
  }

  private calculateAverage(entries: any[], field: string): number {
    if (entries.length === 0) return 0;
    const sum = entries.reduce((acc, entry) => acc + (entry[field] || 0), 0);
    return Math.round((sum / entries.length) * 10) / 10;
  }

  private calculateTrend(entries: any[], field: string): 'improving' | 'stable' | 'declining' {
    if (entries.length < 7) return 'stable';

    const firstWeek = entries.slice(0, Math.min(7, entries.length));
    const lastWeek = entries.slice(-7);

    const firstAvg = this.calculateAverage(firstWeek, field);
    const lastAvg = this.calculateAverage(lastWeek, field);

    const diff = lastAvg - firstAvg;
    
    if (field === 'anxiety') {
      // Pour l'anxiété, une diminution est une amélioration
      if (diff < -0.5) return 'improving';
      if (diff > 0.5) return 'declining';
    } else {
      if (diff > 0.5) return 'improving';
      if (diff < -0.5) return 'declining';
    }
    
    return 'stable';
  }

  private anonymizeName(name: string): string {
    if (!name || name.length === 0) return 'Patient';
    
    const parts = name.trim().split(' ');
    return parts.map((part, index) => {
      if (index === 0) {
        // Premier prénom: première lettre + points
        return part.charAt(0).toUpperCase() + '.';
      } else {
        // Nom de famille: première et dernière lettre
        if (part.length <= 2) return part.charAt(0).toUpperCase() + '.';
        return part.charAt(0).toUpperCase() + '***' + part.slice(-1);
      }
    }).join(' ');
  }

  private anonymizeText(text: string): string {
    if (!text) return '';
    
    // Remplacer les noms propres potentiels par des initiales
    return text.replace(/\b[A-Z][a-z]+\b/g, (match) => {
      if (match.length <= 2) return match;
      return match.charAt(0) + '***';
    });
  }

  // Méthodes pour générer des données d'exemple
  private generateSampleMoodData(startDate: Date, endDate: Date): any[] {
    const data: any[] = [];
    const current = new Date(startDate);
    
    while (current <= endDate) {
      if (Math.random() > 0.2) { // 80% de chance d'avoir une entrée
        data.push({
          date: format(current, 'yyyy-MM-dd'),
          mood: Math.round((Math.random() * 4 + 4) * 10) / 10, // 4-8
          energy: Math.round((Math.random() * 4 + 3) * 10) / 10, // 3-7
          focus: Math.round((Math.random() * 5 + 3) * 10) / 10, // 3-8
          anxiety: Math.round((Math.random() * 3 + 2) * 10) / 10, // 2-5
          notes: Math.random() > 0.7 ? 'Journée productive' : undefined
        });
      }
      
      current.setDate(current.getDate() + 1);
    }
    
    return data;
  }

  private generateSampleSleepData(startDate: Date, endDate: Date): any[] {
    const data: any[] = [];
    const current = new Date(startDate);
    
    while (current <= endDate) {
      const bedtimeHour = 22 + Math.random() * 3; // 22h-1h
      const wakeupHour = 6.5 + Math.random() * 2.5; // 6h30-9h
      const duration = wakeupHour + (bedtimeHour > 12 ? 0 : 24) - bedtimeHour;
      
      data.push({
        date: format(current, 'yyyy-MM-dd'),
        bedtime: `${Math.floor(bedtimeHour)}:${String(Math.floor((bedtimeHour % 1) * 60)).padStart(2, '0')}`,
        wakeup: `${Math.floor(wakeupHour)}:${String(Math.floor((wakeupHour % 1) * 60)).padStart(2, '0')}`,
        quality: Math.round((Math.random() * 3 + 6) * 10) / 10, // 6-9
        duration: Math.round(duration * 10) / 10
      });
      
      current.setDate(current.getDate() + 1);
    }
    
    return data;
  }

  private generateSampleExerciseData(startDate: Date, endDate: Date): any[] {
    const data: any[] = [];
    const current = new Date(startDate);
    const exerciseTypes = ['Marche', 'Course', 'Vélo', 'Yoga', 'Musculation', 'Natation'];
    
    while (current <= endDate) {
      if (Math.random() > 0.6) { // 40% de chance d'exercice
        data.push({
          date: format(current, 'yyyy-MM-dd'),
          type: exerciseTypes[Math.floor(Math.random() * exerciseTypes.length)],
          duration: Math.round((Math.random() * 60 + 15) * 10) / 10, // 15-75 min
          intensity: Math.round((Math.random() * 4 + 4) * 10) / 10 // 4-8
        });
      }
      
      current.setDate(current.getDate() + 1);
    }
    
    return data;
  }

  private generateSampleMedicationTracking(startDate: Date, endDate: Date): any[] {
    const data: any[] = [];
    const current = new Date(startDate);
    const medications = ['Ritalin', 'Concerta', 'Adderall'];
    
    while (current <= endDate) {
      medications.forEach(med => {
        data.push({
          date: format(current, 'yyyy-MM-dd'),
          taken: Math.random() > 0.1, // 90% d'adhérence
          time: '08:00',
          medication: med
        });
      });
      
      current.setDate(current.getDate() + 1);
    }
    
    return data;
  }
}