export interface PrivacyModeSettings {
  enabled: boolean;
  autoEnableOnBackground: boolean;
  autoEnableDelay: number; // secondes
  hideNotifications: boolean;
  blurSensitiveData: boolean;
  showGenericTitle: boolean;
  customCoverText: string;
}

export interface SessionSettings {
  timeoutMinutes: number;
  warnBeforeTimeout: boolean;
  warningMinutes: number;
  logoutOnBackground: boolean;
  backgroundGraceMinutes: number;
}

export class PrivacyModeService {
  private static instance: PrivacyModeService;
  private isPrivacyModeActive = false;
  private backgroundTimer: NodeJS.Timeout | null = null;
  private sessionTimer: NodeJS.Timeout | null = null;
  private warningTimer: NodeJS.Timeout | null = null;
  private lastActivity = Date.now();
  private callbacks: Array<(event: string, data?: any) => void> = [];
  
  // Éléments à masquer en mode privé
  private readonly SENSITIVE_SELECTORS = [
    '[data-sensitive="true"]',
    '[data-medical="true"]',
    '.mood-entry',
    '.medication-name',
    '.personal-note',
    '.symptom-description'
  ];

  static getInstance(): PrivacyModeService {
    if (!PrivacyModeService.instance) {
      PrivacyModeService.instance = new PrivacyModeService();
    }
    return PrivacyModeService.instance;
  }

  private constructor() {
    this.initializeEventListeners();
    this.loadSettings();
  }

  /**
   * Initialise les listeners pour détecter l'activité utilisateur
   */
  private initializeEventListeners(): void {
    if (typeof window === 'undefined') return;

    // Détecter l'activité utilisateur
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    activityEvents.forEach(event => {
      document.addEventListener(event, this.updateActivity.bind(this), true);
    });

    // Détecter quand l'app passe en arrière-plan
    document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
    window.addEventListener('blur', this.handleWindowBlur.bind(this));
    window.addEventListener('focus', this.handleWindowFocus.bind(this));

    // Détecter les tentatives de capture d'écran (approximatif)
    document.addEventListener('keydown', this.handleKeyDown.bind(this));
  }

  /**
   * Met à jour le timestamp de dernière activité
   */
  private updateActivity(): void {
    this.lastActivity = Date.now();
    this.resetSessionTimer();
    
    // Désactiver le mode privé si activé automatiquement
    if (this.isPrivacyModeActive && this.isAutoEnabled()) {
      this.disablePrivacyMode();
    }
  }

  /**
   * Gère le changement de visibilité de l'app
   */
  private handleVisibilityChange(): void {
    const settings = this.getSettings();
    
    if (document.hidden) {
      // App en arrière-plan
      if (settings.autoEnableOnBackground) {
        this.schedulePrivacyMode();
      }
      
      if (this.getSessionSettings().logoutOnBackground) {
        this.scheduleBackgroundLogout();
      }
    } else {
      // App revenue au premier plan
      this.cancelScheduledActions();
      this.updateActivity();
    }
  }

  /**
   * Gère la perte de focus de la fenêtre
   */
  private handleWindowBlur(): void {
    const settings = this.getSettings();
    if (settings.autoEnableOnBackground) {
      this.schedulePrivacyMode();
    }
  }

  /**
   * Gère le retour de focus sur la fenêtre
   */
  private handleWindowFocus(): void {
    this.cancelScheduledActions();
    this.updateActivity();
  }

  /**
   * Détecte les tentatives de capture d'écran
   */
  private handleKeyDown(event: KeyboardEvent): void {
    // Combinaisons communes de capture d'écran
    const isScreenshot = 
      (event.key === 'PrintScreen') ||
      (event.metaKey && event.shiftKey && (event.key === '3' || event.key === '4')) || // macOS
      (event.altKey && event.key === 'PrintScreen'); // Windows Alt+PrtScr

    if (isScreenshot && this.getSettings().blurSensitiveData) {
      this.enablePrivacyMode(true, 'screenshot_detected');
      
      // Désactiver après 2 secondes
      setTimeout(() => {
        this.disablePrivacyMode();
      }, 2000);
    }
  }

  /**
   * Active le mode privé
   */
  enablePrivacyMode(temporary: boolean = false, reason: string = 'manual'): void {
    if (this.isPrivacyModeActive) return;

    this.isPrivacyModeActive = true;
    this.applyPrivacyFilters();
    
    // Modifier le titre de la page si configuré
    if (this.getSettings().showGenericTitle) {
      this.setGenericTitle();
    }

    // Masquer les notifications sensibles
    if (this.getSettings().hideNotifications) {
      this.hideNotifications();
    }

    // Log de l'activation
    this.logPrivacyEvent('privacy_mode_enabled', { reason, temporary });
    this.notifyCallbacks('privacy_mode_enabled', { reason, temporary });

    // Restaurer automatiquement si temporaire
    if (temporary) {
      setTimeout(() => {
        this.disablePrivacyMode();
      }, 5000);
    }
  }

  /**
   * Désactive le mode privé
   */
  disablePrivacyMode(): void {
    if (!this.isPrivacyModeActive) return;

    this.isPrivacyModeActive = false;
    this.removePrivacyFilters();
    this.restoreOriginalTitle();
    this.showNotifications();

    this.logPrivacyEvent('privacy_mode_disabled');
    this.notifyCallbacks('privacy_mode_disabled');
  }

  /**
   * Applique les filtres de confidentialité
   */
  private applyPrivacyFilters(): void {
    const settings = this.getSettings();
    
    if (settings.blurSensitiveData) {
      // Ajouter une classe CSS pour flouter les données sensibles
      document.body.classList.add('privacy-mode-active');
      
      // Masquer spécifiquement les éléments sensibles
      this.SENSITIVE_SELECTORS.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
          (element as HTMLElement).style.filter = 'blur(8px)';
          (element as HTMLElement).style.pointerEvents = 'none';
        });
      });
    }

    // Afficher un overlay de protection si configuré
    if (settings.customCoverText) {
      this.showPrivacyOverlay(settings.customCoverText);
    }
  }

  /**
   * Supprime les filtres de confidentialité
   */
  private removePrivacyFilters(): void {
    document.body.classList.remove('privacy-mode-active');
    
    this.SENSITIVE_SELECTORS.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        (element as HTMLElement).style.filter = '';
        (element as HTMLElement).style.pointerEvents = '';
      });
    });

    this.hidePrivacyOverlay();
  }

  /**
   * Affiche un overlay de protection
   */
  private showPrivacyOverlay(message: string): void {
    const existing = document.getElementById('privacy-overlay');
    if (existing) return;

    const overlay = document.createElement('div');
    overlay.id = 'privacy-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(20px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;

    overlay.innerHTML = `
      <div style="text-align: center; padding: 2rem;">
        <div style="font-size: 4rem; margin-bottom: 1rem;">🔒</div>
        <div style="font-size: 1.5rem; font-weight: 600; color: #374151; margin-bottom: 0.5rem;">Mode Privé Actif</div>
        <div style="color: #6B7280;">${message}</div>
        <div style="margin-top: 1rem; font-size: 0.9rem; color: #9CA3AF;">Touchez l'écran pour déverrouiller</div>
      </div>
    `;

    overlay.addEventListener('click', () => {
      this.disablePrivacyMode();
    });

    document.body.appendChild(overlay);
  }

  /**
   * Cache l'overlay de protection
   */
  private hidePrivacyOverlay(): void {
    const overlay = document.getElementById('privacy-overlay');
    if (overlay) {
      overlay.remove();
    }
  }

  /**
   * Programme l'activation du mode privé
   */
  private schedulePrivacyMode(): void {
    const settings = this.getSettings();
    if (!settings.autoEnableOnBackground) return;

    this.backgroundTimer = setTimeout(() => {
      this.enablePrivacyMode(false, 'auto_background');
    }, settings.autoEnableDelay * 1000);
  }

  /**
   * Programme la déconnexion en arrière-plan
   */
  private scheduleBackgroundLogout(): void {
    const sessionSettings = this.getSessionSettings();
    if (!sessionSettings.logoutOnBackground) return;

    this.backgroundTimer = setTimeout(() => {
      this.performLogout('background_timeout');
    }, sessionSettings.backgroundGraceMinutes * 60 * 1000);
  }

  /**
   * Annule les actions programmées
   */
  private cancelScheduledActions(): void {
    if (this.backgroundTimer) {
      clearTimeout(this.backgroundTimer);
      this.backgroundTimer = null;
    }
  }

  /**
   * Reset le timer de session
   */
  private resetSessionTimer(): void {
    const sessionSettings = this.getSessionSettings();
    
    // Annuler les timers existants
    if (this.sessionTimer) clearTimeout(this.sessionTimer);
    if (this.warningTimer) clearTimeout(this.warningTimer);

    // Programmer l'avertissement
    if (sessionSettings.warnBeforeTimeout) {
      const warningTime = (sessionSettings.timeoutMinutes - sessionSettings.warningMinutes) * 60 * 1000;
      if (warningTime > 0) {
        this.warningTimer = setTimeout(() => {
          this.showSessionWarning();
        }, warningTime);
      }
    }

    // Programmer la déconnexion
    this.sessionTimer = setTimeout(() => {
      this.performLogout('session_timeout');
    }, sessionSettings.timeoutMinutes * 60 * 1000);
  }

  /**
   * Affiche l'avertissement de fin de session
   */
  private showSessionWarning(): void {
    const sessionSettings = this.getSessionSettings();
    
    this.notifyCallbacks('session_warning', {
      remainingMinutes: sessionSettings.warningMinutes
    });
  }

  /**
   * Effectue la déconnexion
   */
  private performLogout(reason: string): void {
    this.logPrivacyEvent('session_logout', { reason });
    this.notifyCallbacks('session_logout', { reason });
    
    // Nettoyer les timers
    this.cancelScheduledActions();
    if (this.sessionTimer) clearTimeout(this.sessionTimer);
    if (this.warningTimer) clearTimeout(this.warningTimer);
  }

  /**
   * Gestion du titre de page générique
   */
  private originalTitle = '';
  
  private setGenericTitle(): void {
    this.originalTitle = document.title;
    document.title = 'Application de Santé';
  }

  private restoreOriginalTitle(): void {
    if (this.originalTitle) {
      document.title = this.originalTitle;
    }
  }

  /**
   * Gestion des notifications
   */
  private hideNotifications(): void {
    // Masquer les notifications du navigateur
    if ('Notification' in window && Notification.permission === 'granted') {
      // Note: Il n'y a pas de méthode native pour masquer les notifications existantes
      // Cette fonctionnalité devrait être gérée par le système de notifications de l'app
    }
  }

  private showNotifications(): void {
    // Réafficher les notifications (si implémenté dans le système de notifications)
  }

  /**
   * Paramètres et configuration
   */
  getSettings(): PrivacyModeSettings {
    const stored = localStorage.getItem('adhd_privacy_settings');
    return stored ? JSON.parse(stored) : this.getDefaultSettings();
  }

  private getDefaultSettings(): PrivacyModeSettings {
    return {
      enabled: false,
      autoEnableOnBackground: true,
      autoEnableDelay: 5, // 5 secondes
      hideNotifications: true,
      blurSensitiveData: true,
      showGenericTitle: true,
      customCoverText: 'Données médicales protégées'
    };
  }

  updateSettings(settings: Partial<PrivacyModeSettings>): void {
    const current = this.getSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem('adhd_privacy_settings', JSON.stringify(updated));
    
    this.logPrivacyEvent('settings_updated', settings);
  }

  getSessionSettings(): SessionSettings {
    const stored = localStorage.getItem('adhd_session_settings');
    return stored ? JSON.parse(stored) : this.getDefaultSessionSettings();
  }

  private getDefaultSessionSettings(): SessionSettings {
    return {
      timeoutMinutes: 30,
      warnBeforeTimeout: true,
      warningMinutes: 5,
      logoutOnBackground: false,
      backgroundGraceMinutes: 5
    };
  }

  updateSessionSettings(settings: Partial<SessionSettings>): void {
    const current = this.getSessionSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem('adhd_session_settings', JSON.stringify(updated));
    
    // Redémarrer le timer de session avec les nouveaux paramètres
    this.resetSessionTimer();
    
    this.logPrivacyEvent('session_settings_updated', settings);
  }

  /**
   * État et utilitaires
   */
  isPrivacyModeEnabled(): boolean {
    return this.isPrivacyModeActive;
  }

  private isAutoEnabled(): boolean {
    // Détermine si le mode privé a été activé automatiquement
    const logs = this.getPrivacyLogs();
    const lastLog = logs[logs.length - 1];
    return lastLog?.data?.reason === 'auto_background' || lastLog?.data?.reason === 'screenshot_detected';
  }

  getLastActivity(): number {
    return this.lastActivity;
  }

  extendSession(minutes: number = 30): void {
    this.updateActivity();
    this.logPrivacyEvent('session_extended', { minutes });
  }

  /**
   * Logging et callbacks
   */
  private logPrivacyEvent(event: string, data?: any): void {
    const logEntry = {
      event: `privacy_${event}`,
      timestamp: Date.now(),
      data: data || {},
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown'
    };

    const existingLogs = this.getPrivacyLogs();
    existingLogs.push(logEntry);
    
    // Garder seulement les 200 derniers événements
    if (existingLogs.length > 200) {
      existingLogs.splice(0, existingLogs.length - 200);
    }
    
    localStorage.setItem('adhd_privacy_log', JSON.stringify(existingLogs));
  }

  getPrivacyLogs(): any[] {
    const stored = localStorage.getItem('adhd_privacy_log');
    return stored ? JSON.parse(stored) : [];
  }

  onPrivacyEvent(callback: (event: string, data?: any) => void): void {
    this.callbacks.push(callback);
  }

  private notifyCallbacks(event: string, data?: any): void {
    this.callbacks.forEach(callback => callback(event, data));
  }

  /**
   * Charger les paramètres au démarrage
   */
  private loadSettings(): void {
    const settings = this.getSettings();
    if (settings.enabled) {
      this.resetSessionTimer();
    }
  }

  /**
   * Nettoyage
   */
  destroy(): void {
    this.cancelScheduledActions();
    if (this.sessionTimer) clearTimeout(this.sessionTimer);
    if (this.warningTimer) clearTimeout(this.warningTimer);
    
    this.disablePrivacyMode();
  }
}