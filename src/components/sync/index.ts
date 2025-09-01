// Export de tous les composants sync pour faciliter les imports
export { SyncProvider, useSyncManager } from './SyncProvider';
export { SyncStatusIndicator } from './SyncStatusIndicator';
export { SyncProgressBar } from './SyncProgressBar';
export { SyncToast } from './SyncToast';
export { SyncDashboard } from './SyncDashboard';
export { ConflictResolutionModal } from './ConflictResolutionModal';
export { AirplaneModeToggle, AirplaneModeExplanationModal } from './AirplaneModeToggle';

// Export des hooks
export { useSyncStatus } from '../../hooks/useSyncStatus';
export { useAutoSync } from '../../hooks/useAutoSync';
export { useProfileSync } from '../../hooks/useProfileSync';

// Export des services
export { SyncManager } from '../../lib/sync/SyncManager';
export { DriveService } from '../../lib/sync/DriveService';
export { ErrorHandler } from '../../lib/sync/ErrorHandler';

export type { 
  SyncOperation, 
  SyncStatus, 
  ConflictResolution 
} from '../../lib/sync/SyncManager';

export type { 
  DriveFile, 
  SyncMetadata 
} from '../../lib/sync/DriveService';

export type { 
  SyncError, 
  ADHDFriendlyError 
} from '../../lib/sync/ErrorHandler';