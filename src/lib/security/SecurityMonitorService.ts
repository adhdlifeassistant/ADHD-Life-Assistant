export interface SecurityAlert {
  id: string;
  type: 'suspicious_login' | 'unusual_activity' | 'data_breach_attempt' | 'multiple_failures' | 'unknown_device' | 'location_change';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: number;
  details: any;
  resolved: boolean;
  actions: string[];
}

export interface DeviceFingerprint {
  id: string;
  userAgent: string;
  screenResolution: string;
  timezone: string;
  language: string;
  platform: string;
  cookiesEnabled: boolean;
  timestamp: number;
  trusted: boolean;
  lastSeen: number;
  accessCount: number;
}

export interface SecurityAnalytics {
  loginPatterns: {
    averageSessionDuration: number;
    commonLoginTimes: number[];
    commonDaysOfWeek: number[];
    averageFailures: number;
  };
  devicePatterns: {
    knownDevices: number;
    newDevicesLastMonth: number;
    suspiciousDevices: number;
  };
  activityPatterns: {
    averageClicksPerSession: number;
    commonFeatures: string[];
    unusualActivityThreshold: number;
  };
}

export class SecurityMonitorService {
  private static instance: SecurityMonitorService;
  private alerts: SecurityAlert[] = [];
  private knownDevices: DeviceFingerprint[] = [];
  private sessionMetrics: any = {};
  private callbacks: Array<(alert: SecurityAlert) => void> = [];

  // Seuils de détection
  private readonly FAILED_LOGIN_THRESHOLD = 5;
  private readonly UNUSUAL_HOUR_THRESHOLD = 2; // 2h du matin - 6h du matin
  private readonly SESSION_DURATION_ANOMALY = 3; // 3x la durée moyenne
  private readonly CLICK_RATE_ANOMALY = 5; // 5x le taux moyen

  static getInstance(): SecurityMonitorService {
    if (!SecurityMonitorService.instance) {
      SecurityMonitorService.instance = new SecurityMonitorService();
    }
    return SecurityMonitorService.instance;
  }

  private constructor() {
    this.loadStoredData();
    this.initializeMonitoring();
  }

  /**
   * Initialise le monitoring en continu
   */
  private initializeMonitoring(): void {
    if (typeof window === 'undefined') return;

    // Détecter les patterns d'activité inhabituels
    this.startActivityMonitoring();
    
    // Vérifier périodiquement les anomalies
    setInterval(() => {
      this.performSecurityCheck();
    }, 5 * 60 * 1000); // Toutes les 5 minutes

    // Monitoring des événements du navigateur
    this.initializeBrowserMonitoring();
  }

  /**
   * Démarre le monitoring d'activité
   */
  private startActivityMonitoring(): void {
    let clickCount = 0;
    let keystrokeCount = 0;
    let lastClickTime = 0;
    
    const resetCounters = () => {
      clickCount = 0;
      keystrokeCount = 0;
    };

    // Compter les clics
    document.addEventListener('click', (event) => {
      const currentTime = Date.now();
      
      clickCount++;
      
      // Détecter les clics trop rapides (possibles scripts automatisés)
      if (currentTime - lastClickTime < 100) { // Moins de 100ms entre clics
        this.triggerAlert('suspicious_login', 'medium', 
          'Activité de clic inhabituelle détectée', 
          { rapidClicks: true, interval: currentTime - lastClickTime }
        );
      }
      
      lastClickTime = currentTime;
    });

    // Compter les frappes
    document.addEventListener('keydown', () => {
      keystrokeCount++;
    });

    // Vérifier les métriques toutes les minutes
    setInterval(() => {
      this.analyzeActivityMetrics(clickCount, keystrokeCount);
      resetCounters();
    }, 60 * 1000);
  }

  /**
   * Initialise le monitoring du navigateur
   */
  private initializeBrowserMonitoring(): void {
    // Détecter les outils de développement ouverts
    let devtools = false;
    setInterval(() => {
      const threshold = 160;
      if (window.outerHeight - window.innerHeight > threshold || 
          window.outerWidth - window.innerWidth > threshold) {
        if (!devtools) {
          devtools = true;
          this.triggerAlert('data_breach_attempt', 'high',
            'Outils de développement détectés - Accès potentiel aux données',
            { devToolsOpen: true }
          );
        }
      } else {
        devtools = false;
      }
    }, 1000);

    // Détecter les tentatives d'accès au localStorage depuis la console
    this.protectLocalStorage();
  }

  /**
   * Protège l'accès au localStorage
   */
  private protectLocalStorage(): void {
    const originalGetItem = Storage.prototype.getItem;
    const originalSetItem = Storage.prototype.setItem;
    
    Storage.prototype.getItem = function(key: string) {
      if (key.startsWith('adhd_') && this === localStorage) {
        SecurityMonitorService.getInstance().logStorageAccess('get', key);
      }
      return originalGetItem.call(this, key);
    };

    Storage.prototype.setItem = function(key: string, value: string) {
      if (key.startsWith('adhd_') && this === localStorage) {
        SecurityMonitorService.getInstance().logStorageAccess('set', key);
      }
      return originalSetItem.call(this, key, value);
    };
  }

  /**
   * Log des accès au storage
   */
  private logStorageAccess(operation: 'get' | 'set', key: string): void {
    // Compter les accès suspects
    const storageLog = this.getStorageAccessLog();
    const recentAccess = storageLog.filter(log => Date.now() - log.timestamp < 60000); // 1 minute
    
    if (recentAccess.length > 50) { // Plus de 50 accès par minute
      this.triggerAlert('data_breach_attempt', 'high',
        'Accès massif aux données détecté',
        { operation, key, accessCount: recentAccess.length }
      );
    }
    
    // Logger l'accès
    storageLog.push({
      operation,
      key: key.startsWith('adhd_') ? '[PROTECTED]' : key,
      timestamp: Date.now(),
      stack: new Error().stack?.split('\n').slice(0, 3).join('\n') || 'unknown'
    });
    
    // Garder seulement les 1000 derniers accès
    if (storageLog.length > 1000) {
      storageLog.splice(0, storageLog.length - 1000);
    }
    
    localStorage.setItem('adhd_storage_access_log', JSON.stringify(storageLog));
  }

  /**
   * Récupère le log des accès au storage
   */
  private getStorageAccessLog(): any[] {
    const stored = localStorage.getItem('adhd_storage_access_log');
    return stored ? JSON.parse(stored) : [];
  }

  /**
   * Analyse les métriques d'activité
   */
  private analyzeActivityMetrics(clicks: number, keystrokes: number): void {
    const analytics = this.getSecurityAnalytics();
    
    // Détecter un taux de clics anormal
    if (clicks > analytics.activityPatterns.averageClicksPerSession * this.CLICK_RATE_ANOMALY) {
      this.triggerAlert('unusual_activity', 'medium',
        'Taux d\'activité inhabituel détecté',
        { clicks, expectedMax: analytics.activityPatterns.averageClicksPerSession * 2 }
      );
    }

    // Mettre à jour les métriques
    this.updateActivityMetrics(clicks, keystrokes);
  }

  /**
   * Met à jour les métriques d'activité
   */
  private updateActivityMetrics(clicks: number, keystrokes: number): void {
    if (!this.sessionMetrics.activity) {
      this.sessionMetrics.activity = [];
    }
    
    this.sessionMetrics.activity.push({
      timestamp: Date.now(),
      clicks,
      keystrokes,
      hour: new Date().getHours()
    });
    
    // Garder seulement les données des 7 derniers jours
    const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    this.sessionMetrics.activity = this.sessionMetrics.activity.filter(
      (metric: any) => metric.timestamp > weekAgo
    );
  }

  /**
   * Enregistre une nouvelle session
   */
  recordSession(deviceInfo: any, loginSuccess: boolean): void {
    const fingerprint = this.generateDeviceFingerprint();
    const isKnownDevice = this.isDeviceKnown(fingerprint);
    
    if (!isKnownDevice && loginSuccess) {
      this.triggerAlert('unknown_device', 'medium',
        'Connexion depuis un nouvel appareil',
        { fingerprint: fingerprint.id, userAgent: fingerprint.userAgent }
      );
    }

    if (loginSuccess) {
      this.updateDeviceInfo(fingerprint);
      this.recordLoginPattern();
    } else {
      this.recordFailedLogin();
    }
  }

  /**
   * Génère une empreinte d'appareil
   */
  private generateDeviceFingerprint(): DeviceFingerprint {
    const nav = navigator;
    const screen = window.screen;
    
    const fingerprint = {
      userAgent: nav.userAgent,
      screenResolution: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: nav.language,
      platform: nav.platform,
      cookiesEnabled: nav.cookieEnabled
    };
    
    // Générer un ID unique basé sur les caractéristiques
    const fpString = JSON.stringify(fingerprint);
    let hash = 0;
    for (let i = 0; i < fpString.length; i++) {
      const char = fpString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    
    return {
      id: hash.toString(16),
      ...fingerprint,
      timestamp: Date.now(),
      trusted: false,
      lastSeen: Date.now(),
      accessCount: 1
    };
  }

  /**
   * Vérifie si l'appareil est connu
   */
  private isDeviceKnown(fingerprint: DeviceFingerprint): boolean {
    return this.knownDevices.some(device => device.id === fingerprint.id);
  }

  /**
   * Met à jour les informations d'appareil
   */
  private updateDeviceInfo(fingerprint: DeviceFingerprint): void {
    const existingIndex = this.knownDevices.findIndex(device => device.id === fingerprint.id);
    
    if (existingIndex >= 0) {
      this.knownDevices[existingIndex].lastSeen = Date.now();
      this.knownDevices[existingIndex].accessCount++;
      
      // Marquer comme trusted après 3 connexions réussies
      if (this.knownDevices[existingIndex].accessCount >= 3) {
        this.knownDevices[existingIndex].trusted = true;
      }
    } else {
      this.knownDevices.push(fingerprint);
    }
    
    this.saveKnownDevices();
  }

  /**
   * Enregistre un pattern de connexion
   */
  private recordLoginPattern(): void {
    const now = new Date();
    const loginData = {
      timestamp: Date.now(),
      hour: now.getHours(),
      dayOfWeek: now.getDay(),
      success: true
    };
    
    if (!this.sessionMetrics.logins) {
      this.sessionMetrics.logins = [];
    }
    
    this.sessionMetrics.logins.push(loginData);
    
    // Détecter les connexions à des heures inhabituelles
    if (loginData.hour >= this.UNUSUAL_HOUR_THRESHOLD && loginData.hour <= 6) {
      this.triggerAlert('unusual_activity', 'low',
        'Connexion à une heure inhabituelle',
        { hour: loginData.hour, message: 'Connexion durant la nuit détectée' }
      );
    }
  }

  /**
   * Enregistre une tentative de connexion échouée
   */
  private recordFailedLogin(): void {
    if (!this.sessionMetrics.failedLogins) {
      this.sessionMetrics.failedLogins = [];
    }
    
    const recentFails = this.sessionMetrics.failedLogins.filter(
      (fail: any) => Date.now() - fail.timestamp < 15 * 60 * 1000 // 15 minutes
    );
    
    this.sessionMetrics.failedLogins.push({
      timestamp: Date.now(),
      userAgent: navigator.userAgent
    });
    
    // Détecter les attaques par force brute
    if (recentFails.length >= this.FAILED_LOGIN_THRESHOLD) {
      this.triggerAlert('multiple_failures', 'high',
        'Multiples tentatives de connexion échouées',
        { 
          attempts: recentFails.length,
          timeframe: '15 minutes',
          recommendation: 'Compte temporairement verrouillé'
        }
      );
    }
  }

  /**
   * Effectue une vérification de sécurité périodique
   */
  private performSecurityCheck(): void {
    // Vérifier les sessions anormalement longues
    this.checkSessionDuration();
    
    // Vérifier les patterns d'activité
    this.checkActivityPatterns();
    
    // Nettoyer les anciennes données
    this.cleanupOldData();
  }

  /**
   * Vérifie la durée des sessions
   */
  private checkSessionDuration(): void {
    const analytics = this.getSecurityAnalytics();
    const currentSessionDuration = Date.now() - (this.sessionMetrics.sessionStart || Date.now());
    
    if (currentSessionDuration > analytics.loginPatterns.averageSessionDuration * this.SESSION_DURATION_ANOMALY) {
      this.triggerAlert('unusual_activity', 'low',
        'Session inhabituellement longue',
        { 
          duration: Math.round(currentSessionDuration / 60000) + ' minutes',
          average: Math.round(analytics.loginPatterns.averageSessionDuration / 60000) + ' minutes'
        }
      );
    }
  }

  /**
   * Vérifie les patterns d'activité
   */
  private checkActivityPatterns(): void {
    if (!this.sessionMetrics.activity || this.sessionMetrics.activity.length === 0) return;
    
    const recentActivity = this.sessionMetrics.activity.slice(-10); // 10 dernières minutes
    const avgClicks = recentActivity.reduce((sum: number, activity: any) => sum + activity.clicks, 0) / recentActivity.length;
    
    const analytics = this.getSecurityAnalytics();
    
    if (avgClicks > analytics.activityPatterns.averageClicksPerSession * 2) {
      this.triggerAlert('unusual_activity', 'medium',
        'Pattern d\'activité inhabituel détecté',
        { 
          averageClicks: Math.round(avgClicks),
          expectedAverage: Math.round(analytics.activityPatterns.averageClicksPerSession)
        }
      );
    }
  }

  /**
   * Déclenche une alerte de sécurité
   */
  private triggerAlert(type: SecurityAlert['type'], severity: SecurityAlert['severity'], message: string, details: any): void {
    const alert: SecurityAlert = {
      id: this.generateId(),
      type,
      severity,
      message,
      timestamp: Date.now(),
      details,
      resolved: false,
      actions: this.getRecommendedActions(type, severity)
    };

    this.alerts.unshift(alert);
    
    // Garder seulement les 100 dernières alertes
    if (this.alerts.length > 100) {
      this.alerts = this.alerts.slice(0, 100);
    }

    this.saveAlerts();
    
    // Notifier les callbacks
    this.callbacks.forEach(callback => callback(alert));
    
    // Log de sécurité
    this.logSecurityEvent('alert_triggered', { 
      type, 
      severity, 
      message,
      alertId: alert.id
    });
  }

  /**
   * Obtient les actions recommandées pour une alerte
   */
  private getRecommendedActions(type: SecurityAlert['type'], severity: SecurityAlert['severity']): string[] {
    const actions: Record<string, string[]> = {
      suspicious_login: ['Vérifier les dernières connexions', 'Changer le mot de passe', 'Activer la double authentification'],
      unusual_activity: ['Vérifier l\'activité récente', 'Scanner l\'appareil', 'Déconnecter les autres sessions'],
      data_breach_attempt: ['Changer le mot de passe immédiatement', 'Vérifier les données', 'Contacter le support'],
      multiple_failures: ['Attendre 15 minutes', 'Vérifier l\'identité', 'Utiliser la biométrie'],
      unknown_device: ['Vérifier si c\'est vous', 'Approuver l\'appareil', 'Déconnecter si suspect'],
      location_change: ['Confirmer le changement', 'Vérifier les connexions actives']
    };

    return actions[type] || ['Surveiller l\'activité'];
  }

  /**
   * Marque une alerte comme résolue
   */
  resolveAlert(alertId: string): void {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;
      this.saveAlerts();
      
      this.logSecurityEvent('alert_resolved', { alertId });
    }
  }

  /**
   * Récupère toutes les alertes
   */
  getAllAlerts(): SecurityAlert[] {
    return [...this.alerts];
  }

  /**
   * Récupère les alertes non résolues
   */
  getUnresolvedAlerts(): SecurityAlert[] {
    return this.alerts.filter(alert => !alert.resolved);
  }

  /**
   * Génère les analytics de sécurité
   */
  getSecurityAnalytics(): SecurityAnalytics {
    const logins = this.sessionMetrics.logins || [];
    const activity = this.sessionMetrics.activity || [];
    
    return {
      loginPatterns: {
        averageSessionDuration: this.calculateAverageSessionDuration(),
        commonLoginTimes: this.getCommonLoginTimes(logins),
        commonDaysOfWeek: this.getCommonDays(logins),
        averageFailures: (this.sessionMetrics.failedLogins || []).length / Math.max(logins.length, 1)
      },
      devicePatterns: {
        knownDevices: this.knownDevices.length,
        newDevicesLastMonth: this.knownDevices.filter(d => Date.now() - d.timestamp < 30 * 24 * 60 * 60 * 1000).length,
        suspiciousDevices: this.knownDevices.filter(d => !d.trusted && d.accessCount === 1).length
      },
      activityPatterns: {
        averageClicksPerSession: activity.length > 0 ? activity.reduce((sum: number, a: any) => sum + a.clicks, 0) / activity.length : 0,
        commonFeatures: this.getCommonFeatures(),
        unusualActivityThreshold: 10
      }
    };
  }

  /**
   * Utilitaires privés
   */
  private calculateAverageSessionDuration(): number {
    // Simulation - dans une vraie app, on trackersait les vraies durées de session
    return 25 * 60 * 1000; // 25 minutes en moyenne
  }

  private getCommonLoginTimes(logins: any[]): number[] {
    const hours = logins.map(login => login.hour);
    const hourCounts: Record<number, number> = {};
    
    hours.forEach(hour => {
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });
    
    return Object.entries(hourCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([hour]) => parseInt(hour));
  }

  private getCommonDays(logins: any[]): number[] {
    const days = logins.map(login => login.dayOfWeek);
    const dayCounts: Record<number, number> = {};
    
    days.forEach(day => {
      dayCounts[day] = (dayCounts[day] || 0) + 1;
    });
    
    return Object.entries(dayCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([day]) => parseInt(day));
  }

  private getCommonFeatures(): string[] {
    // Simulation des fonctionnalités les plus utilisées
    return ['mood-tracking', 'medication-reminders', 'habit-tracking'];
  }

  private cleanupOldData(): void {
    const monthAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    
    // Nettoyer les anciennes métriques
    if (this.sessionMetrics.logins) {
      this.sessionMetrics.logins = this.sessionMetrics.logins.filter((login: any) => login.timestamp > monthAgo);
    }
    
    if (this.sessionMetrics.failedLogins) {
      this.sessionMetrics.failedLogins = this.sessionMetrics.failedLogins.filter((fail: any) => fail.timestamp > monthAgo);
    }
    
    // Nettoyer les anciens appareils (pas vus depuis 3 mois)
    const threeMonthsAgo = Date.now() - (90 * 24 * 60 * 60 * 1000);
    this.knownDevices = this.knownDevices.filter(device => device.lastSeen > threeMonthsAgo);
  }

  /**
   * Persistance et chargement des données
   */
  private loadStoredData(): void {
    try {
      const alerts = localStorage.getItem('adhd_security_alerts');
      this.alerts = alerts ? JSON.parse(alerts) : [];
      
      const devices = localStorage.getItem('adhd_known_devices');
      this.knownDevices = devices ? JSON.parse(devices) : [];
      
      const metrics = localStorage.getItem('adhd_session_metrics');
      this.sessionMetrics = metrics ? JSON.parse(metrics) : {};
    } catch (error) {
      console.error('Erreur lors du chargement des données de sécurité:', error);
    }
  }

  private saveAlerts(): void {
    localStorage.setItem('adhd_security_alerts', JSON.stringify(this.alerts));
  }

  private saveKnownDevices(): void {
    localStorage.setItem('adhd_known_devices', JSON.stringify(this.knownDevices));
  }

  private saveSessionMetrics(): void {
    localStorage.setItem('adhd_session_metrics', JSON.stringify(this.sessionMetrics));
  }

  private logSecurityEvent(event: string, data: any): void {
    const logEntry = {
      event: `security_${event}`,
      timestamp: Date.now(),
      data
    };
    
    const existingLogs = JSON.parse(localStorage.getItem('adhd_security_monitor_log') || '[]');
    existingLogs.push(logEntry);
    
    // Garder seulement les 500 derniers événements
    if (existingLogs.length > 500) {
      existingLogs.splice(0, existingLogs.length - 500);
    }
    
    localStorage.setItem('adhd_security_monitor_log', JSON.stringify(existingLogs));
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Callbacks et événements
   */
  onSecurityAlert(callback: (alert: SecurityAlert) => void): void {
    this.callbacks.push(callback);
  }

  /**
   * Démarrage et arrêt du monitoring
   */
  startSession(): void {
    this.sessionMetrics.sessionStart = Date.now();
    this.recordSession({}, true);
  }

  endSession(): void {
    if (this.sessionMetrics.sessionStart) {
      const duration = Date.now() - this.sessionMetrics.sessionStart;
      this.sessionMetrics.lastSessionDuration = duration;
    }
    
    this.saveSessionMetrics();
  }

  /**
   * Nettoyage complet des données
   */
  wipeAllSecurityData(): void {
    this.alerts = [];
    this.knownDevices = [];
    this.sessionMetrics = {};
    
    localStorage.removeItem('adhd_security_alerts');
    localStorage.removeItem('adhd_known_devices');
    localStorage.removeItem('adhd_session_metrics');
    localStorage.removeItem('adhd_security_monitor_log');
    localStorage.removeItem('adhd_storage_access_log');
  }
}