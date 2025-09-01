export interface BiometricCapabilities {
  available: boolean;
  supportedMethods: ('fingerprint' | 'face' | 'voice')[];
  isEnrolled: boolean;
  deviceSupport: boolean;
}

export interface BiometricCredential {
  id: string;
  type: 'fingerprint' | 'face' | 'voice';
  friendlyName: string;
  created: number;
  lastUsed: number;
}

export class BiometricService {
  private static instance: BiometricService;
  
  static getInstance(): BiometricService {
    if (!BiometricService.instance) {
      BiometricService.instance = new BiometricService();
    }
    return BiometricService.instance;
  }

  /**
   * Vérifie les capacités biométriques du device
   */
  async checkCapabilities(): Promise<BiometricCapabilities> {
    const capabilities: BiometricCapabilities = {
      available: false,
      supportedMethods: [],
      isEnrolled: false,
      deviceSupport: false
    };

    // Vérifier le support WebAuthn
    if (!window.PublicKeyCredential) {
      return capabilities;
    }

    capabilities.deviceSupport = true;

    try {
      // Vérifier si l'authentification biométrique est disponible
      const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      capabilities.available = available;

      if (available) {
        // Détecter les méthodes supportées (approximation basée sur l'User Agent)
        const ua = navigator.userAgent.toLowerCase();
        
        if (ua.includes('iphone') || ua.includes('ipad')) {
          capabilities.supportedMethods.push('fingerprint'); // Touch ID
          if (ua.includes('os 15') || ua.includes('os 16') || ua.includes('os 17')) {
            capabilities.supportedMethods.push('face'); // Face ID sur devices récents
          }
        } else if (ua.includes('android')) {
          capabilities.supportedMethods.push('fingerprint');
          // Certains Android récents supportent la reconnaissance faciale
          if (ua.includes('android 1')) { // Android 10+
            capabilities.supportedMethods.push('face');
          }
        } else if (ua.includes('windows')) {
          capabilities.supportedMethods.push('fingerprint'); // Windows Hello
          capabilities.supportedMethods.push('face');
        } else if (ua.includes('mac')) {
          capabilities.supportedMethods.push('fingerprint'); // Touch ID
        }

        // Vérifier s'il y a déjà des credentials enregistrés
        capabilities.isEnrolled = this.hasStoredCredentials();
      }

    } catch (error) {
      console.warn('Erreur lors de la vérification biométrique:', error);
    }

    return capabilities;
  }

  /**
   * Enregistre une nouvelle empreinte biométrique
   */
  async enrollBiometric(friendlyName: string = 'Empreinte biométrique'): Promise<BiometricCredential> {
    const capabilities = await this.checkCapabilities();
    
    if (!capabilities.available) {
      throw new Error('L\'authentification biométrique n\'est pas disponible sur cet appareil');
    }

    try {
      // Générer un challenge sécurisé
      const challenge = crypto.getRandomValues(new Uint8Array(32));
      const userId = crypto.getRandomValues(new Uint8Array(32));

      const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions = {
        challenge,
        rp: {
          name: 'ADHD Life Assistant',
          id: window.location.hostname
        },
        user: {
          id: userId,
          name: 'ADHD User',
          displayName: friendlyName
        },
        pubKeyCredParams: [
          { alg: -7, type: 'public-key' }, // ES256
          { alg: -257, type: 'public-key' } // RS256
        ],
        authenticatorSelection: {
          authenticatorAttachment: 'platform',
          userVerification: 'required',
          requireResidentKey: false
        },
        timeout: 60000,
        attestation: 'none'
      };

      const credential = await navigator.credentials.create({
        publicKey: publicKeyCredentialCreationOptions
      }) as PublicKeyCredential;

      if (!credential) {
        throw new Error('Échec de l\'enregistrement biométrique');
      }

      // Créer l'objet credential pour stockage local
      const biometricCredential: BiometricCredential = {
        id: credential.id,
        type: this.detectBiometricType(),
        friendlyName,
        created: Date.now(),
        lastUsed: Date.now()
      };

      // Stocker les informations du credential (pas la clé elle-même)
      this.storeCredentialInfo(biometricCredential);
      
      // Stocker les données publiques nécessaires pour la vérification
      const response = credential.response as AuthenticatorAttestationResponse;
      const credentialData = {
        credentialId: credential.id,
        publicKey: Array.from(new Uint8Array(response.getPublicKey()!)),
        challenge: Array.from(challenge)
      };
      
      localStorage.setItem('adhd_biometric_data', JSON.stringify(credentialData));
      
      return biometricCredential;

    } catch (error) {
      console.error('Erreur lors de l\'enregistrement biométrique:', error);
      
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          throw new Error('Enregistrement biométrique refusé par l\'utilisateur');
        } else if (error.name === 'NotSupportedError') {
          throw new Error('Type d\'authentification non supporté');
        } else if (error.name === 'SecurityError') {
          throw new Error('Erreur de sécurité lors de l\'enregistrement');
        }
      }
      
      throw new Error('Échec de l\'enregistrement biométrique');
    }
  }

  /**
   * Authentifie l'utilisateur avec la biométrie
   */
  async authenticateWithBiometric(): Promise<boolean> {
    const storedData = localStorage.getItem('adhd_biometric_data');
    if (!storedData) {
      throw new Error('Aucune empreinte biométrique enregistrée');
    }

    try {
      const credentialData = JSON.parse(storedData);
      const challenge = crypto.getRandomValues(new Uint8Array(32));

      const publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions = {
        challenge,
        allowCredentials: [{
          id: this.base64ToArrayBuffer(credentialData.credentialId),
          type: 'public-key',
          transports: ['internal']
        }],
        timeout: 60000,
        userVerification: 'required'
      };

      const assertion = await navigator.credentials.get({
        publicKey: publicKeyCredentialRequestOptions
      }) as PublicKeyCredential;

      if (!assertion) {
        return false;
      }

      // Mettre à jour le timestamp de dernière utilisation
      this.updateCredentialLastUsed(assertion.id);
      
      // Log de l'événement sécurisé
      this.logBiometricEvent('authentication_success', {
        credentialId: assertion.id,
        timestamp: Date.now()
      });

      return true;

    } catch (error) {
      console.error('Erreur lors de l\'authentification biométrique:', error);
      
      this.logBiometricEvent('authentication_failed', {
        error: error instanceof Error ? error.message : 'Erreur inconnue',
        timestamp: Date.now()
      });

      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          throw new Error('Authentification biométrique refusée');
        } else if (error.name === 'InvalidStateError') {
          throw new Error('État d\'authentification invalide');
        }
      }
      
      return false;
    }
  }

  /**
   * Supprime l'empreinte biométrique
   */
  async removeBiometric(credentialId: string): Promise<void> {
    try {
      // Supprimer des données locales
      localStorage.removeItem('adhd_biometric_data');
      
      const credentials = this.getStoredCredentials();
      const updatedCredentials = credentials.filter(cred => cred.id !== credentialId);
      
      if (updatedCredentials.length > 0) {
        localStorage.setItem('adhd_biometric_credentials', JSON.stringify(updatedCredentials));
      } else {
        localStorage.removeItem('adhd_biometric_credentials');
      }

      this.logBiometricEvent('credential_removed', {
        credentialId,
        timestamp: Date.now()
      });

    } catch (error) {
      console.error('Erreur lors de la suppression biométrique:', error);
      throw new Error('Échec de la suppression de l\'empreinte biométrique');
    }
  }

  /**
   * Liste les empreintes enregistrées
   */
  getStoredCredentials(): BiometricCredential[] {
    const stored = localStorage.getItem('adhd_biometric_credentials');
    return stored ? JSON.parse(stored) : [];
  }

  /**
   * Vérifie s'il y a des credentials stockés
   */
  private hasStoredCredentials(): boolean {
    return this.getStoredCredentials().length > 0;
  }

  /**
   * Stocke les informations du credential
   */
  private storeCredentialInfo(credential: BiometricCredential): void {
    const existing = this.getStoredCredentials();
    existing.push(credential);
    localStorage.setItem('adhd_biometric_credentials', JSON.stringify(existing));
  }

  /**
   * Met à jour le timestamp de dernière utilisation
   */
  private updateCredentialLastUsed(credentialId: string): void {
    const credentials = this.getStoredCredentials();
    const updated = credentials.map(cred => 
      cred.id === credentialId 
        ? { ...cred, lastUsed: Date.now() }
        : cred
    );
    localStorage.setItem('adhd_biometric_credentials', JSON.stringify(updated));
  }

  /**
   * Détecte le type de biométrie basé sur l'appareil
   */
  private detectBiometricType(): 'fingerprint' | 'face' | 'voice' {
    const ua = navigator.userAgent.toLowerCase();
    
    if (ua.includes('iphone') && ua.includes('os 1')) {
      // iPhone X et plus récents supportent Face ID
      const model = this.getiPhoneModel();
      if (model && (model.includes('x') || model.includes('11') || model.includes('12') || model.includes('13') || model.includes('14') || model.includes('15'))) {
        return 'face';
      }
    }
    
    // Par défaut, on assume l'empreinte digitale
    return 'fingerprint';
  }

  /**
   * Essaie de détecter le modèle d'iPhone (approximatif)
   */
  private getiPhoneModel(): string | null {
    const ua = navigator.userAgent;
    const match = ua.match(/iPhone(\d+,\d+)/);
    return match ? match[1] : null;
  }

  /**
   * Log des événements biométriques
   */
  private logBiometricEvent(event: string, data: any): void {
    const logEntry = {
      event: `biometric_${event}`,
      timestamp: Date.now(),
      data,
      userAgent: navigator.userAgent
    };

    const existingLogs = localStorage.getItem('adhd_biometric_log');
    const logs = existingLogs ? JSON.parse(existingLogs) : [];
    
    logs.push(logEntry);
    
    // Garder seulement les 50 derniers événements biométriques
    if (logs.length > 50) {
      logs.splice(0, logs.length - 50);
    }
    
    localStorage.setItem('adhd_biometric_log', JSON.stringify(logs));
  }

  /**
   * Récupère les logs biométriques
   */
  getBiometricLogs(): any[] {
    const stored = localStorage.getItem('adhd_biometric_log');
    return stored ? JSON.parse(stored) : [];
  }

  /**
   * Utilitaire de conversion base64
   */
  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }

  /**
   * Nettoyage complet des données biométriques
   */
  wipeAllBiometricData(): void {
    localStorage.removeItem('adhd_biometric_data');
    localStorage.removeItem('adhd_biometric_credentials');
    localStorage.removeItem('adhd_biometric_log');
    
    this.logBiometricEvent('data_wiped', { timestamp: Date.now() });
  }

  /**
   * Vérifie si la biométrie est configurée et disponible
   */
  async isReadyForBiometric(): Promise<boolean> {
    const capabilities = await this.checkCapabilities();
    return capabilities.available && capabilities.isEnrolled;
  }

  /**
   * Message d'aide contextuel selon l'appareil
   */
  getBiometricHelpMessage(): string {
    const ua = navigator.userAgent.toLowerCase();
    
    if (ua.includes('iphone') || ua.includes('ipad')) {
      return 'Utilisez Touch ID ou Face ID pour vous connecter rapidement et en sécurité';
    } else if (ua.includes('android')) {
      return 'Utilisez votre empreinte digitale ou reconnaissance faciale pour vous connecter';
    } else if (ua.includes('windows')) {
      return 'Utilisez Windows Hello pour vous connecter avec votre empreinte ou reconnaissance faciale';
    } else if (ua.includes('mac')) {
      return 'Utilisez Touch ID pour vous connecter rapidement';
    }
    
    return 'Utilisez l\'authentification biométrique de votre appareil pour vous connecter';
  }
}