'use client';

import React from 'react';
import { useMood, MOOD_CONFIG } from './MoodContext';
import { MoodType } from '@/types/mood';

export default function MoodSelector() {
  const { currentMood, setMood } = useMood();

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2">
          Comment tu te sens aujourd'hui ?
        </h2>
        <p className="text-slate-600 dark:text-slate-300">
          Choisis ton humeur pour adapter l'app à tes besoins
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {Object.values(MOOD_CONFIG).map((mood) => (
          <button
            key={mood.id}
            onClick={() => setMood(mood.id)}
            className={`
              relative p-6 rounded-2xl border-2 transition-all duration-300 ease-out
              transform hover:scale-105 active:scale-95
              ${currentMood === mood.id 
                ? `border-${mood.color} ${mood.bgColor} ${mood.textColor} shadow-lg shadow-${mood.color}/20` 
                : `border-slate-200 bg-white hover:border-${mood.color} ${mood.hoverColor}`
              }
              focus:outline-none focus:ring-4 focus:ring-${mood.color}/20
            `}
          >
            <div className="flex flex-col items-center space-y-3">
              <span className="text-4xl md:text-5xl" role="img" aria-label={mood.label}>
                {mood.emoji}
              </span>
              <span className="font-semibold text-sm md:text-base">
                {mood.label}
              </span>
              {currentMood === mood.id && (
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
              )}
            </div>
          </button>
        ))}
      </div>

      {currentMood && (
        <div className="text-center">
          <div className={`
            inline-flex items-center px-6 py-3 rounded-full 
            ${MOOD_CONFIG[currentMood].bgColor} ${MOOD_CONFIG[currentMood].textColor}
            transition-all duration-500 ease-out
          `}>
            <span className="text-2xl mr-3" role="img">
              {MOOD_CONFIG[currentMood].emoji}
            </span>
            <div className="text-left">
              <p className="font-semibold">
                Mode {MOOD_CONFIG[currentMood].label}
              </p>
              <p className="text-sm opacity-80">
                {MOOD_CONFIG[currentMood].description}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}