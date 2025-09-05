import { GoogleAuthProvider } from '@/lib/auth/GoogleAuthProvider';
import { DriveService } from './DriveService';

export interface SyncOperation {
  id: string;
  type: 'upload' | 'download' | 'delete';
  module: string;
  data: any;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
}

export interface SyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  lastSync: number | null;
  pendingOperations: number;
  errorCount: number;
  status: 'synced' | 'syncing' | 'offline' | 'error';
}

export interface ConflictResolution {
  id: string;
  localData: any;
  remoteData: any;
  timestamp: number;
  module: string;
  resolved: boolean;
}

type SyncCallback = (status: SyncStatus) => void;
type ConflictCallback = (conflict: ConflictResolution) => void;

export class SyncManager {
  private static instance: SyncManager;
  private authProvider: GoogleAuthProvider;
  private driveService: DriveService;
  private syncQueue: SyncOperation[] = [];
  private conflicts: ConflictResolution[] = [];
  private callbacks: SyncCallback[] = [];
  private conflictCallbacks: ConflictCallback[] = [];
  private status: SyncStatus;
  private syncTimer: NodeJS.Timeout | null = null;
  private checkTimer: NodeJS.Timeout | null = null;
  private retryTimer: NodeJS.Timeout | null = null;
  private isProcessing = false;

  private constructor() {
    this.authProvider = new GoogleAuthProvider();
    this.driveService = new DriveService(this.authProvider);
    this.status = {
      isOnline: navigator.onLine,
      isSyncing: false,
      lastSync: null,
      pendingOperations: 0,
      errorCount: 0,
      status: 'offline'
    };

    this.initializeEventListeners();
    this.loadPersistedQueue();
    this.startPeriodicTasks();
  }

  static getInstance(): SyncManager {
    if (!SyncManager.instance) {
      SyncManager.instance = new SyncManager();
    }
    return SyncManager.instance;
  }

  private initializeEventListeners(): void {
    window.addEventListener('online', () => {
      this.status.isOnline = true;
      this.updateStatus();
      this.processQueue();
    });

    window.addEventListener('offline', () => {
      this.status.isOnline = false;
      this.updateStatus();
    });

    // Auto-sync avant fermeture page
    window.addEventListener('beforeunload', () => {
      if (this.status.pendingOperations > 0) {
        this.persistQueue();
      }
    });
  }

  private startPeriodicTasks(): void {
    // Upload modifications locales toutes les 30s
    this.syncTimer = setInterval(() => {
      if (this.status.isOnline && this.authProvider.isAuthenticated() && !this.isProcessing) {
        this.processQueue();
      }
    }, 30000);

    // Check changements Drive toutes les 2min
    this.checkTimer = setInterval(() => {
      if (this.status.isOnline && this.authProvider.isAuthenticated() && !this.isProcessing) {
        this.checkRemoteChanges();
      }
    }, 120000);
  }

  addOperation(operation: Omit<SyncOperation, 'id' | 'timestamp' | 'retryCount' | 'status'>): void {
    const syncOp: SyncOperation = {
      ...operation,
      id: this.generateId(),
      timestamp: Date.now(),
      retryCount: 0,
      status: 'pending'
    };

    this.syncQueue.push(syncOp);
    this.status.pendingOperations = this.syncQueue.filter(op => op.status !== 'completed').length;
    this.persistQueue();
    this.updateStatus();

    // Tentative de sync immédiate si connecté
    if (this.status.isOnline && this.authProvider.isAuthenticated()) {
      setTimeout(() => this.processQueue(), 1000);
    }
  }

  async processQueue(): Promise<void> {
    console.log('🔄 SYNCMANAGER DEBUG: processQueue() appelé');
    console.log('🔄 SYNCMANAGER DEBUG: isProcessing:', this.isProcessing);
    console.log('🔄 SYNCMANAGER DEBUG: syncQueue length:', this.syncQueue.length);
    
    if (this.isProcessing || !this.status.isOnline || !this.authProvider.isAuthenticated()) {
      console.log('❌ SYNCMANAGER DEBUG: Conditions non remplies, sortie de processQueue');
      return;
    }

    console.log('✅ SYNCMANAGER DEBUG: Début du traitement de la queue');
    this.isProcessing = true;
    this.status.isSyncing = true;
    this.updateStatus();

    // Si la queue est vide, créons une opération de test
    if (this.syncQueue.length === 0) {
      console.log('📝 SYNCMANAGER DEBUG: Queue vide, ajout d\'une opération test');
      this.addOperation({
        type: 'upload',
        module: 'test',
        data: { message: 'Test sync', timestamp: Date.now() },
        maxRetries: 3
      });
    }

    const pendingOps = this.syncQueue.filter(op => op.status === 'pending');
    console.log('🔄 SYNCMANAGER DEBUG: Operations en attente:', pendingOps.length);
    
    for (const operation of pendingOps) {
      try {
        console.log('🔄 SYNCMANAGER DEBUG: Traitement opération:', operation.id, operation.module);
        operation.status = 'processing';
        await this.executeOperation(operation);
        operation.status = 'completed';
        this.status.errorCount = Math.max(0, this.status.errorCount - 1);
        console.log('✅ SYNCMANAGER DEBUG: Opération réussie:', operation.id);
      } catch (error) {
        console.error('❌ SYNCMANAGER DEBUG: Erreur opération:', operation.id, error);
        await this.handleOperationError(operation, error);
      }
    }

    this.status.pendingOperations = this.syncQueue.filter(op => op.status !== 'completed').length;
    this.status.lastSync = Date.now();
    this.status.isSyncing = false;
    this.isProcessing = false;
    
    console.log('✅ SYNCMANAGER DEBUG: processQueue terminé, lastSync:', this.status.lastSync);
    this.persistQueue();
    this.updateStatus();
  }

  private async executeOperation(operation: SyncOperation): Promise<void> {
    console.log('🔄 SYNCMANAGER DEBUG: executeOperation pour:', operation.type, operation.module);
    
    switch (operation.type) {
      case 'upload':
        console.log('📤 SYNCMANAGER DEBUG: Upload vers Google Drive...');
        try {
          const result = await this.driveService.uploadModule(operation.module, operation.data);
          console.log('✅ SYNCMANAGER DEBUG: Upload réussi:', result.id);
        } catch (error) {
          console.error('❌ SYNCMANAGER DEBUG: Upload échoué:', error);
          throw error;
        }
        break;
      case 'download':
        console.log('📥 SYNCMANAGER DEBUG: Download depuis Google Drive...');
        const result = await this.driveService.downloadLatestModule(operation.module);
        if (result) {
          console.log('✅ SYNCMANAGER DEBUG: Download réussi');
          await this.handleRemoteData(operation.module, result.content);
        } else {
          console.log('ℹ️ SYNCMANAGER DEBUG: Aucun fichier trouvé pour download');
        }
        break;
      case 'delete':
        console.log('🗑️ SYNCMANAGER DEBUG: Delete operation not yet implemented');
        break;
    }
  }


  private async handleRemoteData(module: string, remoteData: any): Promise<void> {
    const localDataKey = `adhd_${module}_data`;
    const localTimestampKey = `adhd_${module}_timestamp`;
    
    const localData = localStorage.getItem(localDataKey);
    const localTimestamp = parseInt(localStorage.getItem(localTimestampKey) || '0');
    
    if (remoteData.timestamp > localTimestamp) {
      if (localData && localTimestamp > 0) {
        // Conflit détecté
        const conflict: ConflictResolution = {
          id: this.generateId(),
          localData: JSON.parse(localData),
          remoteData: remoteData.data,
          timestamp: Date.now(),
          module,
          resolved: false
        };
        
        this.conflicts.push(conflict);
        this.notifyConflict(conflict);
      } else {
        // Pas de conflit, appliquer les données distantes
        localStorage.setItem(localDataKey, JSON.stringify(remoteData.data));
        localStorage.setItem(localTimestampKey, remoteData.timestamp.toString());
      }
    }
  }

  private async handleOperationError(operation: SyncOperation, error: any): Promise<void> {
    operation.retryCount++;
    this.status.errorCount++;
    
    if (operation.retryCount >= operation.maxRetries) {
      operation.status = 'failed';
      console.error(`Opération ${operation.id} échouée définitivement:`, error);
    } else {
      operation.status = 'pending';
      const delay = Math.min(16000, 1000 * Math.pow(2, operation.retryCount));
      
      setTimeout(() => {
        if (this.status.isOnline && this.authProvider.isAuthenticated()) {
          this.processQueue();
        }
      }, delay);
    }
  }

  private async checkRemoteChanges(): Promise<void> {
    // Vérifier s'il y a des changements distants pour chaque module
    const modules = ['profile', 'health', 'mood', 'reminders', 'checklists'];
    
    for (const module of modules) {
      try {
        const { hasChanges } = await this.driveService.checkRemoteChanges(module);
        if (hasChanges) {
          this.addOperation({
            type: 'download',
            module,
            data: null,
            maxRetries: 3
          });
        }
      } catch (error) {
        console.warn(`Erreur lors de la vérification des changements pour ${module}:`, error);
      }
    }
  }

  resolveConflict(conflictId: string, useLocal: boolean): void {
    const conflict = this.conflicts.find(c => c.id === conflictId);
    if (!conflict) return;

    const dataToUse = useLocal ? conflict.localData : conflict.remoteData;
    const localDataKey = `adhd_${conflict.module}_data`;
    const localTimestampKey = `adhd_${conflict.module}_timestamp`;
    
    localStorage.setItem(localDataKey, JSON.stringify(dataToUse));
    localStorage.setItem(localTimestampKey, Date.now().toString());
    
    conflict.resolved = true;
    
    // Upload de la résolution si on garde les données locales
    if (useLocal) {
      this.addOperation({
        type: 'upload',
        module: conflict.module,
        data: dataToUse,
        maxRetries: 3
      });
    }
  }

  // Méthodes publiques pour l'UI
  getStatus(): SyncStatus {
    return { ...this.status };
  }

  getPendingConflicts(): ConflictResolution[] {
    return this.conflicts.filter(c => !c.resolved);
  }

  onStatusChange(callback: SyncCallback): void {
    this.callbacks.push(callback);
  }

  onConflict(callback: ConflictCallback): void {
    this.conflictCallbacks.push(callback);
  }

  forceSync(): void {
    console.log('🔄 SYNCMANAGER DEBUG: forceSync() appelé');
    console.log('🔄 SYNCMANAGER DEBUG: isOnline:', this.status.isOnline);
    console.log('🔄 SYNCMANAGER DEBUG: isAuthenticated:', this.authProvider.isAuthenticated());
    
    if (this.status.isOnline && this.authProvider.isAuthenticated()) {
      console.log('✅ SYNCMANAGER DEBUG: Conditions OK, lancement processQueue()');
      this.processQueue();
    } else {
      console.log('❌ SYNCMANAGER DEBUG: Conditions non remplies pour sync');
      if (!this.status.isOnline) console.log('  - Pas en ligne');
      if (!this.authProvider.isAuthenticated()) console.log('  - Non authentifié');
    }
  }

  // Méthodes privées utilitaires
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private persistQueue(): void {
    const queueData = {
      operations: this.syncQueue,
      conflicts: this.conflicts,
      lastPersist: Date.now()
    };
    localStorage.setItem('sync_queue', JSON.stringify(queueData));
  }

  private loadPersistedQueue(): void {
    try {
      const stored = localStorage.getItem('sync_queue');
      if (stored) {
        const queueData = JSON.parse(stored);
        this.syncQueue = queueData.operations || [];
        this.conflicts = queueData.conflicts || [];
        
        // Reset processing status
        this.syncQueue.forEach(op => {
          if (op.status === 'processing') {
            op.status = 'pending';
          }
        });
        
        this.status.pendingOperations = this.syncQueue.filter(op => op.status !== 'completed').length;
      }
    } catch (error) {
      console.error('Erreur lors du chargement de la queue:', error);
    }
  }

  private updateStatus(): void {
    if (!this.status.isOnline) {
      this.status.status = 'offline';
    } else if (this.status.isSyncing) {
      this.status.status = 'syncing';
    } else if (this.status.errorCount > 0) {
      this.status.status = 'error';
    } else {
      this.status.status = 'synced';
    }

    this.callbacks.forEach(callback => callback(this.status));
  }

  private notifyConflict(conflict: ConflictResolution): void {
    this.conflictCallbacks.forEach(callback => callback(conflict));
  }

  // Nettoyage
  destroy(): void {
    if (this.syncTimer) clearInterval(this.syncTimer);
    if (this.checkTimer) clearInterval(this.checkTimer);
    if (this.retryTimer) clearTimeout(this.retryTimer);
    
    this.persistQueue();
  }
}