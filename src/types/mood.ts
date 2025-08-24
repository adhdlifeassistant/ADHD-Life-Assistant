export type MoodType = 'energetic' | 'normal' | 'tired' | 'stressed' | 'sad';

export interface Mood {
  id: MoodType;
  emoji: string;
  label: string;
  color: string;
  bgColor: string;
  hoverColor: string;
  textColor: string;
  description: string;
  tone: string;
}

export interface MoodTheme {
  primary: string;
  secondary: string;
  background: string;
  text: string;
  accent: string;
}

export interface MoodContextType {
  currentMood: MoodType;
  setMood: (mood: MoodType) => void;
  getMoodConfig: () => Mood;
  getTheme: () => MoodTheme;
}