'use client';

import React from 'react';
import { useMood } from '@/modules/mood/MoodContext';
import { useReminders } from '@/modules/reminders/ReminderContext';
import { useDashboard } from '../DashboardContext';

export default function QuickReminders() {
  const { getMoodConfig } = useMood();
  const { getTodaysReminders, markAsTaken } = useReminders();
  const { setView } = useDashboard();
  const moodConfig = getMoodConfig();

  const todaysReminders = getTodaysReminders();
  const upcomingReminders = todaysReminders.slice(0, 3); // Afficher max 3

  const isReminderTakenToday = (reminder: any): boolean => {
    if (!reminder.lastTaken) return false;
    const today = new Date();
    const takenDate = new Date(reminder.lastTaken);
    return today.toDateString() === takenDate.toDateString();
  };

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">💊</span>
          <h3 className="font-semibold" style={{ color: 'var(--mood-text)' }}>
            Rappels du jour
          </h3>
        </div>
        <button
          onClick={() => setView('reminders')}
          className="text-sm opacity-70 hover:opacity-100 transition-opacity"
          style={{ color: 'var(--mood-text)' }}
        >
          Voir tout →
        </button>
      </div>

      {upcomingReminders.length === 0 ? (
        <div className="text-center py-4">
          <p className="text-sm opacity-70" style={{ color: 'var(--mood-text)' }}>
            Aucun rappel aujourd'hui
          </p>
          <button
            onClick={() => setView('reminders')}
            className="text-sm mt-2 underline"
            style={{ color: 'var(--mood-primary)' }}
          >
            Créer un rappel
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {upcomingReminders.map(reminder => {
            const isTaken = isReminderTakenToday(reminder);
            
            return (
              <div
                key={reminder.id}
                className={`
                  flex items-center gap-3 p-3 rounded-xl transition-all
                  ${isTaken ? 'bg-green-50 border border-green-200' : 'bg-slate-50 border border-slate-200'}
                `}
              >
                <span className="text-lg">{reminder.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-slate-800 truncate">
                    {reminder.name}
                  </p>
                  <p className="text-xs text-slate-600">
                    {reminder.time}
                  </p>
                </div>
                
                {isTaken ? (
                  <div className="text-green-600 text-sm font-medium">
                    Pris ✅
                  </div>
                ) : (
                  <button
                    onClick={() => markAsTaken(reminder.id)}
                    className="px-2 py-1 text-xs rounded-lg bg-green-100 text-green-700 hover:bg-green-200 transition-colors"
                  >
                    Pris
                  </button>
                )}
              </div>
            );
          })}
          
          {todaysReminders.length > 3 && (
            <div className="text-center pt-2">
              <p className="text-xs opacity-70" style={{ color: 'var(--mood-text)' }}>
                +{todaysReminders.length - 3} autres rappels
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}