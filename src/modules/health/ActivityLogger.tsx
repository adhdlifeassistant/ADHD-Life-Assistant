'use client';

import React, { useState } from 'react';
import { useHealth, ACTIVITY_TYPES } from './HealthContext';
import { useMood } from '../mood/MoodContext';
import { ActivityType } from '@/types/health';

export function ActivityLogger() {
  const { activities, logActivity, deleteActivity, getTodayActivities } = useHealth();
  const { currentMood } = useMood();
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [newActivity, setNewActivity] = useState({
    type: 'walk' as ActivityType,
    customName: '',
    duration: '',
    enjoyment: 3,
    notes: ''
  });

  const todayActivities = getTodayActivities();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    logActivity({
      date: Date.now(),
      type: newActivity.type,
      customName: newActivity.customName || undefined,
      duration: newActivity.duration ? parseInt(newActivity.duration) : undefined,
      enjoyment: newActivity.enjoyment,
      notes: newActivity.notes || undefined,
      mood: currentMood
    });

    // Reset form
    setNewActivity({
      type: 'walk',
      customName: '',
      duration: '',
      enjoyment: 3,
      notes: ''
    });
    setShowAddForm(false);
  };

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) return 'À l\'instant';
    if (hours < 24) return `Il y a ${hours}h`;
    return new Date(timestamp).toLocaleDateString('fr-FR');
  };

  if (showAddForm) {
    return (
      <div className="p-6">
        <div className="max-w-md mx-auto">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
            J'ai bougé aujourd'hui ! 🏃‍♂️
          </h3>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Type d'activité */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Type d'activité
              </label>
              <div className="grid grid-cols-2 gap-3">
                {Object.values(ACTIVITY_TYPES).map(activity => (
                  <button
                    key={activity.id}
                    type="button"
                    onClick={() => setNewActivity(prev => ({ ...prev, type: activity.id }))}
                    className={`p-3 rounded-lg border-2 transition-colors ${
                      newActivity.type === activity.id
                        ? `border-${activity.color} bg-${activity.color.replace('-500', '-50')}`
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="text-center">
                      <span className="text-xl block mb-1">{activity.emoji}</span>
                      <span className="text-xs font-medium">{activity.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Nom personnalisé si "Autre" */}
            {newActivity.type === 'other' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Préciser l'activité
                </label>
                <input
                  type="text"
                  value={newActivity.customName}
                  onChange={(e) => setNewActivity(prev => ({ ...prev, customName: e.target.value }))}
                  placeholder="Ex: Yoga, natation, jardinage..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            )}

            {/* Durée optionnelle */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Durée (optionnel)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={newActivity.duration}
                  onChange={(e) => setNewActivity(prev => ({ ...prev, duration: e.target.value }))}
                  placeholder="30"
                  className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  min="1"
                />
                <span className="text-sm text-gray-600">minutes</span>
              </div>
            </div>

            {/* Niveau de plaisir */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Niveau de plaisir
              </label>
              <div className="flex justify-between items-center">
                <span className="text-sm text-red-600">😞 Pénible</span>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={newActivity.enjoyment}
                  onChange={(e) => setNewActivity(prev => ({ ...prev, enjoyment: parseInt(e.target.value) }))}
                  className="mx-4 flex-1"
                />
                <span className="text-sm text-green-600">😄 Génial</span>
              </div>
              <div className="text-center text-sm text-gray-600 mt-1">
                {newActivity.enjoyment}/5
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes (optionnel)
              </label>
              <textarea
                value={newActivity.notes}
                onChange={(e) => setNewActivity(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Comment je me sens après ? Observations..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                rows={3}
              />
            </div>

            {/* Bénéfice mental */}
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="text-sm text-blue-800">
                <strong>Bénéfice mental:</strong> {ACTIVITY_TYPES[newActivity.type].mentalBenefit}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                ✅ C'est noté !
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          Activité physique
        </h2>
        <p className="text-gray-600">
          Pas de comptage obsessionnel, juste noter quand tu bouges ! 💪
        </p>
      </div>

      {/* Action principale */}
      <div className="text-center">
        <button
          onClick={() => setShowAddForm(true)}
          className="px-8 py-4 bg-green-600 text-white rounded-xl hover:bg-green-700 font-medium text-lg"
        >
          🏃‍♂️ J'ai bougé aujourd'hui !
        </button>
      </div>

      {/* Activités d'aujourd'hui */}
      {todayActivities.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-800">Aujourd'hui</h3>
          <div className="space-y-3">
            {todayActivities.map(activity => {
              const config = ACTIVITY_TYPES[activity.type];
              return (
                <div key={activity.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{config.emoji}</span>
                    <div>
                      <div className="font-medium text-gray-800">
                        {activity.customName || config.name}
                      </div>
                      <div className="text-sm text-gray-600">
                        {activity.duration && `${activity.duration}min • `}
                        Plaisir: {activity.enjoyment}/5
                        {activity.notes && ` • ${activity.notes}`}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteActivity(activity.id)}
                    className="text-gray-400 hover:text-red-500 p-1"
                  >
                    🗑️
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Historique récent */}
      {activities.length > todayActivities.length && (
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-800">Récemment</h3>
          <div className="space-y-2">
            {activities
              .filter(activity => !todayActivities.includes(activity))
              .sort((a, b) => b.date - a.date)
              .slice(0, 5)
              .map(activity => {
                const config = ACTIVITY_TYPES[activity.type];
                return (
                  <div key={activity.id} className="flex items-center gap-3 p-3 bg-white border rounded-lg">
                    <span className="text-lg">{config.emoji}</span>
                    <div className="flex-1">
                      <span className="font-medium text-gray-800">
                        {activity.customName || config.name}
                      </span>
                      {activity.duration && (
                        <span className="ml-2 text-sm text-gray-600">({activity.duration}min)</span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatTimeAgo(activity.date)}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Premier usage */}
      {activities.length === 0 && (
        <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg text-center">
          <h3 className="font-semibold text-gray-800 mb-2">Pourquoi noter mes activités ?</h3>
          <div className="text-sm text-gray-600 space-y-1">
            <p>• Voir l'impact sur ton mood et ton énergie</p>
            <p>• Célébrer chaque mouvement, même petit</p>
            <p>• Identifier les activités qui te font du bien</p>
            <p>• Aucune pression, juste de la bienveillance ! 💙</p>
          </div>
        </div>
      )}

      {/* Stats encourageantes */}
      {activities.length > 0 && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg text-center">
          <p className="text-purple-800">
            🎉 {activities.length} activité{activities.length > 1 ? 's' : ''} notée{activities.length > 1 ? 's' : ''} ! 
            Continue à prendre soin de toi.
          </p>
        </div>
      )}
    </div>
  );
}