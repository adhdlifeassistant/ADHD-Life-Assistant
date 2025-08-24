'use client';

import React, { useState } from 'react';
import { useDashboard } from '@/modules/dashboard/DashboardContext';

interface HelpContent {
  title: string;
  description: string;
  tips: string[];
  keyFeatures: string[];
}

const HELP_CONTENT: Record<string, HelpContent> = {
  home: {
    title: '🏠 Accueil - Vue d\'ensemble',
    description: 'Votre dashboard central qui s\'adapte à votre humeur du moment',
    tips: [
      'Changez votre humeur en haut à gauche pour adapter l\'interface',
      'Les modules recommandés pour votre état actuel sont marqués ⭐',
      'L\'interface change de couleur selon votre mood pour vous aider'
    ],
    keyFeatures: [
      'Dashboard adaptatif à l\'humeur',
      'Widgets résumés de chaque module',
      'Navigation rapide vers tous les outils'
    ]
  },
  finance: {
    title: '💰 Finances - Gestion empathique',
    description: 'Budget et dépenses sans culpabilisation, spécialement conçu pour ADHD',
    tips: [
      'Catégories adaptées : Essentiel, Plaisir, Impulsion, Santé',
      'Réflexion anti-impulsion pour achats >50€',
      'Pas de jugement, que des encouragements bienveillants'
    ],
    keyFeatures: [
      'Tracking des dépenses par catégorie',
      'Budgets flexibles et empathiques',
      'Wishlist pour différer les achats impulsifs',
      'Réflexion guidée avant gros achats'
    ]
  },
  cleaning: {
    title: '🧹 Ménage - Gamification douce',
    description: 'Rendre le ménage motivant avec timers et récompenses',
    tips: [
      'Choisissez des tâches selon votre énergie du moment',
      'Utilisez les timers pour des sessions courtes et efficaces',
      'Célébrez chaque petite victoire, c\'est important !'
    ],
    keyFeatures: [
      'Tâches adaptées à votre mood',
      'Système de timer intégré (Pomodoro/Sprint/Micro)',
      'Gamification saine avec points',
      'Listes par pièce prédéfinies'
    ]
  },
  health: {
    title: '🏥 Santé - Suivi médical ADHD',
    description: 'Tracking bienveillant de votre santé et traitements',
    tips: [
      'Loggez votre bien-être quotidien en 30 secondes',
      'Suivez vos médications avec notes pour le médecin',
      'Les visualisations vous aident à voir vos patterns'
    ],
    keyFeatures: [
      'Suivi quotidien du bien-être (énergie, focus, anxiété...)',
      'Tracker des médications avec effets secondaires',
      'Agenda des RDV médicaux',
      'Export PDF pour consultations'
    ]
  },
  analytics: {
    title: '📊 Analytics - Vos patterns personnels',
    description: 'Découvrez les connexions cachées dans vos données',
    tips: [
      'Plus vous utilisez l\'app, plus les insights sont précis',
      'Les corrélations vous aident à mieux vous comprendre',
      'Utilisez les suggestions d\'actions pour optimiser votre quotidien'
    ],
    keyFeatures: [
      'Détection automatique de patterns',
      'Corrélations entre mood, santé, finances...',
      'Insights personnalisés et bienveillants',
      'Suggestions d\'actions concrètes'
    ]
  },
  reminders: {
    title: '💊 Rappels - Ne plus oublier',
    description: 'Rappels intelligents pour vos médicaments et rendez-vous',
    tips: [
      'Configurez selon votre routine personnelle',
      'Les rappels s\'adaptent à votre humeur',
      'Marquez comme pris rapidement'
    ],
    keyFeatures: [
      'Rappels de médicaments programmables',
      'Notifications push adaptatives',
      'Suivi des prises manquées',
      'Intégration avec le module Santé'
    ]
  }
};

export function ContextualHelp() {
  const { currentView } = useDashboard();
  const [isOpen, setIsOpen] = useState(false);
  
  const helpContent = HELP_CONTENT[currentView];
  
  if (!helpContent) return null;

  return (
    <>
      {/* Bouton d'aide flottant */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all hover:scale-105 z-40"
        aria-label="Aide contextuelle"
      >
        <span className="text-xl">?</span>
      </button>

      {/* Panel d'aide */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="card-elevated max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between p-6 border-b border-gray-100">
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">
                  {helpContent.title}
                </h2>
                <p className="text-gray-600">
                  {helpContent.description}
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none ml-4"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Fonctionnalités clés */}
              <section>
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  ⚡ Fonctionnalités principales
                </h3>
                <ul className="space-y-2">
                  {helpContent.keyFeatures.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="text-green-500 mt-1">✓</span>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </section>

              {/* Conseils d'utilisation */}
              <section>
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  💡 Conseils d'utilisation
                </h3>
                <div className="space-y-3">
                  {helpContent.tips.map((tip, index) => (
                    <div key={index} className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-blue-800 text-sm">{tip}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Conseils généraux ADHD */}
              <section className="bg-purple-50 p-4 rounded-lg">
                <h3 className="font-semibold text-purple-800 mb-3 flex items-center gap-2">
                  🧠 Spécial ADHD
                </h3>
                <div className="text-sm text-purple-700 space-y-2">
                  <p>• <strong>Pas de perfection requise :</strong> Utilisez ce qui vous aide, ignorez le reste</p>
                  <p>• <strong>Petits pas :</strong> Mieux vaut 2 minutes par jour que 2h une fois par mois</p>
                  <p>• <strong>Bienveillance :</strong> Cette app ne vous juge pas, elle vous accompagne</p>
                  <p>• <strong>Votre rythme :</strong> Adaptez tout à VOS besoins, pas aux normes</p>
                </div>
              </section>

              {/* Raccourcis clavier (si applicable) */}
              {currentView === 'home' && (
                <section>
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    ⌨️ Raccourcis utiles
                  </h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="bg-gray-100 p-2 rounded">
                      <kbd className="font-mono bg-gray-200 px-1 rounded">Tab</kbd> Navigation
                    </div>
                    <div className="bg-gray-100 p-2 rounded">
                      <kbd className="font-mono bg-gray-200 px-1 rounded">Esc</kbd> Fermer
                    </div>
                    <div className="bg-gray-100 p-2 rounded">
                      <kbd className="font-mono bg-gray-200 px-1 rounded">?</kbd> Aide
                    </div>
                    <div className="bg-gray-100 p-2 rounded">
                      <kbd className="font-mono bg-gray-200 px-1 rounded">1-6</kbd> Mood rapide
                    </div>
                  </div>
                </section>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-100 p-6">
              <div className="text-center text-sm text-gray-500">
                💜 Besoin d'aide ? Cette app est conçue pour vous accompagner, pas vous stresser !
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Hook pour raccourcis clavier
export function useKeyboardShortcuts() {
  React.useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Aide contextuelle avec ?
      if (event.key === '?' && !event.ctrlKey && !event.metaKey) {
        const helpButton = document.querySelector('[aria-label="Aide contextuelle"]') as HTMLButtonElement;
        if (helpButton) {
          helpButton.click();
        }
      }
      
      // Mood shortcuts (1-5)
      if (['1', '2', '3', '4', '5'].includes(event.key) && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        const moodButtons = document.querySelectorAll('[data-mood-selector] button');
        const index = parseInt(event.key) - 1;
        if (moodButtons[index]) {
          (moodButtons[index] as HTMLButtonElement).click();
        }
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, []);
}