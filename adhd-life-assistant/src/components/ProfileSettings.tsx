'use client';

import React, { useState } from 'react';
import { useProfile } from '@/hooks/useProfile';
import { ADHD_CHALLENGES, CHRONOTYPES, MEDICATION_FREQUENCIES, ADHDChallenge, ProfileMedication } from '@/types/profile';

interface ProfileSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProfileSettings({ isOpen, onClose }: ProfileSettingsProps) {
  const { 
    profile, 
    updateName, 
    updateAge, 
    updateChronotype, 
    updateChallenges,
    addMedication,
    removeMedication,
    clearProfile
  } = useProfile();

  const [tempName, setTempName] = useState(profile.name);
  const [tempAge, setTempAge] = useState(profile.age?.toString() || '');
  const [showAddMedication, setShowAddMedication] = useState(false);
  const [newMedication, setNewMedication] = useState({
    name: '',
    time: '',
    frequency: 'daily' as ProfileMedication['frequency']
  });

  const handleSaveName = () => {
    if (tempName.trim()) {
      updateName(tempName.trim());
    }
  };

  const handleSaveAge = () => {
    const age = tempAge ? parseInt(tempAge) : undefined;
    updateAge(age);
  };

  const handleChallengeToggle = (challenge: ADHDChallenge) => {
    const currentChallenges = [...profile.challenges];
    const index = currentChallenges.indexOf(challenge);
    
    if (index >= 0) {
      currentChallenges.splice(index, 1);
    } else if (currentChallenges.length < 3) {
      currentChallenges.push(challenge);
    }
    
    updateChallenges(currentChallenges);
  };

  const handleAddMedication = () => {
    if (newMedication.name && newMedication.time) {
      addMedication(newMedication);
      setNewMedication({ name: '', time: '', frequency: 'daily' });
      setShowAddMedication(false);
    }
  };

  const handleResetProfile = () => {
    if (confirm('⚠️ Êtes-vous sûr de vouloir réinitialiser votre profil ? Cette action supprimera toutes vos informations personnelles.')) {
      clearProfile();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="card-elevated max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">👤 Mon Profil ADHD</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Identité */}
          <section>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">👤 Identité</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prénom
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus-ring"
                  />
                  <button
                    onClick={handleSaveName}
                    disabled={tempName === profile.name}
                    className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    ✓
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Âge (optionnel)
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="13"
                    max="100"
                    value={tempAge}
                    onChange={(e) => setTempAge(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus-ring"
                  />
                  <button
                    onClick={handleSaveAge}
                    disabled={tempAge === (profile.age?.toString() || '')}
                    className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    ✓
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Chronotype */}
          <section>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">🕐 Mon Rythme</h3>
            <div className="grid md:grid-cols-3 gap-4">
              {Object.entries(CHRONOTYPES).map(([key, chronotype]) => (
                <button
                  key={key}
                  onClick={() => updateChronotype(key as any)}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    profile.chronotype === key
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="text-2xl mb-2">{chronotype.icon}</div>
                  <div className="font-medium text-gray-800 mb-1">{chronotype.label}</div>
                  <div className="text-sm text-gray-600">{chronotype.description}</div>
                </button>
              ))}
            </div>
          </section>

          {/* Défis ADHD */}
          <section>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              🎯 Mes Défis ADHD ({profile.challenges.length}/3)
            </h3>
            <div className="grid md:grid-cols-2 gap-3">
              {Object.entries(ADHD_CHALLENGES).map(([key, challenge]) => {
                const isSelected = profile.challenges.includes(key as ADHDChallenge);
                const isDisabled = !isSelected && profile.challenges.length >= 3;

                return (
                  <button
                    key={key}
                    onClick={() => handleChallengeToggle(key as ADHDChallenge)}
                    disabled={isDisabled}
                    className={`p-3 rounded-lg border-2 transition-all text-left ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50'
                        : isDisabled
                        ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{challenge.icon}</span>
                      <div>
                        <div className="font-medium text-gray-800">{challenge.label}</div>
                        <div className="text-sm text-gray-600">{challenge.description}</div>
                      </div>
                      {isSelected && <span className="text-blue-500 text-lg">✓</span>}
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Médications */}
          <section>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">💊 Mes Médications</h3>
            
            {profile.medications.length > 0 && (
              <div className="space-y-3 mb-4">
                {profile.medications.map((med) => (
                  <div key={med.id} className="flex items-center justify-between bg-blue-50 p-3 rounded-lg">
                    <div>
                      <div className="font-medium text-blue-800">{med.name}</div>
                      <div className="text-sm text-blue-600">
                        {med.time} • {MEDICATION_FREQUENCIES[med.frequency]}
                      </div>
                    </div>
                    <button
                      onClick={() => removeMedication(med.id)}
                      className="text-red-500 hover:text-red-700 p-2"
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            )}

            {showAddMedication ? (
              <div className="border-2 border-dashed border-blue-300 p-4 rounded-lg space-y-3">
                <div className="grid md:grid-cols-3 gap-3">
                  <input
                    type="text"
                    placeholder="Nom du médicament"
                    value={newMedication.name}
                    onChange={(e) => setNewMedication(prev => ({ ...prev, name: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus-ring"
                  />
                  <input
                    type="time"
                    value={newMedication.time}
                    onChange={(e) => setNewMedication(prev => ({ ...prev, time: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus-ring"
                  />
                  <select
                    value={newMedication.frequency}
                    onChange={(e) => setNewMedication(prev => ({ ...prev, frequency: e.target.value as any }))}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus-ring"
                  >
                    {Object.entries(MEDICATION_FREQUENCIES).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowAddMedication(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleAddMedication}
                    disabled={!newMedication.name || !newMedication.time}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Ajouter
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowAddMedication(true)}
                className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
              >
                + Ajouter une médication
              </button>
            )}
          </section>

          {/* Actions dangereuses */}
          <section className="border-t pt-6">
            <h3 className="text-lg font-semibold text-red-600 mb-4">⚠️ Zone Dangereuse</h3>
            <button
              onClick={handleResetProfile}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              🗑️ Réinitialiser mon profil
            </button>
            <div className="text-xs text-gray-500 mt-2">
              Cette action supprimera toutes vos informations personnelles de manière permanente.
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="border-t p-6">
          <div className="text-center">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}