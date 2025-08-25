'use client';

import React, { useState } from 'react';
import { useProfile } from '@/hooks/useProfile';
import { useAppSettings } from '@/hooks/useAppSettings';
import { CHRONOTYPES, ADHD_CHALLENGES, ADHDChallenge } from '@/types/profile';
import { NAVIGATION_ITEMS } from '@/modules/dashboard/DashboardContext';

export function PreferencesSection() {
  const { 
    profile, 
    updateChronotype, 
    updateChallenges,
    updateFavoriteModules 
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
  
  const [selectedModules, setSelectedModules] = useState<string[]>(
    profile.favoriteModules || []
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

  const handleModuleToggle = (moduleId: string) => {
    let newSelection: string[];
    
    if (selectedModules.includes(moduleId)) {
      // Retirer le module
      newSelection = selectedModules.filter(id => id !== moduleId);
    } else {
      // Ajouter le module (max 3)
      if (selectedModules.length >= 3) {
        // Remplacer le plus ancien
        newSelection = [...selectedModules.slice(1), moduleId];
      } else {
        newSelection = [...selectedModules, moduleId];
      }
    }
    
    setSelectedModules(newSelection);
    updateFavoriteModules(newSelection);
  };

  const isModuleSelected = (moduleId: string) => {
    return selectedModules.includes(moduleId);
  };

  const canSelectMoreModules = selectedModules.length < 3;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">⏰ Préférences</h2>
        <p className="text-gray-600">Adaptez l'application à votre rythme et vos besoins</p>
      </div>

      {/* Modules préférés */}
      <div className="bg-blue-50 p-6 rounded-xl">
        <h3 className="text-lg font-semibold text-blue-800 mb-4">🎯 Modules préférés</h3>
        
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-200 shadow-sm">
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
              <p className="text-sm text-blue-600">
                Vos modules favoris apparaissent en premier dans le menu
              </p>
              {selectedModules.length >= 3 ? (
                <p className="text-sm text-blue-600 mt-1">
                  ✨ Parfait ! Vous pouvez encore les modifier
                </p>
              ) : (
                <p className="text-sm text-blue-600 mt-1">
                  Encore {3 - selectedModules.length} module(s) à choisir
                </p>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {NAVIGATION_ITEMS.filter(module => module.id !== 'home').map((module) => {
              const isSelected = isModuleSelected(module.id);
              const canSelect = canSelectMoreModules || isSelected;
              const selectionIndex = selectedModules.indexOf(module.id);
              
              return (
                <button
                  key={module.id}
                  onClick={() => handleModuleToggle(module.id)}
                  disabled={!canSelect}
                  className={`
                    relative p-6 rounded-2xl border-3 transition-all duration-300 transform hover:scale-105
                    focus:outline-none focus:ring-4 focus:ring-blue-500/50
                    ${isSelected 
                      ? 'module-card-selected' 
                      : canSelect 
                      ? 'module-card-unselected'
                      : 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed opacity-60'
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
          
          {selectedModules.length > 0 && (
            <div className="mt-6 p-4 bg-white rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-800 mb-2">Vos modules préférés:</h4>
              <div className="flex flex-wrap gap-2">
                {selectedModules.map((moduleId) => {
                  const module = NAVIGATION_ITEMS.find(m => m.id === moduleId);
                  return module ? (
                    <div key={moduleId} className="flex items-center gap-2 px-3 py-1 bg-blue-100 rounded-full text-sm text-blue-700">
                      <span>{module.icon}</span>
                      <span>{module.label}</span>
                    </div>
                  ) : null;
                })}
              </div>
            </div>
          )}
        </div>
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
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-2xl border border-purple-200 shadow-sm">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-3">
                <div className="flex space-x-1">
                  {[...Array(3)].map((_, index) => (
                    <div
                      key={index}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        index < selectedChallenges.length
                          ? 'bg-purple-500 scale-110 shadow-md'
                          : 'bg-purple-200'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <p className="font-medium text-purple-700 mb-1">
                {selectedChallenges.length} / 3 défis sélectionnés
              </p>
              <p className="text-sm text-purple-600">
                Choisissez vos priorités ADHD pour des conseils personnalisés
              </p>
              {selectedChallenges.length >= 3 ? (
                <p className="text-sm text-purple-600 mt-1">
                  ✨ Parfait ! Vous pouvez encore modifier vos choix
                </p>
              ) : (
                <p className="text-sm text-purple-600 mt-1">
                  Encore {3 - selectedChallenges.length} défi(s) à choisir
                </p>
              )}
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            {Object.entries(ADHD_CHALLENGES).map(([challengeId, challenge]) => {
              const isSelected = isChallengeSelected(challengeId);
              const canSelect = canSelectMore || isSelected;
              const selectionIndex = selectedChallenges.indexOf(challengeId as any);
              
              return (
                <button
                  key={challengeId}
                  onClick={() => handleChallengeToggle(challengeId)}
                  disabled={!canSelect}
                  className={`
                    relative p-6 rounded-2xl border-3 text-left transition-all duration-300 transform hover:scale-105
                    focus:outline-none focus:ring-4 focus:ring-purple-500/50
                    ${isSelected
                      ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-purple-100 shadow-lg shadow-purple-500/25'
                      : canSelect
                      ? 'border-purple-200 bg-white hover:border-purple-300 hover:bg-purple-50/30 shadow-sm hover:shadow-md'
                      : 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed opacity-60'
                    }
                  `}
                  aria-pressed={isSelected}
                  aria-describedby={`challenge-${challengeId}-desc`}
                >
                  {/* Indicateur de sélection avec numéro d'ordre */}
                  {isSelected && (
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-lg selection-indicator border-2 border-white">
                      {selectionIndex + 1}
                    </div>
                  )}
                  
                  {/* Checkmark pour les défis sélectionnés */}
                  {isSelected && (
                    <div className="absolute top-3 left-3 w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center selection-checkmark shadow-md">
                      <span className="text-sm font-bold">✓</span>
                    </div>
                  )}

                  <div className="flex flex-col items-center space-y-3 pt-2">
                    <span className="text-4xl">{challenge.icon}</span>
                    <div className="text-center">
                      <h4 className={`font-bold text-base ${isSelected ? 'text-purple-700' : 'text-gray-800'}`}>
                        {challenge.label}
                      </h4>
                      <p 
                        id={`challenge-${challengeId}-desc`}
                        className={`text-sm mt-1 ${isSelected ? 'text-purple-600' : 'text-gray-500'}`}
                      >
                        {challenge.description}
                      </p>
                    </div>
                  </div>

                  {/* Effet de sélection avec glow */}
                  {isSelected && (
                    <div className="absolute inset-0 border-3 border-purple-500 rounded-2xl bg-purple-500/5 pointer-events-none">
                      <div className="absolute inset-1 border border-purple-400/50 rounded-xl bg-gradient-to-br from-purple-50/80 via-transparent to-purple-50/40"></div>
                      {/* Glow effect */}
                      <div className="absolute -inset-1 bg-purple-500/20 rounded-2xl blur-sm -z-10"></div>
                    </div>
                  )}
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