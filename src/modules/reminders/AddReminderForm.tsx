'use client';

import React, { useState, useEffect } from 'react';
import { useMood } from '@/modules/mood/MoodContext';
import { useReminders, MEDICATION_ICONS } from './ReminderContext';
import { useProfile } from '@/hooks/useProfile';
import { useHealth } from '@/modules/health/HealthContext';
import { useMedicationSync } from '@/hooks/useMedicationSync';
import { ReminderFormData, ReminderFrequency } from '@/types/reminders';

interface AddReminderFormProps {
  onClose: () => void;
}

export default function AddReminderForm({ onClose }: AddReminderFormProps) {
  const { getMoodConfig } = useMood();
  const { addReminder } = useReminders();
  const { profile } = useProfile();
  const { medications: healthMedications } = useHealth();
  const { syncToProfile } = useMedicationSync();
  const moodConfig = getMoodConfig();

  const [formData, setFormData] = useState<ReminderFormData>({
    name: '',
    time: '08:00',
    frequency: 'daily',
    icon: '💊'
  });
  const [selectedMedication, setSelectedMedication] = useState<string>('');
  const [selectedMedicationType, setSelectedMedicationType] = useState<'profile' | 'health' | 'manual'>('manual');
  
  // Combine profile and health medications with clear identification
  const allMedications = [
    ...profile.medications.map(med => ({ ...med, source: 'profile' as const })),
    ...healthMedications
      .filter(healthMed => 
        !profile.medications.some(profileMed => 
          profileMed.name.toLowerCase() === healthMed.name.toLowerCase()
        )
      )
      .map(med => ({
        id: med.id,
        name: med.name,
        time: '08:00', // Default time for health medications
        frequency: 'daily' as const,
        quantity: undefined,
        unit: undefined,
        notes: med.notes,
        source: 'health' as const
      }))
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name.trim()) {
      addReminder(formData);
      onClose();
    }
  };

  const handleMedicationSelect = (medicationId: string) => {
    const medication = allMedications.find(med => med.id === medicationId);
    if (medication) {
      setFormData({
        name: medication.name,
        time: medication.time,
        frequency: medication.frequency === 'twice-daily' ? 'daily' : 
                 medication.frequency === 'as-needed' ? 'daily' : medication.frequency as ReminderFrequency,
        icon: '💊'
      });
      setSelectedMedication(medicationId);
      setSelectedMedicationType(medication.source);
      
      // If it's a health medication, sync it to profile for easier access in the future
      if (medication.source === 'health') {
        const healthMed = healthMedications.find(hm => hm.id === medicationId);
        if (healthMed) {
          syncToProfile(healthMed);
        }
      }
    }
  };

  const handleManualEntry = () => {
    setFormData({
      name: '',
      time: '08:00',
      frequency: 'daily',
      icon: '💊'
    });
    setSelectedMedication('');
    setSelectedMedicationType('manual');
  };

  // Auto-sync health medications to profile when component loads
  useEffect(() => {
    healthMedications.forEach(healthMed => {
      const existsInProfile = profile.medications.some(
        profileMed => profileMed.name.toLowerCase() === healthMed.name.toLowerCase()
      );
      if (!existsInProfile) {
        syncToProfile(healthMed);
      }
    });
  }, []); // Run only once on mount

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
          {/* Sélection du médicament */}
          {allMedications.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Choisir un médicament
              </label>
              <div className="space-y-2">
                {allMedications.map(medication => (
                  <button
                    key={medication.id}
                    type="button"
                    onClick={() => handleMedicationSelect(medication.id)}
                    className={`w-full p-3 rounded-xl border text-left transition-all ${
                      selectedMedication === medication.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-medium text-slate-800">{medication.name}</div>
                      <div className={`px-2 py-0.5 rounded text-xs font-medium ${
                        medication.source === 'profile' 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'bg-purple-100 text-purple-700'
                      }`}>
                        {medication.source === 'profile' ? 'Profil' : 'Module Santé'}
                      </div>
                    </div>
                    <div className="text-sm text-slate-600">
                      {medication.time} • {medication.frequency === 'daily' ? 'Quotidien' : 
                       medication.frequency === 'twice-daily' ? 'Deux fois par jour' :
                       medication.frequency === 'weekly' ? 'Hebdomadaire' : 'Si besoin'}
                      {medication.quantity && medication.unit && (
                        <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs">
                          {medication.quantity} {medication.unit}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
                <button
                  type="button"
                  onClick={handleManualEntry}
                  className={`w-full p-3 rounded-xl border text-left transition-all ${
                    selectedMedicationType === 'manual'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="font-medium text-slate-800">+ Autre médicament</div>
                  <div className="text-sm text-slate-600">Saisie manuelle</div>
                </button>
              </div>
            </div>
          )}

          {/* Nom du médicament - affiché seulement si saisie manuelle */}
          {(selectedMedicationType === 'manual' || allMedications.length === 0) && (
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
          )}

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