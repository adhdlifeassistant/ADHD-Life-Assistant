'use client';

import React from 'react';
import { useDashboard } from './DashboardContext';
import Sidebar from './Sidebar';
import DashboardHome from './DashboardHome';
import ChatInterface from '@/modules/chat/ChatInterface';
import ReminderList from '@/modules/reminders/ReminderList';
import CookingInterface from '@/modules/cooking/CookingInterface';
import ChecklistInterface from '@/modules/checklists/ChecklistInterface';
import { FinanceInterface } from '@/modules/finance/FinanceInterface';
import { CleaningInterface } from '@/modules/cleaning/CleaningInterface';
import { HealthInterface } from '@/modules/health/HealthInterface';
import { AnalyticsInterface } from '@/modules/analytics/AnalyticsInterface';
import { Onboarding, useOnboarding } from '@/components/Onboarding';
import { Settings } from '@/components/Settings';
import { ContextualHelp, useKeyboardShortcuts } from '@/components/ContextualHelp';
import { keyboardNavService } from '@/lib/keyboardNavigation';

// Composants placeholder pour les modules à venir
function TasksModule() {
  return (
    <div className="text-center py-16">
      <div className="text-6xl mb-4">✅</div>
      <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--mood-text)' }}>
        Module Tâches
      </h2>
      <p className="opacity-70" style={{ color: 'var(--mood-text)' }}>
        To-do lists intelligentes ADHD - Bientôt disponible
      </p>
    </div>
  );
}

function FocusModule() {
  return (
    <div className="text-center py-16">
      <div className="text-6xl mb-4">🎯</div>
      <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--mood-text)' }}>
        Module Focus
      </h2>
      <p className="opacity-70" style={{ color: 'var(--mood-text)' }}>
        Sessions Pomodoro adaptatives - Bientôt disponible
      </p>
    </div>
  );
}

export default function Dashboard() {
  const { currentView, isSidebarOpen, setSidebarOpen } = useDashboard();
  const { needsOnboarding, completeOnboarding } = useOnboarding();
  const [showSettings, setShowSettings] = React.useState(false);
  
  // Raccourcis clavier
  useKeyboardShortcuts();
  
  // Initialize keyboard navigation
  React.useEffect(() => {
    // Set up global keyboard navigation
    const dashboardElement = document.getElementById('dashboard-root');
    if (dashboardElement) {
      return keyboardNavService.initializeComponent(dashboardElement, {
        arrowNavigation: 'both'
      });
    }
  }, []);
  
  // Écouter l'événement d'ouverture des paramètres depuis la sidebar
  React.useEffect(() => {
    const handleOpenSettings = () => setShowSettings(true);
    window.addEventListener('open-settings', handleOpenSettings);
    return () => window.removeEventListener('open-settings', handleOpenSettings);
  }, []);

  // Rediriger vers l'onboarding si nécessaire
  React.useEffect(() => {
    if (needsOnboarding && typeof window !== 'undefined') {
      window.location.href = '/onboarding';
    }
  }, [needsOnboarding]);

  const renderCurrentView = () => {
    switch (currentView) {
      case 'home':
        return <DashboardHome />;
      case 'chat':
        return (
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--mood-text)' }}>
                Chat avec Claude
              </h2>
              <p className="opacity-80" style={{ color: 'var(--mood-text)' }}>
                Assistant IA qui s'adapte à votre humeur
              </p>
            </div>
            <ChatInterface />
          </div>
        );
      case 'reminders':
        return (
          <div>
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--mood-text)' }}>
                Rappels médicaments
              </h2>
              <p className="opacity-80" style={{ color: 'var(--mood-text)' }}>
                Ne ratez jamais vos prises de médicaments
              </p>
            </div>
            <ReminderList />
          </div>
        );
      case 'cooking':
        return (
          <div>
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--mood-text)' }}>
                Cuisine adaptative
              </h2>
              <p className="opacity-80" style={{ color: 'var(--mood-text)' }}>
                Recettes qui s'adaptent à ton humeur et ton énergie
              </p>
            </div>
            <CookingInterface />
          </div>
        );
      case 'checklists':
        return (
          <div>
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--mood-text)' }}>
                Checklists anti-oublis
              </h2>
              <p className="opacity-80" style={{ color: 'var(--mood-text)' }}>
                Ne rien oublier avant de partir, spécialement conçu pour ADHD
              </p>
            </div>
            <ChecklistInterface />
          </div>
        );
      case 'finance':
        return (
          <div>
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--mood-text)' }}>
                Finances ADHD
              </h2>
              <p className="opacity-80" style={{ color: 'var(--mood-text)' }}>
                Gestion empathique de vos finances, sans culpabilisation
              </p>
            </div>
            <FinanceInterface />
          </div>
        );
      case 'cleaning':
        return (
          <div>
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--mood-text)' }}>
                Ménage ADHD
              </h2>
              <p className="opacity-80" style={{ color: 'var(--mood-text)' }}>
                Gamification douce pour rendre le ménage motivant
              </p>
            </div>
            <CleaningInterface />
          </div>
        );
      case 'health':
        return (
          <div>
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--mood-text)' }}>
                Suivi Santé ADHD
              </h2>
              <p className="opacity-80" style={{ color: 'var(--mood-text)' }}>
                Tracking médical simple et bienveillant pour adultes ADHD
              </p>
            </div>
            <HealthInterface />
          </div>
        );
      case 'analytics':
        return (
          <div>
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--mood-text)' }}>
                Analytics & Insights
              </h2>
              <p className="opacity-80" style={{ color: 'var(--mood-text)' }}>
                Découvrez vos patterns personnels et optimisez votre quotidien
              </p>
            </div>
            <AnalyticsInterface />
          </div>
        );
      case 'tasks':
        return <TasksModule />;
      case 'focus':
        return <FocusModule />;
      default:
        return <DashboardHome />;
    }
  };

  return (
    <div id="dashboard-root" className="min-h-screen bg-gradient-to-br transition-all duration-700 ease-in-out">
      <div className="flex h-screen">
        {/* Sidebar */}
        <Sidebar />

        {/* Main content */}
        <main 
          id="main-content"
          className="flex-1 flex flex-col overflow-hidden"
          role="main"
          aria-label="Contenu principal"
        >
          {/* Header mobile */}
          <header 
            className="lg:hidden bg-white/80 backdrop-blur-md border-b border-white/20 p-3 safe-area-inset-top"
            role="banner"
          >
            <div className="flex items-center justify-between">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setSidebarOpen(true);
                }}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setSidebarOpen(true);
                }}
                className="p-2 rounded-lg hover:bg-white/50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 relative z-50 cursor-pointer"
                aria-label="Ouvrir le menu de navigation"
                aria-expanded={isSidebarOpen}
                aria-controls="navigation-sidebar"
                style={{ pointerEvents: 'auto', userSelect: 'auto', touchAction: 'manipulation' }}
              >
                <span className="text-xl pointer-events-none" role="img" aria-hidden="true">☰</span>
              </button>
              <h1 
                className="font-bold text-center flex-1 truncate mx-4" 
                style={{ color: 'var(--mood-text)' }}
                id="app-title"
              >
                ADHD Assistant
              </h1>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowSettings(true);
                }}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowSettings(true);
                }}
                className="p-2 rounded-lg hover:bg-white/50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 relative z-50 cursor-pointer"
                aria-label="Ouvrir les paramètres"
                aria-expanded={showSettings}
                style={{ pointerEvents: 'auto', userSelect: 'auto', touchAction: 'manipulation' }}
              >
                <span className="text-xl pointer-events-none" role="img" aria-hidden="true">⚙️</span>
              </button>
            </div>
          </header>

          {/* Content area */}
          <section 
            className="flex-1 overflow-auto safe-area-inset-bottom"
            aria-labelledby="current-view-title"
          >
            <div className="p-4 sm:p-6 lg:p-8 fade-in max-w-full">
              <h2 id="current-view-title" className="sr-only">
                {(() => {
                  switch (currentView) {
                    case 'home': return 'Tableau de bord principal';
                    case 'chat': return 'Chat avec Claude';
                    case 'reminders': return 'Rappels médicaments';
                    case 'cooking': return 'Cuisine adaptative';
                    case 'checklists': return 'Checklists anti-oublis';
                    case 'finance': return 'Finances ADHD';
                    case 'cleaning': return 'Ménage ADHD';
                    case 'health': return 'Suivi Santé ADHD';
                    case 'analytics': return 'Analytics et insights';
                    case 'tasks': return 'Module Tâches';
                    case 'focus': return 'Module Focus';
                    default: return 'Tableau de bord';
                  }
                })()}
              </h2>
              {renderCurrentView()}
            </div>
          </section>
        </main>
      </div>

      {/* Modals et overlays */}
      {needsOnboarding && <Onboarding onComplete={completeOnboarding} />}
      <Settings isOpen={showSettings} onClose={() => setShowSettings(false)} />
      <ContextualHelp />
    </div>
  );
}