export interface EncryptedData {
  data: string; // Données chiffrées en base64
  iv: string; // Initialization Vector en base64
  salt: string; // Salt en base64
  timestamp: number; // Timestamp de chiffrement
  version: string; // Version du chiffrement pour migration future
}

export interface SecurityMetrics {
  encryptionStrength: 'high' | 'medium' | 'low';
  lastPasswordChange: number;
  passwordScore: number;
  sessionCount: number;
  lastActivity: number;
}

export class EncryptionService {
  private static instance: EncryptionService;
  private masterKey: CryptoKey | null = null;
  private sessionTimeout: number = 30 * 60 * 1000; // 30 minutes
  private activityTimer: NodeJS.Timeout | null = null;
  private callbacks: Array<(event: string, data?: any) => void> = [];

  // Constantes de sécurité
  private readonly PBKDF2_ITERATIONS = 100000; // 100k iterations minimum
  private readonly AES_KEY_LENGTH = 256;
  private readonly IV_LENGTH = 16; // 128 bits
  private readonly SALT_LENGTH = 32; // 256 bits
  private readonly ENCRYPTION_VERSION = '1.0';

  static getInstance(): EncryptionService {
    if (!EncryptionService.instance) {
      EncryptionService.instance = new EncryptionService();
    }
    return EncryptionService.instance;
  }

  private constructor() {
    this.initializeSecurityMonitoring();
  }

  /**
   * Dérive une clé de chiffrement à partir du mot de passe utilisateur
   */
  async deriveKeyFromPassword(password: string, salt?: Uint8Array): Promise<{ key: CryptoKey; salt: Uint8Array }> {
    const encoder = new TextEncoder();
    const passwordBuffer = encoder.encode(password);
    
    // Générer un nouveau salt si non fourni
    const keyDerivationSalt = salt || crypto.getRandomValues(new Uint8Array(this.SALT_LENGTH));
    
    // Importer le mot de passe comme clé PBKDF2
    const passwordKey = await crypto.subtle.importKey(
      'raw',
      passwordBuffer,
      { name: 'PBKDF2' },
      false,
      ['deriveBits', 'deriveKey']
    );

    // Dériver la clé AES-256 - Fix du type salt
    const derivedKey = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: keyDerivationSalt.buffer.slice(0),
        iterations: this.PBKDF2_ITERATIONS,
        hash: 'SHA-256'
      },
      passwordKey,
      {
        name: 'AES-GCM',
        length: this.AES_KEY_LENGTH
      },
      false, // La clé ne peut pas être exportée
      ['encrypt', 'decrypt']
    );

    return { key: derivedKey, salt: keyDerivationSalt };
  }

  /**
   * Initialise le service avec un mot de passe
   */
  async initializeWithPassword(password: string): Promise<boolean> {
    try {
      const { key, salt } = await this.deriveKeyFromPassword(password);
      this.masterKey = key;
      
      // Stocker le salt (pas la clé !)
      localStorage.setItem('adhd_encryption_salt', this.arrayBufferToBase64(salt));
      this.startSessionTimeout();
      
      return true;
    } catch (error) {
      console.error('Erreur initialisation chiffrement:', error);
      return false;
    }
  }

  /**
   * Vérifie si le service est prêt
   */
  isReady(): boolean {
    return this.masterKey !== null;
  }

  /**
   * Chiffre les données avec AES-256-GCM
   */
  async encryptData(data: any, masterPassword: string): Promise<EncryptedData> {
    try {
      const plaintext = JSON.stringify(data);
      const encoder = new TextEncoder();
      const plaintextBuffer = encoder.encode(plaintext);

      // Dériver la clé depuis le mot de passe
      const { key, salt } = await this.deriveKeyFromPassword(masterPassword);
      
      // Générer un IV unique pour ce chiffrement
      const iv = crypto.getRandomValues(new Uint8Array(this.IV_LENGTH));

      // Chiffrer les données
      const encryptedBuffer = await crypto.subtle.encrypt(
        {
          name: 'AES-GCM',
          iv: iv,
          additionalData: encoder.encode('ADHD-Helper-Medical-Data') // Données d'authentification
        },
        key,
        plaintextBuffer
      );

      // Convertir en base64 pour stockage
      const encryptedData: EncryptedData = {
        data: this.arrayBufferToBase64(encryptedBuffer),
        iv: this.arrayBufferToBase64(iv),
        salt: this.arrayBufferToBase64(salt),
        timestamp: Date.now(),
        version: this.ENCRYPTION_VERSION
      };

      this.logSecurityEvent('data_encrypted', { 
        dataSize: plaintextBuffer.length,
        timestamp: encryptedData.timestamp 
      });

      return encryptedData;

    } catch (error) {
      this.logSecurityEvent('encryption_failed', { error: error instanceof Error ? error.message : 'Erreur inconnue' });
      throw new Error('Erreur lors du chiffrement des données');
    }
  }

  /**
   * Déchiffre les données avec AES-256-GCM
   */
  async decryptData(encryptedData: EncryptedData, masterPassword: string): Promise<any> {
    try {
      // Vérifier la version du chiffrement
      if (encryptedData.version !== this.ENCRYPTION_VERSION) {
        throw new Error('Version de chiffrement non supportée');
      }

      // Reconvertir depuis base64
      const encrypted = this.base64ToBuffer(encryptedData.data);
      const iv = this.base64ToBuffer(encryptedData.iv);
      const salt = this.base64ToBuffer(encryptedData.salt);

      // Dériver la clé depuis le mot de passe
      const { key } = await this.deriveKeyFromPassword(masterPassword, new Uint8Array(salt));

      // Déchiffrer les données
      const encoder = new TextEncoder();
      const decryptedBuffer = await crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: iv,
          additionalData: encoder.encode('ADHD-Helper-Medical-Data')
        },
        key,
        encrypted
      );

      // Décoder le JSON
      const decoder = new TextDecoder();
      const plaintext = decoder.decode(decryptedBuffer);
      const data = JSON.parse(plaintext);

      this.logSecurityEvent('data_decrypted', { 
        timestamp: Date.now() 
      });

      return data;

    } catch (error) {
      this.logSecurityEvent('decryption_failed', { 
        error: error instanceof Error ? error.message : 'Erreur inconnue',
        timestamp: encryptedData.timestamp 
      });
      
      if (error instanceof Error && error.name === 'OperationError') {
        throw new Error('Mot de passe incorrect ou données corrompues');
      }
      
      throw new Error('Erreur lors du déchiffrement des données');
    }
  }

  /**
   * Authentifie l'utilisateur avec son master password
   */
  async authenticate(password: string): Promise<boolean> {
    try {
      // Récupérer le test de validation stocké
      const validationTest = localStorage.getItem('adhd_security_validation');
      if (!validationTest) {
        // Première utilisation, créer le test de validation
        await this.setupMasterPassword(password);
        return true;
      }

      const testData = JSON.parse(validationTest);
      
      // Tenter de déchiffrer le test avec le mot de passe fourni
      await this.decryptData(testData, password);
      
      // Si on arrive ici, le mot de passe est correct
      this.masterKey = (await this.deriveKeyFromPassword(password)).key;
      this.startSessionTimeout();
      
      this.logSecurityEvent('authentication_success', { 
        timestamp: Date.now() 
      });
      
      return true;

    } catch (error) {
      this.logSecurityEvent('authentication_failed', { 
        error: error.message,
        timestamp: Date.now() 
      });
      
      return false;
    }
  }

  /**
   * Configure le master password lors de la première utilisation
   */
  async setupMasterPassword(password: string): Promise<void> {
    try {
      // Vérifier la force du mot de passe
      const passwordScore = this.assessPasswordStrength(password);
      if (passwordScore < 60) {
        throw new Error('Le mot de passe n\'est pas assez fort');
      }

      // Créer un test de validation (données factices chiffrées)
      const testData = { test: 'validation', timestamp: Date.now() };
      const encryptedTest = await this.encryptData(testData, password);
      
      // Stocker le test chiffré
      localStorage.setItem('adhd_security_validation', JSON.stringify(encryptedTest));
      
      // Stocker les métriques de sécurité
      const metrics: SecurityMetrics = {
        encryptionStrength: passwordScore >= 80 ? 'high' : passwordScore >= 60 ? 'medium' : 'low',
        lastPasswordChange: Date.now(),
        passwordScore,
        sessionCount: 0,
        lastActivity: Date.now()
      };
      
      localStorage.setItem('adhd_security_metrics', JSON.stringify(metrics));
      
      this.logSecurityEvent('master_password_setup', { 
        passwordScore,
        timestamp: Date.now() 
      });

    } catch (error) {
      this.logSecurityEvent('master_password_setup_failed', { 
        error: error.message 
      });
      throw error;
    }
  }

  /**
   * Évalue la force du mot de passe
   */
  assessPasswordStrength(password: string): number {
    let score = 0;
    
    // Longueur
    if (password.length >= 12) score += 25;
    else if (password.length >= 8) score += 15;
    else if (password.length >= 6) score += 5;
    
    // Caractères minuscules
    if (/[a-z]/.test(password)) score += 15;
    
    // Caractères majuscules
    if (/[A-Z]/.test(password)) score += 15;
    
    // Chiffres
    if (/[0-9]/.test(password)) score += 15;
    
    // Caractères spéciaux
    if (/[^A-Za-z0-9]/.test(password)) score += 20;
    
    // Pénalités pour patterns communs
    if (/(.)\1{2,}/.test(password)) score -= 10; // Répétitions
    if (/123|abc|qwe/i.test(password)) score -= 15; // Séquences communes
    if (/password|123456|qwerty/i.test(password)) score -= 25; // Mots de passe courants
    
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Chiffre et sauvegarde les données médicales
   */
  async saveEncryptedData(key: string, data: any, masterPassword: string): Promise<void> {
    const encryptedData = await this.encryptData(data, masterPassword);
    localStorage.setItem(`adhd_encrypted_${key}`, JSON.stringify(encryptedData));
    
    this.updateActivityTimestamp();
  }

  /**
   * Charge et déchiffre les données médicales
   */
  async loadEncryptedData(key: string, masterPassword: string): Promise<any | null> {
    const stored = localStorage.getItem(`adhd_encrypted_${key}`);
    if (!stored) return null;

    try {
      const encryptedData = JSON.parse(stored);
      const data = await this.decryptData(encryptedData, masterPassword);
      
      this.updateActivityTimestamp();
      return data;
      
    } catch (error) {
      this.logSecurityEvent('data_load_failed', { 
        key, 
        error: error.message 
      });
      return null;
    }
  }

  /**
   * Gestion de session et timeout
   */
  private startSessionTimeout(): void {
    this.clearSessionTimeout();
    
    this.activityTimer = setTimeout(() => {
      this.logout();
      this.notifyCallback('session_timeout');
    }, this.sessionTimeout);
  }

  private clearSessionTimeout(): void {
    if (this.activityTimer) {
      clearTimeout(this.activityTimer);
      this.activityTimer = null;
    }
  }

  private updateActivityTimestamp(): void {
    const metrics = this.getSecurityMetrics();
    if (metrics) {
      metrics.lastActivity = Date.now();
      localStorage.setItem('adhd_security_metrics', JSON.stringify(metrics));
    }
    
    // Redémarrer le timeout de session
    this.startSessionTimeout();
  }

  /**
   * Déconnexion sécurisée
   */
  logout(): void {
    this.masterKey = null;
    this.clearSessionTimeout();
    
    // Nettoyer les données sensibles en mémoire
    if (typeof window !== 'undefined' && window.crypto) {
      // Forcer le garbage collection si possible
      setTimeout(() => {
        if (window.gc) window.gc();
      }, 100);
    }
    
    this.logSecurityEvent('logout', { timestamp: Date.now() });
    this.notifyCallback('logout');
  }

  /**
   * Vérifie si l'utilisateur est connecté
   */
  isAuthenticated(): boolean {
    return this.masterKey !== null;
  }

  /**
   * Récupère les métriques de sécurité
   */
  getSecurityMetrics(): SecurityMetrics | null {
    const stored = localStorage.getItem('adhd_security_metrics');
    return stored ? JSON.parse(stored) : null;
  }

  /**
   * Configure le timeout de session
   */
  setSessionTimeout(minutes: number): void {
    this.sessionTimeout = minutes * 60 * 1000;
    if (this.isAuthenticated()) {
      this.startSessionTimeout();
    }
  }

  /**
   * Logging sécurisé des événements
   */
  private logSecurityEvent(event: string, data?: any): void {
    const logEntry = {
      event,
      timestamp: Date.now(),
      data: data || {},
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown'
    };

    // Stocker dans un log local (pas dans le cloud)
    const existingLogs = localStorage.getItem('adhd_security_log');
    const logs = existingLogs ? JSON.parse(existingLogs) : [];
    
    logs.push(logEntry);
    
    // Garder seulement les 100 derniers événements
    if (logs.length > 100) {
      logs.splice(0, logs.length - 100);
    }
    
    localStorage.setItem('adhd_security_log', JSON.stringify(logs));
  }

  /**
   * Récupère les logs de sécurité pour l'utilisateur
   */
  getSecurityLogs(): any[] {
    const stored = localStorage.getItem('adhd_security_log');
    return stored ? JSON.parse(stored) : [];
  }

  /**
   * Monitoring de sécurité
   */
  private initializeSecurityMonitoring(): void {
    // Détecter les tentatives d'accès suspect
    let failedAttempts = 0;
    const maxFailedAttempts = 5;
    
    this.onSecurityEvent('authentication_failed', () => {
      failedAttempts++;
      if (failedAttempts >= maxFailedAttempts) {
        this.notifyCallback('suspicious_activity', { 
          type: 'multiple_failed_auth',
          count: failedAttempts 
        });
        
        // Bloquer temporairement (5 minutes)
        localStorage.setItem('adhd_security_lockout', (Date.now() + 5 * 60 * 1000).toString());
      }
    });

    this.onSecurityEvent('authentication_success', () => {
      failedAttempts = 0;
      localStorage.removeItem('adhd_security_lockout');
    });
  }

  /**
   * Vérifier si le compte est temporairement bloqué
   */
  isTemporarilyLocked(): boolean {
    const lockout = localStorage.getItem('adhd_security_lockout');
    if (!lockout) return false;
    
    const lockoutTime = parseInt(lockout);
    return Date.now() < lockoutTime;
  }

  /**
   * Gestion des callbacks d'événements sécurisés
   */
  onSecurityEvent(event: string, callback: (data?: any) => void): void {
    this.callbacks.push((eventName, data) => {
      if (eventName === event) callback(data);
    });
  }

  private notifyCallback(event: string, data?: any): void {
    this.callbacks.forEach(callback => callback(event, data));
  }

  /**
   * Utilitaires de conversion
   */
  private arrayBufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
    const bytes = buffer instanceof ArrayBuffer ? new Uint8Array(buffer) : buffer;
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  private base64ToBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }

  /**
   * Nettoyage complet des données (pour suppression compte)
   */
  async wipeAllData(): Promise<void> {
    const keysToRemove = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('adhd_')) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    this.logout();
    this.logSecurityEvent('data_wiped', { timestamp: Date.now() });
  }
}