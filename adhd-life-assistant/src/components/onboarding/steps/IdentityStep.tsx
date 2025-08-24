'use client';

import React from 'react';
import { OnboardingStepProps } from '@/types/profile';

export function IdentityStep({ data, updateData }: OnboardingStepProps) {
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateData({ name: e.target.value });
  };

  const handleAgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const age = e.target.value ? parseInt(e.target.value) : undefined;
    updateData({ age });
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <div className="text-4xl mb-4">👤</div>
        <h3 className="text-xl font-semibold text-gray-800">
          Comment tu veux que je t'appelle ?
        </h3>
        <p className="text-gray-600">
          Je personnaliserai mes messages avec ton prénom
        </p>
      </div>

      <div className="space-y-6 max-w-md mx-auto">
        {/* Prénom */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ton prénom <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={data.name || ''}
            onChange={handleNameChange}
            placeholder="Écris ton prénom..."
            className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            autoFocus
          />
          {data.name && (
            <div className="mt-2 text-sm text-green-600">
              ✓ Salut {data.name} ! 👋
            </div>
          )}
        </div>

        {/* Âge (optionnel) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ton âge <span className="text-gray-400">(optionnel)</span>
          </label>
          <input
            type="number"
            min="13"
            max="100"
            value={data.age || ''}
            onChange={handleAgeChange}
            placeholder="Pour adapter le ton des messages"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div className="mt-2 text-xs text-gray-500">
            💡 Aide à personnaliser le niveau de langage et les conseils
          </div>
        </div>
      </div>

      {/* Exemples de personnalisation */}
      {data.name && (
        <div className="bg-purple-50 p-4 rounded-lg max-w-md mx-auto">
          <h4 className="font-medium text-purple-800 mb-2">
            ✨ Exemple de personnalisation
          </h4>
          <div className="text-sm text-purple-700 space-y-1">
            <p>💬 "Salut {data.name}, comment tu te sens aujourd'hui ?"</p>
            <p>🎯 "Super {data.name} ! Tu as terminé 3 tâches !"</p>
            <p>💡 "Petit conseil pour toi {data.name}..."</p>
          </div>
        </div>
      )}
    </div>
  );
}