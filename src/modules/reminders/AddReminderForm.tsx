'use client';

import React, { useState } from 'react';
import { useMood } from '@/modules/mood/MoodContext';
import { useReminders, MEDICATION_ICONS } from './ReminderContext';
import { ReminderFormData, ReminderFrequency } from '@/types/reminders';

interface AddReminderFormProps {
  onClose: () => void;
}

export default function AddReminderForm({ onClose }: AddReminderFormProps) {
  const { getMoodConfig } = useMood();
  const { addReminder } = useReminders();
  const moodConfig = getMoodConfig();

  const [formData, setFormData] = useState<ReminderFormData>({
    name: '',
    time: '08:00',
    frequency: 'daily',
    icon: '💊'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name.trim()) {
      addReminder(formData);
      onClose();
    }
  };

  const frequencyOptions: { value: ReminderFrequency; label: string }[] = [
    { value: 'daily', label: 'Tous les jours' },
    { value: 'weekly', label: 'Chaque semaine' },
    { value: 'monthly', label: 'Chaque mois' },
    { value: 'once', label: 'Une seule fois' }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-800">
            Nouveau rappel
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-xl"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nom du médicament */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Nom du médicament
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="ex: Medikinet, Magnésium..."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          {/* Heure */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Heure
            </label>
            <input
              type="time"
              value={formData.time}
              onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          {/* Fréquence */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Fréquence
            </label>
            <select
              value={formData.frequency}
              onChange={(e) => setFormData(prev => ({ ...prev, frequency: e.target.value as ReminderFrequency }))}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {frequencyOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Icône */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Icône
            </label>
            <div className="grid grid-cols-5 gap-2">
              {MEDICATION_ICONS.map(icon => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, icon }))}
                  className={`p-3 rounded-xl border-2 text-2xl transition-all ${
                    formData.icon === icon
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* Boutons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className={`flex-1 px-4 py-3 rounded-xl font-medium text-white transition-colors ${moodConfig.bgColor.replace('bg-', 'bg-').replace('-50', '-500')} hover:opacity-90`}
              style={{ backgroundColor: 'var(--mood-primary)' }}
            >
              Créer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}