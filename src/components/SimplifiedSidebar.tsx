'use client';

import React from 'react';
import { useMood, MOOD_CONFIG } from '@/modules/mood/MoodContext';
import { useDashboard } from '@/modules/dashboard/DashboardContext';
import { useProfile } from '@/hooks/useProfile';

function MoodSelectorCompact() {
  const { currentMood, setMood } = useMood();

  return (
    <div className="mb-6">
      <fieldset>
        <legend className="text-sm font-medium mb-3" style={{ color: 'var(--mood-text)' }}>
          Comment tu te sens ?
        </legend>
        <div className="grid grid-cols-5 gap-2" role="radiogroup" aria-label="Sélecteur d'humeur">
          {Object.values(MOOD_CONFIG).map((mood) => (
            <button
              key={mood.id}
              onClick={() => setMood(mood.id)}
              className={`
                p-2 rounded-adhd text-lg transition-all hover-lift
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                ${currentMood === mood.id 
                  ? `${mood.bgColor} ${mood.textColor} ring-2 ring-current` 
                  : 'hover:bg-white/50'
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
      </fieldset>
    </div>
  );
}

export default function SimplifiedSidebar() {
  const { getMoodConfig, currentMood } = useMood();
  const { currentView, isSidebarOpen, setSidebarOpen } = useDashboard();
  const { profile } = useProfile();
  const moodConfig = getMoodConfig();

  const menuItems = [
    {
      id: 'settings',
      label: 'Paramètres',
      icon: '⚙️',
      description: 'Configuration de l\'app',
      action: () => {
        const event = new CustomEvent('open-settings');
        window.dispatchEvent(event);
      }
    },
    {
      id: 'home',
      label: 'Accueil',
      icon: '🏠',
      description: 'Retour à la grille d\'icônes',
      action: () => {
        window.location.href = '/';
      }
    },
    {
      id: 'contact',
      label: 'Contact',
      icon: '📧',
      description: 'Support et feedback',
      action: () => {
        // Ouvrir un modal de contact ou rediriger vers support
        window.open('mailto:support@adhd-assistant.com?subject=Feedback ADHD Assistant', '_blank');
      }
    }
  ];

  return (
    <>
      {/* Overlay mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 lg:hidden z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar simplifiée */}
      <aside 
        id="navigation-sidebar"
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-80 lg:w-80 sm:w-72 xs:w-64
          transform transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          bg-white/90 backdrop-blur-md border-r border-white/30
          flex flex-col
          max-h-screen overflow-y-auto
          rounded-adhd-lg
        `}
        role="navigation"
        aria-label="Navigation principale"
        aria-hidden={!isSidebarOpen && typeof window !== 'undefined' && window.innerWidth < 1024}
      >
        {/* Header avec profil utilisateur */}
        <div className="p-6 border-b border-white/20">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="text-2xl">{moodConfig.emoji}</div>
              <div>
                <h1 className="text-xl font-bold text-display" style={{ color: 'var(--mood-text)' }}>
                  {profile.name ? `Salut ${profile.name} !` : 'ADHD Assistant'}
                </h1>
                <p className="text-xs text-caption opacity-70">
                  Mode {moodConfig.label}
                </p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-slate-400 hover:text-slate-600 p-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-adhd"
              aria-label="Fermer le menu de navigation"
            >
              <span role="img" aria-hidden="true">✕</span>
            </button>
          </div>
          
          {/* Mood selector */}
          <MoodSelectorCompact />

          {/* Status mood actuel */}
          <div className={`
            p-4 rounded-adhd-lg ${moodConfig.bgColor} ${moodConfig.textColor}
          `}>
            <div className="flex items-center gap-3">
              <span className="text-xl">{moodConfig.emoji}</span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-sm">Mode {moodConfig.label}</p>
                <p className="text-xs opacity-80 leading-tight">{moodConfig.description}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Menu simplifié */}
        <div className="flex-1 p-6">
          <nav className="space-y-3">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={item.action}
                className={`
                  w-full flex items-center gap-4 p-4 rounded-adhd-lg transition-all text-left
                  hover:bg-white/60 hover:backdrop-blur-sm hover-lift
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                  bg-white/40 backdrop-blur-sm border border-white/20
                `}
              >
                <span className="text-2xl flex-shrink-0" role="img" aria-label={`Icône ${item.label}`}>
                  {item.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-base text-display" style={{ color: 'var(--mood-text)' }}>
                    {item.label}
                  </p>
                  <p className="text-sm text-caption opacity-70">
                    {item.description}
                  </p>
                </div>
              </button>
            ))}
          </nav>
        </div>

        {/* Footer informatif */}
        <div className="p-6 border-t border-white/20">
          <div className="text-center space-y-2">
            <p className="text-xs text-caption opacity-60">
              ADHD Life Assistant v1.0
            </p>
            <p className="text-xs text-caption opacity-40">
              Fait avec 💜 pour la communauté ADHD
            </p>
            <div className="flex justify-center gap-1 mt-3">
              <div className="w-2 h-2 bg-green-400 rounded-full opacity-80"></div>
              <div className="w-2 h-2 bg-blue-400 rounded-full opacity-60"></div>
              <div className="w-2 h-2 bg-purple-400 rounded-full opacity-40"></div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}