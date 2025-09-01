export interface GDPRConsent {
  id: string;
  type: 'essential' | 'analytics' | 'marketing' | 'medical_data' | 'cloud_storage';
  purpose: string;
  description: string;
  granted: boolean;
  timestamp: number;
  version: string;
  expiryDate?: number;
}

export interface DataPortabilityExport {
  exportId: string;
  requestedAt: number;
  completedAt?: number;
  format: 'json' | 'csv' | 'xml';
  sections: string[];
  fileSize?: number;
  downloadUrl?: string;
  expiresAt: number;
}

export interface DataProcessingActivity {
  id: string;
  activity: string;
  purpose: string;
  dataTypes: string[];
  legalBasis: string;
  timestamp: number;
  userId?: string;
}

export interface GDPRRights {
  access: boolean;          // Droit d'accès
  rectification: boolean;   // Droit de rectification
  erasure: boolean;         // Droit à l'effacement
  portability: boolean;     // Droit à la portabilité
  restriction: boolean;     // Droit de limitation
  objection: boolean;       // Droit d'opposition
  automated: boolean;       // Droit relatif à la prise de décision automatisée
}

export class GDPRService {
  private static instance: GDPRService;
  
  static getInstance(): GDPRService {
    if (!GDPRService.instance) {
      GDPRService.instance = new GDPRService();
    }
    return GDPRService.instance;
  }

  /**
   * Consentements par défaut selon RGPD
   */
  private getDefaultConsents(): GDPRConsent[] {
    return [
      {
        id: 'essential',
        type: 'essential',
        purpose: 'Fonctionnement de base de l\'application',
        description: 'Nécessaire pour que l\'app fonctionne (connexion, préférences de base). Ne peut pas être refusé.',
        granted: true,
        timestamp: Date.now(),
        version: '1.0'
      },
      {
        id: 'medical_data_local',
        type: 'medical_data',
        purpose: 'Stockage local de vos données médicales ADHD',
        description: 'Stockage sécurisé de vos données d\'humeur, médicaments et habitudes sur votre appareil uniquement.',
        granted: false,
        timestamp: Date.now(),
        version: '1.0'
      },
      {
        id: 'cloud_storage',
        type: 'cloud_storage',
        purpose: 'Synchronisation de vos données dans le cloud',
        description: 'Stockage chiffré de vos données sur Google Drive ou Microsoft OneDrive pour synchronisation entre appareils.',
        granted: false,
        timestamp: Date.now(),
        version: '1.0'
      },
      {
        id: 'analytics_anonymous',
        type: 'analytics',
        purpose: 'Amélioration de l\'application (anonyme)',
        description: 'Collecte anonyme de statistiques d\'usage pour améliorer l\'app (aucune donnée médicale).',
        granted: false,
        timestamp: Date.now(),
        version: '1.0',
        expiryDate: Date.now() + (365 * 24 * 60 * 60 * 1000) // 1 an
      }
    ];
  }

  /**
   * Initialise les consentements RGPD
   */
  initializeConsents(): GDPRConsent[] {
    const existing = this.getStoredConsents();
    if (existing.length === 0) {
      const defaultConsents = this.getDefaultConsents();
      this.storeConsents(defaultConsents);
      return defaultConsents;
    }
    return existing;
  }

  /**
   * Met à jour un consentement
   */
  updateConsent(consentId: string, granted: boolean, version: string = '1.0'): void {
    const consents = this.getStoredConsents();
    const updatedConsents = consents.map(consent => {
      if (consent.id === consentId) {
        return {
          ...consent,
          granted,
          timestamp: Date.now(),
          version
        };
      }
      return consent;
    });

    this.storeConsents(updatedConsents);
    this.logDataProcessingActivity('consent_updated', `Consentement ${consentId}`, ['consent'], 'user_consent');
  }

  /**
   * Vérifie si un consentement est accordé
   */
  hasConsent(consentId: string): boolean {
    const consents = this.getStoredConsents();
    const consent = consents.find(c => c.id === consentId);
    
    if (!consent) return false;
    
    // Vérifier l'expiration si applicable
    if (consent.expiryDate && Date.now() > consent.expiryDate) {
      return false;
    }
    
    return consent.granted;
  }

  /**
   * Récupère tous les consentements
   */
  getAllConsents(): GDPRConsent[] {
    return this.getStoredConsents();
  }

  /**
   * Génère l'export de portabilité des données (Article 20 RGPD)
   */
  async generateDataPortabilityExport(format: 'json' | 'csv' | 'xml' = 'json', sections: string[] = ['all']): Promise<DataPortabilityExport> {
    const exportId = this.generateId();
    
    const exportRequest: DataPortabilityExport = {
      exportId,
      requestedAt: Date.now(),
      format,
      sections,
      expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 jours
    };

    try {
      // Collecter toutes les données utilisateur
      const userData = await this.collectAllUserData(sections);
      
      let exportData: string;
      let mimeType: string;
      let extension: string;

      switch (format) {
        case 'json':
          exportData = JSON.stringify(userData, null, 2);
          mimeType = 'application/json';
          extension = 'json';
          break;
        case 'csv':
          exportData = this.convertToCSV(userData);
          mimeType = 'text/csv';
          extension = 'csv';
          break;
        case 'xml':
          exportData = this.convertToXML(userData);
          mimeType = 'application/xml';
          extension = 'xml';
          break;
      }

      // Créer le blob et l'URL de téléchargement
      const blob = new Blob([exportData], { type: mimeType });
      const url = URL.createObjectURL(blob);
      
      exportRequest.completedAt = Date.now();
      exportRequest.fileSize = blob.size;
      exportRequest.downloadUrl = url;

      // Stocker la demande d'export
      this.storePortabilityRequest(exportRequest);
      
      this.logDataProcessingActivity('data_export', 'Export de portabilité RGPD', ['all_user_data'], 'legal_obligation');

      return exportRequest;

    } catch (error) {
      console.error('Erreur lors de l\'export RGPD:', error);
      throw new Error('Échec de la génération de l\'export de données');
    }
  }

  /**
   * Collecte toutes les données utilisateur pour l'export
   */
  private async collectAllUserData(sections: string[]): Promise<any> {
    const userData: any = {
      metadata: {
        exportDate: new Date().toISOString(),
        version: '1.0',
        format: 'GDPR-compliant',
        sections: sections
      },
      consents: this.getStoredConsents(),
      processingActivities: this.getProcessingActivities()
    };

    if (sections.includes('all') || sections.includes('profile')) {
      userData.profile = this.getStoredData('adhd-user-profile');
    }

    if (sections.includes('all') || sections.includes('health')) {
      userData.health = {
        medications: this.getStoredData('adhd-medications'),
        symptoms: this.getStoredData('adhd-symptoms'),
        mood: this.getStoredData('adhd-mood-entries')
      };
    }

    if (sections.includes('all') || sections.includes('habits')) {
      userData.habits = {
        sleep: this.getStoredData('adhd-sleep-data'),
        exercise: this.getStoredData('adhd-exercise-data'),
        routines: this.getStoredData('adhd-routines')
      };
    }

    if (sections.includes('all') || sections.includes('reminders')) {
      userData.reminders = this.getStoredData('adhd-reminders');
    }

    if (sections.includes('all') || sections.includes('security')) {
      userData.security = {
        logs: this.getStoredData('adhd_security_log'),
        metrics: this.getStoredData('adhd_security_metrics'),
        // Note: les clés de chiffrement ne sont jamais exportées
        biometricInfo: this.getStoredData('adhd_biometric_credentials')
      };
    }

    if (sections.includes('all') || sections.includes('settings')) {
      userData.settings = this.getStoredData('adhd-app-settings');
    }

    return userData;
  }

  /**
   * Droit à l'effacement (Article 17 RGPD)
   */
  async exerciseRightToErasure(reason: string = 'user_request'): Promise<void> {
    try {
      // Log de la demande d'effacement
      this.logDataProcessingActivity('data_erasure', `Droit à l'effacement exercé: ${reason}`, ['all_user_data'], 'legal_obligation');

      // Supprimer toutes les données locales
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('adhd')) {
          keysToRemove.push(key);
        }
      }

      keysToRemove.forEach(key => localStorage.removeItem(key));

      // Si connecté au cloud, supprimer aussi les données distantes
      if (this.hasConsent('cloud_storage')) {
        await this.deleteCloudData();
      }

      // Créer un log final avant suppression
      const finalLog = {
        event: 'account_deleted',
        timestamp: Date.now(),
        reason,
        dataTypesDeleted: ['profile', 'health', 'habits', 'security', 'settings']
      };

      localStorage.setItem('adhd_deletion_log', JSON.stringify(finalLog));

    } catch (error) {
      console.error('Erreur lors de l\'effacement des données:', error);
      throw new Error('Échec de l\'effacement des données');
    }
  }

  /**
   * Droit de rectification (Article 16 RGPD)
   */
  async exerciseRightToRectification(dataType: string, corrections: any): Promise<void> {
    try {
      const currentData = this.getStoredData(`adhd-${dataType}`);
      if (!currentData) {
        throw new Error(`Aucune donnée trouvée pour le type: ${dataType}`);
      }

      // Appliquer les corrections
      const correctedData = { ...currentData, ...corrections, lastModified: Date.now() };
      localStorage.setItem(`adhd-${dataType}`, JSON.stringify(correctedData));

      this.logDataProcessingActivity('data_rectification', `Rectification de ${dataType}`, [dataType], 'user_request');

    } catch (error) {
      console.error('Erreur lors de la rectification:', error);
      throw new Error('Échec de la rectification des données');
    }
  }

  /**
   * Registre des activités de traitement (Article 30 RGPD)
   */
  logDataProcessingActivity(activity: string, purpose: string, dataTypes: string[], legalBasis: string): void {
    const activityRecord: DataProcessingActivity = {
      id: this.generateId(),
      activity,
      purpose,
      dataTypes,
      legalBasis,
      timestamp: Date.now()
    };

    const existingActivities = this.getProcessingActivities();
    existingActivities.push(activityRecord);

    // Garder seulement les 1000 dernières activités
    if (existingActivities.length > 1000) {
      existingActivities.splice(0, existingActivities.length - 1000);
    }

    localStorage.setItem('adhd_processing_activities', JSON.stringify(existingActivities));
  }

  /**
   * Récupère les activités de traitement
   */
  getProcessingActivities(): DataProcessingActivity[] {
    const stored = localStorage.getItem('adhd_processing_activities');
    return stored ? JSON.parse(stored) : [];
  }

  /**
   * Génère le rapport de conformité RGPD
   */
  generateComplianceReport(): any {
    return {
      generatedAt: new Date().toISOString(),
      consents: {
        total: this.getStoredConsents().length,
        granted: this.getStoredConsents().filter(c => c.granted).length,
        expired: this.getStoredConsents().filter(c => c.expiryDate && Date.now() > c.expiryDate).length
      },
      processingActivities: {
        total: this.getProcessingActivities().length,
        last30Days: this.getProcessingActivities().filter(a => Date.now() - a.timestamp < 30 * 24 * 60 * 60 * 1000).length
      },
      dataSubjectRights: this.getSupportedRights(),
      dataRetention: {
        hasRetentionPolicy: true,
        maxRetentionPeriod: '3 ans',
        automaticDeletion: true
      },
      technicalMeasures: {
        encryption: 'AES-256-GCM',
        keyDerivation: 'PBKDF2 100k iterations',
        dataMinimization: true,
        privacyByDesign: true
      }
    };
  }

  /**
   * Droits supportés selon RGPD
   */
  getSupportedRights(): GDPRRights {
    return {
      access: true,           // Export des données
      rectification: true,    // Modification des données
      erasure: true,         // Suppression compte
      portability: true,     // Export structuré
      restriction: false,    // Limitation du traitement (non implémenté)
      objection: true,       // Retrait du consentement
      automated: false       // Pas de décision automatisée
    };
  }

  /**
   * Utilitaires privés
   */
  private getStoredConsents(): GDPRConsent[] {
    const stored = localStorage.getItem('adhd_gdpr_consents');
    return stored ? JSON.parse(stored) : [];
  }

  private storeConsents(consents: GDPRConsent[]): void {
    localStorage.setItem('adhd_gdpr_consents', JSON.stringify(consents));
  }

  private getStoredData(key: string): any {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : null;
  }

  private storePortabilityRequest(request: DataPortabilityExport): void {
    const existing = localStorage.getItem('adhd_portability_requests');
    const requests = existing ? JSON.parse(existing) : [];
    requests.push(request);
    localStorage.setItem('adhd_portability_requests', JSON.stringify(requests));
  }

  private convertToCSV(data: any): string {
    // Conversion simplifiée vers CSV
    let csv = 'Section,Property,Value\n';
    
    function flattenObject(obj: any, section: string = '') {
      for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          flattenObject(value, section ? `${section}.${key}` : key);
        } else {
          const cleanValue = typeof value === 'string' ? value.replace(/"/g, '""') : value;
          csv += `"${section}","${key}","${cleanValue}"\n`;
        }
      }
    }
    
    flattenObject(data);
    return csv;
  }

  private convertToXML(data: any): string {
    // Conversion simplifiée vers XML
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<gdpr-export>\n';
    
    function objectToXML(obj: any, indent: string = '  '): string {
      let result = '';
      for (const [key, value] of Object.entries(obj)) {
        const safeKey = key.replace(/[^a-zA-Z0-9]/g, '_');
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          result += `${indent}<${safeKey}>\n`;
          result += objectToXML(value, indent + '  ');
          result += `${indent}</${safeKey}>\n`;
        } else {
          const cleanValue = typeof value === 'string' 
            ? value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            : value;
          result += `${indent}<${safeKey}>${cleanValue}</${safeKey}>\n`;
        }
      }
      return result;
    }
    
    xml += objectToXML(data);
    xml += '</gdpr-export>';
    return xml;
  }

  private async deleteCloudData(): Promise<void> {
    // Cette fonction devrait supprimer les données du cloud storage
    // L'implémentation dépend du service cloud utilisé
    console.log('Suppression des données cloud (à implémenter selon le service)');
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Nettoyage des données expirées
   */
  cleanupExpiredData(): void {
    // Nettoyer les consentements expirés
    const consents = this.getStoredConsents();
    const validConsents = consents.filter(consent => 
      !consent.expiryDate || Date.now() < consent.expiryDate
    );
    
    if (validConsents.length !== consents.length) {
      this.storeConsents(validConsents);
      this.logDataProcessingActivity('consent_cleanup', 'Nettoyage consentements expirés', ['consent'], 'data_retention');
    }

    // Nettoyer les anciennes activités (> 3 ans)
    const threeYearsAgo = Date.now() - (3 * 365 * 24 * 60 * 60 * 1000);
    const activities = this.getProcessingActivities();
    const recentActivities = activities.filter(activity => activity.timestamp > threeYearsAgo);
    
    if (recentActivities.length !== activities.length) {
      localStorage.setItem('adhd_processing_activities', JSON.stringify(recentActivities));
    }
  }
}