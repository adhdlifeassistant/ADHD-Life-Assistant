'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Reminder, ReminderContextType, ReminderFormData } from '@/types/reminders';
import { notificationService } from '@/lib/notificationService';

const MEDICATION_ICONS = ['💊', '🩹', '💉', '🧴', '⚕️'];
const MEDICATION_COLORS = ['blue', 'green', 'purple', 'orange', 'pink'];

const ReminderContext = createContext<ReminderContextType | undefined>(undefined);

export function ReminderProvider({ children }: { children: React.ReactNode }) {
  const [reminders, setReminders] = useState<Reminder[]>([]);

  useEffect(() => {
    const savedReminders = localStorage.getItem('adhd-reminders');
    if (savedReminders) {
      const parsed = JSON.parse(savedReminders);
      setReminders(parsed);
      notificationService.scheduleAllReminders(parsed);
    }

    // Initialiser le service de notifications
    notificationService.initialize();

    // Écouter les actions des notifications
    const handleReminderAction = (event: CustomEvent) => {
      const { action, reminderId } = event.detail;
      
      if (action === 'taken') {
        markAsTaken(reminderId);
      } else if (action === 'snooze') {
        snoozeReminder(reminderId, 15);
      } else if (action === 'later') {
        snoozeReminder(reminderId, 60);
      }
    };

    window.addEventListener('reminderAction', handleReminderAction as EventListener);
    
    return () => {
      window.removeEventListener('reminderAction', handleReminderAction as EventListener);
    };
  }, []);

  useEffect(() => {
    if (reminders.length > 0) {
      localStorage.setItem('adhd-reminders', JSON.stringify(reminders));
      notificationService.scheduleAllReminders(reminders);
    }
  }, [reminders]);

  const addReminder = (reminderData: ReminderFormData) => {
    const newReminder: Reminder = {
      id: Date.now().toString(),
      name: reminderData.name,
      time: reminderData.time,
      frequency: reminderData.frequency,
      isActive: true,
      createdAt: Date.now(),
      icon: reminderData.icon,
      color: MEDICATION_COLORS[Math.floor(Math.random() * MEDICATION_COLORS.length)]
    };

    setReminders(prev => [...prev, newReminder]);
  };

  const updateReminder = (id: string, updates: Partial<Reminder>) => {
    setReminders(prev => 
      prev.map(reminder => 
        reminder.id === id ? { ...reminder, ...updates } : reminder
      )
    );
  };

  const deleteReminder = (id: string) => {
    setReminders(prev => prev.filter(reminder => reminder.id !== id));
  };

  const markAsTaken = (id: string) => {
    setReminders(prev => 
      prev.map(reminder => 
        reminder.id === id 
          ? { ...reminder, lastTaken: Date.now(), snoozedUntil: undefined }
          : reminder
      )
    );
  };

  const snoozeReminder = (id: string, minutes: number) => {
    const snoozeUntil = Date.now() + (minutes * 60 * 1000);
    setReminders(prev => 
      prev.map(reminder => 
        reminder.id === id 
          ? { ...reminder, snoozedUntil: snoozeUntil }
          : reminder
      )
    );
  };

  const getTodaysReminders = () => {
    const today = new Date();
    return reminders.filter(reminder => {
      if (!reminder.isActive) return false;
      
      // Pour les rappels quotidiens, on les affiche tous les jours
      if (reminder.frequency === 'daily') return true;
      
      // TODO: Implémenter la logique pour weekly/monthly/once
      return true;
    });
  };

  const getUpcomingReminders = () => {
    const now = new Date();
    const todaysReminders = getTodaysReminders();
    
    return todaysReminders
      .map(reminder => {
        const [hours, minutes] = reminder.time.split(':').map(Number);
        const reminderTime = new Date();
        reminderTime.setHours(hours, minutes, 0, 0);
        
        // Si l'heure est passée, c'est pour demain
        if (reminderTime <= now) {
          reminderTime.setDate(reminderTime.getDate() + 1);
        }
        
        return {
          ...reminder,
          nextTime: reminderTime.getTime()
        };
      })
      .sort((a, b) => a.nextTime - b.nextTime);
  };

  return (
    <ReminderContext.Provider value={{
      reminders,
      addReminder,
      updateReminder,
      deleteReminder,
      markAsTaken,
      snoozeReminder,
      getTodaysReminders,
      getUpcomingReminders
    }}>
      {children}
    </ReminderContext.Provider>
  );
}

export function useReminders() {
  const context = useContext(ReminderContext);
  if (context === undefined) {
    throw new Error('useReminders must be used within a ReminderProvider');
  }
  return context;
}

export { MEDICATION_ICONS };