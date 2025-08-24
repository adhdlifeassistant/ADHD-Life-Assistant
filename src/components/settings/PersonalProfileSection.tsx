'use client';

import React, { useState } from 'react';
import { useProfile } from '@/hooks/useProfile';
import { useAppSettings } from '@/hooks/useAppSettings';
import { AVATAR_EMOJIS } from '@/types/settings';

export function PersonalProfileSection() {
  const { profile, updateName, updateAge } = useProfile();
  const { settings, updateAvatar } = useAppSettings();
  
  const [tempName, setTempName] = useState(profile.name);
  const [tempAge, setTempAge] = useState(profile.age?.toString() || '');
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  const handleSaveName = () => {
    if (tempName.trim() && tempName !== profile.name) {
      updateName(tempName.trim());
    }
  };

  const handleSaveAge = () => {
    const age = tempAge ? parseInt(tempAge) : undefined;
    if (age !== profile.age) {
      updateAge(age);
    }
  };

  const handleAvatarSelect = (emoji: string) => {
    updateAvatar(emoji);
    setShowAvatarPicker(false);
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">🏷️ Profil Personnel</h2>
        <p className="text-gray-600">Personnalisez votre identité dans l'application</p>
      </div>

      {/* Avatar */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-xl">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Photo de Profil</h3>
        
        <div className="flex items-center gap-6">
          <div className="text-center">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-4xl shadow-lg mb-3">
              {settings.avatar || '😊'}
            </div>
            <button
              onClick={() => setShowAvatarPicker(!showAvatarPicker)}
              className="px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium shadow-sm"
            >
              Changer
            </button>
          </div>
          
          <div className="flex-1">
            <h4 className="font-medium text-gray-800 mb-2">Avatar Emoji</h4>
            <p className="text-sm text-gray-600 mb-4">
              Choisissez un emoji qui vous représente. Il apparaîtra dans vos messages personnalisés et votre profil.
            </p>
            
            {showAvatarPicker && (
              <div className="grid grid-cols-8 gap-2 p-4 bg-white rounded-lg border max-w-lg">
                {AVATAR_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => handleAvatarSelect(emoji)}
                    className={`w-10 h-10 text-xl rounded-lg hover:bg-blue-50 transition-colors ${
                      settings.avatar === emoji ? 'bg-blue-100 ring-2 ring-blue-400' : ''
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Informations personnelles */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-800">Informations Personnelles</h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* Prénom */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Prénom <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Votre prénom"
              />
              <button
                onClick={handleSaveName}
                disabled={!tempName.trim() || tempName === profile.name}
                className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                ✓
              </button>
            </div>
            {profile.name && (
              <div className="mt-2 text-sm text-green-600">
                ✓ Salut {profile.name} ! Les messages seront personnalisés avec ce prénom.
              </div>
            )}
          </div>

          {/* Âge */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Âge <span className="text-gray-400">(optionnel)</span>
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                min="13"
                max="100"
                value={tempAge}
                onChange={(e) => setTempAge(e.target.value)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Votre âge"
              />
              <button
                onClick={handleSaveAge}
                disabled={tempAge === (profile.age?.toString() || '')}
                className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                ✓
              </button>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              💡 L'âge aide à adapter le ton des messages et les conseils
            </div>
          </div>
        </div>
      </div>

      {/* Aperçu personnalisation */}
      {profile.name && (
        <div className="bg-green-50 p-6 rounded-xl">
          <h4 className="font-semibold text-green-800 mb-3">✨ Aperçu de votre personnalisation</h4>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-lg">
                {settings.avatar || '😊'}
              </div>
              <span className="text-green-700">
                "Salut {profile.name} ! Comment tu te sens aujourd'hui ?"
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-lg">
                🎯
              </div>
              <span className="text-green-700">
                "Super boulot {profile.name} ! Tu as terminé 3 tâches !"
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-lg">
                💡
              </div>
              <span className="text-green-700">
                "Petit conseil pour toi {profile.name}..."
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Statistiques du profil */}
      <div className="bg-gray-50 p-6 rounded-xl">
        <h4 className="font-semibold text-gray-800 mb-4">📊 Statistiques de votre profil</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {profile.medications?.length || 0}
            </div>
            <div className="text-sm text-gray-600">Médications</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {profile.challenges?.length || 0}
            </div>
            <div className="text-sm text-gray-600">Défis ADHD</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {profile.createdAt ? Math.floor((Date.now() - profile.createdAt) / (1000 * 60 * 60 * 24)) : 0}
            </div>
            <div className="text-sm text-gray-600">Jours d'usage</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {profile.chronotype === 'morning' ? '🌅' : profile.chronotype === 'evening' ? '🦉' : '😴'}
            </div>
            <div className="text-sm text-gray-600">Chronotype</div>
          </div>
        </div>
      </div>
    </div>
  );
}