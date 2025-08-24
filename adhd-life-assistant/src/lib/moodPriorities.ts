import { MoodType } from '@/types/mood';
import { DashboardView } from '@/types/dashboard';

interface ModulePriority {
  id: DashboardView;
  priority: number; // 1 = haute priorité, 3 = basse priorité
  reason: string;
  isRecommended: boolean;
}

const MOOD_PRIORITIES: Record<MoodType, ModulePriority[]> = {
  energetic: [
    {
      id: 'tasks',
      priority: 1,
      reason: 'Perfect pour tacler tes gros projets !',
      isRecommended: true
    },
    {
      id: 'cooking',
      priority: 1,
      reason: 'Cuisine créative et batch cooking !',
      isRecommended: true
    },
    {
      id: 'checklists',
      priority: 2,
      reason: 'Organise tes sorties efficacement',
      isRecommended: false
    },
    {
      id: 'focus',
      priority: 2,
      reason: 'Channel cette énergie avec des sessions focus',
      isRecommended: false
    },
    {
      id: 'chat',
      priority: 2,
      reason: 'Brainstorme tes idées avec Claude',
      isRecommended: false
    },
    {
      id: 'reminders',
      priority: 2,
      reason: 'Garde le momentum avec tes médicaments',
      isRecommended: false
    },
    {
      id: 'home',
      priority: 3,
      reason: 'Dashboard complet',
      isRecommended: false
    }
  ],

  normal: [
    {
      id: 'home',
      priority: 1,
      reason: 'Vue d\'ensemble équilibrée',
      isRecommended: true
    },
    {
      id: 'cooking',
      priority: 1,
      reason: 'Cuisine équilibrée et savoureuse',
      isRecommended: true
    },
    {
      id: 'checklists',
      priority: 1,
      reason: 'Prépare tes sorties sereinement',
      isRecommended: true
    },
    {
      id: 'tasks',
      priority: 2,
      reason: 'Avance régulièrement sur tes objectifs',
      isRecommended: false
    },
    {
      id: 'chat',
      priority: 2,
      reason: 'Assistant pour t\'organiser',
      isRecommended: false
    },
    {
      id: 'reminders',
      priority: 2,
      reason: 'Maintiens tes bonnes habitudes',
      isRecommended: false
    },
    {
      id: 'focus',
      priority: 2,
      reason: 'Sessions modérées pour rester productif',
      isRecommended: false
    }
  ],

  tired: [
    {
      id: 'cooking',
      priority: 1,
      reason: 'Solutions simples et réconfortantes',
      isRecommended: true
    },
    {
      id: 'checklists',
      priority: 1,
      reason: 'Évite les oublis quand tu sors',
      isRecommended: true
    },
    {
      id: 'reminders',
      priority: 1,
      reason: 'L\'essentiel : tes médicaments',
      isRecommended: true
    },
    {
      id: 'chat',
      priority: 2,
      reason: 'Parle à Claude, pas de pression',
      isRecommended: false
    },
    {
      id: 'home',
      priority: 2,
      reason: 'Juste ce qu\'il faut',
      isRecommended: false
    },
    {
      id: 'tasks',
      priority: 3,
      reason: 'Pas aujourd\'hui, repose-toi',
      isRecommended: false
    },
    {
      id: 'focus',
      priority: 3,
      reason: 'Évite les sessions intenses',
      isRecommended: false
    }
  ],

  stressed: [
    {
      id: 'checklists',
      priority: 1,
      reason: 'Réduis le stress des préparatifs',
      isRecommended: true
    },
    {
      id: 'cooking',
      priority: 1,
      reason: 'Cuisine apaisante et méditative',
      isRecommended: true
    },
    {
      id: 'chat',
      priority: 1,
      reason: 'Parle de ce qui te stresse',
      isRecommended: true
    },
    {
      id: 'reminders',
      priority: 2,
      reason: 'Ne rate pas tes médicaments',
      isRecommended: false
    },
    {
      id: 'home',
      priority: 2,
      reason: 'Simplifie avec le dashboard',
      isRecommended: false
    },
    {
      id: 'tasks',
      priority: 3,
      reason: 'Une chose à la fois seulement',
      isRecommended: false
    },
    {
      id: 'focus',
      priority: 3,
      reason: 'Évite la pression supplémentaire',
      isRecommended: false
    }
  ],

  sad: [
    {
      id: 'cooking',
      priority: 1,
      reason: 'Plats doudou réconfortants',
      isRecommended: true
    },
    {
      id: 'checklists',
      priority: 2,
      reason: 'Simplifie tes sorties nécessaires',
      isRecommended: false
    },
    {
      id: 'chat',
      priority: 1,
      reason: 'Claude est là pour t\'écouter',
      isRecommended: true
    },
    {
      id: 'reminders',
      priority: 2,
      reason: 'Prendre soin de toi est prioritaire',
      isRecommended: false
    },
    {
      id: 'home',
      priority: 2,
      reason: 'Douceur et bienveillance',
      isRecommended: false
    },
    {
      id: 'tasks',
      priority: 3,
      reason: 'Pas de pression aujourd\'hui',
      isRecommended: false
    },
    {
      id: 'focus',
      priority: 3,
      reason: 'Repos mental recommandé',
      isRecommended: false
    }
  ]
};

export function getModulePriorities(mood: MoodType): ModulePriority[] {
  return MOOD_PRIORITIES[mood].sort((a, b) => a.priority - b.priority);
}

export function getRecommendedModules(mood: MoodType): ModulePriority[] {
  return MOOD_PRIORITIES[mood].filter(module => module.isRecommended);
}

export function isModuleRecommended(mood: MoodType, moduleId: DashboardView): boolean {
  const module = MOOD_PRIORITIES[mood].find(m => m.id === moduleId);
  return module?.isRecommended || false;
}

export function getModuleReason(mood: MoodType, moduleId: DashboardView): string {
  const module = MOOD_PRIORITIES[mood].find(m => m.id === moduleId);
  return module?.reason || '';
}

export function shouldHideModule(mood: MoodType, moduleId: DashboardView): boolean {
  const module = MOOD_PRIORITIES[mood].find(m => m.id === moduleId);
  return module?.priority === 3 && (mood === 'tired' || mood === 'sad');
}