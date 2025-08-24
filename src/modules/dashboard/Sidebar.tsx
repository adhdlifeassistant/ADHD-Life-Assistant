'use client';

import React from 'react';
import { useMood, MOOD_CONFIG } from '@/modules/mood/MoodContext';
import { useDashboard, NAVIGATION_ITEMS } from './DashboardContext';
import { isModuleRecommended, getModuleReason, shouldHideModule } from '@/lib/moodPriorities';
import { a11yService } from '@/lib/notificationService';
import { keyboardNavService } from '@/lib/keyboardNavigation';

function MoodSelectorCompact() {
  const { currentMood, setMood } = useMood();

  const announceOnMoodChange = (mood: any) => {
    a11yService.announceMoodChange(mood.label, mood.description);
  };

  return (
    <div className="mb-4">
      <fieldset>
        <legend className="text-xs lg:text-sm font-medium mb-2 lg:mb-3" style={{ color: 'var(--mood-text)' }}>
          Comment tu te sens ?
        </legend>
        <div className="grid grid-cols-5 gap-1 lg:gap-2" role="radiogroup" aria-label="Sélecteur d'humeur">
          {Object.values(MOOD_CONFIG).map((mood) => (
            <button
              key={mood.id}
              onClick={() => {
                setMood(mood.id);
                announceOnMoodChange(mood);
              }}
              className={`
                p-1.5 lg:p-2 rounded-lg text-sm lg:text-lg transition-bounce hover-lift
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                ${currentMood === mood.id 
                  ? `${mood.bgColor} ${mood.textColor} ring-1 lg:ring-2 ring-current pulse-mood` 
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

export default function Sidebar() {
  const { getMoodConfig, currentMood } = useMood();
  const { currentView, setView, isSidebarOpen, setSidebarOpen } = useDashboard();
  const moodConfig = getMoodConfig();
  
  // Initialize keyboard navigation for sidebar
  React.useEffect(() => {
    const sidebarElement = document.getElementById('navigation-sidebar');
    if (sidebarElement && isSidebarOpen) {
      const cleanup = keyboardNavService.initializeComponent(sidebarElement, {
        arrowNavigation: 'vertical',
        radioGroups: true
      });
      
      // Focus the first navigation item when sidebar opens
      const firstNavItem = sidebarElement.querySelector('[role="navigation"] button');
      if (firstNavItem instanceof HTMLElement) {
        firstNavItem.focus();
      }
      
      return cleanup;
    }
  }, [isSidebarOpen]);

  return (
    <>
      {/* Overlay mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 lg:hidden z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        id="navigation-sidebar"
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-80 lg:w-80 sm:w-72 xs:w-64
          transform transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          bg-white/80 backdrop-blur-md border-r border-white/20
          flex flex-col
          max-h-screen overflow-y-auto
        `}
        role="navigation"
        aria-label="Navigation principale"
        aria-hidden={!isSidebarOpen && typeof window !== 'undefined' && window.innerWidth < 1024}
      >
        {/* Header avec mood selector compact */}
        <div className="p-4 lg:p-6 border-b border-white/20">
          <div className="flex items-center justify-between mb-4 lg:mb-6">
            <h1 className="text-lg lg:text-xl font-bold truncate" style={{ color: 'var(--mood-text)' }}>
              ADHD Assistant
            </h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-slate-400 hover:text-slate-600 p-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
              aria-label="Fermer le menu de navigation"
            >
              <span role="img" aria-hidden="true">✕</span>
            </button>
          </div>
          
          {/* Mood selector compact */}
          <MoodSelectorCompact />

          {/* Status mood actuel */}
          <div className={`
            p-2 lg:p-3 rounded-xl ${moodConfig.bgColor} ${moodConfig.textColor}
          `}>
            <div className="flex items-center gap-2">
              <span className="text-base lg:text-lg">{moodConfig.emoji}</span>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-xs lg:text-sm truncate">Mode {moodConfig.label}</p>
                <p className="text-xs opacity-80 truncate">{moodConfig.description}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 p-4 lg:p-6 overflow-y-auto">
          <nav 
            className="space-y-1 lg:space-y-2"
            role="navigation"
            aria-label="Modules de l'application"
          >
            {NAVIGATION_ITEMS.map((item) => {
              const isRecommended = isModuleRecommended(currentMood, item.id);
              const shouldHide = shouldHideModule(currentMood, item.id);
              const reason = getModuleReason(currentMood, item.id);
              
              if (shouldHide) return null;
              
              return (
                <button
                  key={item.id}
                  onClick={() => setView(item.id)}
                  className={`
                    w-full flex items-center gap-2 lg:gap-3 p-2 lg:p-3 rounded-lg lg:rounded-xl transition-all text-left relative
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                    ${currentView === item.id 
                      ? `${moodConfig.bgColor} ${moodConfig.textColor} shadow-sm` 
                      : 'hover:bg-white/50'
                    }
                    ${isRecommended ? 'ring-1 lg:ring-2 ring-current ring-opacity-50' : ''}
                  `}
                  aria-current={currentView === item.id ? 'page' : undefined}
                  aria-describedby={isRecommended ? `${item.id}-recommended` : undefined}
                >
                  {isRecommended && (
                    <div 
                      className="absolute -top-1 -right-1 w-3 h-3 lg:w-4 lg:h-4 bg-yellow-400 rounded-full flex items-center justify-center"
                      aria-hidden="true"
                    >
                      <span className="text-xs">⭐</span>
                    </div>
                  )}
                  
                  <span 
                    className="text-lg lg:text-xl flex-shrink-0" 
                    role="img" 
                    aria-label={`Icône ${item.label}`}
                  >
                    {item.icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 lg:gap-2">
                      <p className="font-medium text-sm lg:text-base truncate">{item.label}</p>
                      {isRecommended && (
                        <span 
                          id={`${item.id}-recommended`}
                          className="text-xs px-1 py-0.5 bg-yellow-100 text-yellow-800 rounded hidden lg:inline"
                        >
                          Recommandé
                        </span>
                      )}
                    </div>
                    <p className="text-xs opacity-70 truncate lg:overflow-visible lg:whitespace-normal">
                      {reason || item.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer */}
        <div className="p-4 lg:p-6 border-t border-white/20 flex-shrink-0">
          <div className="text-center space-y-3">
            <button
              onClick={() => {
                const event = new CustomEvent('open-settings');
                window.dispatchEvent(event);
              }}
              className="w-full px-3 py-2 text-sm bg-white/20 hover:bg-white/30 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              style={{ color: 'var(--mood-text)' }}
              aria-label="Ouvrir les paramètres de l'application"
            >
              <span role="img" aria-hidden="true">⚙️</span> Paramètres
            </button>
            <div>
              <p className="text-xs opacity-60 truncate" style={{ color: 'var(--mood-text)' }}>
                ADHD Life Assistant v1.0
              </p>
              <p className="text-xs opacity-40 mt-1 truncate" style={{ color: 'var(--mood-text)' }}>
                Fait avec 💜 pour la communauté ADHD
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}