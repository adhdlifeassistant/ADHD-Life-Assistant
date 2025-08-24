import { Reminder } from '@/types/reminders';

class NotificationService {
  private isInitialized = false;
  private registration: ServiceWorkerRegistration | null = null;

  async initialize() {
    if (this.isInitialized) return;

    try {
      // Enregistrer le Service Worker
      if ('serviceWorker' in navigator) {
        this.registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered');
      }

      // Écouter les messages du Service Worker
      navigator.serviceWorker.addEventListener('message', this.handleServiceWorkerMessage);

      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize notification service:', error);
    }
  }

  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('Notifications not supported');
      return false;
    }

    let permission = Notification.permission;

    if (permission === 'default') {
      permission = await Notification.requestPermission();
    }

    return permission === 'granted';
  }

  private handleServiceWorkerMessage = (event: MessageEvent) => {
    if (event.data.type === 'REMINDER_ACTION') {
      const { action, reminderId } = event.data;
      
      // Émettre un événement personnalisé que les composants peuvent écouter
      const customEvent = new CustomEvent('reminderAction', {
        detail: { action, reminderId }
      });
      window.dispatchEvent(customEvent);
    }
  };

  async scheduleNotification(reminder: Reminder, scheduledTime: number) {
    if (!this.registration) {
      await this.initialize();
    }

    if (!this.registration) {
      console.error('Service Worker not available');
      return;
    }

    // Envoie le rappel au Service Worker
    this.registration.active?.postMessage({
      type: 'SCHEDULE_NOTIFICATION',
      reminder,
      scheduledTime
    });
  }

  calculateNextNotificationTime(reminder: Reminder): number {
    const now = new Date();
    const [hours, minutes] = reminder.time.split(':').map(Number);
    
    const nextNotification = new Date();
    nextNotification.setHours(hours, minutes, 0, 0);

    // Si l'heure est passée aujourd'hui, programmer pour demain
    if (nextNotification <= now) {
      nextNotification.setDate(nextNotification.getDate() + 1);
    }

    // Si le rappel est en snooze, utiliser l'heure de snooze
    if (reminder.snoozedUntil && reminder.snoozedUntil > now.getTime()) {
      return reminder.snoozedUntil;
    }

    return nextNotification.getTime();
  }

  async scheduleAllReminders(reminders: Reminder[]) {
    const hasPermission = await this.requestPermission();
    if (!hasPermission) return;

    for (const reminder of reminders) {
      if (reminder.isActive) {
        const nextTime = this.calculateNextNotificationTime(reminder);
        await this.scheduleNotification(reminder, nextTime);
      }
    }
  }

  async showTestNotification() {
    const hasPermission = await this.requestPermission();
    if (!hasPermission) return false;

    if (this.registration) {
      await this.registration.showNotification('Test Notification 💊', {
        body: 'Les notifications fonctionnent !',
        icon: '/icon-192x192.png',
        badge: '/icon-72x72.png',
        tag: 'test-notification'
      });
      return true;
    }
    return false;
  }
}

export const notificationService = new NotificationService();

// Accessibility announcement service for screen readers
export class AccessibilityService {
  private static instance: AccessibilityService;
  
  static getInstance(): AccessibilityService {
    if (!AccessibilityService.instance) {
      AccessibilityService.instance = new AccessibilityService();
    }
    return AccessibilityService.instance;
  }

  private constructor() {}

  /**
   * Announce a message to screen readers using live regions
   * @param message - The message to announce
   * @param priority - 'polite' for non-urgent, 'assertive' for urgent
   * @param type - 'status' for status updates, 'live' for general announcements
   */
  announce(message: string, priority: 'polite' | 'assertive' = 'polite', type: 'status' | 'live' = 'live') {
    const regionId = type === 'status' ? 'status-region' : 'live-region';
    const region = document.getElementById(regionId);
    
    if (region) {
      // Clear first to ensure screen readers pick up the change
      region.textContent = '';
      
      // Set the aria-live priority
      region.setAttribute('aria-live', priority);
      
      // Add the message with a small delay to ensure screen readers detect the change
      setTimeout(() => {
        region.textContent = message;
      }, 100);
      
      // Clear after a reasonable time to prevent cluttering
      setTimeout(() => {
        region.textContent = '';
      }, 5000);
    }
  }

  /**
   * Announce form validation errors
   */
  announceFormError(fieldName: string, error: string) {
    this.announce(`Erreur dans le champ ${fieldName}: ${error}`, 'assertive', 'status');
  }

  /**
   * Announce successful form submission
   */
  announceFormSuccess(message: string) {
    this.announce(`Succès: ${message}`, 'polite', 'status');
  }

  /**
   * Announce navigation changes
   */
  announceNavigation(newLocation: string) {
    this.announce(`Navigation vers ${newLocation}`, 'polite', 'live');
  }

  /**
   * Announce mood changes
   */
  announceMoodChange(moodLabel: string, moodDescription: string) {
    this.announce(`Humeur changée en ${moodLabel}: ${moodDescription}`, 'polite', 'live');
  }

  /**
   * Announce loading states
   */
  announceLoading(message: string) {
    this.announce(`${message}`, 'polite', 'status');
  }

  /**
   * Announce completion states
   */
  announceCompletion(message: string) {
    this.announce(`${message}`, 'polite', 'status');
  }
}

export const a11yService = AccessibilityService.getInstance();