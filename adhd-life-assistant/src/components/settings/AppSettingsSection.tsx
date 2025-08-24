'use client';

import React from 'react';
import { useAppSettings } from '@/hooks/useAppSettings';

export function AppSettingsSection() {
  const {
    settings,
    updateTheme,
    updateTextSize,
    toggleAnimations,
    updateMedicationReminders,
    toggleAutoBackup,
    updateBackupFrequency
  } = useAppSettings();

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">🔧 Paramètres Application</h2>
        <p className="text-gray-600">Personnalisez l'interface et le comportement de l'application</p>
      </div>

      {/* Apparence */}
      <div className="bg-indigo-50 p-6 rounded-xl">
        <h3 className="text-lg font-semibold text-indigo-800 mb-4">🎨 Apparence</h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* Thème */}
          <div>
            <label className="block text-sm font-medium text-indigo-700 mb-3">
              Thème
            </label>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  id="theme-auto"
                  name="theme"
                  checked={settings.theme === 'auto'}
                  onChange={() => updateTheme('auto')}
                  className="text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="theme-auto" className="flex items-center gap-2">
                  <span>🌓</span>
                  <span>Automatique (selon l'heure)</span>
                </label>
              </div>
              
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  id="theme-light"
                  name="theme"
                  checked={settings.theme === 'light'}
                  onChange={() => updateTheme('light')}
                  className="text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="theme-light" className="flex items-center gap-2">
                  <span>☀️</span>
                  <span>Clair</span>
                </label>
              </div>
              
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  id="theme-dark"
                  name="theme"
                  checked={settings.theme === 'dark'}
                  onChange={() => updateTheme('dark')}
                  className="text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="theme-dark" className="flex items-center gap-2">
                  <span>🌙</span>
                  <span>Sombre</span>
                </label>
              </div>
            </div>
          </div>

          {/* Taille du texte */}
          <div>
            <label className="block text-sm font-medium text-indigo-700 mb-3">
              Taille du texte
            </label>
            <select
              value={settings.textSize}
              onChange={(e) => updateTextSize(e.target.value as any)}
              className="w-full px-3 py-2 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="sm">Petit</option>
              <option value="base">Normal</option>
              <option value="lg">Grand</option>
              <option value="xl">Très grand</option>
            </select>
            <div className="mt-2 text-xs text-indigo-600">
              💡 Une taille plus grande peut aider à la concentration
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-indigo-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-indigo-800">Animations</div>
              <div className="text-sm text-indigo-600">Transitions et effets visuels</div>
            </div>
            <button
              onClick={toggleAnimations}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.animations ? 'bg-indigo-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                  settings.animations ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          <div className="mt-2 text-xs text-indigo-600">
            Désactiver peut améliorer les performances sur les appareils plus lents
          </div>
        </div>
      </div>

      {/* Rappels intelligents */}
      <div className="bg-teal-50 p-6 rounded-xl">
        <h3 className="text-lg font-semibold text-teal-800 mb-4">🧠 Rappels intelligents</h3>
        
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="font-medium text-teal-800">Fonction "Snooze"</div>
                <div className="text-sm text-teal-600">Permet de reporter un rappel de médication</div>
              </div>
              <button
                onClick={() => updateMedicationReminders({ 
                  snoozeEnabled: !settings.medicationReminders.snoozeEnabled 
                })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.medicationReminders.snoozeEnabled ? 'bg-teal-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    settings.medicationReminders.snoozeEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            
            {settings.medicationReminders.snoozeEnabled && (
              <div className="ml-4 pt-3 border-l-2 border-teal-200 pl-4">
                <label className="block text-sm font-medium text-teal-700 mb-2">
                  Intervalle de snooze (minutes)
                </label>
                <select
                  value={settings.medicationReminders.snoozeInterval}
                  onChange={(e) => updateMedicationReminders({ 
                    snoozeInterval: parseInt(e.target.value) 
                  })}
                  className="w-32 px-3 py-2 border border-teal-200 rounded-lg focus:ring-2 focus:ring-teal-500"
                >
                  <option value={5}>5 min</option>
                  <option value={10}>10 min</option>
                  <option value={15}>15 min</option>
                  <option value={30}>30 min</option>
                </select>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sauvegarde automatique */}
      <div className="bg-green-50 p-6 rounded-xl">
        <h3 className="text-lg font-semibold text-green-800 mb-4">💾 Sauvegarde automatique</h3>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-green-800">Sauvegarde automatique</div>
              <div className="text-sm text-green-600">
                Crée automatiquement des sauvegardes de vos données dans le stockage local
              </div>
            </div>
            <button
              onClick={toggleAutoBackup}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.autoBackup ? 'bg-green-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                  settings.autoBackup ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {settings.autoBackup && (
            <div>
              <label className="block text-sm font-medium text-green-700 mb-2">
                Fréquence de sauvegarde
              </label>
              <select
                value={settings.backupFrequency}
                onChange={(e) => updateBackupFrequency(e.target.value as any)}
                className="w-full max-w-xs px-3 py-2 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="daily">Quotidienne</option>
                <option value="weekly">Hebdomadaire</option>
                <option value="monthly">Mensuelle</option>
              </select>
              <div className="mt-2 text-xs text-green-600">
                Les sauvegardes sont stockées localement dans votre navigateur
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Conseils d'optimisation */}
      <div className="bg-yellow-50 p-6 rounded-xl">
        <h4 className="font-semibold text-yellow-800 mb-3">⚡ Conseils d'optimisation</h4>
        <div className="text-sm text-yellow-700 space-y-2">
          <p>• <strong>Thème automatique :</strong> Adapte l'interface selon votre chronotype et l'heure</p>
          <p>• <strong>Taille de texte :</strong> Les personnes ADHD lisent souvent mieux avec du texte plus grand</p>
          <p>• <strong>Animations :</strong> Peuvent aider à la concentration mais ralentir sur les anciens appareils</p>
          <p>• <strong>Snooze intelligent :</strong> Évite l'oubli tout en respectant votre rythme</p>
        </div>
      </div>

      {/* Aperçu des paramètres actuels */}
      <div className="bg-gray-50 p-6 rounded-xl">
        <h4 className="font-semibold text-gray-800 mb-4">📋 Résumé de vos paramètres</h4>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <div className="font-medium text-gray-700 mb-2">Interface</div>
            <ul className="space-y-1 text-gray-600">
              <li>• Thème: {settings.theme === 'auto' ? '🌓 Automatique' : settings.theme === 'light' ? '☀️ Clair' : '🌙 Sombre'}</li>
              <li>• Taille texte: {settings.textSize}</li>
              <li>• Animations: {settings.animations ? '✅ Activées' : '❌ Désactivées'}</li>
            </ul>
          </div>
          <div>
            <div className="font-medium text-gray-700 mb-2">Fonctionnalités</div>
            <ul className="space-y-1 text-gray-600">
              <li>• Snooze: {settings.medicationReminders.snoozeEnabled ? `✅ ${settings.medicationReminders.snoozeInterval}min` : '❌ Désactivé'}</li>
              <li>• Sauvegarde: {settings.autoBackup ? `✅ ${settings.backupFrequency}` : '❌ Désactivée'}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}