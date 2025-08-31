import MainIconGrid from '@/components/MainIconGrid';
import { useMood, MOOD_CONFIG } from '@/modules/mood/MoodContext';
import { useProfile } from '@/hooks/useProfile';
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
  const { profile } = useProfile();
  
  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    const name = profile.name || 'toi';
    
    if (hour < 12) return `Bonjour ${name}`;
    if (hour < 17) return `Bon après-midi ${name}`;
    return `Bonsoir ${name}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex flex-col">
      {/* Sélecteur de mood flottant */}
      <MoodSelectorHeader />
      
      {/* Header principal épuré */}
      <div className="pt-24 pb-12 text-center flex-shrink-0">
        <h1 className="text-5xl md:text-6xl font-bold mb-6" style={{ color: 'var(--mood-text)' }}>
          ADHD Assistant
        </h1>
        <p className="text-xl md:text-2xl opacity-80 mb-2" style={{ color: 'var(--mood-text)' }}>
          {getTimeGreeting()}
        </p>
        <p className="text-lg opacity-60" style={{ color: 'var(--mood-text)' }}>
          Choisissez votre module
        </p>
      </div>
      
      {/* Grille d'icônes optimisée */}
      <div className="flex-1 flex items-center justify-center px-4 pb-12">
        <MainIconGrid onSettingsClick={() => console.log('Settings clicked')} />
      </div>
    </div>
  );
}
