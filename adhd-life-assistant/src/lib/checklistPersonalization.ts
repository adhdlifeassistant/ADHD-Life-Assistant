'use client';

import { UserProfile, ADHD_CHALLENGES } from '@/types/profile';
import { MoodType } from '@/types/mood';

export interface PersonalizedChecklistConfig {
  challengeBasedChecklists: Array<{
    title: string;
    category: string;
    priority: number;
    items: Array<{
      task: string;
      adhdTip: string;
      estimatedTime: string;
      difficulty: 'easy' | 'medium' | 'hard';
    }>;
    motivation: string;
  }>;
  chronotypeOptimizedTiming: Array<{
    checklistType: string;
    optimalTime: string;
    reason: string;
  }>;
  personalizedReminders: Array<{
    trigger: string;
    checklistSuggestion: string;
    personalMessage: string;
  }>;
  adaptiveComplexity: {
    currentLevel: 'beginner' | 'intermediate' | 'advanced';
    nextLevelCriteria: string;
    suggestions: string[];
  };
}

export function getPersonalizedChecklistConfig(profile: UserProfile, currentMood: MoodType): PersonalizedChecklistConfig {
  const name = profile.name || 'Tu';
  const challenges = profile.challenges || [];
  
  // Checklists basées sur les défis ADHD
  const challengeBasedChecklists = [];
  
  // Organisation quotidienne
  if (challenges.includes('organization')) {
    challengeBasedChecklists.push({
      title: `📋 Routine matinale de ${name}`,
      category: 'Organisation',
      priority: 10,
      items: [
        {
          task: 'Vérifier téléphone/messages',
          adhdTip: 'Limite 5min pour éviter la spirale',
          estimatedTime: '5min',
          difficulty: 'easy' as const
        },
        {
          task: 'Préparer vêtements du jour',
          adhdTip: 'Choisis la veille si possible',
          estimatedTime: '3min',
          difficulty: 'easy' as const
        },
        {
          task: 'Petit-déjeuner + médications',
          adhdTip: 'Routine fixe = moins de décisions',
          estimatedTime: '15min',
          difficulty: 'medium' as const
        },
        {
          task: 'Check agenda/to-do du jour',
          adhdTip: 'Max 3 priorités, pas plus !',
          estimatedTime: '5min',
          difficulty: 'medium' as const
        }
      ],
      motivation: `${name}, ta routine matinale structure toute ta journée ADHD ! 🌅`
    });

    challengeBasedChecklists.push({
      title: `🎯 Organisation espace de travail - ${name}`,
      category: 'Organisation',
      priority: 9,
      items: [
        {
          task: 'Vider le bureau des distractions',
          adhdTip: 'Un seul projet visible à la fois',
          estimatedTime: '5min',
          difficulty: 'easy' as const
        },
        {
          task: 'Préparer outils nécessaires',
          adhdTip: 'Tout à portée = moins de procrastination',
          estimatedTime: '3min',
          difficulty: 'easy' as const
        },
        {
          task: 'Éliminer notifications parasites',
          adhdTip: 'Mode focus ou téléphone dans autre pièce',
          estimatedTime: '2min',
          difficulty: 'medium' as const
        }
      ],
      motivation: `${name}, ton environnement organisé boost ta concentration ! 🧠⚡`
    });
  }

  // Gestion du temps
  if (challenges.includes('time-management')) {
    challengeBasedChecklists.push({
      title: `⏰ Planning réaliste - ${name}`,
      category: 'Temps',
      priority: 9,
      items: [
        {
          task: 'Estimer temps réel (x1.5)',
          adhdTip: 'ADHD sous-estime toujours !',
          estimatedTime: '5min',
          difficulty: 'hard' as const
        },
        {
          task: 'Prévoir pauses entre tâches',
          adhdTip: '15min buffer = moins de stress',
          estimatedTime: '2min',
          difficulty: 'medium' as const
        },
        {
          task: 'Identifier tâche la plus importante',
          adhdTip: 'Si tu ne fais qu\'une chose aujourd\'hui',
          estimatedTime: '3min',
          difficulty: 'medium' as const
        },
        {
          task: 'Bloquer créneaux focus',
          adhdTip: 'Protège tes heures de concentration',
          estimatedTime: '5min',
          difficulty: 'hard' as const
        }
      ],
      motivation: `${name}, ton temps ADHD est précieux, planifie-le bien ! ⏱️`
    });
  }

  // Procrastination
  if (challenges.includes('procrastination')) {
    challengeBasedChecklists.push({
      title: `🚀 Anti-procrastination - ${name}`,
      category: 'Motivation',
      priority: 8,
      items: [
        {
          task: 'Choisir LA tâche à faire maintenant',
          adhdTip: 'Une seule ! Pas de liste de 20 trucs',
          estimatedTime: '2min',
          difficulty: 'medium' as const
        },
        {
          task: 'Découper en micro-étapes',
          adhdTip: '5min max par micro-tâche',
          estimatedTime: '3min',
          difficulty: 'medium' as const
        },
        {
          task: 'Lancer timer 15min',
          adhdTip: 'Juste commencer, pas finir !',
          estimatedTime: '1min',
          difficulty: 'easy' as const
        },
        {
          task: 'Récompense après effort',
          adhdTip: 'Même petite, elle compte !',
          estimatedTime: '5min',
          difficulty: 'easy' as const
        }
      ],
      motivation: `${name}, commencer c'est 80% du travail avec ADHD ! 💪`
    });
  }

  // Mémoire/oublis
  if (challenges.includes('memory-forgetting')) {
    challengeBasedChecklists.push({
      title: `🧠 Anti-oublis quotidiens - ${name}`,
      category: 'Mémoire',
      priority: 9,
      items: [
        {
          task: 'Vérifier portefeuille/clés/téléphone',
          adhdTip: 'Toujours au même endroit !',
          estimatedTime: '1min',
          difficulty: 'easy' as const
        },
        {
          task: 'Check agenda/RDV du jour',
          adhdTip: 'Notification 2h avant minimum',
          estimatedTime: '2min',
          difficulty: 'easy' as const
        },
        {
          task: 'Médications + pilulier',
          adhdTip: 'Alarme téléphone + routine',
          estimatedTime: '2min',
          difficulty: 'easy' as const
        },
        {
          task: 'Note vocale idées importantes',
          adhdTip: 'Capture immédiate avant l\'oubli',
          estimatedTime: '1min',
          difficulty: 'easy' as const
        }
      ],
      motivation: `${name}, tes stratégies anti-oubli sont tes super-pouvoirs ! 🦸‍♀️`
    });
  }

  // Régulation émotionnelle
  if (challenges.includes('emotional-regulation')) {
    challengeBasedChecklists.push({
      title: `💙 Check émotionnel - ${name}`,
      category: 'Émotions',
      priority: 7,
      items: [
        {
          task: 'Scanner sensations corporelles',
          adhdTip: 'Tensions ? Respiration ? Énergie ?',
          estimatedTime: '2min',
          difficulty: 'medium' as const
        },
        {
          task: 'Nommer émotion présente',
          adhdTip: 'Juste observer, pas juger',
          estimatedTime: '1min',
          difficulty: 'medium' as const
        },
        {
          task: 'Identifier déclencheur si stress',
          adhdTip: 'Qu\'est-ce qui s\'est passé juste avant ?',
          estimatedTime: '2min',
          difficulty: 'hard' as const
        },
        {
          task: 'Choisir stratégie apaisement',
          adhdTip: 'Respiration/mouvement/musique',
          estimatedTime: '5min',
          difficulty: 'medium' as const
        }
      ],
      motivation: `${name}, reconnaître tes émotions ADHD c'est déjà les apprivoiser ! 🌈`
    });
  }

  // Si aucun défi spécifique, checklists générales ADHD
  if (challenges.length === 0) {
    challengeBasedChecklists.push({
      title: `✨ Routine ADHD de base - ${name}`,
      category: 'Général',
      priority: 5,
      items: [
        {
          task: 'Médications si applicable',
          adhdTip: 'Même heure chaque jour',
          estimatedTime: '2min',
          difficulty: 'easy' as const
        },
        {
          task: 'Boire un verre d\'eau',
          adhdTip: 'ADHD oublie souvent l\'hydratation',
          estimatedTime: '1min',
          difficulty: 'easy' as const
        },
        {
          task: 'Check humeur du moment',
          adhdTip: 'Adapte ta journée selon ton énergie',
          estimatedTime: '1min',
          difficulty: 'easy' as const
        }
      ],
      motivation: `${name}, même les petites routines aident ton cerveau ADHD ! 🧠`
    });
  }

  // Optimisation chronotype
  const chronotypeOptimizedTiming = [
    ...(profile.chronotype === 'morning' ? [
      { checklistType: 'Tâches importantes', optimalTime: '8h-11h', reason: 'Ton pic de concentration matinal' },
      { checklistType: 'Organisation/planning', optimalTime: '9h-10h', reason: 'Clarté mentale maximale' },
      { checklistType: 'Révisions/apprentissage', optimalTime: '7h-9h', reason: 'Mémoire optimale le matin' }
    ] : []),
    ...(profile.chronotype === 'evening' ? [
      { checklistType: 'Tâches créatives', optimalTime: '18h-21h', reason: 'Ton pic créatif du soir' },
      { checklistType: 'Réflexion/bilan', optimalTime: '20h-22h', reason: 'Moment introspectif naturel' },
      { checklistType: 'Planning lendemain', optimalTime: '19h-20h', reason: 'Préparer demain en douceur' }
    ] : []),
    ...(profile.chronotype === 'flexible' ? [
      { checklistType: 'Adaptation tempo', optimalTime: 'Selon énergie', reason: 'Écoute tes signaux internes' },
      { checklistType: 'Test créneaux', optimalTime: 'Varie les horaires', reason: 'Découvre tes patterns' }
    ] : [])
  ];

  // Rappels personnalisés selon contexte
  const personalizedReminders = [
    {
      trigger: 'Avant sortie maison',
      checklistSuggestion: 'Anti-oublis sortie',
      personalMessage: `${name}, prends 30sec pour vérifier l'essentiel !`
    },
    {
      trigger: 'Fin de journée travail',
      checklistSuggestion: 'Décompression ADHD',
      personalMessage: `${name}, transition douce entre travail et perso 🏠`
    },
    {
      trigger: 'Dimanche soir',
      checklistSuggestion: 'Préparation semaine',
      personalMessage: `${name}, 15min maintenant = semaine plus sereine ! 📅`
    },
    ...(profile.medications.length > 0 ? [{
      trigger: 'Avant médications',
      checklistSuggestion: 'Routine médication',
      personalMessage: `${name}, petit check avant ta prise de ${profile.medications[0].name} 💊`
    }] : [])
  ];

  // Complexité adaptative selon usage
  const completedChecklists = 0; // TODO: récupérer depuis le stockage
  const adaptiveComplexity = {
    currentLevel: completedChecklists < 10 ? 'beginner' as const : 
                  completedChecklists < 50 ? 'intermediate' as const : 
                  'advanced' as const,
    nextLevelCriteria: completedChecklists < 10 ? 
      'Complete 10 checklists pour débloquer plus d\'options' :
      completedChecklists < 50 ?
      'Complete 50 checklists pour les fonctionnalités avancées' :
      'Tu maîtrises les checklists ADHD ! 🏆',
    suggestions: [
      `${name}, commence par les checklists "facile" puis augmente`,
      'Les habitudes ADHD prennent 66 jours en moyenne',
      'Célèbre chaque petite victoire, ça compte énormément !'
    ]
  };

  return {
    challengeBasedChecklists: challengeBasedChecklists.sort((a, b) => b.priority - a.priority),
    chronotypeOptimizedTiming,
    personalizedReminders,
    adaptiveComplexity
  };
}