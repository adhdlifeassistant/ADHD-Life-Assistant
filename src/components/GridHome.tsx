'use client';

import React from 'react';
import { useMood, MOOD_CONFIG } from '@/modules/mood/MoodContext';
import IconGrid from './IconGrid';

function MoodSelectorHeader() {
  const { currentMood, setMood } = useMood();

  return (
    <div className="fixed top-4 left-4 right-4 z-50 flex justify-center">
      <div className="bg-white/90 backdrop-blur-md rounded-adhd-lg p-3 shadow-lg border border-white/20">
        <div className="flex gap-2">
          {Object.values(MOOD_CONFIG).map((mood) => (
            <button
              key={mood.id}
              onClick={() => setMood(mood.id)}
              className={`
                p-2 rounded-adhd text-lg transition-all hover-lift
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                ${currentMood === mood.id 
                  ? `${mood.bgColor} ${mood.textColor} ring-2 ring-current` 
                  : 'hover:bg-white/60'
                }
              `}
              role="radio"
              aria-checked={currentMood === mood.id}
              aria-label={`${mood.label}: ${mood.description}`}
              title={`${mood.label}: ${mood.description}`}
            >
              <span role="img" aria-hidden="true">{mood.emoji}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

interface GridHomeProps {
  onSettingsClick: () => void;
}

export default function GridHome({ onSettingsClick }: GridHomeProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30">
      {/* Sélecteur de mood flottant */}
      <MoodSelectorHeader />
      
      {/* Grille d'icônes principale */}
      <IconGrid onSettingsClick={onSettingsClick} />
    </div>
  );
}