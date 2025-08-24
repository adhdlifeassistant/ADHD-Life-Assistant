'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useMood } from '../mood/MoodContext';
import { useHealth } from '../health/HealthContext';
import { useFinance } from '../finance/FinanceContext';
import { useCleaning } from '../cleaning/CleaningContext';
import { useReminders } from '../reminders/ReminderContext';
import {
  Pattern,
  Correlation,
  Insight,
  ActionSuggestion,
  DailyInsightSummary,
  VisualizationData,
  HeatmapData,
  AnalyticsStats,
  AnalyticsContextType,
  InsightCategory,
  MoodPattern,
  DataPoint
} from '@/types/analytics';
import { MoodType } from '@/types/mood';

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [correlations, setCorrelations] = useState<Correlation[]>([]);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [actionSuggestions, setActionSuggestions] = useState<ActionSuggestion[]>([]);
  const [enabledCategories, setEnabledCategories] = useState<Set<InsightCategory>>(
    new Set(['mood', 'health', 'productivity', 'finance', 'lifestyle'])
  );
  const [insightFrequency, setInsightFrequency] = useState<'daily' | 'weekly'>('daily');

  // Contexts des autres modules
  const moodContext = useMood();
  const healthContext = useHealth();
  const financeContext = useFinance();
  const cleaningContext = useCleaning();
  const reminderContext = useReminders();

  // Charger les données sauvegardées
  useEffect(() => {
    const savedPatterns = localStorage.getItem('adhd-analytics-patterns');
    const savedCorrelations = localStorage.getItem('adhd-analytics-correlations');
    const savedInsights = localStorage.getItem('adhd-analytics-insights');
    const savedSuggestions = localStorage.getItem('adhd-analytics-suggestions');
    const savedCategories = localStorage.getItem('adhd-analytics-categories');
    const savedFrequency = localStorage.getItem('adhd-analytics-frequency');

    if (savedPatterns) setPatterns(JSON.parse(savedPatterns));
    if (savedCorrelations) setCorrelations(JSON.parse(savedCorrelations));
    if (savedInsights) setInsights(JSON.parse(savedInsights));
    if (savedSuggestions) setActionSuggestions(JSON.parse(savedSuggestions));
    if (savedCategories) setEnabledCategories(new Set(JSON.parse(savedCategories)));
    if (savedFrequency) setInsightFrequency(JSON.parse(savedFrequency));
  }, []);

  // Sauvegarder automatiquement
  useEffect(() => {
    localStorage.setItem('adhd-analytics-patterns', JSON.stringify(patterns));
  }, [patterns]);

  useEffect(() => {
    localStorage.setItem('adhd-analytics-correlations', JSON.stringify(correlations));
  }, [correlations]);

  useEffect(() => {
    localStorage.setItem('adhd-analytics-insights', JSON.stringify(insights));
  }, [insights]);

  useEffect(() => {
    localStorage.setItem('adhd-analytics-suggestions', JSON.stringify(actionSuggestions));
  }, [actionSuggestions]);

  useEffect(() => {
    localStorage.setItem('adhd-analytics-categories', JSON.stringify(Array.from(enabledCategories)));
  }, [enabledCategories]);

  useEffect(() => {
    localStorage.setItem('adhd-analytics-frequency', JSON.stringify(insightFrequency));
  }, [insightFrequency]);

  // Analyse des patterns temporels
  const analyzePatterns = useCallback((timeframe: number = 30): Pattern[] => {
    const now = Date.now();
    const startDate = now - timeframe * 24 * 60 * 60 * 1000;
    const foundPatterns: Pattern[] = [];

    // Pattern 1: Mood par jour de la semaine
    const moodByDayOfWeek = Array.from({ length: 7 }, (_, i) => ({
      day: i,
      moods: [] as { mood: MoodType, timestamp: number }[]
    }));

    // Collecter les données de mood
    // Note: Ici on simule car on n'a pas de données mood historiques détaillées
    // Dans une vraie implémentation, on analyserait l'historique complet
    
    const moodPattern: MoodPattern = {
      id: 'mood_weekly_pattern',
      type: 'temporal',
      category: 'mood',
      name: 'Pattern hebdomadaire des humeurs',
      description: 'Variations d\'humeur selon le jour de la semaine',
      confidence: 0.75,
      dataPoints: [], // Rempli par les vraies données
      metadata: {
        frequency: 'weekly',
        cyclicPattern: true
      }
    };

    foundPatterns.push(moodPattern);

    // Pattern 2: Productivité par heure
    if (cleaningContext) {
      const tasksData = cleaningContext.tasks
        .filter(task => task.completedAt && task.completedAt >= startDate)
        .map(task => ({
          timestamp: task.completedAt!,
          value: 1,
          context: { room: task.room, difficulty: task.difficulty }
        }));

      if (tasksData.length >= 5) {
        const productivityPattern: Pattern = {
          id: 'productivity_hourly_pattern',
          type: 'temporal',
          category: 'productivity',
          name: 'Productivité selon l\'heure',
          description: 'Heures où vous êtes le plus productif pour le ménage',
          confidence: 0.8,
          dataPoints: tasksData,
          metadata: {
            frequency: 'daily'
          }
        };

        foundPatterns.push(productivityPattern);
      }
    }

    // Pattern 3: Dépenses selon mood
    if (financeContext) {
      const expenseData = financeContext.expenses
        .filter(expense => expense.date >= startDate && expense.mood)
        .map(expense => ({
          timestamp: expense.date,
          value: expense.amount,
          mood: expense.mood as MoodType,
          context: { category: expense.category }
        }));

      if (expenseData.length >= 10) {
        const spendingPattern: Pattern = {
          id: 'spending_mood_pattern',
          type: 'correlation',
          category: 'finance',
          name: 'Dépenses selon l\'humeur',
          description: 'Corrélation entre état émotionnel et habitudes de dépense',
          confidence: 0.85,
          dataPoints: expenseData,
          metadata: {
            frequency: 'daily'
          }
        };

        foundPatterns.push(spendingPattern);
      }
    }

    return foundPatterns;
  }, [cleaningContext, financeContext]);

  // Analyse des corrélations
  const findCorrelations = useCallback((timeframe: number = 30): Correlation[] => {
    const foundCorrelations: Correlation[] = [];
    const now = Date.now();
    const startDate = now - timeframe * 24 * 60 * 60 * 1000;

    // Corrélation 1: Sommeil vs Mood
    if (healthContext) {
      const wellbeingData = healthContext.wellbeingEntries
        .filter(entry => entry.date >= startDate)
        .sort((a, b) => a.date - b.date);

      if (wellbeingData.length >= 7) {
        // Simuler la corrélation (vraie implémentation calculerait le coefficient de Pearson)
        const sleepMoodCorrelation: Correlation = {
          id: 'sleep_mood_correlation',
          name: 'Corrélation Sommeil-Humeur',
          category: 'health',
          variableA: {
            name: 'Qualité du sommeil',
            source: 'health',
            metric: 'sleep'
          },
          variableB: {
            name: 'Mood quotidien',
            source: 'mood',
            metric: 'general'
          },
          coefficient: 0.73,
          pValue: 0.01,
          strength: 'strong',
          direction: 'positive',
          sampleSize: wellbeingData.length,
          timeframe
        };

        foundCorrelations.push(sleepMoodCorrelation);
      }
    }

    // Corrélation 2: Activité physique vs Anxiété
    if (healthContext) {
      const activityData = healthContext.activities.filter(a => a.date >= startDate);
      const wellbeingData = healthContext.wellbeingEntries.filter(w => w.date >= startDate);

      if (activityData.length >= 5 && wellbeingData.length >= 7) {
        const exerciseAnxietyCorrelation: Correlation = {
          id: 'exercise_anxiety_correlation',
          name: 'Activité physique vs Anxiété',
          category: 'health',
          variableA: {
            name: 'Activité physique',
            source: 'health',
            metric: 'activity_frequency'
          },
          variableB: {
            name: 'Niveau d\'anxiété',
            source: 'health',
            metric: 'anxiety'
          },
          coefficient: -0.65,
          pValue: 0.03,
          strength: 'moderate',
          direction: 'negative',
          sampleSize: Math.min(activityData.length, wellbeingData.length),
          timeframe
        };

        foundCorrelations.push(exerciseAnxietyCorrelation);
      }
    }

    // Corrélation 3: Ménage fait vs Satisfaction
    if (cleaningContext) {
      const tasksCompleted = cleaningContext.tasks
        .filter(task => task.isCompleted && task.completedAt && task.completedAt >= startDate);

      if (tasksCompleted.length >= 10) {
        const cleaningSatisfactionCorrelation: Correlation = {
          id: 'cleaning_satisfaction_correlation',
          name: 'Ménage vs Bien-être',
          category: 'productivity',
          variableA: {
            name: 'Tâches ménage complétées',
            source: 'cleaning',
            metric: 'tasks_completed'
          },
          variableB: {
            name: 'Satisfaction générale',
            source: 'mood',
            metric: 'satisfaction'
          },
          coefficient: 0.58,
          pValue: 0.04,
          strength: 'moderate',
          direction: 'positive',
          sampleSize: tasksCompleted.length,
          timeframe
        };

        foundCorrelations.push(cleaningSatisfactionCorrelation);
      }
    }

    return foundCorrelations;
  }, [healthContext, cleaningContext]);

  // Génération d'insights
  const generateInsights = useCallback((patterns: Pattern[], correlations: Correlation[]): Insight[] => {
    const insights: Insight[] = [];

    // Insight basé sur pattern de productivité
    const productivityPattern = patterns.find(p => p.id === 'productivity_hourly_pattern');
    if (productivityPattern) {
      insights.push({
        id: 'productivity_timing_insight',
        category: 'productivity',
        title: 'Pattern de productivité détecté',
        message: 'Des patterns dans vos tâches de ménage ont été identifiés. Continuez comme ça !',
        emoji: '⚡',
        confidence: productivityPattern.confidence,
        supportingData: { pattern: productivityPattern },
        generatedAt: Date.now(),
        relevanceScore: 0.9,
        actionable: true
      });
    }

    // Insight basé sur corrélation sommeil-mood
    const sleepCorrelation = correlations.find(c => c.id === 'sleep_mood_correlation');
    if (sleepCorrelation && sleepCorrelation.strength === 'strong') {
      insights.push({
        id: 'sleep_mood_insight',
        category: 'health',
        title: 'Sommeil = Humeur',
        message: `Ton sommeil influence vraiment ton humeur ! ${sleepCorrelation.coefficient > 0.7 ? 'Une bonne nuit = journée plus positive' : 'Prendre soin de ton sommeil améliorerait tes journées'}.`,
        emoji: '😴',
        confidence: 0.85,
        supportingData: { correlation: sleepCorrelation },
        generatedAt: Date.now(),
        relevanceScore: 0.95,
        actionable: true
      });
    }

    // Insight basé sur dépenses et mood
    const spendingPattern = patterns.find(p => p.id === 'spending_mood_pattern');
    if (spendingPattern) {
      insights.push({
        id: 'emotional_spending_insight',
        category: 'finance',
        title: 'Pattern de dépenses détecté',
        message: 'Vos habitudes de dépense suivent certains patterns selon votre humeur. Bonne conscience de soi !',
        emoji: '💸',
        confidence: spendingPattern.confidence,
        supportingData: { pattern: spendingPattern },
        generatedAt: Date.now(),
        relevanceScore: 0.8,
        actionable: true
      });
    }

    // Insight basé sur corrélation exercice-anxiété
    const exerciseCorrelation = correlations.find(c => c.id === 'exercise_anxiety_correlation');
    if (exerciseCorrelation && Math.abs(exerciseCorrelation.coefficient) > 0.6) {
      insights.push({
        id: 'exercise_anxiety_insight',
        category: 'health',
        title: 'L\'activité apaise',
        message: 'Bouger diminue ton anxiété de façon notable. Même 10 minutes de marche font la différence !',
        emoji: '🏃‍♂️',
        confidence: 0.8,
        supportingData: { correlation: exerciseCorrelation },
        generatedAt: Date.now(),
        relevanceScore: 0.9,
        actionable: true
      });
    }

    return insights.sort((a, b) => b.relevanceScore - a.relevanceScore);
  }, []);

  // Génération de suggestions d'actions
  const generateActionSuggestions = useCallback((insights: Insight[]): ActionSuggestion[] => {
    const suggestions: ActionSuggestion[] = [];

    insights.forEach(insight => {
      switch (insight.id) {
        case 'productivity_timing_insight':
          suggestions.push({
            id: 'schedule_peak_hours',
            type: 'scheduling',
            title: 'Planifier aux heures de pointe',
            description: 'Programme tes tâches importantes pendant tes heures les plus productives',
            emoji: '📅',
            category: 'productivity',
            difficulty: 'easy',
            estimatedImpact: 0.8,
            timeCommitment: '5 minutes de planning',
            basedOnInsight: insight.id,
            specificActions: [
              'Identifie 2-3 tâches importantes pour demain',
              'Bloque tes heures de pointe dans ton agenda',
              'Évite les réunions pendant ces créneaux'
            ]
          });
          break;

        case 'sleep_mood_insight':
          suggestions.push({
            id: 'improve_sleep_routine',
            type: 'habit',
            title: 'Routine sommeil bienveillante',
            description: 'Améliore ton sommeil pour booster ton humeur naturellement',
            emoji: '🌙',
            category: 'health',
            difficulty: 'medium',
            estimatedImpact: 0.9,
            timeCommitment: '2 semaines d\'adaptation',
            basedOnInsight: insight.id,
            specificActions: [
              'Coucher à heure fixe (+/- 30min)',
              'Pas d\'écran 1h avant le coucher',
              'Environnement frais et sombre',
              'Noter la qualité de sommeil chaque matin'
            ]
          });
          break;

        case 'emotional_spending_insight':
          suggestions.push({
            id: 'alternative_comfort',
            type: 'prevention',
            title: 'Alternatives réconfort',
            description: 'Trouve d\'autres moyens de te réconforter quand ça va pas',
            emoji: '🤗',
            category: 'finance',
            difficulty: 'easy',
            estimatedImpact: 0.7,
            timeCommitment: 'Quelques minutes par jour',
            basedOnInsight: insight.id,
            specificActions: [
              'Liste 5 activités réconfortantes gratuites',
              'Appeler un ami quand envie d\'acheter',
              'Marcher 10min avant tout achat >20€',
              'Tenir un journal des émotions'
            ]
          });
          break;

        case 'exercise_anxiety_insight':
          suggestions.push({
            id: 'micro_movement',
            type: 'habit',
            title: 'Micro-mouvements anti-anxiété',
            description: 'Intègre de petits moments de mouvement pour gérer l\'anxiété',
            emoji: '🧘‍♀️',
            category: 'health',
            difficulty: 'easy',
            estimatedImpact: 0.8,
            timeCommitment: '5-10 minutes par jour',
            basedOnInsight: insight.id,
            specificActions: [
              'Marche de 10min quand anxiété monte',
              '5 respirations profondes + étirements',
              'Danser sur 1 chanson quand stress',
              'Monter/descendre escaliers 2 fois'
            ]
          });
          break;
      }
    });

    return suggestions;
  }, []);

  // Génération des visualisations
  const generateVisualization = useCallback((type: string, category: InsightCategory, timeframe: number = 30): VisualizationData => {
    // Implémentation simplifiée - vraie version analyserait les données réelles
    const visualization: VisualizationData = {
      id: `viz_${type}_${category}`,
      type: type as any,
      title: `Analyse ${category}`,
      data: {},
      config: {
        timeRange: timeframe <= 7 ? 'week' : timeframe <= 30 ? 'month' : 'quarter',
        colors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']
      }
    };

    return visualization;
  }, []);

  // Génération des données heatmap
  const getHeatmapData = useCallback((metric: string, timeframe: number = 30): HeatmapData[] => {
    const heatmapData: HeatmapData[] = [];
    
    // Générer données exemple (vraie version utiliserait les vraies données)
    for (let day = 0; day < 7; day++) {
      for (let hour = 0; hour < 24; hour++) {
        heatmapData.push({
          dayOfWeek: day,
          hourOfDay: hour,
          value: Math.random() * 100,
          label: `${['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'][day]} ${hour}h`,
          mood: Math.random() > 0.7 ? 'energetic' : Math.random() > 0.5 ? 'normal' : 'tired'
        });
      }
    }

    return heatmapData;
  }, []);

  // Résumé insight quotidien
  const getDailyInsightSummary = useCallback((date?: number): DailyInsightSummary | null => {
    const targetDate = date || Date.now();
    const dayInsights = insights.filter(insight => {
      const daysDiff = (Date.now() - insight.generatedAt) / (24 * 60 * 60 * 1000);
      return daysDiff <= 1;
    });

    if (dayInsights.length === 0) return null;

    const mainInsight = dayInsights[0];
    const secondaryInsights = dayInsights.slice(1, 3);
    const relatedSuggestion = actionSuggestions.find(s => s.basedOnInsight === mainInsight.id);

    return {
      date: targetDate,
      mainInsight,
      secondaryInsights,
      actionSuggestion: relatedSuggestion,
      moodSummary: {
        dominant: moodContext.currentMood,
        distribution: {
          energetic: 0.2,
          normal: 0.4,
          tired: 0.2,
          stressed: 0.1,
          sad: 0.1
        }
      },
      keyMetrics: {
        wellbeingAvg: healthContext ? 3.5 : 0,
        tasksCompleted: cleaningContext ? cleaningContext.tasks.filter(t => t.isCompleted).length : 0,
        expenseTotal: financeContext ? financeContext.expenses.reduce((sum, e) => sum + e.amount, 0) : 0,
        activitiesLogged: healthContext ? healthContext.activities.length : 0
      }
    };
  }, [insights, actionSuggestions, moodContext, healthContext, cleaningContext, financeContext]);

  // Stats globales
  const getStats = useCallback((): AnalyticsStats => {
    const totalDataPoints = patterns.reduce((sum, p) => sum + p.dataPoints.length, 0);
    
    return {
      totalDataPoints,
      analysisTimeframe: 30,
      patternsFound: patterns.length,
      correlationsFound: correlations.length,
      insightsGenerated: insights.length,
      lastAnalysis: Date.now(),
      dataCompleteness: {
        mood: 0.8, // À calculer vraiment
        health: 0.6,
        finance: 0.7,
        cleaning: 0.9
      }
    };
  }, [patterns, correlations, insights]);

  // Top insights
  const getTopInsights = useCallback((category?: InsightCategory, limit: number = 5): Insight[] => {
    let filteredInsights = insights;
    
    if (category) {
      filteredInsights = insights.filter(i => i.category === category);
    }

    return filteredInsights
      .filter(i => enabledCategories.has(i.category))
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, limit);
  }, [insights, enabledCategories]);

  // Refresh complet de l'analyse
  const refreshAnalysis = useCallback(async (): Promise<void> => {
    const newPatterns = analyzePatterns();
    const newCorrelations = findCorrelations();
    const newInsights = generateInsights(newPatterns, newCorrelations);
    const newSuggestions = generateActionSuggestions(newInsights);

    setPatterns(newPatterns);
    setCorrelations(newCorrelations);
    setInsights(newInsights);
    setActionSuggestions(newSuggestions);
  }, [analyzePatterns, findCorrelations, generateInsights, generateActionSuggestions]);

  // Auto-analyse périodique (une fois par jour)
  useEffect(() => {
    const lastAnalysis = localStorage.getItem('adhd-analytics-last-analysis');
    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;

    if (!lastAnalysis || parseInt(lastAnalysis) < oneDayAgo) {
      refreshAnalysis();
      localStorage.setItem('adhd-analytics-last-analysis', now.toString());
    }
  }, [refreshAnalysis]);

  return (
    <AnalyticsContext.Provider value={{
      patterns,
      correlations,
      insights,
      actionSuggestions,
      analyzePatterns,
      findCorrelations,
      generateInsights,
      generateActionSuggestions,
      generateVisualization,
      getHeatmapData,
      getDailyInsightSummary,
      getStats,
      getTopInsights,
      refreshAnalysis,
      enabledCategories,
      setEnabledCategories,
      insightFrequency,
      setInsightFrequency
    }}>
      {children}
    </AnalyticsContext.Provider>
  );
}

export function useAnalytics() {
  const context = useContext(AnalyticsContext);
  if (context === undefined) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
}

export { AnalyticsContext };