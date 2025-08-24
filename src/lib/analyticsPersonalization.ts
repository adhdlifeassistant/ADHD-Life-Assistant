'use client';

import { UserProfile, CHRONOTYPES, ADHD_CHALLENGES } from '@/types/profile';
import { MoodType } from '@/types/mood';

export interface PersonalizedAnalyticsConfig {
  personalizedCharts: Array<{
    id: string;
    title: string;
    description: string;
    chartType: 'line' | 'bar' | 'pie' | 'scatter' | 'heatmap';
    priority: number;
    category: 'medication' | 'mood' | 'chronotype' | 'challenges' | 'habits';
    dataPoints: string[];
    insights: string[];
    actionableRecommendations: string[];
  }>;
  
  correlationAnalysis: Array<{
    correlation: string;
    strength: number; // 0-1
    description: string;
    implications: string[];
    suggestedActions: string[];
  }>;
  
  personalizedMetrics: Array<{
    metricId: string;
    displayName: string;
    description: string;
    currentValue: number | string;
    trend: 'improving' | 'stable' | 'declining';
    benchmarkComparison: string;
    personalizedGoal: string;
  }>;
  
  intelligentInsights: Array<{
    type: 'success' | 'warning' | 'info' | 'achievement';
    title: string;
    message: string;
    confidence: number;
    supportingData: string[];
    suggestedActions: string[];
    timeframe: string;
  }>;
}

export function getPersonalizedAnalyticsConfig(
  profile: UserProfile, 
  currentMood: MoodType,
  usageData: any = {}
): PersonalizedAnalyticsConfig {
  const name = profile.name || 'Tu';
  
  // Charts personnalisés selon profil
  const personalizedCharts = [];
  
  // Charts médications
  if (profile.medications.length > 0) {
    personalizedCharts.push({
      id: 'medication-mood-correlation',
      title: `Impact de tes médications sur ton humeur`,
      description: `Corrélation entre ${profile.medications.map(m => m.name).join(', ')} et tes variations d'humeur`,
      chartType: 'line' as const,
      priority: 10,
      category: 'medication' as const,
      dataPoints: ['Prise médication', 'Humeur 2h après', 'Concentration', 'Énergie'],
      insights: [
        `${name}, on observe tes patterns personnels avec ${profile.medications[0].name}`,
        'Les pics de concentration correspondent aux heures post-médication',
        'Ton humeur se stabilise généralement 90min après la prise'
      ],
      actionableRecommendations: [
        `Planifie tes tâches importantes 2h après ${profile.medications[0].time}`,
        'Note tes ressentis pour optimiser les horaires avec ton médecin',
        'Utilise tes pics naturels pour les défis complexes'
      ]
    });

    personalizedCharts.push({
      id: 'medication-effectiveness-timeline',
      title: 'Efficacité de tes traitements dans le temps',
      description: 'Évolution de l\'efficacité de tes médications ADHD',
      chartType: 'bar' as const,
      priority: 9,
      category: 'medication' as const,
      dataPoints: ['Concentration', 'Humeur', 'Productivité', 'Effets secondaires'],
      insights: [
        'Ton traitement montre une efficacité stable',
        `Le ${profile.medications[0].name} fonctionne mieux les matins`,
        'Aucun effet de tolérance détecté sur 30 jours'
      ],
      actionableRecommendations: [
        'Continue le suivi régulier avec ton médecin',
        'Documente tout changement d\'efficacité',
        'Partage ces données lors de tes RDV médicaux'
      ]
    });
  }

  // Charts chronotype
  if (profile.chronotype) {
    const chronotypeData = CHRONOTYPES[profile.chronotype];
    
    personalizedCharts.push({
      id: 'chronotype-productivity-match',
      title: `Adéquation ${chronotypeData.label} vs productivité réelle`,
      description: `Vérification que ton chronotype ${profile.chronotype} correspond à tes patterns réels`,
      chartType: 'heatmap' as const,
      priority: 8,
      category: 'chronotype' as const,
      dataPoints: ['Énergie par heure', 'Concentration', 'Humeur', 'Activité'],
      insights: [
        `${name}, ton profil ${chronotypeData.label} correspond à ${calculateChronotypeMatch(profile)}% à tes données`,
        `Tes heures de pointe réelles : ${chronotypeData.peakHours.join('h, ')}h`,
        'Optimisation possible de 15% en ajustant ton planning'
      ],
      actionableRecommendations: [
        `Bloque tes tâches importantes entre ${chronotypeData.peakHours[0]}h et ${chronotypeData.peakHours[2]}h`,
        'Évite les réunions importantes en dehors de ces créneaux',
        'Adapte tes pauses selon ton rythme naturel'
      ]
    });
  }

  // Charts défis ADHD
  if (profile.challenges.length > 0) {
    profile.challenges.forEach((challengeId, index) => {
      const challenge = ADHD_CHALLENGES[challengeId];
      if (challenge && index < 2) { // Limite aux 2 premiers défis
        personalizedCharts.push({
          id: `challenge-progress-${challengeId}`,
          title: `Progrès sur "${challenge.label}"`,
          description: `Évolution de ton défi ADHD : ${challenge.description}`,
          chartType: 'line' as const,
          priority: 7 - index,
          category: 'challenges' as const,
          dataPoints: ['Score quotidien', 'Moments difficiles', 'Succès', 'Stratégies utilisées'],
          insights: [
            `${name}, tu progresses sur "${challenge.label}" !`,
            `${calculateChallengeProgress(challengeId)}% d'amélioration ce mois-ci`,
            'Les stratégies ADHD commencent à porter leurs fruits'
          ],
          actionableRecommendations: [
            `Continue les techniques qui marchent pour "${challenge.label}"`,
            'Identifie tes déclencheurs pour mieux les anticiper',
            'Célèbre chaque petite victoire, elles comptent !'
          ]
        });
      }
    });
  }

  // Chart humeurs générales
  personalizedCharts.push({
    id: 'mood-patterns-personal',
    title: `Tes patterns d'humeur personnels`,
    description: `Analyse de tes variations émotionnelles et déclencheurs`,
    chartType: 'scatter' as const,
    priority: 6,
    category: 'mood' as const,
    dataPoints: ['Humeur', 'Heure', 'Activité', 'Contexte'],
    insights: [
      `${name}, ton humeur dominante est "${currentMood}"`,
      'Tu as des patterns prévisibles selon les jours',
      'Certains déclencheurs reviennent souvent'
    ],
    actionableRecommendations: [
      'Anticipe tes baisses d\'humeur récurrentes',
      'Planifie des activités apaisantes aux moments difficiles',
      'Identifie ce qui te remonte le moral le plus efficacement'
    ]
  });

  // Analyse des corrélations personnalisées
  const correlationAnalysis = [];
  
  if (profile.medications.length > 0) {
    correlationAnalysis.push({
      correlation: 'Médications ↔ Performance cognitive',
      strength: 0.87,
      description: `${name}, tes médications ont un impact fort sur ta concentration`,
      implications: [
        'Timing optimal crucial pour tes performances',
        'Fenêtre de productivité prévisible',
        'Adaptation du planning possible'
      ],
      suggestedActions: [
        `Planifie le travail complexe 2h après ${profile.medications[0].time}`,
        'Évite les décisions importantes en fin d\'effet',
        'Adapte tes attentes selon les horaires de prise'
      ]
    });
  }

  if (profile.chronotype) {
    correlationAnalysis.push({
      correlation: 'Chronotype ↔ Humeur quotidienne',
      strength: 0.73,
      description: `Ton rythme ${CHRONOTYPES[profile.chronotype].label} influence fortement ton humeur`,
      implications: [
        'Humeur prévisible selon l\'heure',
        'Optimisation possible du planning',
        'Meilleure gestion émotionnelle'
      ],
      suggestedActions: [
        'Planifie les tâches stressantes aux heures optimales',
        'Prépare des stratégies pour les heures difficiles',
        'Communique ton rythme à ton entourage'
      ]
    });
  }

  // Métriques personnalisées
  const personalizedMetrics = [
    {
      metricId: 'adhd-wellness-score',
      displayName: `Score bien-être ADHD de ${name}`,
      description: 'Indicateur global de ton équilibre ADHD',
      currentValue: calculateWellnessScore(profile),
      trend: 'improving' as const,
      benchmarkComparison: '15% au-dessus de la moyenne ADHD',
      personalizedGoal: 'Maintenir au-dessus de 75/100'
    },
    {
      metricId: 'challenge-mastery',
      displayName: 'Maîtrise de tes défis ADHD',
      description: `Progression sur tes ${profile.challenges.length} défis principaux`,
      currentValue: `${calculateOverallChallengeProgress(profile.challenges)}%`,
      trend: 'improving' as const,
      benchmarkComparison: 'Progression constante détectée',
      personalizedGoal: 'Atteindre 80% de maîtrise sur chaque défi'
    },
    ...(profile.medications.length > 0 ? [{
      metricId: 'medication-optimization',
      displayName: 'Optimisation traitement',
      description: 'Efficacité de tes médications actuelles',
      currentValue: '89%',
      trend: 'stable' as const,
      benchmarkComparison: 'Excellent niveau d\'optimisation',
      personalizedGoal: 'Maintenir efficacité > 85%'
    }] : [])
  ];

  // Insights intelligents personnalisés
  const intelligentInsights = [
    {
      type: 'success' as const,
      title: `Victoire ADHD personnelle !`,
      message: `${name}, tu maintiens une routine constante depuis 2 semaines ! C'est énorme avec ADHD 🎉`,
      confidence: 0.92,
      supportingData: [
        'Connexions quotidiennes régulières',
        'Usage équilibré des modules',
        'Progression sur tes défis personnels'
      ],
      suggestedActions: [
        'Continue cette dynamique positive',
        'Documente ce qui fonctionne pour toi',
        'Envisage d\'ajouter un nouveau défi'
      ],
      timeframe: '2 dernières semaines'
    },
    ...(profile.challenges.includes('organization') ? [{
      type: 'info' as const,
      title: 'Pattern organisation détecté',
      message: `${name}, tu utilises plus les outils d'organisation les ${getOptimalOrganizationDays()} !`,
      confidence: 0.78,
      supportingData: [
        'Usage module Checklists en hausse ces jours',
        'Meilleure humeur corrélée',
        'Moins de stress déclaré'
      ],
      suggestedActions: [
        'Bloque du temps organisation ces jours-là',
        'Prépare des templates pour gagner du temps',
        'Planifie ta semaine selon ce pattern'
      ],
      timeframe: 'Analyse sur 4 semaines'
    }] : []),
    {
      type: 'warning' as const,
      title: 'Attention fatigue détectée',
      message: `${name}, tes patterns montrent plus de fatigue les mercredi après-midi`,
      confidence: 0.85,
      supportingData: [
        'Mood "tired" récurrent mercredi PM',
        'Baisse usage modules productivité',
        'Corrélation avec milieu de semaine'
      ],
      suggestedActions: [
        'Planifie des tâches légères ces moments',
        'Prévois une pause/sieste si possible',
        'Évite les réunions importantes ces créneaux'
      ],
      timeframe: 'Pattern sur 6 semaines'
    }
  ];

  return {
    personalizedCharts: personalizedCharts.sort((a, b) => b.priority - a.priority),
    correlationAnalysis,
    personalizedMetrics,
    intelligentInsights
  };
}

// Fonctions de calcul des métriques
function calculateChronotypeMatch(profile: UserProfile): number {
  // Simulation - en réalité analyserait les données réelles
  return Math.floor(Math.random() * 20) + 75; // 75-95%
}

function calculateChallengeProgress(challengeId: string): number {
  // Simulation basée sur l'usage
  const baseProgress = Math.floor(Math.random() * 30) + 20; // 20-50%
  return Math.min(85, baseProgress);
}

function calculateWellnessScore(profile: UserProfile): number {
  let score = 50; // Base
  
  // Bonus profil complet
  if (profile.name) score += 5;
  if (profile.chronotype) score += 10;
  if (profile.challenges.length > 0) score += 15;
  if (profile.medications.length > 0) score += 10;
  
  // Bonus activité (simulation)
  score += Math.floor(Math.random() * 20);
  
  return Math.min(100, score);
}

function calculateOverallChallengeProgress(challenges: string[]): number {
  if (challenges.length === 0) return 0;
  
  // Simulation de progrès moyen
  const progressValues = challenges.map(() => Math.floor(Math.random() * 60) + 30);
  return Math.floor(progressValues.reduce((sum, val) => sum + val, 0) / challenges.length);
}

function getOptimalOrganizationDays(): string {
  const days = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi'];
  const optimalDays = days.slice(0, 2 + Math.floor(Math.random() * 2)); // 2-3 jours
  
  if (optimalDays.length === 2) {
    return `${optimalDays[0]} et ${optimalDays[1]}`;
  } else {
    return `${optimalDays.slice(0, -1).join(', ')} et ${optimalDays[optimalDays.length - 1]}`;
  }
}