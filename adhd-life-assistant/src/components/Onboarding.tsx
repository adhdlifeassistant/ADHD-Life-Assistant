'use client';

import React, { useState, useEffect } from 'react';
import { useMood, MOOD_CONFIG } from '@/modules/mood/MoodContext';

interface OnboardingProps {
  onComplete: () => void;
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const { setMood } = useMood();
  const [currentStep, setCurrentStep] = useState(0);
  const [userName, setUserName] = useState('');
  const [selectedMood, setSelectedMood] = useState<string>('');

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
          <div className="bg-green-50 p-6 rounded-lg max-w-lg mx-auto">
            <h4 className="font-semibold text-green-800 mb-3">🌟 Vos modules disponibles :</h4>
            <div className="grid grid-cols-2 gap-2 text-sm text-green-700">
              <div>💰 Finances empathiques</div>
              <div>🧹 Ménage gamifié</div>
              <div>🏥 Suivi santé ADHD</div>
              <div>📊 Analytics personnels</div>
              <div>💊 Rappels médicaments</div>
              <div>🍳 Cuisine adaptative</div>
            </div>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-700">
              💡 Conseil : Commencez par explorer un module qui vous intéresse !
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