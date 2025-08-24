'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  CleaningTask,
  TaskTemplate,
  Room,
  MoodCleaningPlan,
  TimerSession,
  TimerConfig,
  TimerType,
  CleaningStreak,
  CleaningStats,
  Achievement,
  MicroVictory,
  CleaningContextType,
  RoomType,
  TaskDifficulty,
  SessionStatus
} from '@/types/cleaning';
import { MoodType } from '@/types/mood';

// Configuration des pièces
const ROOMS: Record<RoomType, Room> = {
  kitchen: {
    id: 'kitchen',
    name: 'Cuisine',
    emoji: '🍳',
    color: 'yellow-500',
    bgColor: 'bg-yellow-50',
    textColor: 'text-yellow-700',
    description: 'Cœur de la maison'
  },
  bedroom: {
    id: 'bedroom',
    name: 'Chambre',
    emoji: '🛏️',
    color: 'purple-500',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-700',
    description: 'Sanctuaire du repos'
  },
  living: {
    id: 'living',
    name: 'Salon',
    emoji: '🛋️',
    color: 'blue-500',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    description: 'Espace de vie'
  },
  bathroom: {
    id: 'bathroom',
    name: 'Salle de bain',
    emoji: '🛁',
    color: 'teal-500',
    bgColor: 'bg-teal-50',
    textColor: 'text-teal-700',
    description: 'Zone de fraîcheur'
  },
  office: {
    id: 'office',
    name: 'Bureau',
    emoji: '💻',
    color: 'green-500',
    bgColor: 'bg-green-50',
    textColor: 'text-green-700',
    description: 'Zone de productivité'
  },
  all: {
    id: 'all',
    name: 'Toutes les pièces',
    emoji: '🏠',
    color: 'gray-500',
    bgColor: 'bg-gray-50',
    textColor: 'text-gray-700',
    description: 'Grand ménage complet'
  }
};

// Templates de tâches par pièce
const TASK_TEMPLATES: TaskTemplate[] = [
  // Cuisine
  { id: 'kitchen_dishes', name: 'Faire la vaisselle', room: 'kitchen', difficulty: 'medium', estimatedMinutes: 15, points: 3, emoji: '🍽️', order: 1 },
  { id: 'kitchen_counter', name: 'Nettoyer le plan de travail', room: 'kitchen', difficulty: 'easy', estimatedMinutes: 5, points: 2, emoji: '🧽', order: 2 },
  { id: 'kitchen_stove', name: 'Nettoyer la cuisinière', room: 'kitchen', difficulty: 'medium', estimatedMinutes: 10, points: 3, emoji: '🔥', order: 3 },
  { id: 'kitchen_fridge', name: 'Ranger le frigo', room: 'kitchen', difficulty: 'easy', estimatedMinutes: 8, points: 2, emoji: '❄️', order: 4 },
  { id: 'kitchen_floor', name: 'Nettoyer le sol', room: 'kitchen', difficulty: 'medium', estimatedMinutes: 10, points: 3, emoji: '🧹', order: 5 },
  
  // Chambre
  { id: 'bedroom_bed', name: 'Faire le lit', room: 'bedroom', difficulty: 'micro', estimatedMinutes: 3, points: 1, emoji: '🛏️', order: 1 },
  { id: 'bedroom_clothes', name: 'Ranger les vêtements', room: 'bedroom', difficulty: 'easy', estimatedMinutes: 10, points: 2, emoji: '👕', order: 2 },
  { id: 'bedroom_desk', name: 'Ranger le bureau/commode', room: 'bedroom', difficulty: 'easy', estimatedMinutes: 8, points: 2, emoji: '🗃️', order: 3 },
  { id: 'bedroom_vacuum', name: 'Aspirer', room: 'bedroom', difficulty: 'medium', estimatedMinutes: 12, points: 3, emoji: '🫧', order: 4 },
  
  // Salon
  { id: 'living_tidy', name: 'Ranger les objets qui traînent', room: 'living', difficulty: 'easy', estimatedMinutes: 10, points: 2, emoji: '📦', order: 1 },
  { id: 'living_dust', name: 'Enlever la poussière', room: 'living', difficulty: 'easy', estimatedMinutes: 8, points: 2, emoji: '🪶', order: 2 },
  { id: 'living_vacuum', name: 'Aspirer', room: 'living', difficulty: 'medium', estimatedMinutes: 15, points: 3, emoji: '🫧', order: 3 },
  { id: 'living_plants', name: 'Arroser les plantes', room: 'living', difficulty: 'micro', estimatedMinutes: 3, points: 1, emoji: '🪴', order: 4 },
  
  // Salle de bain
  { id: 'bathroom_sink', name: 'Nettoyer le lavabo', room: 'bathroom', difficulty: 'easy', estimatedMinutes: 5, points: 2, emoji: '🚿', order: 1 },
  { id: 'bathroom_toilet', name: 'Nettoyer les toilettes', room: 'bathroom', difficulty: 'medium', estimatedMinutes: 8, points: 3, emoji: '🚽', order: 2 },
  { id: 'bathroom_shower', name: 'Nettoyer la douche', room: 'bathroom', difficulty: 'medium', estimatedMinutes: 12, points: 3, emoji: '🛁', order: 3 },
  { id: 'bathroom_floor', name: 'Nettoyer le sol', room: 'bathroom', difficulty: 'easy', estimatedMinutes: 6, points: 2, emoji: '🧹', order: 4 },
  
  // Bureau
  { id: 'office_desk', name: 'Ranger le bureau', room: 'office', difficulty: 'easy', estimatedMinutes: 10, points: 2, emoji: '💻', order: 1 },
  { id: 'office_papers', name: 'Trier les papiers', room: 'office', difficulty: 'medium', estimatedMinutes: 15, points: 3, emoji: '📄', order: 2 },
  { id: 'office_dust', name: 'Enlever la poussière', room: 'office', difficulty: 'easy', estimatedMinutes: 8, points: 2, emoji: '🪶', order: 3 },
  { id: 'office_vacuum', name: 'Aspirer', room: 'office', difficulty: 'medium', estimatedMinutes: 10, points: 3, emoji: '🫧', order: 4 }
];

// Plans de ménage selon le mood
const MOOD_CLEANING_PLANS: Record<MoodType, MoodCleaningPlan> = {
  energetic: {
    mood: 'energetic',
    title: 'Grand ménage productif !',
    description: 'Tu as l\'énergie, on en profite pour tout faire briller ✨',
    maxTasks: 8,
    recommendedTimer: 'pomodoro',
    focusAreas: ['kitchen', 'living', 'bedroom'],
    motivationalMessage: 'Tu as une énergie incroyable aujourd\'hui ! Utilisons-la bien 🚀',
    successMessage: 'Waouh ! Quelle productivité ! Tu peux être fier(e) de toi 🎉'
  },
  normal: {
    mood: 'normal',
    title: 'Quelques tâches faciles',
    description: 'On reste dans le confortable avec des tâches satisfaisantes',
    maxTasks: 4,
    recommendedTimer: 'sprint',
    focusAreas: ['kitchen', 'bedroom'],
    motivationalMessage: 'Parfait pour une session efficace et détendue 😊',
    successMessage: 'Excellent travail ! Tu maintiens bien ton espace 👏'
  },
  tired: {
    mood: 'tired',
    title: 'Minimum viable',
    description: 'Juste l\'essentiel pour se sentir mieux, sans se fatiguer',
    maxTasks: 2,
    recommendedTimer: 'micro',
    focusAreas: ['bedroom'],
    motivationalMessage: 'Même fatigué(e), tu prends soin de ton espace. Bravo 💪',
    successMessage: 'Parfait ! Tu as fait l\'essentiel, c\'est tout ce qui compte 🌟'
  },
  stressed: {
    mood: 'stressed',
    title: 'Rangement thérapeutique',
    description: 'Actions répétitives et calmantes pour apaiser l\'esprit',
    maxTasks: 3,
    recommendedTimer: 'micro',
    focusAreas: ['bedroom', 'office'],
    motivationalMessage: 'Le rangement va t\'aider à retrouver ta sérénité 🧘‍♀️',
    successMessage: 'Tu as transformé ton stress en productivité douce. Bien joué ! 🌊'
  },
  sad: {
    mood: 'sad',
    title: 'Juste faire son lit',
    description: 'Une micro-victoire pour commencer la journée en douceur',
    maxTasks: 1,
    recommendedTimer: 'micro',
    focusAreas: ['bedroom'],
    motivationalMessage: 'Chaque petit geste compte. Tu es courageux(se) ❤️',
    successMessage: 'Tu l\'as fait ! Cette petite victoire est précieuse 🌈'
  }
};

// Configuration des timers
const TIMER_CONFIGS: Record<TimerType, TimerConfig> = {
  pomodoro: {
    type: 'pomodoro',
    workDuration: 25,
    shortBreak: 5,
    longBreak: 15,
    longBreakInterval: 4,
    name: 'Pomodoro Focus',
    emoji: '🍅',
    description: '25min intense + pause'
  },
  sprint: {
    type: 'sprint',
    workDuration: 10,
    shortBreak: 3,
    longBreak: 10,
    longBreakInterval: 3,
    name: 'Sprint Rapide',
    emoji: '⚡',
    description: '10min efficace + pause'
  },
  micro: {
    type: 'micro',
    workDuration: 5,
    shortBreak: 2,
    longBreak: 5,
    longBreakInterval: 2,
    name: 'Micro Session',
    emoji: '⏰',
    description: '5min douce + pause'
  }
};

// Achievements disponibles
const AVAILABLE_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_task',
    name: 'Première victoire',
    description: 'Tu as terminé ta première tâche !',
    emoji: '🎯',
    points: 5,
    category: 'completion'
  },
  {
    id: 'streak_3',
    name: 'Régularité',
    description: '3 jours de suite, tu gères !',
    emoji: '🔥',
    points: 10,
    category: 'streak'
  },
  {
    id: 'speed_demon',
    name: 'Éclair',
    description: 'Tâche terminée en moins de temps prévu',
    emoji: '⚡',
    points: 8,
    category: 'speed'
  },
  {
    id: 'kitchen_master',
    name: 'Chef de cuisine',
    description: '10 tâches de cuisine terminées',
    emoji: '👨‍🍳',
    points: 15,
    category: 'room_master'
  }
];

const CleaningContext = createContext<CleaningContextType | undefined>(undefined);

export function CleaningProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<CleaningTask[]>([]);
  const [currentSession, setCurrentSession] = useState<TimerSession | null>(null);
  const [streak, setStreak] = useState<CleaningStreak>({
    currentStreak: 0,
    longestStreak: 0,
    totalTasksCompleted: 0,
    totalPointsEarned: 0
  });
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [microVictories, setMicroVictories] = useState<MicroVictory[]>([]);

  // Timer interval
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Charger les données sauvegardées
    const savedTasks = localStorage.getItem('adhd-cleaning-tasks');
    const savedStreak = localStorage.getItem('adhd-cleaning-streak');
    const savedAchievements = localStorage.getItem('adhd-cleaning-achievements');
    const savedMicroVictories = localStorage.getItem('adhd-cleaning-victories');

    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    }
    if (savedStreak) {
      setStreak(JSON.parse(savedStreak));
    }
    if (savedAchievements) {
      setAchievements(JSON.parse(savedAchievements));
    }
    if (savedMicroVictories) {
      setMicroVictories(JSON.parse(savedMicroVictories));
    }
  }, []);

  // Sauvegarder automatiquement
  useEffect(() => {
    localStorage.setItem('adhd-cleaning-tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('adhd-cleaning-streak', JSON.stringify(streak));
  }, [streak]);

  useEffect(() => {
    localStorage.setItem('adhd-cleaning-achievements', JSON.stringify(achievements));
  }, [achievements]);

  useEffect(() => {
    localStorage.setItem('adhd-cleaning-victories', JSON.stringify(microVictories));
  }, [microVictories]);

  const createTasksFromPlan = useCallback((mood: MoodType, selectedRooms?: RoomType[]): CleaningTask[] => {
    const plan = MOOD_CLEANING_PLANS[mood];
    let relevantTemplates = TASK_TEMPLATES;

    // Filtrer par pièces si spécifié
    if (selectedRooms && selectedRooms.length > 0 && !selectedRooms.includes('all')) {
      relevantTemplates = TASK_TEMPLATES.filter(template => 
        selectedRooms.includes(template.room)
      );
    } else {
      // Utiliser les pièces recommandées pour le mood
      relevantTemplates = TASK_TEMPLATES.filter(template =>
        plan.focusAreas.includes(template.room) || plan.focusAreas.includes('all')
      );
    }

    // Prioriser selon le mood et limiter le nombre
    const prioritizedTemplates = relevantTemplates
      .sort((a, b) => {
        if (mood === 'sad' || mood === 'tired') {
          // Privilégier les micro tâches
          const difficultyOrder = { micro: 0, easy: 1, medium: 2, heavy: 3 };
          return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
        }
        return a.order - b.order;
      })
      .slice(0, plan.maxTasks);

    const newTasks: CleaningTask[] = prioritizedTemplates.map(template => ({
      id: `${template.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: template.name,
      room: template.room,
      difficulty: template.difficulty,
      estimatedMinutes: template.estimatedMinutes,
      points: template.points,
      description: template.description,
      emoji: template.emoji,
      isCompleted: false
    }));

    setTasks(prev => [...prev, ...newTasks]);
    return newTasks;
  }, []);

  const addCustomTask = useCallback((taskData: Omit<CleaningTask, 'id' | 'isCompleted'>) => {
    const newTask: CleaningTask = {
      ...taskData,
      id: `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      isCompleted: false
    };
    setTasks(prev => [...prev, newTask]);
  }, []);

  const completeTask = useCallback((taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task || task.isCompleted) return;

    setTasks(prev => 
      prev.map(t => 
        t.id === taskId 
          ? { ...t, isCompleted: true, completedAt: Date.now() }
          : t
      )
    );

    // Mettre à jour les stats
    setStreak(prev => ({
      ...prev,
      totalTasksCompleted: prev.totalTasksCompleted + 1,
      totalPointsEarned: prev.totalPointsEarned + task.points
    }));

    // Ajouter une micro-victoire
    addMicroVictory(taskId, `${task.emoji} ${task.name} terminé !`);
  }, [tasks]);

  const uncompleteTask = useCallback((taskId: string) => {
    setTasks(prev => 
      prev.map(t => 
        t.id === taskId 
          ? { ...t, isCompleted: false, completedAt: undefined }
          : t
      )
    );
  }, []);

  const deleteTask = useCallback((taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
  }, []);

  const clearCompletedTasks = useCallback(() => {
    setTasks(prev => prev.filter(t => !t.isCompleted));
  }, []);

  const startTimer = useCallback((type: TimerType, taskId?: string) => {
    const config = TIMER_CONFIGS[type];
    const newSession: TimerSession = {
      id: `timer_${Date.now()}`,
      type,
      duration: config.workDuration * 60, // convertir en secondes
      taskId,
      status: 'running',
      startTime: Date.now(),
      completedPomodoros: 0
    };
    setCurrentSession(newSession);
  }, []);

  const pauseTimer = useCallback(() => {
    if (currentSession && currentSession.status === 'running') {
      setCurrentSession(prev => prev ? {
        ...prev,
        status: 'paused',
        pausedTime: Date.now()
      } : null);
    }
  }, [currentSession]);

  const resumeTimer = useCallback(() => {
    if (currentSession && currentSession.status === 'paused') {
      setCurrentSession(prev => prev ? {
        ...prev,
        status: 'running',
        pausedTime: undefined
      } : null);
    }
  }, [currentSession]);

  const stopTimer = useCallback(() => {
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
    setCurrentSession(null);
  }, [timerInterval]);

  const completeTimer = useCallback(() => {
    if (currentSession) {
      setCurrentSession(prev => prev ? {
        ...prev,
        status: 'completed',
        endTime: Date.now()
      } : null);
      
      setTimeout(() => {
        setCurrentSession(null);
      }, 3000);
    }
  }, [currentSession]);

  const getMoodPlan = useCallback((mood: MoodType): MoodCleaningPlan => {
    return MOOD_CLEANING_PLANS[mood];
  }, []);

  const getStats = useCallback((): CleaningStats => {
    const today = new Date();
    const startOfToday = new Date(today.setHours(0, 0, 0, 0)).getTime();
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay())).getTime();

    const todayTasks = tasks.filter(t => t.completedAt && t.completedAt >= startOfToday);
    const weekTasks = tasks.filter(t => t.completedAt && t.completedAt >= startOfWeek);
    const allCompletedTasks = tasks.filter(t => t.isCompleted);

    return {
      today: {
        tasksCompleted: todayTasks.length,
        pointsEarned: todayTasks.reduce((sum, t) => sum + t.points, 0),
        timeSpent: todayTasks.reduce((sum, t) => sum + t.estimatedMinutes, 0),
        roomsCleaned: [...new Set(todayTasks.map(t => t.room))] as RoomType[]
      },
      thisWeek: {
        tasksCompleted: weekTasks.length,
        pointsEarned: weekTasks.reduce((sum, t) => sum + t.points, 0),
        timeSpent: weekTasks.reduce((sum, t) => sum + t.estimatedMinutes, 0),
        streak: streak.currentStreak
      },
      allTime: {
        tasksCompleted: allCompletedTasks.length,
        pointsEarned: allCompletedTasks.reduce((sum, t) => sum + t.points, 0),
        timeSpent: allCompletedTasks.reduce((sum, t) => sum + t.estimatedMinutes, 0)
      }
    };
  }, [tasks, streak]);

  const getTodaysTasks = useCallback((): CleaningTask[] => {
    const today = new Date();
    const startOfToday = new Date(today.setHours(0, 0, 0, 0)).getTime();
    return tasks.filter(t => 
      !t.completedAt || t.completedAt >= startOfToday
    );
  }, [tasks]);

  const getTasksByRoom = useCallback((room: RoomType): CleaningTask[] => {
    return tasks.filter(t => t.room === room);
  }, [tasks]);

  const canEarnAchievement = useCallback((achievementId: string): boolean => {
    return !achievements.some(a => a.id === achievementId);
  }, [achievements]);

  const earnAchievement = useCallback((achievementId: string) => {
    const achievement = AVAILABLE_ACHIEVEMENTS.find(a => a.id === achievementId);
    if (achievement && canEarnAchievement(achievementId)) {
      setAchievements(prev => [...prev, {
        ...achievement,
        unlockedAt: Date.now()
      }]);
    }
  }, [canEarnAchievement]);

  const addMicroVictory = useCallback((taskId: string, message: string) => {
    const victory: MicroVictory = {
      id: `victory_${Date.now()}`,
      message,
      emoji: '🎉',
      taskId,
      timestamp: Date.now()
    };
    setMicroVictories(prev => [victory, ...prev.slice(0, 9)]); // Garder les 10 dernières
  }, []);

  return (
    <CleaningContext.Provider value={{
      tasks,
      currentSession,
      streak,
      achievements,
      microVictories,
      createTasksFromPlan,
      addCustomTask,
      completeTask,
      uncompleteTask,
      deleteTask,
      clearCompletedTasks,
      startTimer,
      pauseTimer,
      resumeTimer,
      stopTimer,
      completeTimer,
      getMoodPlan,
      getStats,
      getTodaysTasks,
      getTasksByRoom,
      canEarnAchievement,
      earnAchievement,
      addMicroVictory
    }}>
      {children}
    </CleaningContext.Provider>
  );
}

export function useCleaning() {
  const context = useContext(CleaningContext);
  if (context === undefined) {
    throw new Error('useCleaning must be used within a CleaningProvider');
  }
  return context;
}

export { ROOMS, TASK_TEMPLATES, MOOD_CLEANING_PLANS, TIMER_CONFIGS, AVAILABLE_ACHIEVEMENTS };