'use client';

import React, { useState, useEffect } from 'react';
import { useMood, MOOD_CONFIG } from '@/modules/mood/MoodContext';
import { NAVIGATION_ITEMS } from '@/modules/dashboard/DashboardContext';

interface OnboardingProps {
  onComplete: () => void;
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const { setMood } = useMood();
  const [currentStep, setCurrentStep] = useState(0);
  const [userName, setUserName] = useState('');
  const [selectedMood, setSelectedMood] = useState<string>('');
  const [selectedModules, setSelectedModules] = useState<string[]>([]);

  const steps = [
    {
      title: '👋 Bienvenue !',
      content: (
        <div className="text-center space-y-6">
          <div className="text-6xl mb-4">🧠</div>
          <h2 className="text-2xl font-bold text-gray-800">ADHD Life Assistant</h2>
          <p className="text-gray-600 max-w-md mx-auto">
            Votre assistant personnel conçu spécialement pour les cerveaux ADHD. 
            Nous allons vous aider à gérer votre quotidien avec bienveillance.
          </p>
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-700">
              💡 Toutes vos données restent sur votre appareil, en sécurité et privées
            </p>
          </div>
        </div>
      )
    },
    {
      title: '✨ Comment vous appeler ?',
      content: (
        <div className="text-center space-y-6">
          <div className="text-4xl mb-4">👤</div>
          <h3 className="text-xl font-semibold text-gray-800">Personnalisons votre expérience</h3>
          <div className="max-w-sm mx-auto">
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Votre prénom..."
              className="w-full px-4 py-3 text-center border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
              autoFocus
            />
          </div>
          <p className="text-sm text-gray-500">
            Nous utiliserons ce prénom pour personnaliser vos messages
          </p>
        </div>
      )
    },
    {
      title: '🎭 Comment vous sentez-vous ?',
      content: (
        <div className="text-center space-y-6">
          <h3 className="text-xl font-semibold text-gray-800">
            {userName ? `${userName}, ` : ''}comment vous sentez-vous maintenant ?
          </h3>
          <p className="text-gray-600">
            Votre humeur influence l'interface et les suggestions. Pas de pression, ça peut changer !
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 max-w-2xl mx-auto">
            {Object.values(MOOD_CONFIG).map((mood) => (
              <button
                key={mood.id}
                onClick={() => setSelectedMood(mood.id)}
                className={`p-4 rounded-xl transition-all ${
                  selectedMood === mood.id
                    ? `${mood.bgColor} ${mood.textColor} ring-2 ring-current transform scale-105`
                    : 'bg-gray-100 hover:bg-gray-200 hover:scale-105'
                }`}
              >
                <div className="text-3xl mb-2">{mood.emoji}</div>
                <div className="font-medium text-sm">{mood.label}</div>
                <div className="text-xs opacity-70 mt-1">{mood.description}</div>
              </button>
            ))}
          </div>
        </div>
      )
    },
    {
      title: '🎯 Choisissez vos modules',
      content: (
        <div className="text-center space-y-6">
          <div className="text-6xl mb-6">🎯</div>
          
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-800">
              Choisis tes 3 modules préférés
            </h2>
            <p className="text-lg text-gray-600 max-w-lg mx-auto leading-relaxed">
              Sélectionne les outils qui t'intéressent le plus pour personnaliser ton expérience !
            </p>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl max-w-md mx-auto mb-8 border border-blue-200 shadow-sm">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-3">
                <div className="flex space-x-1">
                  {[...Array(3)].map((_, index) => (
                    <div
                      key={index}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        index < selectedModules.length
                          ? 'bg-blue-500 scale-110 shadow-md'
                          : 'bg-blue-200'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <p className="font-medium text-blue-700 mb-1">
                {selectedModules.length} / 3 modules sélectionnés
              </p>
              {selectedModules.length >= 3 ? (
                <p className="text-sm text-blue-600">
                  ✨ Parfait ! Tu peux encore changer d'avis
                </p>
              ) : (
                <p className="text-sm text-blue-600">
                  Encore {3 - selectedModules.length} à choisir
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {NAVIGATION_ITEMS.filter(module => module.id !== 'home').map((module) => {
              const isSelected = selectedModules.includes(module.id);
              const selectionIndex = selectedModules.indexOf(module.id);
              
              return (
                <button
                  key={module.id}
                  onClick={() => {
                    let newSelection: string[];
                    
                    if (isSelected) {
                      // Retirer le module
                      newSelection = selectedModules.filter(id => id !== module.id);
                    } else {
                      // Ajouter le module (max 3)
                      if (selectedModules.length >= 3) {
                        // Remplacer le plus ancien
                        newSelection = [...selectedModules.slice(1), module.id];
                      } else {
                        newSelection = [...selectedModules, module.id];
                      }
                    }
                    
                    setSelectedModules(newSelection);
                  }}
                  className={`
                    relative p-6 rounded-2xl transition-all duration-300 transform hover:scale-105
                    focus:outline-none focus:ring-4 focus:ring-blue-500/50
                    ${isSelected 
                      ? 'module-card-selected' 
                      : 'module-card-unselected'
                    }
                  `}
                  aria-pressed={isSelected}
                  aria-describedby={`module-${module.id}-desc`}
                >
                  {/* Indicateur de sélection avec numéro d'ordre */}
                  {isSelected && (
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-lg selection-indicator border-2 border-white">
                      {selectionIndex + 1}
                    </div>
                  )}
                  
                  {/* Checkmark pour les modules sélectionnés */}
                  {isSelected && (
                    <div className="absolute top-3 left-3 w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center selection-checkmark shadow-md">
                      <span className="text-sm font-bold">✓</span>
                    </div>
                  )}
                  
                  <div className="flex flex-col items-center space-y-3">
                    <span className="text-4xl">{module.icon}</span>
                    <div className="text-center">
                      <h3 className={`font-bold text-base ${isSelected ? 'text-blue-700' : 'text-gray-800'}`}>
                        {module.label}
                      </h3>
                      <p 
                        id={`module-${module.id}-desc`}
                        className={`text-sm mt-1 ${isSelected ? 'text-blue-600' : 'text-gray-500'}`}
                      >
                        {module.description}
                      </p>
                    </div>
                  </div>
                  
                  {/* Effet de sélection avec glow */}
                  {isSelected && (
                    <div className="absolute inset-0 border-3 border-blue-500 rounded-2xl bg-blue-500/5 pointer-events-none">
                      <div className="absolute inset-1 border border-blue-400/50 rounded-xl bg-gradient-to-br from-blue-50/80 via-transparent to-blue-50/40"></div>
                      {/* Glow effect */}
                      <div className="absolute -inset-1 bg-blue-500/20 rounded-2xl blur-sm -z-10"></div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <div className="text-xs text-gray-500 mt-6">
            💡 Tu pourras accéder à tous les modules plus tard, cette sélection aide juste à personnaliser ton expérience
          </div>
        </div>
      )
    },
    {
      title: '🚀 C\'est parti !',
      content: (
        <div className="text-center space-y-6">
          <div className="text-6xl mb-4">🎉</div>
          <h3 className="text-xl font-semibold text-gray-800">
            Parfait {userName ? userName : 'mon ami'} !
          </h3>
          <p className="text-gray-600 max-w-md mx-auto">
            Votre ADHD Life Assistant est configuré. L'interface s'adapte maintenant à votre humeur.
          </p>
          {selectedModules.length > 0 && (
            <div className="bg-green-50 p-6 rounded-lg max-w-lg mx-auto">
              <h4 className="font-semibold text-green-800 mb-3">🌟 Vos modules sélectionnés :</h4>
              <div className="grid grid-cols-1 gap-2 text-sm text-green-700">
                {selectedModules.map(moduleId => {
                  const module = NAVIGATION_ITEMS.find(m => m.id === moduleId);
                  return module ? (
                    <div key={moduleId} className="flex items-center gap-2">
                      <span>{module.icon}</span>
                      <span>{module.label}</span>
                    </div>
                  ) : null;
                })}
              </div>
            </div>
          )}
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-700">
              💡 Conseil : Explorez vos modules sélectionnés en premier !
            </p>
          </div>
        </div>
      )
    }
  ];

  const handleNext = () => {
    if (currentStep === 1 && !userName.trim()) {
      return; // Ne pas avancer si pas de nom
    }
    if (currentStep === 2 && !selectedMood) {
      return; // Ne pas avancer si pas de mood
    }
    if (currentStep === 3 && selectedModules.length === 0) {
      return; // Ne pas avancer si aucun module sélectionné
    }
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Finaliser l'onboarding
      if (selectedMood) {
        setMood(selectedMood as any);
      }
      if (userName) {
        localStorage.setItem('adhd-assistant-username', userName);
      }
      if (selectedModules.length > 0) {
        localStorage.setItem('adhd-favorite-modules', JSON.stringify(selectedModules));
      }
      localStorage.setItem('adhd-assistant-onboarded', 'true');
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceed = () => {
    if (currentStep === 1) return userName.trim().length > 0;
    if (currentStep === 2) return selectedMood !== '';
    if (currentStep === 3) return selectedModules.length > 0;
    return true;
  };

  const progressPercentage = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Progress bar */}
        <div className="progress-bar m-6 mb-0">
          <div 
            className="progress-bar-fill" 
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        
        {/* Header */}
        <div className="p-6 pb-0">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-lg font-semibold text-gray-800">
              {steps[currentStep].title}
            </h1>
            <div className="text-sm text-gray-500">
              {currentStep + 1} / {steps.length}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 pt-4 module-transition">
          {steps[currentStep].content}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center p-6 pt-0 border-t border-gray-100">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            ← Précédent
          </button>
          
          <button
            onClick={handleNext}
            disabled={!canProceed()}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {currentStep === steps.length - 1 ? '🚀 Commencer' : 'Suivant →'}
          </button>
        </div>
      </div>
    </div>
  );
}

export function useOnboarding() {
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  useEffect(() => {
    // Vérifier si l'onboarding personnalisé a été complété
    const profileData = localStorage.getItem('adhd-user-profile');
    if (profileData) {
      try {
        const profile = JSON.parse(profileData);
        setNeedsOnboarding(!profile.onboardingCompleted);
      } catch {
        setNeedsOnboarding(true);
      }
    } else {
      setNeedsOnboarding(true);
    }
  }, []);

  const completeOnboarding = () => {
    setNeedsOnboarding(false);
  };

  return {
    needsOnboarding,
    completeOnboarding
  };
}