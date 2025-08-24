'use client';

import React from 'react';
import { OnboardingStepProps, CHRONOTYPES } from '@/types/profile';

export function ChronotypeStep({ data, updateData }: OnboardingStepProps) {
  const selectedChronotype = data.chronotype || 'flexible';

  const handleChronotypeChange = (chronotype: typeof data.chronotype) => {
    updateData({ chronotype });
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <div className="text-4xl mb-4">🕐</div>
        <h3 className="text-xl font-semibold text-gray-800">
          Tu es plutôt...?
        </h3>
        <p className="text-gray-600">
          Je vais optimiser tes notifications selon ton rythme naturel
        </p>
      </div>

      <div className="space-y-4 max-w-2xl mx-auto">
        {Object.entries(CHRONOTYPES).map(([key, chronotype]) => (
          <button
            key={key}
            onClick={() => handleChronotypeChange(key as typeof data.chronotype)}
            className={`w-full p-6 rounded-xl border-2 transition-all text-left ${
              selectedChronotype === key
                ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className="text-3xl">{chronotype.icon}</div>
              <div className="flex-1">
                <h4 className={`font-semibold text-lg mb-2 ${
                  selectedChronotype === key ? 'text-blue-800' : 'text-gray-800'
                }`}>
                  {chronotype.label}
                </h4>
                <p className={`text-sm mb-3 ${
                  selectedChronotype === key ? 'text-blue-700' : 'text-gray-600'
                }`}>
                  {chronotype.description}
                </p>
                
                {/* Heures de pointe */}
                <div className={`text-xs ${
                  selectedChronotype === key ? 'text-blue-600' : 'text-gray-500'
                }`}>
                  <span className="font-medium">Heures optimales : </span>
                  {chronotype.peakHours.map(hour => `${hour}h`).join(', ')}
                </div>
              </div>
              
              {selectedChronotype === key && (
                <div className="text-blue-500">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Explications personnalisées */}
      {selectedChronotype && (
        <div className="bg-purple-50 p-4 rounded-lg max-w-lg mx-auto">
          <h4 className="font-medium text-purple-800 mb-2">
            ✨ Ce que ça change pour toi
          </h4>
          <div className="text-sm text-purple-700 space-y-2">
            {selectedChronotype === 'morning' && (
              <>
                <p>• Tâches importantes programmées le matin</p>
                <p>• Rappels médication adaptés à ton réveil</p>
                <p>• Sessions de ménage suggérées avant midi</p>
              </>
            )}
            {selectedChronotype === 'evening' && (
              <>
                <p>• Notifications importantes décalées en fin de journée</p>
                <p>• Activités créatives suggérées le soir</p>
                <p>• Respect de tes matinées plus difficiles</p>
              </>
            )}
            {selectedChronotype === 'flexible' && (
              <>
                <p>• Suggestions adaptées aux créneaux moyens</p>
                <p>• Pas de contraintes horaires strictes</p>
                <p>• Tu peux ajuster selon tes périodes</p>
              </>
            )}
          </div>
        </div>
      )}

      <div className="text-center text-xs text-gray-500 max-w-md mx-auto">
        💡 Cette information m'aide à personnaliser les moments où je te propose des tâches et des rappels
      </div>
    </div>
  );
}