'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { MoodType, MoodContextType, Mood, MoodTheme } from '@/types/mood';

const MOOD_CONFIG: Record<MoodType, Mood> = {
  energetic: {
    id: 'energetic',
    emoji: '😊',
    label: 'Énergique',
    color: 'emerald-500',
    bgColor: 'bg-emerald-50',
    hoverColor: 'hover:bg-emerald-100',
    textColor: 'text-emerald-700',
    description: 'Prêt(e) à conquérir le monde !',
    tone: 'motivant'
  },
  normal: {
    id: 'normal',
    emoji: '😐',
    label: 'Normal',
    color: 'blue-500',
    bgColor: 'bg-blue-50',
    hoverColor: 'hover:bg-blue-100',
    textColor: 'text-blue-700',
    description: 'Une journée comme les autres',
    tone: 'neutre'
  },
  tired: {
    id: 'tired',
    emoji: '😴',
    label: 'Fatigué',
    color: 'purple-500',
    bgColor: 'bg-purple-50',
    hoverColor: 'hover:bg-purple-100',
    textColor: 'text-purple-700',
    description: 'On y va doucement aujourd\'hui',
    tone: 'réconfortant'
  },
  stressed: {
    id: 'stressed',
    emoji: '😰',
    label: 'Stressé',
    color: 'orange-500',
    bgColor: 'bg-orange-50',
    hoverColor: 'hover:bg-orange-100',
    textColor: 'text-orange-700',
    description: 'Respirons et simplifions',
    tone: 'rassurant'
  },
  sad: {
    id: 'sad',
    emoji: '😢',
    label: 'Pas bien',
    color: 'slate-500',
    bgColor: 'bg-slate-50',
    hoverColor: 'hover:bg-slate-100',
    textColor: 'text-slate-700',
    description: 'C\'est ok de ne pas être ok',
    tone: 'empathique'
  }
};

const MOOD_THEMES: Record<MoodType, MoodTheme> = {
  energetic: {
    primary: 'rgb(5 150 105)', // emerald-600 - Better contrast ratio
    secondary: 'rgb(236 253 245)', // emerald-50
    background: 'linear-gradient(to bottom right, rgb(236 253 245), rgb(209 250 229))',
    text: 'rgb(4 120 87)', // emerald-700 - AA compliant
    accent: 'rgb(16 185 129)' // emerald-500
  },
  normal: {
    primary: 'rgb(37 99 235)', // blue-600 - Better contrast ratio
    secondary: 'rgb(239 246 255)', // blue-50
    background: 'linear-gradient(to bottom right, rgb(239 246 255), rgb(219 234 254))',
    text: 'rgb(29 78 216)', // blue-700 - AA compliant
    accent: 'rgb(59 130 246)' // blue-500
  },
  tired: {
    primary: 'rgb(147 51 234)', // purple-600 - Better contrast ratio
    secondary: 'rgb(250 245 255)', // purple-50
    background: 'linear-gradient(to bottom right, rgb(250 245 255), rgb(243 232 255))',
    text: 'rgb(109 40 217)', // purple-700 - Enhanced for better contrast
    accent: 'rgb(168 85 247)' // purple-500
  },
  stressed: {
    primary: 'rgb(234 88 12)', // orange-600 - Better contrast ratio
    secondary: 'rgb(255 251 235)', // orange-50
    background: 'linear-gradient(to bottom right, rgb(255 251 235), rgb(254 243 199))',
    text: 'rgb(154 52 18)', // orange-800 - Enhanced for better contrast
    accent: 'rgb(249 115 22)' // orange-500
  },
  sad: {
    primary: 'rgb(71 85 105)', // slate-600 - Better contrast ratio
    secondary: 'rgb(248 250 252)', // slate-50
    background: 'linear-gradient(to bottom right, rgb(248 250 252), rgb(241 245 249))',
    text: 'rgb(30 41 59)', // slate-800 - Enhanced for better contrast
    accent: 'rgb(100 116 139)' // slate-500
  }
};

const MoodContext = createContext<MoodContextType | undefined>(undefined);

export function MoodProvider({ children }: { children: React.ReactNode }) {
  const [currentMood, setCurrentMood] = useState<MoodType>('normal');

  useEffect(() => {
    const savedMood = localStorage.getItem('adhd-mood');
    if (savedMood && savedMood in MOOD_CONFIG) {
      setCurrentMood(savedMood as MoodType);
    }
  }, []);

  const setMood = (mood: MoodType) => {
    setCurrentMood(mood);
    localStorage.setItem('adhd-mood', mood);
  };

  const getMoodConfig = () => MOOD_CONFIG[currentMood];
  const getTheme = () => MOOD_THEMES[currentMood];

  return (
    <MoodContext.Provider value={{
      currentMood,
      setMood,
      getMoodConfig,
      getTheme
    }}>
      {children}
    </MoodContext.Provider>
  );
}

export function useMood() {
  const context = useContext(MoodContext);
  if (context === undefined) {
    throw new Error('useMood must be used within a MoodProvider');
  }
  return context;
}

export { MOOD_CONFIG };