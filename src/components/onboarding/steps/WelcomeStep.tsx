'use client';

import React from 'react';
import { OnboardingStepProps } from '@/types/profile';

export function WelcomeStep({ onNext }: OnboardingStepProps) {
  return (
    <div className="text-center space-y-6">
      <div className="text-6xl mb-6">👋</div>
      
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-800">
          Salut ! Je suis ton assistant ADHD personnel.
        </h2>
        
        <p className="text-lg text-gray-600 max-w-lg mx-auto leading-relaxed">
          Quelques questions pour mieux t'aider au quotidien ?
        </p>
      </div>

      <div className="bg-blue-50 p-6 rounded-xl max-w-md mx-auto">
        <div className="space-y-3 text-sm text-blue-700">
          <div className="flex items-center gap-3">
            <span className="text-lg">🎯</span>
            <span>Interface qui s'adapte à ton humeur</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-lg">💡</span>
            <span>Conseils personnalisés selon tes défis</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-lg">🔒</span>
            <span>Tes données restent sur ton appareil</span>
          </div>
        </div>
      </div>

      <div className="text-center pt-4">
        <button
          onClick={onNext}
          className="btn-primary text-lg px-8 py-3"
        >
          C'est parti ! 🚀
        </button>
      </div>

      <div className="text-xs text-gray-500 mt-6">
        ⏱️ 2-3 minutes seulement • Tu peux modifier tes réponses plus tard
      </div>
    </div>
  );
}