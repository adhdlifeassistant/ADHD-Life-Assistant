'use client';

import React from 'react';
import { useDashboard } from './DashboardContext';
import GridHome from '@/components/GridHome';
import DashboardHome from './DashboardHome';
import ChatInterface from '@/modules/chat/ChatInterface';
import ReminderList from '@/modules/reminders/ReminderList';
import CookingInterface from '@/modules/cooking/CookingInterface';
import ChecklistInterface from '@/modules/checklists/ChecklistInterface';
import { FinanceInterface } from '@/modules/finance/FinanceInterface';
import { CleaningInterface } from '@/modules/cleaning/CleaningInterface';
import { HealthInterface } from '@/modules/health/HealthInterface';
import { AnalyticsInterface } from '@/modules/analytics/AnalyticsInterface';
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
  const { currentView, setView } = useDashboard();
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
  
  // Écouter l'événement d'ouverture des paramètres
  React.useEffect(() => {
    const handleOpenSettings = () => setShowSettings(true);
    window.addEventListener('open-settings', handleOpenSettings);
    return () => window.removeEventListener('open-settings', handleOpenSettings);
  }, []);


  const renderCurrentView = () => {
    switch (currentView) {
      case 'home':
        return <GridHome onSettingsClick={() => setShowSettings(true)} />;
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
      {currentView === 'home' ? (
        // Vue grille complète pour l'accueil
        renderCurrentView()
      ) : (
        // Vue épurée pour les modules
        <div className="min-h-screen relative">
          {/* Bouton Home flottant */}
          <div className="fixed bottom-6 right-6 z-50">
            <button
              onClick={() => setView('home')}
              className="p-4 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50"
              aria-label="Retour à l'accueil"
              title="Retour à l'accueil"
            >
              <span className="text-2xl" role="img" aria-hidden="true">🏠</span>
            </button>
          </div>

          {/* Contenu principal */}
          <main className="w-full min-h-screen pt-6 pb-24">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              {renderCurrentView()}
            </div>
          </main>
        </div>
      )}

      {/* Modals et overlays */}
      <Settings isOpen={showSettings} onClose={() => setShowSettings(false)} />
      <ContextualHelp />
    </div>
  );
}