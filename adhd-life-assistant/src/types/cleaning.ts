import { MoodType } from './mood';

export type RoomType = 'kitchen' | 'bedroom' | 'living' | 'bathroom' | 'office' | 'all';

export type TaskDifficulty = 'micro' | 'easy' | 'medium' | 'heavy';

export type TimerType = 'pomodoro' | 'sprint' | 'micro';

export type SessionStatus = 'idle' | 'running' | 'paused' | 'completed' | 'break';

export interface CleaningTask {
  id: string;
  name: string;
  room: RoomType;
  difficulty: TaskDifficulty;
  estimatedMinutes: number;
  points: number;
  description?: string;
  emoji: string;
  isCompleted: boolean;
  completedAt?: number;
}

export interface TaskTemplate {
  id: string;
  name: string;
  room: RoomType;
  difficulty: TaskDifficulty;
  estimatedMinutes: number;
  points: number;
  description?: string;
  emoji: string;
  order: number;
}

export interface Room {
  id: RoomType;
  name: string;
  emoji: string;
  color: string;
  bgColor: string;
  textColor: string;
  description: string;
}

export interface MoodCleaningPlan {
  mood: MoodType;
  title: string;
  description: string;
  maxTasks: number;
  recommendedTimer: TimerType;
  focusAreas: RoomType[];
  motivationalMessage: string;
  successMessage: string;
}

export interface TimerSession {
  id: string;
  type: TimerType;
  duration: number; // en minutes
  taskId?: string;
  status: SessionStatus;
  startTime?: number;
  endTime?: number;
  pausedTime?: number;
  completedPomodoros: number;
}

export interface TimerConfig {
  type: TimerType;
  workDuration: number; // en minutes
  shortBreak: number;
  longBreak: number;
  longBreakInterval: number;
  name: string;
  emoji: string;
  description: string;
}

export interface CleaningStreak {
  currentStreak: number;
  longestStreak: number;
  lastCleaningDate?: number;
  totalTasksCompleted: number;
  totalPointsEarned: number;
}

export interface CleaningStats {
  today: {
    tasksCompleted: number;
    pointsEarned: number;
    timeSpent: number; // en minutes
    roomsCleaned: RoomType[];
  };
  thisWeek: {
    tasksCompleted: number;
    pointsEarned: number;
    timeSpent: number;
    streak: number;
  };
  allTime: {
    tasksCompleted: number;
    pointsEarned: number;
    timeSpent: number;
    favoriteRoom?: RoomType;
    favoriteTimeOfDay?: string;
  };
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  emoji: string;
  points: number;
  unlockedAt?: number;
  category: 'streak' | 'completion' | 'speed' | 'consistency' | 'room_master';
}

export interface MicroVictory {
  id: string;
  message: string;
  emoji: string;
  taskId: string;
  timestamp: number;
}

export interface CleaningContextType {
  // Tasks
  tasks: CleaningTask[];
  currentSession: TimerSession | null;
  streak: CleaningStreak;
  achievements: Achievement[];
  microVictories: MicroVictory[];
  
  // Actions - Tasks
  createTasksFromPlan: (mood: MoodType, selectedRooms?: RoomType[]) => CleaningTask[];
  addCustomTask: (task: Omit<CleaningTask, 'id' | 'isCompleted'>) => void;
  completeTask: (taskId: string) => void;
  uncompleteTask: (taskId: string) => void;
  deleteTask: (taskId: string) => void;
  clearCompletedTasks: () => void;
  
  // Actions - Timer
  startTimer: (type: TimerType, taskId?: string) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  stopTimer: () => void;
  completeTimer: () => void;
  
  // Utils
  getMoodPlan: (mood: MoodType) => MoodCleaningPlan;
  getStats: () => CleaningStats;
  getTodaysTasks: () => CleaningTask[];
  getTasksByRoom: (room: RoomType) => CleaningTask[];
  canEarnAchievement: (achievementId: string) => boolean;
  earnAchievement: (achievementId: string) => void;
  addMicroVictory: (taskId: string, message: string) => void;
}

export interface TaskListProps {
  mood: MoodType;
  onTasksCreated: (tasks: CleaningTask[]) => void;
}

export interface TimerDisplayProps {
  session: TimerSession | null;
  onStart: (type: TimerType) => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onComplete: () => void;
}

export interface RoomSelectorProps {
  selectedRooms: RoomType[];
  onRoomToggle: (room: RoomType) => void;
  mood: MoodType;
}