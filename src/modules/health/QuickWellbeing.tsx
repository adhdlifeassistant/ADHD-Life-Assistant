'use client';

import React, { useState } from 'react';
import { useHealth, WELLBEING_METRICS } from './HealthContext';
import { useMood } from '../mood/MoodContext';
import { WellbeingMetric } from '@/types/health';

export function QuickWellbeing() {
  const { logWellbeing, getTodayWellbeing } = useHealth();
  const { getMoodConfig, currentMood } = useMood();
  
  const existingEntry = getTodayWellbeing();
  const [metrics, setMetrics] = useState({
    sleep: existingEntry?.metrics.sleep || 3,
    energy: existingEntry?.metrics.energy || 3,
    focus: existingEntry?.metrics.focus || 3,
    anxiety: existingEntry?.metrics.anxiety || 3
  });
  const [notes, setNotes] = useState(existingEntry?.notes || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const moodConfig = getMoodConfig();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      logWellbeing({
        date: new Date().setHours(0, 0, 0, 0),
        metrics,
        notes: notes.trim() || undefined,
        mood: currentMood
      });

      // Message de confirmation
      setTimeout(() => {
        setIsSubmitting(false);
      }, 1000);
    } catch (error) {
      console.error('Error logging wellbeing:', error);
      setIsSubmitting(false);
    }
  };

  const renderMetricSlider = (metric: WellbeingMetric) => {
    const config = WELLBEING_METRICS[metric];
    const value = metrics[metric];
    const scaleInfo = config.scale[value as keyof typeof config.scale];

    return (
      <div key={metric} className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">{config.emoji}</span>
            <span className="font-medium text-gray-800">{config.name}</span>
          </div>
          <div className="text-right">
            <div className={`font-semibold ${scaleInfo.color}`}>
              {scaleInfo.label}
            </div>
            <div className="text-sm text-gray-500">{value}/5</div>
          </div>
        </div>

        <div className="relative">
          <input
            type="range"
            min="1"
            max="5"
            value={value}
            onChange={(e) => setMetrics(prev => ({
              ...prev,
              [metric]: parseInt(e.target.value)
            }))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            style={{
              background: `linear-gradient(to right, #fee2e2 0%, #fef3c7 25%, #ecfdf5 50%, #dcfce7 75%, #d1fae5 100%)`
            }}
          />
          <div className="flex justify-between mt-1 text-xs text-gray-400">
            <span>1</span>
            <span>2</span>
            <span>3</span>
            <span>4</span>
            <span>5</span>
          </div>
        </div>
      </div>
    );
  };

  if (isSubmitting) {
    return (
      <div className="p-6 text-center">
        <div className="text-6xl mb-4">🎉</div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          Bien-être noté !
        </h3>
        <p className="text-gray-600">
          Merci de prendre soin de toi. Ces données t'aideront à mieux te comprendre.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          {existingEntry ? 'Modifier' : 'Noter'} mon bien-être
        </h2>
        <p className="text-gray-600">
          Comment te sens-tu aujourd'hui ? Prends 30 secondes pour t'écouter.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
        {/* Métriques de bien-être */}
        <div className="space-y-6">
          {Object.keys(WELLBEING_METRICS).map(metric => 
            renderMetricSlider(metric as WellbeingMetric)
          )}
        </div>

        {/* Notes optionnelles */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Notes (optionnel)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Quelque chose de particulier à noter ? Événements, ressentis..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            rows={3}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            className={`flex-1 px-6 py-3 rounded-lg font-medium transition-colors ${
              `bg-${moodConfig.color} text-white hover:bg-${moodConfig.color.replace('-500', '-600')}`
            }`}
          >
            {existingEntry ? '✏️ Modifier' : '✅ Enregistrer'} mon bien-être
          </button>
        </div>

        {existingEntry && (
          <div className="text-center text-sm text-gray-500">
            Dernière mise à jour: {new Date(existingEntry.completedAt).toLocaleString('fr-FR')}
          </div>
        )}

        {/* Encouragement selon mood */}
        <div className={`p-4 rounded-lg ${moodConfig.bgColor} text-center`}>
          <p className={`text-sm ${moodConfig.textColor}`}>
            {currentMood === 'energetic' && 'Tu rayonnes aujourd\'hui ! Ces bonnes sensations sont précieuses à noter ✨'}
            {currentMood === 'normal' && 'Tracking habituel, tu prends bien soin de toi 📊'}
            {currentMood === 'tired' && 'Même fatigué(e), tu prends le temps de t\'écouter. C\'est courageux 💤'}
            {currentMood === 'stressed' && 'Prendre conscience de son état, c\'est déjà un pas vers l\'apaisement 🤗'}
            {currentMood === 'sad' && 'Tu as le courage de noter comment ça va. Chaque petite action compte ❤️'}
          </p>
        </div>
      </form>
    </div>
  );
}