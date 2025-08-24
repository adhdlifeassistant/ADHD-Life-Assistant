'use client';

import React, { useState } from 'react';
import { useHealth, COMMON_SIDE_EFFECTS } from './HealthContext';
import { useMood } from '../mood/MoodContext';
import { useReminders, MEDICATION_ICONS } from '../reminders/ReminderContext';
import { Medication, SideEffect } from '@/types/health';

export function MedicationTracker() {
  const { 
    medications, 
    medicationEntries, 
    addMedication, 
    logMedication, 
    updateMedication,
    deleteMedication 
  } = useHealth();
  const { currentMood } = useMood();
  const { reminders } = useReminders();
  
  const [showAddMedication, setShowAddMedication] = useState(false);
  const [selectedMedication, setSelectedMedication] = useState<Medication | null>(null);
  const [logData, setLogData] = useState({
    dose: '',
    notes: '',
    effectiveness: 3,
    sideEffects: [] as SideEffect[]
  });

  const activeMedications = medications.filter(med => med.isActive);

  // Obtenir les prises d'aujourd'hui
  const today = new Date().setHours(0, 0, 0, 0);
  const todayEntries = medicationEntries.filter(entry => 
    new Date(entry.takenAt).setHours(0, 0, 0, 0) === today
  );

  const handleLogMedication = (medication: Medication) => {
    setSelectedMedication(medication);
    
    // Pré-remplir avec la dernière prise
    const lastEntry = medicationEntries
      .filter(e => e.medicationId === medication.id)
      .sort((a, b) => b.takenAt - a.takenAt)[0];
    
    if (lastEntry) {
      setLogData({
        dose: lastEntry.dose || '',
        notes: '',
        effectiveness: lastEntry.effectiveness || 3,
        sideEffects: []
      });
    }
  };

  const handleSubmitLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMedication) return;

    logMedication({
      medicationId: selectedMedication.id,
      takenAt: Date.now(),
      dose: logData.dose || undefined,
      notes: logData.notes || undefined,
      effectiveness: logData.effectiveness,
      sideEffects: logData.sideEffects,
      mood: currentMood
    });

    setSelectedMedication(null);
    setLogData({
      dose: '',
      notes: '',
      effectiveness: 3,
      sideEffects: []
    });
  };

  const toggleSideEffect = (sideEffect: SideEffect) => {
    setLogData(prev => ({
      ...prev,
      sideEffects: prev.sideEffects.find(se => se.id === sideEffect.id)
        ? prev.sideEffects.filter(se => se.id !== sideEffect.id)
        : [...prev.sideEffects, sideEffect]
    }));
  };

  const renderMedicationCard = (medication: Medication) => {
    const todayTaken = todayEntries.filter(e => e.medicationId === medication.id);
    const lastEntry = medicationEntries
      .filter(e => e.medicationId === medication.id)
      .sort((a, b) => b.takenAt - a.takenAt)[0];

    return (
      <div key={medication.id} className="bg-white border rounded-lg p-4 hover:shadow-sm transition-shadow">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full bg-${medication.color}-100 flex items-center justify-center`}>
              <span className="text-lg">{medication.icon}</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">{medication.name}</h3>
              <p className="text-sm text-gray-600">{medication.dosage} • {medication.frequency}</p>
            </div>
          </div>
          <div className="text-right">
            <div className={`text-sm font-medium ${
              todayTaken.length > 0 ? 'text-green-600' : 'text-orange-600'
            }`}>
              {todayTaken.length > 0 ? `✓ Pris ${todayTaken.length}x` : 'Pas encore pris'}
            </div>
            {lastEntry && (
              <div className="text-xs text-gray-500">
                Dernière prise: {new Date(lastEntry.takenAt).toLocaleDateString('fr-FR')}
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => handleLogMedication(medication)}
            className={`flex-1 px-3 py-2 text-sm rounded ${
              todayTaken.length > 0 
                ? 'bg-gray-100 text-gray-600' 
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {todayTaken.length > 0 ? '📝 Modifier' : '💊 Je viens de prendre'}
          </button>
          <button
            onClick={() => setShowAddMedication(true)}
            className="px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50"
          >
            ⚙️
          </button>
        </div>

        {medication.notes && (
          <div className="mt-3 p-2 bg-gray-50 rounded text-sm text-gray-600">
            {medication.notes}
          </div>
        )}
      </div>
    );
  };

  // Modal de log de médication
  if (selectedMedication) {
    return (
      <div className="p-6">
        <div className="max-w-md mx-auto">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
            Logger {selectedMedication.name}
          </h3>

          <form onSubmit={handleSubmitLog} className="space-y-6">
            {/* Dose */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dose prise (optionnel)
              </label>
              <input
                type="text"
                value={logData.dose}
                onChange={(e) => setLogData(prev => ({ ...prev, dose: e.target.value }))}
                placeholder={selectedMedication.dosage}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Efficacité ressentie */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Efficacité ressentie
              </label>
              <div className="flex justify-between items-center">
                <span className="text-sm text-red-600">Inefficace</span>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={logData.effectiveness}
                  onChange={(e) => setLogData(prev => ({ ...prev, effectiveness: parseInt(e.target.value) }))}
                  className="mx-4 flex-1"
                />
                <span className="text-sm text-green-600">Très efficace</span>
              </div>
              <div className="text-center text-sm text-gray-600 mt-1">
                {logData.effectiveness}/5
              </div>
            </div>

            {/* Effets secondaires */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Effets secondaires ressentis
              </label>
              <div className="grid grid-cols-2 gap-2">
                {COMMON_SIDE_EFFECTS.map(sideEffect => (
                  <button
                    key={sideEffect.id}
                    type="button"
                    onClick={() => toggleSideEffect(sideEffect)}
                    className={`p-2 text-sm rounded border transition-colors ${
                      logData.sideEffects.find(se => se.id === sideEffect.id)
                        ? 'bg-red-100 border-red-300 text-red-700'
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    {sideEffect.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes pour le médecin
              </label>
              <textarea
                value={logData.notes}
                onChange={(e) => setLogData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Observations, questions à poser..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                rows={3}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setSelectedMedication(null)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                ✅ Enregistrer
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Mes médications</h2>
          <p className="text-sm text-gray-600 mt-1">
            Suivi des prises et effets pour vos consultations
          </p>
        </div>
        <button
          onClick={() => setShowAddMedication(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
        >
          + Ajouter
        </button>
      </div>

      {activeMedications.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <span className="text-4xl block mb-4">💊</span>
          <p>Aucune médication enregistrée</p>
          <p className="text-sm mt-2">
            Ajoutez vos traitements pour faciliter le suivi
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {activeMedications.map(renderMedicationCard)}
        </div>
      )}

      {/* Rappels liés (si existants) */}
      {reminders.filter(r => r.isActive).length > 0 && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2">💡 Conseil</h4>
          <p className="text-sm text-blue-700">
            Vous avez des rappels de médication configurés. Ce tracking vous aide à noter 
            les effets et préparer vos RDV médecin !
          </p>
        </div>
      )}

      {/* Conseils d'usage */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium text-gray-800 mb-2">📋 Pourquoi tracker ?</h4>
        <div className="text-sm text-gray-600 space-y-1">
          <p>• Identifier les corrélations médication ↔ mood</p>
          <p>• Préparer les questions pour votre médecin</p>
          <p>• Détecter les effets secondaires</p>
          <p>• Optimiser les dosages avec votre prescripteur</p>
        </div>
      </div>
    </div>
  );
}