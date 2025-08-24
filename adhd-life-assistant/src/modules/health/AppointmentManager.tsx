'use client';

import React, { useState } from 'react';
import { useHealth, APPOINTMENT_TYPES } from './HealthContext';
import { AppointmentType, MedicalAppointment } from '@/types/health';

export function AppointmentManager() {
  const { appointments, addAppointment, updateAppointment, deleteAppointment, getUpcomingAppointments } = useHealth();
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAppointment, setNewAppointment] = useState({
    type: 'general' as AppointmentType,
    doctorName: '',
    date: '',
    time: '',
    duration: 30,
    location: '',
    notes: '',
    questionsToAsk: ['']
  });

  const upcomingAppointments = getUpcomingAppointments();
  const pastAppointments = appointments
    .filter(apt => apt.isCompleted || apt.date < Date.now())
    .sort((a, b) => b.date - a.date)
    .slice(0, 5);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const datetime = new Date(`${newAppointment.date}T${newAppointment.time}`).getTime();
    const config = APPOINTMENT_TYPES[newAppointment.type];
    
    addAppointment({
      type: newAppointment.type,
      doctorName: newAppointment.doctorName,
      date: datetime,
      duration: newAppointment.duration,
      location: newAppointment.location || undefined,
      notes: newAppointment.notes || undefined,
      questionsToAsk: newAppointment.questionsToAsk.filter(q => q.trim()),
      followUpNotes: undefined,
      isCompleted: false,
      reminders: config.defaultReminders.map(days => ({
        daysBefore: days,
        isEnabled: true
      }))
    });

    // Reset form
    setNewAppointment({
      type: 'general',
      doctorName: '',
      date: '',
      time: '',
      duration: 30,
      location: '',
      notes: '',
      questionsToAsk: ['']
    });
    setShowAddForm(false);
  };

  const addQuestion = () => {
    setNewAppointment(prev => ({
      ...prev,
      questionsToAsk: [...prev.questionsToAsk, '']
    }));
  };

  const updateQuestion = (index: number, value: string) => {
    setNewAppointment(prev => ({
      ...prev,
      questionsToAsk: prev.questionsToAsk.map((q, i) => i === index ? value : q)
    }));
  };

  const removeQuestion = (index: number) => {
    setNewAppointment(prev => ({
      ...prev,
      questionsToAsk: prev.questionsToAsk.filter((_, i) => i !== index)
    }));
  };

  const formatDateTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderAppointmentCard = (appointment: MedicalAppointment) => {
    const config = APPOINTMENT_TYPES[appointment.type];
    const isUpcoming = appointment.date > Date.now();
    const isToday = new Date(appointment.date).toDateString() === new Date().toDateString();
    const isTomorrow = new Date(appointment.date).toDateString() === new Date(Date.now() + 24*60*60*1000).toDateString();

    return (
      <div key={appointment.id} className={`p-4 rounded-lg border ${
        isToday ? 'bg-yellow-50 border-yellow-300' :
        isTomorrow ? 'bg-blue-50 border-blue-300' :
        isUpcoming ? 'bg-white border-gray-200' :
        'bg-gray-50 border-gray-200'
      }`}>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <span className="text-xl">{config.emoji}</span>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-800">{config.name}</h3>
                {isToday && <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">Aujourd'hui</span>}
                {isTomorrow && <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Demain</span>}
              </div>
              <div className="text-gray-600">
                Dr. {appointment.doctorName}
              </div>
              <div className="text-sm text-gray-500">
                {formatDateTime(appointment.date)}
                {appointment.duration && ` • ${appointment.duration}min`}
                {appointment.location && ` • ${appointment.location}`}
              </div>
              
              {appointment.questionsToAsk && appointment.questionsToAsk.length > 0 && (
                <div className="mt-2">
                  <div className="text-xs font-medium text-gray-700 mb-1">Questions à poser:</div>
                  <ul className="text-sm text-gray-600 list-disc list-inside">
                    {appointment.questionsToAsk.slice(0, 2).map((question, index) => (
                      <li key={index}>{question}</li>
                    ))}
                    {appointment.questionsToAsk.length > 2 && (
                      <li className="text-gray-500">+{appointment.questionsToAsk.length - 2} autre{appointment.questionsToAsk.length - 2 > 1 ? 's' : ''}...</li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex gap-1">
            {isUpcoming && (
              <button
                onClick={() => updateAppointment(appointment.id, { isCompleted: true, followUpNotes: '' })}
                className="text-sm px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
              >
                ✓ Fait
              </button>
            )}
            <button
              onClick={() => deleteAppointment(appointment.id)}
              className="text-gray-400 hover:text-red-500 p-1"
            >
              🗑️
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (showAddForm) {
    return (
      <div className="p-6">
        <div className="max-w-2xl mx-auto">
          <h3 className="text-lg font-semibold text-gray-800 mb-6 text-center">
            Nouveau RDV médical
          </h3>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Type de RDV */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Type de rendez-vous
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {Object.values(APPOINTMENT_TYPES).map(type => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setNewAppointment(prev => ({ 
                      ...prev, 
                      type: type.id,
                      duration: type.defaultDuration 
                    }))}
                    className={`p-3 rounded-lg border-2 transition-colors ${
                      newAppointment.type === type.id
                        ? `border-${type.color} bg-${type.color.replace('-500', '-50')}`
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="text-center">
                      <span className="text-xl block mb-1">{type.emoji}</span>
                      <span className="text-xs font-medium">{type.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Nom du médecin */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom du médecin
              </label>
              <input
                type="text"
                value={newAppointment.doctorName}
                onChange={(e) => setNewAppointment(prev => ({ ...prev, doctorName: e.target.value }))}
                placeholder="Dr. Martin"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Date et heure */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={newAppointment.date}
                  onChange={(e) => setNewAppointment(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Heure
                </label>
                <input
                  type="time"
                  value={newAppointment.time}
                  onChange={(e) => setNewAppointment(prev => ({ ...prev, time: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            {/* Lieu */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lieu (optionnel)
              </label>
              <input
                type="text"
                value={newAppointment.location}
                onChange={(e) => setNewAppointment(prev => ({ ...prev, location: e.target.value }))}
                placeholder="Cabinet médical, hôpital..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Questions à poser */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Questions à poser
              </label>
              <div className="space-y-2">
                {newAppointment.questionsToAsk.map((question, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={question}
                      onChange={(e) => updateQuestion(index, e.target.value)}
                      placeholder="Ex: Ajuster la dose ? Effets secondaires..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    {newAppointment.questionsToAsk.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeQuestion(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        ❌
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addQuestion}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  + Ajouter une question
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                📅 Programmer le RDV
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
          <h2 className="text-xl font-semibold text-gray-800">Calendrier médical</h2>
          <p className="text-sm text-gray-600 mt-1">
            Gérer vos RDV et préparer vos consultations
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
        >
          + Nouveau RDV
        </button>
      </div>

      {/* RDV à venir */}
      {upcomingAppointments.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-800">À venir</h3>
          <div className="space-y-3">
            {upcomingAppointments.map(renderAppointmentCard)}
          </div>
        </div>
      )}

      {/* Historique */}
      {pastAppointments.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-800">Historique</h3>
          <div className="space-y-3">
            {pastAppointments.map(renderAppointmentCard)}
          </div>
        </div>
      )}

      {/* Premier usage */}
      {appointments.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <span className="text-4xl block mb-4">📅</span>
          <p>Aucun RDV programmé</p>
          <p className="text-sm mt-2">
            Ajoutez vos consultations pour mieux les préparer
          </p>
        </div>
      )}

      {/* Conseils */}
      <div className="bg-indigo-50 p-4 rounded-lg">
        <h4 className="font-medium text-indigo-800 mb-2">💡 Conseils RDV médical ADHD</h4>
        <div className="text-sm text-indigo-700 space-y-1">
          <p>• Préparez vos questions à l'avance (mémoire ADHD !)</p>
          <p>• Notez les effets de vos médications</p>
          <p>• Apportez votre historique de bien-être</p>
          <p>• N'hésitez pas à demander des clarifications</p>
        </div>
      </div>
    </div>
  );
}