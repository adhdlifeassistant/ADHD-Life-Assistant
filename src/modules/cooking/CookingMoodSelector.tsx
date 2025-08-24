'use client';

import React from 'react';
import { CookingMood } from '@/types/cooking';
import { useMood } from '@/modules/mood/MoodContext';

interface CookingMoodSelectorProps {
  selectedMood: CookingMood | null;
  onMoodSelect: (mood: CookingMood) => void;
}

const COOKING_MOODS = [
  {
    id: 'energetic' as CookingMood,
    emoji: '💪',
    label: 'Motivé(e)',
    description: 'J\'ai envie de cuisiner !',
    color: 'emerald'
  },
  {
    id: 'normal' as CookingMood,
    emoji: '😊',
    label: 'Normal',
    description: 'Une cuisine équilibrée',
    color: 'blue'
  },
  {
    id: 'tired' as CookingMood,
    emoji: '😴',
    label: 'Fatigué(e)',
    description: 'Quelque chose de simple',
    color: 'purple'
  },
  {
    id: 'stressed' as CookingMood,
    emoji: '😰',
    label: 'Stressé(e)',
    description: 'Cuisine apaisante',
    color: 'orange'
  },
  {
    id: 'sad' as CookingMood,
    emoji: '😢',
    label: 'Pas terrible',
    description: 'Plats réconfortants',
    color: 'slate'
  },
  {
    id: 'not-feeling-it' as CookingMood,
    emoji: '🚫',
    label: 'Pas envie',
    description: 'Alternatives sans effort',
    color: 'gray'
  }
];

export default function CookingMoodSelector({ selectedMood, onMoodSelect }: CookingMoodSelectorProps) {
  const { getMoodConfig } = useMood();
  const moodConfig = getMoodConfig();

  return (
    <div className="mb-8">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--mood-text)' }}>
          Comment tu te sens pour cuisiner ? 🍳
        </h2>
        <p className="opacity-80" style={{ color: 'var(--mood-text)' }}>
          Je vais adapter mes suggestions à ton état d'esprit
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {COOKING_MOODS.map((mood) => (
          <button
            key={mood.id}
            onClick={() => onMoodSelect(mood.id)}
            className={`
              p-4 rounded-xl border-2 transition-all hover:scale-105 active:scale-95
              ${selectedMood === mood.id
                ? `${moodConfig.bgColor} ${moodConfig.textColor} border-current shadow-lg`
                : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-md'
              }
            `}
          >
            <div className="text-center">
              <div className="text-3xl mb-2">{mood.emoji}</div>
              <h3 className={`font-semibold mb-1 ${
                selectedMood === mood.id ? '' : 'text-slate-800'
              }`}>
                {mood.label}
              </h3>
              <p className={`text-sm ${
                selectedMood === mood.id ? 'opacity-80' : 'text-slate-600'
              }`}>
                {mood.description}
              </p>
            </div>
          </button>
        ))}
      </div>

      {selectedMood && (
        <div className="text-center mt-6">
          <div className={`
            inline-flex items-center px-6 py-3 rounded-full
            ${moodConfig.bgColor} ${moodConfig.textColor}
            transition-all duration-500 ease-out
          `}>
            <span className="text-xl mr-3">
              {COOKING_MOODS.find(m => m.id === selectedMood)?.emoji}
            </span>
            <span className="font-medium">
              Mood cuisine : {COOKING_MOODS.find(m => m.id === selectedMood)?.label}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}