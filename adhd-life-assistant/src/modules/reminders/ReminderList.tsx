'use client';

import React, { useState, useEffect } from 'react';
import { useMood } from '@/modules/mood/MoodContext';
import { useReminders } from './ReminderContext';
import { Reminder } from '@/types/reminders';
import AddReminderForm from './AddReminderForm';
import { notificationService } from '@/lib/notificationService';

export default function ReminderList() {
  const { getMoodConfig } = useMood();
  const { reminders, markAsTaken, snoozeReminder, deleteReminder, getTodaysReminders } = useReminders();
  const [showAddForm, setShowAddForm] = useState(false);
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [hasNotificationPermission, setHasNotificationPermission] = useState(false);

  const moodConfig = getMoodConfig();
  const todaysReminders = getTodaysReminders();

  useEffect(() => {
    // Mettre à jour l'heure actuelle chaque minute
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Vérifier les permissions de notification
    const checkPermission = () => {
      setHasNotificationPermission(Notification.permission === 'granted');
    };
    
    checkPermission();
    // Re-vérifier périodiquement
    const interval = setInterval(checkPermission, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleRequestPermission = async () => {
    const granted = await notificationService.requestPermission();
    setHasNotificationPermission(granted);
  };

  const handleTestNotification = async () => {
    await notificationService.showTestNotification();
  };

  const isReminderOverdue = (reminder: Reminder): boolean => {
    const [hours, minutes] = reminder.time.split(':').map(Number);
    const reminderTime = new Date();
    reminderTime.setHours(hours, minutes, 0, 0);
    
    const now = new Date();
    return reminderTime < now && (!reminder.lastTaken || !isSameDay(new Date(reminder.lastTaken), now));
  };

  const isSameDay = (date1: Date, date2: Date): boolean => {
    return date1.toDateString() === date2.toDateString();
  };

  const getReminderStatus = (reminder: Reminder): { text: string; color: string } => {
    const now = new Date();
    
    // Vérifie si pris aujourd'hui
    if (reminder.lastTaken && isSameDay(new Date(reminder.lastTaken), now)) {
      return { text: 'Pris ✅', color: 'text-green-600' };
    }
    
    // Vérifie si en snooze
    if (reminder.snoozedUntil && reminder.snoozedUntil > Date.now()) {
      const snoozeTime = new Date(reminder.snoozedUntil);
      return { 
        text: `Snooze ${snoozeTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} ⏰`, 
        color: 'text-orange-600' 
      };
    }
    
    // Vérifie si en retard
    if (isReminderOverdue(reminder)) {
      return { text: 'En retard ⚠️', color: 'text-red-600' };
    }
    
    return { text: 'Programmé', color: 'text-slate-600' };
  };

  const formatTime = (time: string): string => {
    return time;
  };

  const formatFrequency = (frequency: string): string => {
    const frequencies = {
      daily: 'Quotidien',
      weekly: 'Hebdomadaire',
      monthly: 'Mensuel',
      once: 'Une fois'
    };
    return frequencies[frequency as keyof typeof frequencies] || frequency;
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Header avec bouton d'ajout */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: 'var(--mood-text)' }}>
            Rappels médicaments
          </h2>
          <p className="text-sm opacity-80" style={{ color: 'var(--mood-text)' }}>
            {todaysReminders.length} rappel{todaysReminders.length !== 1 ? 's' : ''} aujourd'hui
          </p>
        </div>
        
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors"
          style={{ 
            backgroundColor: 'var(--mood-primary)', 
            color: 'white' 
          }}
        >
          ➕ Nouveau rappel
        </button>
      </div>

      {/* Alerte permissions */}
      {!hasNotificationPermission && (
        <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-xl">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🔔</span>
            <div className="flex-1">
              <p className="font-medium text-orange-800">
                Notifications désactivées
              </p>
              <p className="text-sm text-orange-600">
                Autorisez les notifications pour recevoir vos rappels de médicaments.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleTestNotification}
                className="text-sm px-3 py-1 rounded-lg bg-orange-100 text-orange-700 hover:bg-orange-200 transition-colors"
              >
                Test
              </button>
              <button
                onClick={handleRequestPermission}
                className="text-sm px-3 py-1 rounded-lg bg-orange-600 text-white hover:bg-orange-700 transition-colors"
              >
                Activer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Liste des rappels */}
      {todaysReminders.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">💊</div>
          <p className="text-lg font-medium" style={{ color: 'var(--mood-text)' }}>
            Aucun rappel configuré
          </p>
          <p className="text-sm opacity-70 mt-2" style={{ color: 'var(--mood-text)' }}>
            Ajoutez votre premier rappel de médicament
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {todaysReminders.map(reminder => {
            const status = getReminderStatus(reminder);
            const isOverdue = isReminderOverdue(reminder);
            
            return (
              <div
                key={reminder.id}
                className={`p-4 rounded-xl border transition-all ${
                  isOverdue 
                    ? 'border-red-200 bg-red-50' 
                    : 'border-slate-200 bg-white/70'
                }`}
              >
                <div className="flex items-center gap-4">
                  {/* Icône et info */}
                  <div className="flex items-center gap-3 flex-1">
                    <span className="text-2xl">{reminder.icon}</span>
                    <div>
                      <h3 className="font-medium text-slate-800">
                        {reminder.name}
                      </h3>
                      <div className="flex items-center gap-3 text-sm">
                        <span className="text-slate-600">
                          {formatTime(reminder.time)} • {formatFrequency(reminder.frequency)}
                        </span>
                        <span className={status.color}>
                          {status.text}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {(!reminder.lastTaken || !isSameDay(new Date(reminder.lastTaken), new Date())) && (
                      <>
                        <button
                          onClick={() => markAsTaken(reminder.id)}
                          className="px-3 py-1 text-sm rounded-lg bg-green-100 text-green-700 hover:bg-green-200 transition-colors"
                        >
                          Pris ✅
                        </button>
                        <button
                          onClick={() => snoozeReminder(reminder.id, 15)}
                          className="px-3 py-1 text-sm rounded-lg bg-orange-100 text-orange-700 hover:bg-orange-200 transition-colors"
                        >
                          15min ⏰
                        </button>
                        <button
                          onClick={() => snoozeReminder(reminder.id, 60)}
                          className="px-3 py-1 text-sm rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
                        >
                          1h ⏰
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => deleteReminder(reminder.id)}
                      className="px-2 py-1 text-sm rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Formulaire d'ajout */}
      {showAddForm && (
        <AddReminderForm onClose={() => setShowAddForm(false)} />
      )}
    </div>
  );
}