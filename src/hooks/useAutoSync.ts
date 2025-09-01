import { useEffect, useCallback, useRef } from 'react';
import { SyncManager } from '@/lib/sync/SyncManager';

interface AutoSyncConfig {
  module: string;
  data: any;
  enabled?: boolean;
  maxRetries?: number;
}

export function useAutoSync({ 
  module, 
  data, 
  enabled = true, 
  maxRetries = 3 
}: AutoSyncConfig) {
  const syncManager = useRef(SyncManager.getInstance());
  const lastDataRef = useRef<string>('');
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const scheduleSync = useCallback(() => {
    if (!enabled) return;
    
    // Debounce de 2 secondes pour éviter trop de sync
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    debounceRef.current = setTimeout(() => {
      const currentDataString = JSON.stringify(data);
      
      if (currentDataString !== lastDataRef.current) {
        // Sauvegarder localement avec timestamp
        const localDataKey = `adhd_${module}_data`;
        const localTimestampKey = `adhd_${module}_timestamp`;
        
        localStorage.setItem(localDataKey, currentDataString);
        localStorage.setItem(localTimestampKey, Date.now().toString());
        
        // Ajouter à la queue de sync
        syncManager.current.addOperation({
          type: 'upload',
          module,
          data,
          maxRetries
        });
        
        lastDataRef.current = currentDataString;
      }
    }, 2000);
  }, [module, data, enabled, maxRetries]);

  useEffect(() => {
    scheduleSync();
    
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [scheduleSync]);

  const forceSync = useCallback(() => {
    syncManager.current.forceSync();
  }, []);

  return { forceSync };
}