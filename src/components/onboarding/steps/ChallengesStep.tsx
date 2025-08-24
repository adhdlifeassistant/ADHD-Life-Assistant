'use client';

import React from 'react';
import { OnboardingStepProps, ADHDChallenge, ADHD_CHALLENGES } from '@/types/profile';

export function ChallengesStep({ data, updateData }: OnboardingStepProps) {
  const selectedChallenges = data.challenges || [];

  const handleChallengeToggle = (challenge: ADHDChallenge) => {
    const isSelected = selectedChallenges.includes(challenge);
    let updatedChallenges: ADHDChallenge[];

    if (isSelected) {
      updatedChallenges = selectedChallenges.filter(c => c !== challenge);
    } else if (selectedChallenges.length < 3) {
      updatedChallenges = [...selectedChallenges, challenge];
    } else {
      // Remplacer le premier si on en a déjà 3
      updatedChallenges = [challenge, ...selectedChallenges.slice(0, 2)];
    }

    updateData({ challenges: updatedChallenges });
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <div className="text-4xl mb-4">🎯</div>
        <h3 className="text-xl font-semibold text-gray-800">
          Tes 3 plus gros défis ADHD ?
        </h3>
        <p className="text-gray-600">
          Je vais prioriser les modules qui t'aideront le plus
        </p>
        <div className="text-sm text-blue-600 bg-blue-50 p-2 rounded-lg inline-block">
          {selectedChallenges.length}/3 défis sélectionnés
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-4xl mx-auto">
        {Object.entries(ADHD_CHALLENGES).map(([key, challenge]) => {
          const isSelected = selectedChallenges.includes(key as ADHDChallenge);
          const isDisabled = !isSelected && selectedChallenges.length >= 3;

          return (
            <button
              key={key}
              onClick={() => handleChallengeToggle(key as ADHDChallenge)}
              disabled={isDisabled}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                isSelected
                  ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                  : isDisabled
                  ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 cursor-pointer'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="text-2xl">{challenge.icon}</div>
                <div className="flex-1">
                  <h4 className={`font-medium mb-1 ${
                    isSelected ? 'text-blue-800' : isDisabled ? 'text-gray-400' : 'text-gray-800'
                  }`}>
                    {challenge.label}
                  </h4>
                  <p className={`text-sm ${
                    isSelected ? 'text-blue-700' : isDisabled ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {challenge.description}
                  </p>
                </div>
                
                {isSelected && (
                  <div className="text-blue-500 flex-shrink-0">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Conseils basés sur la sélection */}
      {selectedChallenges.length > 0 && (
        <div className="bg-green-50 p-4 rounded-lg max-w-2xl mx-auto">
          <h4 className="font-medium text-green-800 mb-3">
            🎯 Modules recommandés pour toi
          </h4>
          <div className="text-sm text-green-700 space-y-2">
            {selectedChallenges.includes('organization') && (
              <p>• <strong>📋 Dashboard</strong> - Vue d'ensemble pour structurer tes journées</p>
            )}
            {selectedChallenges.includes('time-management') && (
              <p>• <strong>⏰ Focus</strong> - Timers Pomodoro pour mieux gérer le temps</p>
            )}
            {selectedChallenges.includes('procrastination') && (
              <p>• <strong>✅ Tâches</strong> - Découpage en micro-actions motivantes</p>
            )}
            {selectedChallenges.includes('impulse-spending') && (
              <p>• <strong>💰 Finances</strong> - Réflexions anti-impulsion intégrées</p>
            )}
            {selectedChallenges.includes('cleaning-tidying') && (
              <p>• <strong>🧹 Ménage</strong> - Gamification douce pour motiver</p>
            )}
            {selectedChallenges.includes('memory-forgetting') && (
              <p>• <strong>💊 Rappels</strong> - Notifications intelligentes</p>
            )}
            {selectedChallenges.includes('emotional-regulation') && (
              <p>• <strong>🏥 Santé</strong> - Suivi émotionnel et bien-être</p>
            )}
          </div>
        </div>
      )}

      {/* Option skip */}
      {selectedChallenges.length === 0 && (
        <div className="text-center space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg max-w-md mx-auto">
            <p className="text-sm text-gray-600 mb-2">
              Pas sûr·e de tes défis principaux ?
            </p>
            <p className="text-xs text-gray-500">
              Aucun problème ! Tu découvriras au fur et à mesure. Tu peux modifier tes choix plus tard.
            </p>
          </div>
        </div>
      )}

      <div className="text-center text-xs text-gray-500 max-w-md mx-auto">
        💡 Ces informations m'aident à mettre en avant les outils les plus utiles pour toi dans l'interface
      </div>
    </div>
  );
}