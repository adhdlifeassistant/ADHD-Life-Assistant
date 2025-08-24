'use client';

import { UserProfile, ADHDChallenge } from '@/types/profile';
import { MoodType } from '@/types/mood';

// Types pour l'évolution du profil
export interface ProfileEvolutionData {
  moodPatterns: {
    dominant: MoodType;
    frequency: Record<MoodType, number>;
    timePatterns: Array<{hour: number; mood: MoodType; frequency: number}>;
    triggers: Array<{trigger: string; mood: MoodType; confidence: number}>;
  };
  
  behaviorInsights: {
    mostUsedModules: Array<{moduleId: string; usage: number; timeOfDay: string[]}>;
    challengeProgress: Array<{challengeId: ADHDChallenge; improvement: number; strugglingAreas: string[]}>;
    chronotypeAccuracy: {
      predicted: 'morning' | 'evening' | 'flexible';
      confidence: number;
      optimalHours: number[];
    };
  };
  
  adaptiveRecommendations: {
    newChallengesDetected: Array<{challengeId: ADHDChallenge; evidence: string[]; confidence: number}>;
    modulePersonalizationUpdates: Array<{moduleId: string; updates: any; reason: string}>;
    routineOptimizations: Array<{type: string; suggestion: string; potentialImpact: number}>;
  };
  
  profileMaturity: {
    level: 'discovering' | 'understanding' | 'optimizing' | 'mastering';
    completeness: number; // 0-100%
    nextMilestones: string[];
    strengths: string[];
    growthAreas: string[];
  };
}

export interface ActivityData {
  timestamp: number;
  moduleId: string;
  action: string;
  mood: MoodType;
  duration?: number;
  metadata?: any;
}

export interface MoodEntry {
  timestamp: number;
  mood: MoodType;
  context?: string;
  triggers?: string[];
}

// Classe principale pour l'évolution du profil
export class ProfileEvolutionEngine {
  private activities: ActivityData[] = [];
  private moodEntries: MoodEntry[] = [];
  
  constructor(private profile: UserProfile) {
    this.loadHistoricalData();
  }
  
  private loadHistoricalData() {
    // Charger depuis localStorage
    try {
      const activities = localStorage.getItem('adhd-activities');
      const moods = localStorage.getItem('adhd-mood-history');
      
      if (activities) this.activities = JSON.parse(activities);
      if (moods) this.moodEntries = JSON.parse(moods);
    } catch (error) {
      console.error('Erreur chargement données historiques:', error);
    }
  }
  
  // Enregistrer une nouvelle activité
  recordActivity(moduleId: string, action: string, mood: MoodType, duration?: number, metadata?: any) {
    const activity: ActivityData = {
      timestamp: Date.now(),
      moduleId,
      action,
      mood,
      duration,
      metadata
    };
    
    this.activities.push(activity);
    this.saveActivities();
    
    // Déclencher analyse si suffisamment de données
    if (this.activities.length % 10 === 0) {
      this.triggerEvolutionAnalysis();
    }
  }
  
  // Enregistrer changement d'humeur
  recordMoodChange(mood: MoodType, context?: string, triggers?: string[]) {
    const moodEntry: MoodEntry = {
      timestamp: Date.now(),
      mood,
      context,
      triggers
    };
    
    this.moodEntries.push(moodEntry);
    this.saveMoodEntries();
  }
  
  // Analyse complète de l'évolution
  analyzeEvolution(): ProfileEvolutionData {
    return {
      moodPatterns: this.analyzeMoodPatterns(),
      behaviorInsights: this.analyzeBehaviorInsights(),
      adaptiveRecommendations: this.generateAdaptiveRecommendations(),
      profileMaturity: this.assessProfileMaturity()
    };
  }
  
  private analyzeMoodPatterns() {
    const moodFrequency: Record<MoodType, number> = {
      energetic: 0,
      normal: 0,
      tired: 0,
      stressed: 0,
      sad: 0
    };
    
    // Analyser fréquence des moods
    this.moodEntries.forEach(entry => {
      moodFrequency[entry.mood]++;
    });
    
    // Trouver mood dominant
    const dominant = Object.entries(moodFrequency)
      .sort(([,a], [,b]) => b - a)[0][0] as MoodType;
    
    // Patterns temporels
    const timePatterns = this.analyzeTimePatterns();
    
    // Déclencheurs détectés
    const triggers = this.detectMoodTriggers();
    
    return {
      dominant,
      frequency: moodFrequency,
      timePatterns,
      triggers
    };
  }
  
  private analyzeTimePatterns() {
    const hourlyMoods: Record<number, Record<MoodType, number>> = {};
    
    this.moodEntries.forEach(entry => {
      const hour = new Date(entry.timestamp).getHours();
      
      if (!hourlyMoods[hour]) {
        hourlyMoods[hour] = {
          energetic: 0, normal: 0, tired: 0, stressed: 0, sad: 0
        };
      }
      
      hourlyMoods[hour][entry.mood]++;
    });
    
    return Object.entries(hourlyMoods).map(([hour, moods]) => {
      const dominantMood = Object.entries(moods)
        .sort(([,a], [,b]) => b - a)[0][0] as MoodType;
      
      return {
        hour: parseInt(hour),
        mood: dominantMood,
        frequency: moods[dominantMood]
      };
    });
  }
  
  private detectMoodTriggers() {
    const triggers: Array<{trigger: string; mood: MoodType; confidence: number}> = [];
    
    // Analyser les déclencheurs mentionnés
    this.moodEntries.forEach(entry => {
      if (entry.triggers) {
        entry.triggers.forEach(trigger => {
          const existing = triggers.find(t => t.trigger === trigger && t.mood === entry.mood);
          if (existing) {
            existing.confidence += 0.1;
          } else {
            triggers.push({
              trigger,
              mood: entry.mood,
              confidence: 0.5
            });
          }
        });
      }
    });
    
    return triggers.filter(t => t.confidence > 0.6);
  }
  
  private analyzeBehaviorInsights() {
    // Modules les plus utilisés
    const moduleUsage: Record<string, number> = {};
    const moduleTimeUsage: Record<string, number[]> = {};
    
    this.activities.forEach(activity => {
      moduleUsage[activity.moduleId] = (moduleUsage[activity.moduleId] || 0) + 1;
      
      const hour = new Date(activity.timestamp).getHours();
      if (!moduleTimeUsage[activity.moduleId]) {
        moduleTimeUsage[activity.moduleId] = [];
      }
      moduleTimeUsage[activity.moduleId].push(hour);
    });
    
    const mostUsedModules = Object.entries(moduleUsage)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([moduleId, usage]) => ({
        moduleId,
        usage,
        timeOfDay: this.getOptimalHours(moduleTimeUsage[moduleId] || [])
      }));
    
    // Progression des défis
    const challengeProgress = this.analyzeChallengeProgress();
    
    // Précision chronotype
    const chronotypeAccuracy = this.assessChronotypeAccuracy();
    
    return {
      mostUsedModules,
      challengeProgress,
      chronotypeAccuracy
    };
  }
  
  private analyzeChallengeProgress() {
    // Simuler analyse des progrès
    return this.profile.challenges.map(challengeId => ({
      challengeId,
      improvement: Math.random() * 100, // TODO: vraie logique
      strugglingAreas: ['Constance', 'Motivation'] // TODO: vraie analyse
    }));
  }
  
  private assessChronotypeAccuracy() {
    const activityHours = this.activities.map(a => 
      new Date(a.timestamp).getHours()
    );
    
    const optimalHours = this.getOptimalHours(activityHours).map(h => parseInt(h));
    
    // Prédire chronotype basé sur les données
    let predicted: 'morning' | 'evening' | 'flexible' = 'flexible';
    let confidence = 0.5;
    
    const morningActivity = optimalHours.filter(h => h >= 6 && h <= 11).length;
    const eveningActivity = optimalHours.filter(h => h >= 18 && h <= 23).length;
    
    if (morningActivity > eveningActivity * 1.5) {
      predicted = 'morning';
      confidence = 0.8;
    } else if (eveningActivity > morningActivity * 1.5) {
      predicted = 'evening';
      confidence = 0.8;
    }
    
    return {
      predicted,
      confidence,
      optimalHours
    };
  }
  
  private getOptimalHours(hours: number[]): string[] {
    const hourCounts: Record<number, number> = {};
    hours.forEach(h => hourCounts[h] = (hourCounts[h] || 0) + 1);
    
    return Object.entries(hourCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([hour]) => `${hour}h`);
  }
  
  private generateAdaptiveRecommendations() {
    const newChallengesDetected: Array<{challengeId: ADHDChallenge; evidence: string[]; confidence: number}> = [];
    const modulePersonalizationUpdates: Array<{moduleId: string; updates: any; reason: string}> = [];
    const routineOptimizations: Array<{type: string; suggestion: string; potentialImpact: number}> = [];
    
    // Détecter nouveaux défis basés sur l'usage
    const financeUsage = this.activities.filter(a => a.moduleId === 'finance').length;
    if (financeUsage > 20 && !this.profile.challenges.includes('impulse-spending')) {
      newChallengesDetected.push({
        challengeId: 'impulse-spending',
        evidence: ['Usage fréquent module finances', 'Patterns d\'achats détectés'],
        confidence: 0.7
      });
    }
    
    // Optimisations de routine
    if (this.activities.length > 50) {
      routineOptimizations.push({
        type: 'timing',
        suggestion: 'Décaler les tâches importantes selon tes heures de pointe détectées',
        potentialImpact: 85
      });
    }
    
    return {
      newChallengesDetected,
      modulePersonalizationUpdates,
      routineOptimizations
    };
  }
  
  private assessProfileMaturity() {
    const completeness = this.calculateCompleteness();
    
    let level: 'discovering' | 'understanding' | 'optimizing' | 'mastering' = 'discovering';
    if (completeness > 25) level = 'understanding';
    if (completeness > 50) level = 'optimizing';
    if (completeness > 80) level = 'mastering';
    
    const nextMilestones = this.getNextMilestones(level, completeness);
    const strengths = this.identifyStrengths();
    const growthAreas = this.identifyGrowthAreas();
    
    return {
      level,
      completeness,
      nextMilestones,
      strengths,
      growthAreas
    };
  }
  
  private calculateCompleteness(): number {
    let score = 0;
    
    // Profil de base
    if (this.profile.name) score += 10;
    if (this.profile.age) score += 5;
    if (this.profile.chronotype) score += 10;
    
    // Médications
    if (this.profile.medications.length > 0) score += 15;
    
    // Défis ADHD
    score += this.profile.challenges.length * 5;
    
    // Données d'usage
    if (this.activities.length > 10) score += 10;
    if (this.activities.length > 50) score += 15;
    if (this.moodEntries.length > 20) score += 10;
    
    // Diversité d'usage
    const uniqueModules = new Set(this.activities.map(a => a.moduleId)).size;
    score += uniqueModules * 3;
    
    return Math.min(100, score);
  }
  
  private getNextMilestones(level: string, completeness: number): string[] {
    const milestones = [];
    
    if (level === 'discovering') {
      milestones.push('Complete ton profil ADHD (défis, chronotype)');
      milestones.push('Utilise 3 modules différents');
      milestones.push('Enregistre tes humeurs pendant 1 semaine');
    } else if (level === 'understanding') {
      milestones.push('Identifie tes patterns personnels');
      milestones.push('Optimise ton chronotype');
      milestones.push('Développe des routines personnalisées');
    } else if (level === 'optimizing') {
      milestones.push('Affine tes stratégies ADHD');
      milestones.push('Aide la communauté avec ton expérience');
      milestones.push('Expérimente des techniques avancées');
    } else {
      milestones.push('Tu maîtrises ! Continues à évoluer');
      milestones.push('Partage tes insights uniques');
    }
    
    return milestones;
  }
  
  private identifyStrengths(): string[] {
    const strengths = [];
    
    if (this.activities.length > 30) {
      strengths.push('Engagement constant avec les outils');
    }
    
    const moodStability = this.calculateMoodStability();
    if (moodStability > 0.7) {
      strengths.push('Bonne régulation émotionnelle');
    }
    
    if (this.profile.medications.length > 0) {
      strengths.push('Gestion proactive du traitement');
    }
    
    return strengths;
  }
  
  private identifyGrowthAreas(): string[] {
    const growthAreas = [];
    
    if (this.activities.length < 10) {
      growthAreas.push('Exploration des différents modules');
    }
    
    if (this.profile.challenges.length < 2) {
      growthAreas.push('Identification des défis ADHD personnels');
    }
    
    const moodVariability = this.calculateMoodVariability();
    if (moodVariability > 0.8) {
      growthAreas.push('Stabilisation des patterns émotionnels');
    }
    
    return growthAreas;
  }
  
  private calculateMoodStability(): number {
    if (this.moodEntries.length < 5) return 0.5;
    
    const recentMoods = this.moodEntries.slice(-10);
    const moodCounts = recentMoods.reduce((acc, entry) => {
      acc[entry.mood] = (acc[entry.mood] || 0) + 1;
      return acc;
    }, {} as Record<MoodType, number>);
    
    const maxCount = Math.max(...Object.values(moodCounts));
    return maxCount / recentMoods.length;
  }
  
  private calculateMoodVariability(): number {
    if (this.moodEntries.length < 5) return 0.5;
    
    const uniqueMoods = new Set(this.moodEntries.slice(-20).map(e => e.mood)).size;
    return uniqueMoods / 5; // 5 = nombre total de moods possibles
  }
  
  private saveActivities() {
    try {
      localStorage.setItem('adhd-activities', JSON.stringify(this.activities));
    } catch (error) {
      console.error('Erreur sauvegarde activités:', error);
    }
  }
  
  private saveMoodEntries() {
    try {
      localStorage.setItem('adhd-mood-history', JSON.stringify(this.moodEntries));
    } catch (error) {
      console.error('Erreur sauvegarde humeurs:', error);
    }
  }
  
  private triggerEvolutionAnalysis() {
    // Déclencher une analyse complète et suggérer des mises à jour
    const evolution = this.analyzeEvolution();
    
    // Événement pour notifier l'UI des nouvelles insights
    window.dispatchEvent(new CustomEvent('profileEvolutionUpdate', {
      detail: evolution
    }));
  }
  
  // API publique pour intégration
  static getInstance(profile: UserProfile): ProfileEvolutionEngine {
    // Singleton pattern pour éviter duplications
    if (!(window as any).__profileEvolution) {
      (window as any).__profileEvolution = new ProfileEvolutionEngine(profile);
    }
    return (window as any).__profileEvolution;
  }
}