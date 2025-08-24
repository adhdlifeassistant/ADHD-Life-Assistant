import { MoodType } from './mood';

export type CookingMood = 'energetic' | 'normal' | 'tired' | 'stressed' | 'sad' | 'not-feeling-it';

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export type DifficultyLevel = 'easy' | 'medium' | 'hard';

export interface Recipe {
  id: string;
  name: string;
  description: string;
  emoji: string;
  difficulty: DifficultyLevel;
  cookingTime: number; // en minutes
  prepTime: number; // en minutes
  servings: number;
  ingredients: Ingredient[];
  steps: CookingStep[];
  tags: string[];
  moodCompatibility: CookingMood[];
  mealTypes: MealType[];
  isComfort: boolean;
  isBatchCookable: boolean;
  energy: 'low' | 'medium' | 'high'; // Énergie requise pour cuisiner
}

export interface Ingredient {
  id: string;
  name: string;
  quantity: string;
  unit?: string;
  isOptional?: boolean;
  notes?: string;
}

export interface CookingStep {
  id: string;
  instruction: string;
  duration?: number; // en minutes si applicable
  temperature?: string;
  tips?: string;
}

export interface CookingSession {
  id: string;
  recipeId: string;
  mood: CookingMood;
  startTime: number;
  currentStep: number;
  timers: CookingTimer[];
  notes?: string;
}

export interface CookingTimer {
  id: string;
  name: string;
  duration: number; // en secondes
  startTime: number;
  isActive: boolean;
  isCompleted: boolean;
}

export interface Alternative {
  id: string;
  type: 'delivery' | 'takeout' | 'prepared' | 'snack';
  name: string;
  description: string;
  emoji: string;
  estimatedTime: number;
  mood: CookingMood[];
}

export interface CookingMoodResponse {
  greeting: string;
  suggestion: string;
  recipes: Recipe[];
  alternatives: Alternative[];
}