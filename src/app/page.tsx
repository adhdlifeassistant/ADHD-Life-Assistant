import MainIconGrid from '@/components/MainIconGrid';
import { useMood, MOOD_CONFIG } from '@/modules/mood/MoodContext';
import { getPersonalizedGreeting } from '@/lib/personalizedGreetings';
import React from 'react';

function MoodSelectorHeader() {
  const { currentMood, setMood } = useMood();

  return (
    <div className="fixed top-4 left-4 right-4 z-50 flex justify-center">
      <div className="bg-white/90 backdrop-blur-md rounded-2xl p-3 shadow-lg border border-white/20">
        <div className="flex gap-2">
          {Object.values(MOOD_CONFIG).map((mood) => (
            <button
              key={mood.id}
              onClick={() => setMood(mood.id)}
              className={`
                p-2 rounded-xl text-lg transition-all hover:scale-105
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

export default function Home() {
  const { currentMood } = useMood();
  const moodGreeting = getPersonalizedGreeting(currentMood, 'afternoon');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Sélecteur de mood flottant */}
      <MoodSelectorHeader />
      
      {/* Header principal */}
      <div className="pt-20 pb-8 text-center">
        <h1 className="text-4xl font-bold mb-4" style={{ color: 'var(--mood-text)' }}>
          ADHD Assistant
        </h1>
        <p className="text-lg opacity-80 mb-2" style={{ color: 'var(--mood-text)' }}>
          {moodGreeting}
        </p>
        <p className="text-base opacity-60" style={{ color: 'var(--mood-text)' }}>
          Choisissez votre module
        </p>
      </div>
      
      {/* Grille d'icônes principale */}
      <MainIconGrid onSettingsClick={() => console.log('Settings clicked')} />
    </div>
  );
}
