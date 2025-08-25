'use client';

import React, { useState } from 'react';
import { OnboardingStepProps, ProfileMedication, MEDICATION_FREQUENCIES, MEDICATION_UNITS } from '@/types/profile';

export function MedicationsStep({ data, updateData }: OnboardingStepProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMedication, setNewMedication] = useState({
    name: '',
    time: '',
    frequency: 'daily' as ProfileMedication['frequency'],
    quantity: undefined as number | undefined,
    unit: 'mg' as keyof typeof MEDICATION_UNITS,
    notes: ''
  });

  const medications = data.medications || [];

  const handleAddMedication = () => {
    if (newMedication.name && newMedication.time) {
      const medication: ProfileMedication = {
        id: `temp_${Date.now()}`,
        name: newMedication.name,
        time: newMedication.time,
        frequency: newMedication.frequency,
        quantity: newMedication.quantity,
        unit: newMedication.unit,
        notes: newMedication.notes || undefined
      };

      updateData({
        medications: [...medications, medication]
      });

      // Reset form
      setNewMedication({
        name: '',
        time: '',
        frequency: 'daily',
        quantity: undefined,
        unit: 'mg',
        notes: ''
      });
      setShowAddForm(false);
    }
  };

  const handleRemoveMedication = (id: string) => {
    updateData({
      medications: medications.filter(med => med.id !== id)
    });
  };

  const commonMedications = [
    'Medikinet', 'Ritaline', 'Concerta', 'Quasym', 'Vyvanse',
    'Adderall', 'Strattera', 'Wellbutrin'
  ];

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <div className="text-4xl mb-4">💊</div>
        <h3 className="text-xl font-semibold text-gray-800">
          Tes médications ADHD actuelles ?
        </h3>
        <p className="text-gray-600">
          Je pourrai te rappeler les prises et suivre les effets
        </p>
      </div>

      {/* Liste des médications ajoutées */}
      {medications.length > 0 && (
        <div className="space-y-3 max-w-lg mx-auto">
          <h4 className="font-medium text-gray-700">Tes médications :</h4>
          {medications.map((med) => (
            <div key={med.id} className="flex items-center justify-between bg-blue-50 p-3 rounded-lg">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="font-medium text-blue-800">{med.name}</div>
                  {med.quantity && med.unit && (
                    <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium">
                      {med.quantity} {med.unit}
                    </span>
                  )}
                </div>
                <div className="text-sm text-blue-600">
                  {med.time} • {MEDICATION_FREQUENCIES[med.frequency]}
                </div>
              </div>
              <button
                onClick={() => handleRemoveMedication(med.id)}
                className="text-red-500 hover:text-red-700 p-1"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Formulaire d'ajout */}
      {showAddForm ? (
        <div className="max-w-lg mx-auto space-y-4 p-4 border-2 border-dashed border-blue-300 rounded-lg">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom du médicament
            </label>
            <input
              type="text"
              value={newMedication.name}
              onChange={(e) => setNewMedication(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Ex: Medikinet, Ritaline..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              list="common-medications"
            />
            <datalist id="common-medications">
              {commonMedications.map(med => (
                <option key={med} value={med} />
              ))}
            </datalist>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Heure de prise
              </label>
              <input
                type="time"
                value={newMedication.time}
                onChange={(e) => setNewMedication(prev => ({ ...prev, time: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fréquence
              </label>
              <select
                value={newMedication.frequency}
                onChange={(e) => setNewMedication(prev => ({ ...prev, frequency: e.target.value as ProfileMedication['frequency'] }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {Object.entries(MEDICATION_FREQUENCIES).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantité (optionnel)
              </label>
              <input
                type="number"
                step="0.25"
                min="0"
                value={newMedication.quantity || ''}
                onChange={(e) => setNewMedication(prev => ({ 
                  ...prev, 
                  quantity: e.target.value ? parseFloat(e.target.value) : undefined 
                }))}
                placeholder="Ex: 10, 0.5, 2"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unité (optionnel)
              </label>
              <select
                value={newMedication.unit}
                onChange={(e) => setNewMedication(prev => ({ ...prev, unit: e.target.value as keyof typeof MEDICATION_UNITS }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {Object.entries(MEDICATION_UNITS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes (optionnel)
            </label>
            <input
              type="text"
              value={newMedication.notes}
              onChange={(e) => setNewMedication(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Avec repas, conditions..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowAddForm(false)}
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
        <div className="text-center space-y-4">
          <button
            onClick={() => setShowAddForm(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            + Ajouter une médication
          </button>
        </div>
      )}

      {/* Option skip */}
      <div className="text-center space-y-4">
        {medications.length === 0 && !showAddForm && (
          <div className="bg-gray-50 p-4 rounded-lg max-w-md mx-auto">
            <p className="text-sm text-gray-600 mb-2">
              Pas de médication actuellement ?
            </p>
            <p className="text-xs text-gray-500">
              Aucun souci ! Tu peux toujours en ajouter plus tard dans les paramètres.
            </p>
          </div>
        )}
      </div>

      {/* Conseils */}
      <div className="bg-green-50 p-4 rounded-lg max-w-lg mx-auto">
        <h4 className="font-medium text-green-800 mb-2">💡 Pourquoi c'est utile ?</h4>
        <div className="text-sm text-green-700 space-y-1">
          <p>• Rappels automatiques pour ne pas oublier</p>
          <p>• Suivi des effets et de l'efficacité</p>
          <p>• Préparation des RDV avec ton médecin</p>
          <p>• Corrélations avec ton humeur et ton énergie</p>
        </div>
      </div>
    </div>
  );
}