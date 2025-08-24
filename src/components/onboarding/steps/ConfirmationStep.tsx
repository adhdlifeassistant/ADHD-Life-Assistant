'use client';

import React from 'react';
import { OnboardingStepProps, ADHD_CHALLENGES, CHRONOTYPES } from '@/types/profile';

export function ConfirmationStep({ data, onNext }: OnboardingStepProps) {
  const { name, age, medications, chronotype, challenges } = data;

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold text-gray-800">
          Parfait ! Je te connais mieux maintenant {name} ! 😊
        </h2>
        <p className="text-lg text-gray-600">
          Ton assistant personnel est configuré !
        </p>
      </div>

      {/* Résumé du profil */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-xl max-w-2xl mx-auto">
        <h3 className="font-semibold text-gray-800 mb-4 text-center">
          📋 Ton profil ADHD
        </h3>
        
        <div className="space-y-4">
          {/* Identité */}
          <div className="bg-white bg-opacity-60 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">👤</span>
              <span className="font-medium text-gray-700">Identité</span>
            </div>
            <div className="text-sm text-gray-600">
              {name}{age ? `, ${age} ans` : ''}
            </div>
          </div>

          {/* Chronotype */}
          <div className="bg-white bg-opacity-60 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">{CHRONOTYPES[chronotype!].icon}</span>
              <span className="font-medium text-gray-700">Rythme</span>
            </div>
            <div className="text-sm text-gray-600">
              {CHRONOTYPES[chronotype!].label}
            </div>
          </div>

          {/* Médications */}
          {medications && medications.length > 0 && (
            <div className="bg-white bg-opacity-60 p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">💊</span>
                <span className="font-medium text-gray-700">Médications</span>
              </div>
              <div className="text-sm text-gray-600 space-y-1">
                {medications.map((med, index) => (
                  <div key={index}>
                    {med.name} à {med.time}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Défis */}
          {challenges && challenges.length > 0 && (
            <div className="bg-white bg-opacity-60 p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">🎯</span>
                <span className="font-medium text-gray-700">Tes défis principaux</span>
              </div>
              <div className="text-sm text-gray-600 space-y-1">
                {challenges.map((challenge, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span>{ADHD_CHALLENGES[challenge].icon}</span>
                    <span>{ADHD_CHALLENGES[challenge].label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Ce qui change maintenant */}
      <div className="bg-green-50 p-6 rounded-xl max-w-2xl mx-auto">
        <h4 className="font-semibold text-green-800 mb-3">
          ✨ Ce qui change maintenant
        </h4>
        <div className="text-sm text-green-700 space-y-2">
          <p>🎨 Interface adaptée à ton rythme {CHRONOTYPES[chronotype!].label.toLowerCase()}</p>
          <p>💬 Messages personnalisés avec ton prénom {name}</p>
          {medications && medications.length > 0 && (
            <p>⏰ Rappels configurés pour tes médications</p>
          )}
          {challenges && challenges.length > 0 && (
            <p>🎯 Modules prioritaires selon tes défis</p>
          )}
          <p>📊 Analytics personnalisées qui s'enrichiront avec ton usage</p>
        </div>
      </div>

      {/* Première étape suggérée */}
      <div className="bg-blue-50 p-6 rounded-xl max-w-2xl mx-auto">
        <h4 className="font-semibold text-blue-800 mb-3">
          🚀 Par quoi commencer ?
        </h4>
        <div className="text-sm text-blue-700 space-y-2">
          <p>1. <strong>Définis ton humeur du moment</strong> dans le dashboard</p>
          {challenges?.includes('impulse-spending') && (
            <p>2. <strong>Explore le module Finances</strong> avec ses réflexions anti-impulsion</p>
          )}
          {challenges?.includes('cleaning-tidying') && (
            <p>2. <strong>Essaie le module Ménage</strong> avec une tâche de 5 minutes</p>
          )}
          {challenges?.includes('organization') && (
            <p>2. <strong>Configure tes premières tâches</strong> dans le module Organisation</p>
          )}
          {medications && medications.length > 0 && (
            <p>3. <strong>Vérifie tes rappels</strong> de médication</p>
          )}
          <p>{medications && medications.length > 0 ? '4' : '3'}. <strong>Reviens régulièrement</strong> pour que je te connaisse mieux ! 📈</p>
        </div>
      </div>

      {/* Bouton final */}
      <div className="text-center pt-6">
        <button
          onClick={onNext}
          className="btn-primary text-lg px-8 py-4 shadow-lg"
        >
          🎯 Commencer à utiliser l'app !
        </button>
      </div>

      <div className="text-center text-xs text-gray-500 space-y-1">
        <p>💡 Tu peux modifier ton profil à tout moment dans les paramètres</p>
        <p>🔒 Toutes tes données restent privées sur ton appareil</p>
      </div>
    </div>
  );
}