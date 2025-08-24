'use client';

import React, { useState } from 'react';
import { useProfile } from '@/hooks/useProfile';
import { useAppSettings } from '@/hooks/useAppSettings';
import { CHRONOTYPES, ADHD_CHALLENGES, ADHDChallenge } from '@/types/profile';

export function PreferencesSection() {
  const { 
    profile, 
    updateChronotype, 
    updateChallenges 
  } = useProfile();
  
  const { 
    settings, 
    updateNotificationLevel,
    toggleSound,
    toggleDiscreetMode,
    updateMedicationReminders
  } = useAppSettings();

  const [selectedChallenges, setSelectedChallenges] = useState<ADHDChallenge[]>(
    profile.challenges || []
  );

  const handleChronotypeChange = (newChronotype: 'morning' | 'evening' | 'flexible') => {
    updateChronotype(newChronotype);
  };

  const handleChallengeToggle = (challengeId: string) => {
    const challengeData = ADHD_CHALLENGES[challengeId as ADHDChallenge];
    if (!challengeData) return;

    let newChallenges: ADHDChallenge[];
    
    const isSelected = selectedChallenges.some(c => c === challengeId);
    
    if (isSelected) {
      newChallenges = selectedChallenges.filter(c => c !== challengeId);
    } else {
      if (selectedChallenges.length >= 3) return; // Max 3 défis
      newChallenges = [...selectedChallenges, challengeId as ADHDChallenge];
    }
    
    setSelectedChallenges(newChallenges);
    updateChallenges(newChallenges);
  };

  const isChallengeSelected = (challengeId: string) => {
    return selectedChallenges.some(c => c === challengeId);
  };

  const canSelectMore = selectedChallenges.length < 3;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">⏰ Préférences</h2>
        <p className="text-gray-600">Adaptez l'application à votre rythme et vos besoins</p>
      </div>

      {/* Chronotype */}
      <div className="bg-orange-50 p-6 rounded-xl">
        <h3 className="text-lg font-semibold text-orange-800 mb-4">🌅 Chronotype - Votre rythme naturel</h3>
        
        <div className="space-y-4">
          <p className="text-sm text-orange-700">
            Votre chronotype influence quand vous êtes le plus productif. Cela nous aide à adapter les notifications 
            et les conseils à vos heures d'efficacité maximale.
          </p>
          
          <div className="grid gap-4">
            {Object.entries(CHRONOTYPES).map(([key, option]) => (
              <div key={key} className="flex items-start gap-4">
                <input
                  type="radio"
                  id={key}
                  name="chronotype"
                  checked={profile.chronotype === key}
                  onChange={() => handleChronotypeChange(key as any)}
                  className="mt-2 text-orange-600 focus:ring-orange-500"
                />
                <label htmlFor={key} className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{option.icon}</span>
                    <span className="font-medium text-orange-800">{option.label}</span>
                  </div>
                  <p className="text-sm text-orange-700">{option.description}</p>
                  <p className="text-xs text-orange-600 mt-1 italic">
                    Heures productives: {option.peakHours.join('h, ')}h
                  </p>
                </label>
              </div>
            ))}
          </div>
          
          {profile.chronotype && (
            <div className="mt-4 p-4 bg-white rounded-lg border border-orange-200">
              <div className="flex items-center gap-2 text-orange-700">
                <span className="text-lg">✓</span>
                <span className="font-medium">Chronotype actuel: {CHRONOTYPES[profile.chronotype]?.label}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Défis ADHD */}
      <div className="bg-purple-50 p-6 rounded-xl">
        <h3 className="text-lg font-semibold text-purple-800 mb-4">🎯 Défis ADHD - Vos priorités</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-purple-700">
              Choisissez jusqu'à 3 défis sur lesquels vous voulez vous concentrer
            </p>
            <span className="text-sm font-medium text-purple-600">
              {selectedChallenges.length}/3 sélectionnés
            </span>
          </div>
          
          <div className="grid md:grid-cols-2 gap-3">
            {Object.entries(ADHD_CHALLENGES).map(([challengeId, challenge]) => {
              const isSelected = isChallengeSelected(challengeId);
              const canSelect = canSelectMore || isSelected;
              
              return (
                <button
                  key={challengeId}
                  onClick={() => handleChallengeToggle(challengeId)}
                  disabled={!canSelect}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    isSelected
                      ? 'border-purple-400 bg-purple-100 text-purple-800'
                      : canSelect
                      ? 'border-purple-200 hover:border-purple-300 hover:bg-purple-50'
                      : 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{challenge.icon}</span>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium">{challenge.label}</div>
                      <div className="text-sm opacity-80">{challenge.description}</div>
                    </div>
                    {isSelected && (
                      <span className="text-purple-600 text-xl">✓</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
          
          {selectedChallenges.length > 0 && (
            <div className="mt-6 p-4 bg-white rounded-lg border border-purple-200">
              <h4 className="font-medium text-purple-800 mb-2">Vos défis sélectionnés:</h4>
              <div className="flex flex-wrap gap-2">
                {selectedChallenges.map((challengeId) => {
                  const challenge = ADHD_CHALLENGES[challengeId];
                  return (
                    <div key={challengeId} className="flex items-center gap-2 px-3 py-1 bg-purple-100 rounded-full text-sm text-purple-700">
                      <span>{challenge.icon}</span>
                      <span>{challenge.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-blue-50 p-6 rounded-xl">
        <h3 className="text-lg font-semibold text-blue-800 mb-4">🔔 Notifications générales</h3>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-blue-700 mb-3">
              Niveau de notifications
            </label>
            <div className="grid gap-4">
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  id="calm"
                  name="notification-level"
                  checked={settings.notificationLevel === 'calm'}
                  onChange={() => updateNotificationLevel('calm')}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="calm" className="flex-1">
                  <div className="font-medium text-blue-800">🧘 Calme</div>
                  <div className="text-sm text-blue-600">Notifications discrètes, moins fréquentes</div>
                </label>
              </div>
              
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  id="normal"
                  name="notification-level"
                  checked={settings.notificationLevel === 'normal'}
                  onChange={() => updateNotificationLevel('normal')}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="normal" className="flex-1">
                  <div className="font-medium text-blue-800">⚖️ Normal</div>
                  <div className="text-sm text-blue-600">Équilibre entre rappels et tranquillité</div>
                </label>
              </div>
              
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  id="active"
                  name="notification-level"
                  checked={settings.notificationLevel === 'active'}
                  onChange={() => updateNotificationLevel('active')}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="active" className="flex-1">
                  <div className="font-medium text-blue-800">⚡ Actif</div>
                  <div className="text-sm text-blue-600">Rappels fréquents et encouragements réguliers</div>
                </label>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 pt-4 border-t border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-blue-800">Sons activés</div>
                <div className="text-sm text-blue-600">Notifications sonores pour les rappels</div>
              </div>
              <button
                onClick={toggleSound}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.soundEnabled ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    settings.soundEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-blue-800">Mode discret</div>
                <div className="text-sm text-blue-600">Désactive temporairement toutes les notifications</div>
              </div>
              <button
                onClick={toggleDiscreetMode}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.discreetMode ? 'bg-orange-500' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    settings.discreetMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {settings.discreetMode && (
            <div className="p-3 bg-orange-100 border border-orange-200 rounded-lg">
              <div className="flex items-center gap-2 text-orange-700">
                <span className="text-lg">🤫</span>
                <span className="text-sm font-medium">Mode discret activé - Toutes les notifications sont suspendues</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Conseils personnalisés */}
      <div className="bg-green-50 p-6 rounded-xl">
        <h4 className="font-semibold text-green-800 mb-3">💡 Conseils pour vos préférences</h4>
        <div className="text-sm text-green-700 space-y-2">
          <p>• <strong>Chronotype :</strong> Vos notifications importantes seront programmées pendant vos heures de productivité</p>
          <p>• <strong>Défis ADHD :</strong> L'application adaptera ses conseils et outils selon vos priorités</p>
          <p>• <strong>Notifications :</strong> Le niveau choisi influence la fréquence des rappels et encouragements</p>
          <p>• <strong>Mode discret :</strong> Parfait pour les réunions ou moments de concentration intense</p>
        </div>
      </div>
    </div>
  );
}