import { MoodType } from './mood';
import { CleaningTask } from './cleaning';
import { Expense } from './finance';
import { WellbeingEntry, ActivityEntry, MedicationEntry } from './health';

export type PatternType = 'temporal' | 'correlation' | 'trend' | 'anomaly';

export type InsightCategory = 'mood' | 'productivity' | 'health' | 'finance' | 'lifestyle';

export type ActionSuggestionType = 'scheduling' | 'prevention' | 'optimization' | 'habit';

export interface DataPoint {
  timestamp: number;
  value: number | string | boolean;
  mood?: MoodType;
  context?: Record<string, any>;
}

export interface Pattern {
  id: string;
  type: PatternType;
  category: InsightCategory;
  name: string;
  description: string;
  confidence: number; // 0-1
  dataPoints: DataPoint[];
  metadata: {
    frequency?: string; // 'daily', 'weekly', etc.
    dayOfWeek?: number; // 0-6
    timeOfDay?: number; // 0-23
    duration?: number; // en jours
    strength?: number; // force du pattern 0-1
  };
}

export interface Correlation {
  id: string;
  name: string;
  category: InsightCategory;
  variableA: {
    name: string;
    source: 'mood' | 'health' | 'finance' | 'cleaning' | 'reminders';
    metric: string;
  };
  variableB: {
    name: string;
    source: 'mood' | 'health' | 'finance' | 'cleaning' | 'reminders';
    metric: string;
  };
  coefficient: number; // -1 à 1
  pValue: number; // significativité statistique
  strength: 'weak' | 'moderate' | 'strong';
  direction: 'positive' | 'negative';
  sampleSize: number;
  timeframe: number; // jours analysés
}

export interface Insight {
  id: string;
  category: InsightCategory;
  title: string;
  message: string;
  emoji: string;
  confidence: number;
  supportingData: {
    pattern?: Pattern;
    correlation?: Correlation;
    statistics?: Record<string, number>;
  };
  generatedAt: number;
  relevanceScore: number; // 0-1
  actionable: boolean;
}

export interface ActionSuggestion {
  id: string;
  type: ActionSuggestionType;
  title: string;
  description: string;
  emoji: string;
  category: InsightCategory;
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedImpact: number; // 0-1
  timeCommitment: string; // "5 minutes", "1 semaine", etc.
  basedOnInsight: string; // insight ID
  specificActions: string[];
  mood?: MoodType; // Si l'action est spécifique à un mood
}

export interface DailyInsightSummary {
  date: number;
  mainInsight: Insight;
  secondaryInsights: Insight[];
  actionSuggestion?: ActionSuggestion;
  moodSummary: {
    dominant: MoodType;
    distribution: Record<MoodType, number>;
  };
  keyMetrics: {
    wellbeingAvg: number;
    tasksCompleted: number;
    expenseTotal: number;
    activitiesLogged: number;
  };
}

export interface VisualizationData {
  id: string;
  type: 'line' | 'bar' | 'heatmap' | 'scatter' | 'pie';
  title: string;
  data: any; // Flexible pour différents types de graphiques
  config: {
    colors?: string[];
    labels?: string[];
    timeRange?: 'week' | 'month' | 'quarter';
    aggregation?: 'daily' | 'weekly' | 'monthly';
  };
  insights?: string[]; // Insights liés à cette visualisation
}

export interface HeatmapData {
  dayOfWeek: number; // 0-6
  hourOfDay: number; // 0-23
  value: number;
  label: string;
  mood?: MoodType;
}

export interface AnalyticsStats {
  totalDataPoints: number;
  analysisTimeframe: number; // jours
  patternsFound: number;
  correlationsFound: number;
  insightsGenerated: number;
  lastAnalysis: number;
  dataCompleteness: {
    mood: number; // pourcentage de jours avec data
    health: number;
    finance: number;
    cleaning: number;
  };
}

export interface AnalyticsContextType {
  // Données analysées
  patterns: Pattern[];
  correlations: Correlation[];
  insights: Insight[];
  actionSuggestions: ActionSuggestion[];
  
  // Méthodes d'analyse
  analyzePatterns: (timeframe?: number) => Pattern[];
  findCorrelations: (timeframe?: number) => Correlation[];
  generateInsights: (patterns: Pattern[], correlations: Correlation[]) => Insight[];
  generateActionSuggestions: (insights: Insight[]) => ActionSuggestion[];
  
  // Données visualisations
  generateVisualization: (type: string, category: InsightCategory, timeframe?: number) => VisualizationData;
  getHeatmapData: (metric: string, timeframe?: number) => HeatmapData[];
  
  // Utils
  getDailyInsightSummary: (date?: number) => DailyInsightSummary | null;
  getStats: () => AnalyticsStats;
  getTopInsights: (category?: InsightCategory, limit?: number) => Insight[];
  refreshAnalysis: () => Promise<void>;
  
  // Préférences
  enabledCategories: Set<InsightCategory>;
  setEnabledCategories: (categories: Set<InsightCategory>) => void;
  insightFrequency: 'daily' | 'weekly';
  setInsightFrequency: (frequency: 'daily' | 'weekly') => void;
}

// Types pour les analyses spécifiques
export interface MoodPattern extends Pattern {
  category: 'mood';
  metadata: Pattern['metadata'] & {
    triggerEvents?: string[];
    recoveryTime?: number; // heures
    cyclicPattern?: boolean;
  };
}

export interface ProductivityPattern extends Pattern {
  category: 'productivity';
  metadata: Pattern['metadata'] & {
    peakHours?: number[];
    optimalConditions?: string[];
    blockers?: string[];
  };
}

export interface HealthPattern extends Pattern {
  category: 'health';
  metadata: Pattern['metadata'] & {
    medicationRelated?: boolean;
    sleepImpact?: number;
    exerciseCorrelation?: number;
  };
}

export interface SpendingPattern extends Pattern {
  category: 'finance';
  metadata: Pattern['metadata'] & {
    impulsiveThreshold?: number;
    categoryTrends?: Record<string, number>;
    moodTriggers?: MoodType[];
  };
}

// Props des composants
export interface InsightCardProps {
  insight: Insight;
  onActionClick?: (suggestion: ActionSuggestion) => void;
  compact?: boolean;
}

export interface PatternVisualizationProps {
  pattern: Pattern;
  timeframe?: number;
}

export interface CorrelationChartProps {
  correlation: Correlation;
  showDetails?: boolean;
}

export interface AnalyticsDashboardProps {
  selectedCategory?: InsightCategory;
  timeframe?: number;
}

export interface HeatmapProps {
  data: HeatmapData[];
  metric: string;
  title: string;
}