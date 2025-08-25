'use client';

import React, { useState } from 'react';
import { useProfile } from '@/hooks/useProfile';
import { useAppSettings } from '@/hooks/useAppSettings';
import { ProfileMedication, MEDICATION_FREQUENCIES, MEDICATION_UNITS } from '@/types/profile';

export function MedicationsSection() {
  const { 
    profile, 
    addMedication, 
    updateMedication, 
    removeMedication 
  } = useProfile();
  
  const { 
    settings, 
    updateMedicationReminders,
    updateMedicationNotificationSettings 
  } = useAppSettings();
  
  const [editingMedication, setEditingMedication] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMedication, setNewMedication] = useState({
    name: '',
    time: '',
    frequency: 'daily' as ProfileMedication['frequency'],
    quantity: undefined as number | undefined,
    unit: 'mg' as keyof typeof MEDICATION_UNITS,
    notes: ''
  });

  const handleAddMedication = () => {
    if (newMedication.name && newMedication.time) {
      addMedication(newMedication);
      setNewMedication({ name: '', time: '', frequency: 'daily', quantity: undefined, unit: 'mg', notes: '' });
      setShowAddForm(false);
    }
  };

  const handleUpdateMedication = (id: string, updates: Partial<ProfileMedication>) => {
    updateMedication(id, updates);
    setEditingMedication(null);
  };

  const handleToggleMedicationNotifications = (medicationId: string) => {
    const currentSettings = settings.medicationReminders.perMedicationSettings[medicationId];
    updateMedicationNotificationSettings(medicationId, {
      enabled: !currentSettings?.enabled
    });
  };

  const getMedicationNotificationSettings = (medicationId: string) => {
    return settings.medicationReminders.perMedicationSettings[medicationId] || {
      enabled: true,
      urgencyLevel: 'normal',
      reminderText: undefined
    };
  };

  const commonMedications = [
    'Medikinet', 'Ritaline', 'Concerta', 'Quasym', 'Vyvanse',
    'Adderall', 'Strattera', 'Wellbutrin', 'Intuniv'
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">💊 Gestion des Médications</h2>
        <p className="text-gray-600">Gérez vos traitements et personnalisez les rappels</p>
      </div>

      {/* Paramètres globaux des rappels */}
      <div className="bg-blue-50 p-6 rounded-xl">
        <h3 className="text-lg font-semibold text-blue-800 mb-4">⏰ Paramètres des Rappels</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-blue-800">Rappels de médication</div>
              <div className="text-sm text-blue-600">Activer les notifications pour toutes les médications</div>
            </div>
            <button
              onClick={() => updateMedicationReminders({ enabled: !settings.medicationReminders.enabled })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.medicationReminders.enabled ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                  settings.medicationReminders.enabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {settings.medicationReminders.enabled && (
            <div className="grid md:grid-cols-2 gap-4 pt-4 border-t border-blue-200">
              <div>
                <label className="block text-sm font-medium text-blue-700 mb-2">
                  Fréquence des rappels
                </label>
                <select
                  value={settings.medicationReminders.frequency}
                  onChange={(e) => updateMedicationReminders({ frequency: e.target.value as any })}
                  className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="once">Une seule fois</option>
                  <option value="persistent">Persistant jusqu'à prise</option>
                  <option value="smart">Intelligent (selon chronotype)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-blue-700 mb-2">
                  Préavis (minutes)
                </label>
                <input
                  type="number"
                  min="0"
                  max="60"
                  value={settings.medicationReminders.advanceNotice}
                  onChange={(e) => updateMedicationReminders({ advanceNotice: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Liste des médications */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-800">
            Mes Médications ({profile.medications?.length || 0})
          </h3>
          <button
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            + Ajouter une médication
          </button>
        </div>

        {/* Formulaire d'ajout */}
        {showAddForm && (
          <div className="bg-gray-50 p-6 rounded-xl mb-6 border-2 border-dashed border-gray-300">
            <h4 className="font-medium text-gray-800 mb-4">Nouvelle médication</h4>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom du médicament *
                </label>
                <input
                  type="text"
                  value={newMedication.name}
                  onChange={(e) => setNewMedication(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Medikinet, Ritaline..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  list="common-medications"
                />
                <datalist id="common-medications">
                  {commonMedications.map(med => (
                    <option key={med} value={med} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Heure de prise *
                </label>
                <input
                  type="time"
                  value={newMedication.time}
                  onChange={(e) => setNewMedication(prev => ({ ...prev, time: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fréquence
                </label>
                <select
                  value={newMedication.frequency}
                  onChange={(e) => setNewMedication(prev => ({ ...prev, frequency: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {Object.entries(MEDICATION_FREQUENCIES).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unité (optionnel)
                </label>
                <select
                  value={newMedication.unit}
                  onChange={(e) => setNewMedication(prev => ({ ...prev, unit: e.target.value as keyof typeof MEDICATION_UNITS }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {Object.entries(MEDICATION_UNITS).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (optionnel)
                </label>
                <input
                  type="text"
                  value={newMedication.notes}
                  onChange={(e) => setNewMedication(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Avec repas, conditions..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowAddForm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={handleAddMedication}
                disabled={!newMedication.name || !newMedication.time}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                Ajouter
              </button>
            </div>
          </div>
        )}

        {/* Liste des médications existantes */}
        {profile.medications && profile.medications.length > 0 ? (
          <div className="space-y-4">
            {profile.medications.map((medication) => {
              const isEditing = editingMedication === medication.id;
              const notificationSettings = getMedicationNotificationSettings(medication.id);

              return (
                <div key={medication.id} className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-blue-200 transition-colors">
                  {isEditing ? (
                    /* Mode édition */
                    <EditMedicationForm
                      medication={medication}
                      onSave={(updates) => handleUpdateMedication(medication.id, updates)}
                      onCancel={() => setEditingMedication(null)}
                    />
                  ) : (
                    /* Mode affichage */
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-2">
                          <h4 className="text-lg font-semibold text-gray-800">{medication.name}</h4>
                          <div className="flex items-center gap-2">
                            {medication.quantity && medication.unit && (
                              <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-sm font-medium">
                                {medication.quantity} {medication.unit}
                              </span>
                            )}
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm">
                              {medication.time} • {MEDICATION_FREQUENCIES[medication.frequency]}
                            </span>
                          </div>
                        </div>
                        {medication.notes && (
                          <p className="text-sm text-gray-600 mb-3">{medication.notes}</p>
                        )}
                        
                        {/* Paramètres de notification */}
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleToggleMedicationNotifications(medication.id)}
                              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                                notificationSettings.enabled ? 'bg-green-500' : 'bg-gray-200'
                              }`}
                            >
                              <span
                                className={`inline-block h-3 w-3 transform rounded-full bg-white transition ${
                                  notificationSettings.enabled ? 'translate-x-5' : 'translate-x-1'
                                }`}
                              />
                            </button>
                            <span className="text-sm text-gray-600">
                              Notifications {notificationSettings.enabled ? 'activées' : 'désactivées'}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => setEditingMedication(medication.id)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => removeMedication(medication.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <div className="text-4xl mb-4">💊</div>
            <p className="text-lg mb-2">Aucune médication enregistrée</p>
            <p className="text-sm">Ajoutez vos traitements pour bénéficier des rappels personnalisés</p>
          </div>
        )}
      </div>

      {/* Conseils */}
      <div className="bg-green-50 p-6 rounded-xl">
        <h4 className="font-semibold text-green-800 mb-3">💡 Conseils d'utilisation</h4>
        <div className="text-sm text-green-700 space-y-2">
          <p>• <strong>Rappels intelligents :</strong> Adaptés à votre chronotype pour un meilleur respect</p>
          <p>• <strong>Notifications par médication :</strong> Personnalisez chaque traitement selon son importance</p>
          <p>• <strong>Suivi des effets :</strong> Utilisez le module Santé pour tracker l'efficacité</p>
          <p>• <strong>Préparation RDV :</strong> Exportez vos données pour vos consultations médicales</p>
        </div>
      </div>
    </div>
  );
}

interface EditMedicationFormProps {
  medication: ProfileMedication;
  onSave: (updates: Partial<ProfileMedication>) => void;
  onCancel: () => void;
}

function EditMedicationForm({ medication, onSave, onCancel }: EditMedicationFormProps) {
  const [formData, setFormData] = useState({
    name: medication.name,
    time: medication.time,
    frequency: medication.frequency,
    quantity: medication.quantity,
    unit: medication.unit || 'mg',
    notes: medication.notes || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Heure</label>
          <input
            type="time"
            value={formData.time}
            onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Fréquence</label>
          <select
            value={formData.frequency}
            onChange={(e) => setFormData(prev => ({ ...prev, frequency: e.target.value as any }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            {Object.entries(MEDICATION_FREQUENCIES).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Quantité</label>
          <input
            type="number"
            step="0.25"
            min="0"
            value={formData.quantity || ''}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              quantity: e.target.value ? parseFloat(e.target.value) : undefined 
            }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Ex: 10, 0.5, 2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Unité</label>
          <select
            value={formData.unit}
            onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value as keyof typeof MEDICATION_UNITS }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            {Object.entries(MEDICATION_UNITS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
          <input
            type="text"
            value={formData.notes}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Notes optionnelles..."
          />
        </div>
      </div>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Annuler
        </button>
        <button
          type="submit"
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Sauvegarder
        </button>
      </div>
    </form>
  );
}