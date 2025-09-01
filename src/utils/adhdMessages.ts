export interface ADHDMessage {
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  emoji: string;
  type: 'success' | 'info' | 'warning' | 'error';
  autoClose?: number; // en millisecondes
}

export class ADHDMessageService {
  
  /**
   * Messages bienveillants pour erreurs de stockage
   */
  static getStorageErrorMessage(error: string, context?: any): ADHDMessage {
    // Normaliser l'erreur
    const errorLower = error.toLowerCase();

    // Erreur 403 - Pas d'autorisation Drive
    if (errorLower.includes('403') || errorLower.includes('forbidden')) {
      return {
        title: 'Petite pause sync ! 😊',
        description: 'Tes données restent safe sur ton téléphone. Veux-tu reconnecter ton Drive ?',
        emoji: '🔄',
        type: 'warning',
        action: {
          label: 'Reconnecter Drive',
          onClick: () => this.reconnectDrive()
        }
      };
    }

    // Erreur réseau / connexion
    if (errorLower.includes('network') || errorLower.includes('connexion') || errorLower.includes('timeout')) {
      return {
        title: 'Mode avion activé ! 🛫',
        description: 'Tout fonctionne normalement, la sync reprendra toute seule dès que tu auras du réseau',
        emoji: '📶',
        type: 'info',
        autoClose: 5000
      };
    }

    // Quota dépassé
    if (errorLower.includes('quota') || errorLower.includes('space') || errorLower.includes('storage full')) {
      return {
        title: 'Ton Drive est plein ! 📦',
        description: 'Veux-tu que je nettoie automatiquement les vieux backups pour faire de la place ?',
        emoji: '🧹',
        type: 'warning',
        action: {
          label: 'Nettoyer automatiquement',
          onClick: () => this.cleanupOldBackups()
        }
      };
    }

    // Erreur d'authentification
    if (errorLower.includes('auth') || errorLower.includes('token') || errorLower.includes('unauthorized')) {
      return {
        title: 'Session expirée 🔐',
        description: 'C\'est normal après un moment ! Reconnecte-toi en 2 clics pour continuer',
        emoji: '🔓',
        type: 'warning',
        action: {
          label: 'Me reconnecter',
          onClick: () => this.reauthenticate()
        }
      };
    }

    // Erreur de fichier corrompu
    if (errorLower.includes('corrupt') || errorLower.includes('invalid') || errorLower.includes('parse')) {
      return {
        title: 'Fichier un peu mélangé 🔧',
        description: 'Pas de panique ! Je peux restaurer depuis ton dernier backup automatique',
        emoji: '⚡',
        type: 'warning',
        action: {
          label: 'Restaurer backup',
          onClick: () => this.restoreFromBackup()
        }
      };
    }

    // Erreur générique avec solution
    return {
      title: 'Petit accroc technique 🛠️',
      description: 'Tes données sont en sécurité ! Veux-tu que je réessaie automatiquement ?',
      emoji: '🔄',
      type: 'error',
      action: {
        label: 'Réessayer maintenant',
        onClick: () => this.retryOperation(context)
      }
    };
  }

  /**
   * Messages de succès encourageants
   */
  static getSuccessMessage(operation: string): ADHDMessage {
    const successMessages = {
      sync: {
        title: 'Parfait ! ✨',
        description: 'Tes données sont bien sauvées dans ton Drive',
        emoji: '☁️',
      },
      save: {
        title: 'Enregistré ! 🎉',
        description: 'Ton travail est en sécurité, tu peux souffler',
        emoji: '💾',
      },
      backup: {
        title: 'Backup créé ! 🛡️',
        description: 'Une copie de sécurité supplémentaire, au cas où',
        emoji: '📋',
      },
      export: {
        title: 'Export terminé ! 📁',
        description: 'Tes données sont prêtes à être partagées',
        emoji: '📤',
      }
    };

    const message = successMessages[operation as keyof typeof successMessages] || {
      title: 'Action réussie ! ✅',
      description: 'Tout s\'est bien passé',
      emoji: '👍',
    };

    return {
      ...message,
      type: 'success',
      autoClose: 3000
    };
  }

  /**
   * Messages informatifs rassurants
   */
  static getInfoMessage(type: string, details?: any): ADHDMessage {
    switch (type) {
      case 'offline_mode':
        return {
          title: 'Mode hors-ligne activé 📴',
          description: 'Tu peux continuer à travailler, tout sera synchronisé à la reconnexion',
          emoji: '🔄',
          type: 'info',
          autoClose: 4000
        };

      case 'slow_connection':
        return {
          title: 'Connexion un peu lente 🐌',
          description: 'La sync prendra quelques secondes de plus, mais ça va marcher !',
          emoji: '⏰',
          type: 'info',
          autoClose: 3000
        };

      case 'large_file':
        return {
          title: 'Gros fichier détecté 📊',
          description: `${details?.fileName} fait ${details?.fileSize}, ça peut prendre 1-2 minutes`,
          emoji: '⏳',
          type: 'info'
        };

      case 'auto_backup':
        return {
          title: 'Backup automatique en cours 🔄',
          description: 'Je sauvegarde tes progrès toutes les 5 minutes, comme ça tu ne perds rien',
          emoji: '💝',
          type: 'info',
          autoClose: 2000
        };

      default:
        return {
          title: 'Information 📢',
          description: 'Tout va bien, continue comme ça !',
          emoji: 'ℹ️',
          type: 'info',
          autoClose: 3000
        };
    }
  }

  /**
   * Messages de progression avec encouragement
   */
  static getProgressMessage(operation: string, progress: number): ADHDMessage {
    const timeEstimations = {
      sync: Math.max(1, Math.round((100 - progress) / 10)),
      backup: Math.max(1, Math.round((100 - progress) / 20)),
      export: Math.max(1, Math.round((100 - progress) / 15)),
    };

    const timeLeft = timeEstimations[operation as keyof typeof timeEstimations] || 1;
    
    const encouragements = [
      'Tu y es presque !',
      'Encore quelques secondes !',
      'Ça avance bien !',
      'Presque fini !',
      'Plus que quelques instants !'
    ];

    const randomEncouragement = encouragements[Math.floor(Math.random() * encouragements.length)];

    return {
      title: `${operation.charAt(0).toUpperCase() + operation.slice(1)} en cours... (${progress}%)`,
      description: `${randomEncouragement} Plus que ${timeLeft} seconde${timeLeft > 1 ? 's' : ''}`,
      emoji: '⏳',
      type: 'info'
    };
  }

  // Actions helper (à implémenter selon ton contexte)
  private static reconnectDrive() {
    console.log('Reconnexion Drive...');
  }

  private static cleanupOldBackups() {
    console.log('Nettoyage des anciens backups...');
  }

  private static reauthenticate() {
    console.log('Réauthentification...');
  }

  private static restoreFromBackup() {
    console.log('Restauration depuis backup...');
  }

  private static retryOperation(context?: any) {
    console.log('Nouvel essai...', context);
  }
}

/**
 * Messages spécifiques pour différents contextes ADHD
 */
export class ADHDContextualMessages {
  
  // Messages pour la gestion de l'attention
  static getAttentionMessages() {
    return {
      focus_break: {
        title: 'Petite pause ? 🧠',
        description: 'Tu travailles depuis un moment, veux-tu sauvegarder avant de faire une pause ?',
        emoji: '☕',
        type: 'info' as const
      },
      
      task_switch: {
        title: 'Changement de tâche détecté 🔄',
        description: 'Je sauvegarde automatiquement pour que tu puisses revenir facilement',
        emoji: '💾',
        type: 'success' as const,
        autoClose: 2000
      }
    };
  }

  // Messages pour la motivation
  static getMotivationalMessages() {
    return {
      daily_streak: {
        title: 'Bravo ! 🔥',
        description: 'C\'est ton 5ème jour consécutif d\'utilisation, tu assures !',
        emoji: '🌟',
        type: 'success' as const,
        autoClose: 4000
      },
      
      first_sync: {
        title: 'Welcome ! 🎉',
        description: 'Félicitations, ton premier sync est réussi. Tes données sont maintenant protégées',
        emoji: '🛡️',
        type: 'success' as const,
        autoClose: 5000
      }
    };
  }
}