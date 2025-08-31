'use client';

import React from 'react';
import { useMood, MOOD_CONFIG } from '@/modules/mood/MoodContext';
import MainIconGrid from './MainIconGrid';

function MoodSelectorHeader() {
  const { currentMood, setMood } = useMood();

  return (
    <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-white/95 backdrop-blur-xl rounded-2xl px-4 py-3 shadow-xl border border-white/30">
        <div className="flex gap-3">
          {Object.values(MOOD_CONFIG).map((mood) => (
            <button
              key={mood.id}
              onClick={() => setMood(mood.id)}
              className={`
                p-2.5 rounded-xl text-xl transition-all duration-200 hover:scale-110
                focus:outline-none focus:ring-3 focus:ring-blue-500 focus:ring-opacity-50
                ${currentMood === mood.id 
                  ? `${mood.bgColor} ${mood.textColor} ring-2 ring-current scale-105` 
                  : 'hover:bg-white/70'
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex flex-col">
      {/* Sélecteur de mood flottant */}
      <MoodSelectorHeader />
      
      {/* Header principal épuré */}
      <div className="pt-20 pb-12 text-center flex-shrink-0">
        <h1 className="text-5xl md:text-6xl font-bold mb-6" style={{ color: 'var(--mood-text)' }}>
          ADHD Assistant
        </h1>
        <p className="text-xl md:text-2xl opacity-80 mb-2" style={{ color: 'var(--mood-text)' }}>
          Choisissez votre module
        </p>
      </div>
      
      {/* Grille d'icônes optimisée */}
      <div className="flex-1 flex items-center justify-center px-4 pb-12">
        <MainIconGrid onSettingsClick={onSettingsClick} />
      </div>
    </div>
  );
}