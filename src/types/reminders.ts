export type ReminderFrequency = 'daily' | 'weekly' | 'monthly' | 'once';

export interface Reminder {
  id: string;
  name: string;
  time: string; // Format HH:MM
  frequency: ReminderFrequency;
  isActive: boolean;
  createdAt: number;
  lastTaken?: number;
  snoozedUntil?: number;
  icon: string;
  color: string;
  quantity?: number;
  unit?: string;
}

export interface ReminderNotification {
  id: string;
  reminderId: string;
  scheduledFor: number;
  isShown: boolean;
  isSnoozed: boolean;
}

export interface ReminderFormData {
  name: string;
  time: string;
  frequency: ReminderFrequency;
  icon: string;
  quantity?: number;
  unit?: string;
}

export interface ReminderContextType {
  reminders: Reminder[];
  addReminder: (reminderData: ReminderFormData) => void;
  updateReminder: (id: string, updates: Partial<Reminder>) => void;
  deleteReminder: (id: string) => void;
  markAsTaken: (id: string) => void;
  snoozeReminder: (id: string, minutes: number) => void;
  getTodaysReminders: () => Reminder[];
  getUpcomingReminders: () => Reminder[];
}