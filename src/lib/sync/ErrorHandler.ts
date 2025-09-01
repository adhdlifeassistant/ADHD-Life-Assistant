export interface SyncError {
  code: string;
  message: string;
  originalError?: any;
  timestamp: number;
  module?: string;
  recoveryAction?: 'retry' | 'manual' | 'ignore';
}

export interface ADHDFriendlyError {
  emoji: string;
  title: string;
  message: string;
  explanation: string;
  actionNeeded: boolean;
  actionText?: string;
  severity: 'low' | 'medium' | 'high';
}

export class ErrorHandler {
  private static readonly ERROR_MESSAGES: Record<string, ADHDFriendlyError> = {
    NETWORK_ERROR: {
      emoji: '📶',
      title: 'Pas de réseau',
      message: 'Pas de panique ! Tes données sont safe localement.',
      explanation: 'Tu n\'es pas connecté à internet en ce moment. L\'app continue à fonctionner normalement et tout sera synchronisé dès que tu seras reconnecté.',
      actionNeeded: false,
      severity: 'low'
    },
    AUTH_ERROR: {
      emoji: '🔐',
      title: 'Souci de connexion',
      message: 'Il faut se reconnecter à Google Drive.',
      explanation: 'Ta session Google a expiré. C\'est normal, ça arrive parfois pour ta sécurité.',
      actionNeeded: true,
      actionText: 'Se reconnecter',
      severity: 'medium'
    },
    QUOTA_EXCEEDED: {
      emoji: '📦',
      title: 'Espace Drive plein',
      message: 'Ton Google Drive est un peu plein !',
      explanation: 'Pas de stress ! Tes données importantes sont toujours là. Tu peux libérer un peu d\'espace sur Drive ou continuer en mode local.',
      actionNeeded: true,
      actionText: 'Gérer l\'espace',
      severity: 'medium'
    },
    SERVER_ERROR: {
      emoji: '🛠️',
      title: 'Petit problème technique',
      message: 'Les serveurs Google font une pause.',
      explanation: 'Ce n\'est pas de ta faute ! Les serveurs ont parfois des petits soucis. On réessaye automatiquement toutes les quelques minutes.',
      actionNeeded: false,
      severity: 'low'
    },
    CONFLICT_ERROR: {
      emoji: '🤝',
      title: 'Versions différentes détectées',
      message: 'On a trouvé des données différentes sur tes appareils.',
      explanation: 'C\'est normal quand tu utilises plusieurs appareils ! On va t\'aider à choisir quelle version garder.',
      actionNeeded: true,
      actionText: 'Résoudre',
      severity: 'medium'
    },
    PERMISSION_ERROR: {
      emoji: '🚫',
      title: 'Permissions insuffisantes',
      message: 'Il faut donner accès à Google Drive.',
      explanation: 'L\'app a besoin d\'accéder à ton Drive personnel pour sauvegarder tes données. C\'est complètement sécurisé et privé.',
      actionNeeded: true,
      actionText: 'Donner accès',
      severity: 'high'
    },
    CORRUPTION_ERROR: {
      emoji: '🔧',
      title: 'Fichier abîmé',
      message: 'Un fichier de sauvegarde est un peu abîmé.',
      explanation: 'Pas de panique ! On a plusieurs sauvegardes. On va prendre une version précédente qui fonctionne bien.',
      actionNeeded: false,
      severity: 'medium'
    },
    UNKNOWN_ERROR: {
      emoji: '❓',
      title: 'Quelque chose d\'inattendu',
      message: 'Un petit souci qu\'on n\'avait pas prévu.',
      explanation: 'Ça arrive parfois ! Tes données sont en sécurité. On va réessayer automatiquement et ça devrait rentrer dans l\'ordre.',
      actionNeeded: false,
      severity: 'low'
    }
  };

  static categorizeError(error: any): SyncError {
    const timestamp = Date.now();
    
    // Erreurs réseau
    if (error.message?.includes('fetch') || error.message?.includes('network') || error.name === 'NetworkError') {
      return {
        code: 'NETWORK_ERROR',
        message: 'Network connectivity issue',
        originalError: error,
        timestamp,
        recoveryAction: 'retry'
      };
    }
    
    // Erreurs d'authentification
    if (error.message?.includes('401') || error.message?.includes('unauthorized') || error.message?.includes('token')) {
      return {
        code: 'AUTH_ERROR',
        message: 'Authentication failed',
        originalError: error,
        timestamp,
        recoveryAction: 'manual'
      };
    }
    
    // Quota dépassé
    if (error.message?.includes('403') || error.message?.includes('quota') || error.message?.includes('limit')) {
      return {
        code: 'QUOTA_EXCEEDED',
        message: 'Storage quota exceeded',
        originalError: error,
        timestamp,
        recoveryAction: 'manual'
      };
    }
    
    // Erreurs serveur
    if (error.message?.includes('500') || error.message?.includes('502') || error.message?.includes('503')) {
      return {
        code: 'SERVER_ERROR',
        message: 'Server error',
        originalError: error,
        timestamp,
        recoveryAction: 'retry'
      };
    }
    
    // Erreurs de permissions
    if (error.message?.includes('permission') || error.message?.includes('forbidden')) {
      return {
        code: 'PERMISSION_ERROR',
        message: 'Permission denied',
        originalError: error,
        timestamp,
        recoveryAction: 'manual'
      };
    }
    
    // Erreurs de corruption de données
    if (error.message?.includes('JSON') || error.message?.includes('parse') || error.message?.includes('corrupt')) {
      return {
        code: 'CORRUPTION_ERROR',
        message: 'Data corruption detected',
        originalError: error,
        timestamp,
        recoveryAction: 'retry'
      };
    }
    
    // Erreur inconnue
    return {
      code: 'UNKNOWN_ERROR',
      message: error.message || 'Unknown error occurred',
      originalError: error,
      timestamp,
      recoveryAction: 'retry'
    };
  }

  static getADHDFriendlyMessage(error: SyncError): ADHDFriendlyError {
    const friendlyError = this.ERROR_MESSAGES[error.code] || this.ERROR_MESSAGES.UNKNOWN_ERROR;
    return { ...friendlyError };
  }

  static logError(error: SyncError): void {
    // Log sans données personnelles
    const logEntry = {
      code: error.code,
      timestamp: error.timestamp,
      module: error.module,
      message: error.message,
      // Ne pas logger originalError car ça peut contenir des données sensibles
      stack: error.originalError?.stack ? 'Stack trace available' : 'No stack trace'
    };
    
    console.error('[ADHD Sync Error]', logEntry);
    
    // Dans un vrai projet, on enverrait ça à un service de monitoring
    // sans données personnelles
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'sync_error', {
        error_code: error.code,
        error_severity: this.getADHDFriendlyMessage(error).severity,
        module: error.module
      });
    }
  }

  static shouldRetry(error: SyncError): boolean {
    return error.recoveryAction === 'retry';
  }

  static getRetryDelay(retryCount: number, error: SyncError): number {
    // Backoff exponentiel avec limites ADHD-friendly
    const baseDelay = error.code === 'NETWORK_ERROR' ? 2000 : 1000;
    const delay = Math.min(16000, baseDelay * Math.pow(2, retryCount));
    
    // Ajout d'un peu de randomization pour éviter les thundering herds
    return delay + Math.random() * 1000;
  }

  static getMaxRetries(error: SyncError): number {
    switch (error.code) {
      case 'NETWORK_ERROR':
        return 5; // Plus de tentatives pour les problèmes réseau
      case 'SERVER_ERROR':
        return 3;
      case 'CORRUPTION_ERROR':
        return 2;
      default:
        return 1; // Pour les erreurs qui nécessitent une intervention manuelle
    }
  }
}