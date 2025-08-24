'use client';

import { UserProfile, CHRONOTYPES, ADHD_CHALLENGES } from '@/types/profile';
import { AppSettings } from '@/types/settings';
import { MoodType } from '@/types/mood';

export interface ModulePersonalizationContext {
  profile: UserProfile;
  settings: AppSettings;
  currentMood: MoodType;
  currentTime: Date;
}

// ===== PERSONNALISATION MODULE FINANCES =====

export interface PersonalizedFinanceConfig {
  budgetSuggestions: Array<{category: string; amount: number; reason: string}>;
  antiImpulsiveFeatures: {
    enabled: boolean;
    reflectionTime: number; // secondes
    questions: string[];
  };
  categories: Array<{id: string; name: string; priority: number; icon: string}>;
  ageAdaptedTips: string[];
  challengeSpecificTools: Array<{tool: string; description: string}>;
}

export function getPersonalizedFinanceConfig(context: ModulePersonalizationContext): PersonalizedFinanceConfig {
  const { profile, currentMood } = context;
  const hasImpulsiveSpending = profile.challenges.includes('impulse-spending');
  const age = profile.age || 25;

  // Budget suggestions selon âge et situation
  const budgetSuggestions = [
    ...(age < 25 ? [
      { category: 'Divertissement', amount: 200, reason: 'Important pour la socialisation à ton âge' },
      { category: 'Formation', amount: 100, reason: 'Investis dans tes compétences' }
    ] : []),
    ...(age > 30 ? [
      { category: 'Épargne', amount: 500, reason: 'Préparation de l\'avenir recommandée' },
      { category: 'Santé', amount: 150, reason: 'Suivi médical important avec l\'âge' }
    ] : []),
    ...(profile.medications.length > 0 ? [
      { category: 'Médications', amount: 100, reason: 'Budget pour tes traitements ADHD' }
    ] : [])
  ];

  // Anti-impulsif renforcé si c'est le défi
  const antiImpulsiveFeatures = {
    enabled: hasImpulsiveSpending,
    reflectionTime: hasImpulsiveSpending ? 30 : 10,
    questions: hasImpulsiveSpending ? [
      `${profile.name || 'Tu'} en as vraiment besoin maintenant ?`,
      'Est-ce que ça correspond à tes objectifs ?',
      `${profile.name || 'Tu'} le regretteras dans une semaine ?`,
      'As-tu comparé les prix ailleurs ?',
      'Peux-tu attendre 24h avant d\'acheter ?'
    ] : [
      'Est-ce nécessaire maintenant ?',
      'As-tu le budget pour ça ?'
    ]
  };

  // Catégories adaptées
  const categories = [
    { id: 'essential', name: '🏠 Essentiel', priority: 10, icon: '🏠' },
    { id: 'health', name: '💊 Santé/Médications', priority: profile.medications.length > 0 ? 9 : 5, icon: '💊' },
    { id: 'food', name: '🍕 Alimentation', priority: 8, icon: '🍕' },
    { id: 'transport', name: '🚗 Transport', priority: 7, icon: '🚗' },
    { id: 'entertainment', name: '🎮 Divertissement', priority: age < 30 ? 6 : 4, icon: '🎮' },
    { id: 'shopping', name: '🛒 Achats', priority: hasImpulsiveSpending ? 2 : 5, icon: '🛒' },
    { id: 'savings', name: '💰 Épargne', priority: age > 25 ? 8 : 3, icon: '💰' }
  ].sort((a, b) => b.priority - a.priority);

  // Conseils adaptés à l'âge
  const ageAdaptedTips = [
    ...(age < 25 ? [
      `${profile.name || 'Toi'}, commence petit avec l'épargne, même 50€/mois c'est parfait !`,
      'Profite de tes années étudiantes pour apprendre la gestion financière',
      'Les erreurs maintenant t\'enseignent pour plus tard'
    ] : []),
    ...(age > 30 ? [
      `${profile.name || 'Tu as'} l'expérience maintenant, fais-toi confiance !`,
      'Pense long terme : épargne de précaution, retraite',
      'Tes habitudes ADHD sont connues, anticipe-les'
    ] : []),
    ...(hasImpulsiveSpending ? [
      `${profile.name || 'Tes'} achats impulsifs sont normaux avec ADHD, on apprend à les gérer !`,
      'Chaque pause avant achat est une victoire !',
      'Tu peux programmer des "budgets plaisir" pour tes impulsions'
    ] : [])
  ];

  // Outils spécifiques aux défis
  const challengeSpecificTools = [
    ...(hasImpulsiveSpending ? [
      { tool: 'Pause anti-impulsive', description: 'Timer obligatoire avant gros achats' },
      { tool: 'Liste de souhaits', description: 'Note tes envies, réévalue dans 1 semaine' },
      { tool: 'Budget plaisir', description: 'Montant dédié aux achats spontanés' }
    ] : []),
    ...(profile.challenges.includes('organization') ? [
      { tool: 'Catégories automatiques', description: 'Classement auto de tes dépenses' },
      { tool: 'Rappels budgets', description: 'Notifications selon tes limites' }
    ] : [])
  ];

  return {
    budgetSuggestions,
    antiImpulsiveFeatures,
    categories,
    ageAdaptedTips,
    challengeSpecificTools
  };
}

// ===== PERSONNALISATION MODULE MÉNAGE =====

export interface PersonalizedCleaningConfig {
  chronotypeSchedule: Array<{task: string; optimalTime: string; reason: string}>;
  challengeFocusedTasks: Array<{task: string; gamification: string; priority: number}>;
  personalizedMotivation: string[];
  adhdFriendlyBreakdown: Array<{room: string; microTasks: string[]; timeEstimate: string}>;
}

export function getPersonalizedCleaningConfig(context: ModulePersonalizationContext): PersonalizedCleaningConfig {
  const { profile, currentTime } = context;
  const hasCleaningChallenge = profile.challenges.includes('cleaning-tidying');
  const chronotypeData = CHRONOTYPES[profile.chronotype];
  const name = profile.name || 'Tu';

  // Planning adapté au chronotype
  const chronotypeSchedule = [
    ...(profile.chronotype === 'morning' ? [
      { task: 'Tâches lourdes (aspirateur, sols)', optimalTime: '8h-11h', reason: 'Tu as plus d\'énergie le matin' },
      { task: 'Rangement général', optimalTime: '9h-10h', reason: 'Concentration maximale' },
      { task: 'Tâches légères (poussière)', optimalTime: '14h-16h', reason: 'Parfait pour ton après-midi calme' }
    ] : []),
    ...(profile.chronotype === 'evening' ? [
      { task: 'Tâches légères le matin', optimalTime: '9h-11h', reason: 'Doucement pour commencer' },
      { task: 'Rangement principal', optimalTime: '15h-18h', reason: 'Tu commences à avoir de l\'énergie' },
      { task: 'Aspirateur/sols', optimalTime: '18h-20h', reason: 'Ton pic d\'énergie du soir' }
    ] : []),
    ...(profile.chronotype === 'flexible' ? [
      { task: 'Test tes créneaux', optimalTime: '9h-10h ou 15h-16h', reason: 'Varie selon ton énergie' },
      { task: 'Écoute ton corps', optimalTime: 'Quand tu te sens motivé', reason: 'Ton rythme est unique' }
    ] : [])
  ];

  // Tâches prioritaires si défi ménage
  const challengeFocusedTasks = hasCleaningChallenge ? [
    { task: 'Ranger 5 objets', gamification: '+10 points ! 🌟', priority: 10 },
    { task: 'Vider 1 surface', gamification: 'Combo rangement ! ⚡', priority: 9 },
    { task: 'Faire son lit', gamification: 'Victoire matinale ! ☀️', priority: 8 },
    { task: '10min chrono ménage', gamification: 'Speed cleaning ! 🏃‍♀️', priority: 7 }
  ] : [
    { task: 'Maintien général', gamification: 'Bien joué ! ✨', priority: 5 }
  ];

  // Motivation personnalisée
  const personalizedMotivation = [
    `${name}, même 5 minutes de rangement c'est une victoire ADHD !`,
    `${name}, ton espace ordonné = ton cerveau plus calme 🧠`,
    hasCleaningChallenge ? 
      `${name}, tu travailles sur ton défi ménage, chaque petit geste compte énormément ! 💪` :
      `${name}, le ménage n'est pas ton défi principal, vas-y à ton rythme ! 😊`,
    profile.medications.length > 0 ? 
      `${name}, un environnement rangé aide tes médications à mieux fonctionner 💊` : 
      `${name}, l'ordre extérieur aide ton ADHD à se concentrer 🎯`
  ];

  // Micro-tâches ADHD-friendly
  const adhdFriendlyBreakdown = [
    {
      room: '🛏️ Chambre',
      microTasks: [
        'Faire le lit (2min)',
        'Ramasser 5 vêtements',
        'Vider la table de nuit',
        'Ouvrir les rideaux'
      ],
      timeEstimate: '10-15 minutes'
    },
    {
      room: '🍳 Cuisine',
      microTasks: [
        'Vider l\'évier',
        'Ranger le plan de travail',
        'Sortir les poubelles',
        'Essuyer les surfaces'
      ],
      timeEstimate: '15-20 minutes'
    },
    {
      room: '🛋️ Salon',
      microTasks: [
        'Ranger la table basse',
        'Replacer les coussins',
        'Ramasser ce qui traîne',
        'Passer un coup d\'aspirateur'
      ],
      timeEstimate: '10-15 minutes'
    }
  ];

  return {
    chronotypeSchedule,
    challengeFocusedTasks,
    personalizedMotivation,
    adhdFriendlyBreakdown
  };
}

// ===== PERSONNALISATION MODULE SANTÉ =====

export interface PersonalizedHealthConfig {
  medicationCorrelations: Array<{
    medication: string;
    trackingPoints: string[];
    sideEffectsToMonitor: string[];
    optimalTimes: string[];
  }>;
  adhdSpecificQuestions: Array<{
    category: string;
    questions: string[];
    frequency: 'daily' | 'weekly' | 'monthly';
  }>;
  doctorVisitPrep: Array<{
    topic: string;
    questions: string[];
    dataToTrack: string[];
  }>;
  personalizedReminders: Array<{
    reminder: string;
    timing: string;
    reason: string;
  }>;
}

export function getPersonalizedHealthConfig(context: ModulePersonalizationContext): PersonalizedHealthConfig {
  const { profile } = context;
  const name = profile.name || 'Tu';

  // Corrélations avec médications spécifiques
  const medicationCorrelations = profile.medications.map(med => ({
    medication: med.name,
    trackingPoints: [
      'Niveau d\'attention après prise',
      'Qualité du sommeil',
      'Appétit et hydratation',
      'Humeur générale'
    ],
    sideEffectsToMonitor: getMedicationSideEffects(med.name),
    optimalTimes: [`Suivi 2h après ${med.time}`, `Évaluation en fin de journée`]
  }));

  // Questions spécifiques ADHD
  const adhdSpecificQuestions = [
    {
      category: 'Concentration',
      questions: [
        `${name}, comment évalues-tu ta concentration aujourd'hui ? (1-10)`,
        'As-tu eu des moments d\'hyperfocus ?',
        'Qu\'est-ce qui t\'a le plus distrait ?'
      ],
      frequency: 'daily' as const
    },
    {
      category: 'Médications',
      questions: profile.medications.length > 0 ? [
        `${name}, as-tu ressenti les effets de tes médications ?`,
        'Y a-t-il eu des effets secondaires gênants ?',
        'À quelle heure as-tu été le plus/moins concentré ?'
      ] : [],
      frequency: 'daily' as const
    },
    {
      category: 'Émotions',
      questions: [
        `${name}, comment décrirais-tu ton humeur cette semaine ?`,
        'As-tu eu des moments de frustration ADHD ?',
        'Qu\'est-ce qui t\'a aidé à réguler tes émotions ?'
      ],
      frequency: 'weekly' as const
    }
  ].filter(q => q.questions.length > 0);

  // Préparation RDV médecin
  const doctorVisitPrep = [
    {
      topic: 'Efficacité des médications',
      questions: [
        `Comment ${name} se sent avec ${profile.medications.map(m => m.name).join(', ') || 'ses traitements'} ?`,
        'Y a-t-il eu des changements dans l\'efficacité ?',
        'Les horaires de prise sont-ils optimaux ?'
      ],
      dataToTrack: [
        'Scores de concentration quotidiens',
        'Heures d\'efficacité maximale',
        'Effets secondaires notés'
      ]
    },
    {
      topic: 'Défis ADHD actuels',
      questions: profile.challenges.length > 0 ? [
        `Comment ${name} progresse sur ${profile.challenges.map(id => ADHD_CHALLENGES[id]?.label).join(', ') || 'ses défis'} ?`,
        'Quelles stratégies fonctionnent le mieux ?',
        'Où a-t-il besoin de plus de soutien ?'
      ] : [
        'Quels sont les défis ADHD actuels ?',
        'Dans quels domaines chercher de l\'aide ?'
      ],
      dataToTrack: [
        'Réussites et échecs par défi',
        'Patterns comportementaux',
        'Impact sur le quotidien'
      ]
    },
    {
      topic: 'Bien-être général',
      questions: [
        `Comment va le sommeil de ${name} ?`,
        'Y a-t-il des changements d\'appétit ?',
        'Niveau de stress et d\'anxiété ?'
      ],
      dataToTrack: [
        'Qualité du sommeil',
        'Variations d\'humeur',
        'Événements stressants'
      ]
    }
  ];

  // Rappels personnalisés
  const personalizedReminders = [
    ...profile.medications.map(med => ({
      reminder: `Tracking post-${med.name}`,
      timing: `2h après ${med.time}`,
      reason: 'Observer les effets de ta médication'
    })),
    {
      reminder: 'Check-in émotionnel',
      timing: profile.chronotype === 'morning' ? '18h00' : '20h00',
      reason: 'Bilan de ta journée ADHD'
    },
    ...(profile.challenges.includes('sleep-routine') ? [{
      reminder: 'Préparation sommeil',
      timing: '21h00',
      reason: 'Ton défi routine sommeil'
    }] : [])
  ];

  return {
    medicationCorrelations,
    adhdSpecificQuestions,
    doctorVisitPrep,
    personalizedReminders
  };
}

// Effets secondaires par médication (base de données simplifiée)
function getMedicationSideEffects(medicationName: string): string[] {
  const commonSideEffects: Record<string, string[]> = {
    'Medikinet': ['Perte d\'appétit', 'Troubles du sommeil', 'Nervosité', 'Maux de tête'],
    'Ritaline': ['Insomnie', 'Diminution appétit', 'Nervosité', 'Nausées'],
    'Concerta': ['Troubles sommeil', 'Perte poids', 'Irritabilité', 'Vertiges'],
    'Vyvanse': ['Sécheresse bouche', 'Insomnie', 'Perte appétit', 'Anxiété'],
    'Strattera': ['Somnolence', 'Nausées', 'Fatigue', 'Humeur changeante'],
    'Wellbutrin': ['Bouche sèche', 'Constipation', 'Tremblements', 'Agitation']
  };
  
  return commonSideEffects[medicationName] || ['Changements d\'humeur', 'Troubles digestifs', 'Fatigue', 'Maux de tête'];
}

// ===== PERSONNALISATION MODULE CUISINE =====

export interface PersonalizedCookingConfig {
  chronotypeRecipes: Array<{
    mealType: string;
    optimalTime: string;
    energyLevel: 'low' | 'medium' | 'high';
    recipes: string[];
  }>;
  moodAdaptedSuggestions: Array<{
    mood: MoodType;
    cookingStyle: string;
    recipes: string[];
    tips: string[];
  }>;
  adhdFriendlyFeatures: {
    timerReminders: boolean;
    stepByStep: boolean;
    quickMeals: string[];
    batchCooking: string[];
  };
}

export function getPersonalizedCookingConfig(context: ModulePersonalizationContext): PersonalizedCookingConfig {
  const { profile, currentMood } = context;
  const chronotypeData = CHRONOTYPES[profile.chronotype];

  const chronotypeRecipes = [
    ...(profile.chronotype === 'morning' ? [
      {
        mealType: 'Petit-déjeuner',
        optimalTime: '7h-9h',
        energyLevel: 'high' as const,
        recipes: ['Pancakes maison', 'Bowl açaï', 'Omelette complète']
      },
      {
        mealType: 'Déjeuner',
        optimalTime: '11h-13h',
        energyLevel: 'medium' as const,
        recipes: ['Salade complète', 'Sandwich gourmand', 'Pâtes légères']
      }
    ] : []),
    ...(profile.chronotype === 'evening' ? [
      {
        mealType: 'Petit-déjeuner',
        optimalTime: '9h-11h',
        energyLevel: 'low' as const,
        recipes: ['Smoothie rapide', 'Céréales', 'Toast avocat']
      },
      {
        mealType: 'Dîner',
        optimalTime: '19h-21h',
        energyLevel: 'high' as const,
        recipes: ['Plat mijoté', 'Curry maison', 'Gratin élaboré']
      }
    ] : [])
  ];

  const moodAdaptedSuggestions = [
    {
      mood: 'energetic' as MoodType,
      cookingStyle: 'Créatif et ambitieux',
      recipes: ['Nouvelle recette à tester', 'Plat de chef', 'Cuisine du monde'],
      tips: [`${profile.name || 'Tu'} as de l'énergie, teste quelque chose de nouveau !`]
    },
    {
      mood: 'tired' as MoodType,
      cookingStyle: 'Simple et réconfortant',
      recipes: ['One-pot pasta', 'Soupe express', 'Plat réchauffé'],
      tips: [`${profile.name || 'Tu'} es fatigué, pas de culpabilité sur la simplicité !`]
    },
    {
      mood: 'stressed' as MoodType,
      cookingStyle: 'Thérapeutique',
      recipes: ['Pâtisserie', 'Pétrissage pain', 'Découpe légumes'],
      tips: ['Cuisiner peut apaiser le stress ADHD']
    }
  ];

  const adhdFriendlyFeatures = {
    timerReminders: true,
    stepByStep: true,
    quickMeals: [
      'Pasta 10 minutes',
      'Œufs brouillés express',
      'Sandwich créatif',
      'Salade composée'
    ],
    batchCooking: [
      'Soupe pour la semaine',
      'Batch de céréales',
      'Légumes pré-coupés',
      'Sauces maison'
    ]
  };

  return {
    chronotypeRecipes,
    moodAdaptedSuggestions,
    adhdFriendlyFeatures
  };
}