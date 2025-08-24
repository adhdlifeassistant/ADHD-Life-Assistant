'use client';

import React from 'react';

// Cache intelligent pour les données locales
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  version: string;
}

interface CacheConfig {
  ttl: number; // Time to live en millisecondes
  maxSize: number; // Nombre maximum d'entrées
  version: string; // Version pour invalider le cache
}

class DataCache {
  private cache = new Map<string, CacheEntry<any>>();
  private config: CacheConfig = {
    ttl: 5 * 60 * 1000, // 5 minutes par défaut
    maxSize: 100,
    version: '1.0.0'
  };

  constructor(config?: Partial<CacheConfig>) {
    if (config) {
      this.config = { ...this.config, ...config };
    }
    this.loadFromStorage();
    this.startCleanupTimer();
  }

  set<T>(key: string, data: T, customTtl?: number): void {
    const ttl = customTtl || this.config.ttl;
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      version: this.config.version
    };

    // Si la cache est pleine, supprimer les anciennes entrées
    if (this.cache.size >= this.config.maxSize) {
      this.cleanup();
    }

    this.cache.set(key, entry);
    this.saveToStorage();
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Vérifier la version
    if (entry.version !== this.config.version) {
      this.cache.delete(key);
      this.saveToStorage();
      return null;
    }

    // Vérifier l'expiration
    if (Date.now() - entry.timestamp > this.config.ttl) {
      this.cache.delete(key);
      this.saveToStorage();
      return null;
    }

    return entry.data as T;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.saveToStorage();
    }
    return deleted;
  }

  clear(): void {
    this.cache.clear();
    localStorage.removeItem('adhd-cache');
  }

  size(): number {
    return this.cache.size;
  }

  // Nettoyage des entrées expirées
  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.config.ttl || entry.version !== this.config.version) {
        keysToDelete.push(key);
      }
    }

    // Supprimer les plus anciennes si encore trop plein
    if (keysToDelete.length === 0 && this.cache.size >= this.config.maxSize) {
      const sortedEntries = Array.from(this.cache.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp);
      
      const toRemove = Math.floor(this.config.maxSize * 0.2); // Supprimer 20% des plus anciennes
      for (let i = 0; i < toRemove; i++) {
        keysToDelete.push(sortedEntries[i][0]);
      }
    }

    keysToDelete.forEach(key => this.cache.delete(key));
    
    if (keysToDelete.length > 0) {
      this.saveToStorage();
    }
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem('adhd-cache');
      if (stored) {
        const data = JSON.parse(stored);
        this.cache = new Map(data);
      }
    } catch (error) {
      console.warn('Erreur lors du chargement du cache:', error);
      localStorage.removeItem('adhd-cache');
    }
  }

  private saveToStorage(): void {
    try {
      const data = Array.from(this.cache.entries());
      localStorage.setItem('adhd-cache', JSON.stringify(data));
    } catch (error) {
      console.warn('Erreur lors de la sauvegarde du cache:', error);
      // Si l'espace est plein, vider le cache
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        this.clear();
      }
    }
  }

  private startCleanupTimer(): void {
    // Nettoyage automatique toutes les 10 minutes
    setInterval(() => {
      this.cleanup();
    }, 10 * 60 * 1000);
  }

  // Méthodes utilitaires pour les patterns de cache courants
  
  // Cache avec mise à jour automatique
  async getOrSet<T>(
    key: string, 
    factory: () => Promise<T> | T, 
    ttl?: number
  ): Promise<T> {
    let data = this.get<T>(key);
    
    if (data === null) {
      data = await factory();
      this.set(key, data, ttl);
    }
    
    return data;
  }

  // Cache conditionnel avec validation
  getWithValidation<T>(
    key: string, 
    validator: (data: T) => boolean
  ): T | null {
    const data = this.get<T>(key);
    
    if (data !== null && !validator(data)) {
      this.delete(key);
      return null;
    }
    
    return data;
  }

  // Stats pour debugging
  getStats(): {
    size: number;
    oldestEntry: number | null;
    newestEntry: number | null;
    hitRate?: number;
  } {
    if (this.cache.size === 0) {
      return { size: 0, oldestEntry: null, newestEntry: null };
    }

    const timestamps = Array.from(this.cache.values()).map(entry => entry.timestamp);
    
    return {
      size: this.cache.size,
      oldestEntry: Math.min(...timestamps),
      newestEntry: Math.max(...timestamps)
    };
  }
}

// Instance globale du cache
export const globalCache = new DataCache({
  ttl: 10 * 60 * 1000, // 10 minutes
  maxSize: 200,
  version: '1.0.0'
});

// Cache spécialisé pour les analytics (plus long TTL)
export const analyticsCache = new DataCache({
  ttl: 60 * 60 * 1000, // 1 heure
  maxSize: 50,
  version: '1.0.0'
});

// Hooks utiles pour React

export function useCachedData<T>(
  key: string,
  factory: () => T | Promise<T>,
  dependencies: any[] = [],
  cache = globalCache
) {
  const [data, setData] = React.useState<T | null>(cache.get<T>(key));
  const [loading, setLoading] = React.useState(!data);

  React.useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      
      try {
        const cachedData = cache.get<T>(key);
        
        if (cachedData !== null) {
          setData(cachedData);
          setLoading(false);
        } else {
          const newData = await factory();
          cache.set(key, newData);
          setData(newData);
          setLoading(false);
        }
      } catch (error) {
        console.error(`Erreur lors du chargement des données pour ${key}:`, error);
        setLoading(false);
      }
    };

    loadData();
  }, dependencies);

  const invalidate = () => {
    cache.delete(key);
    setData(null);
  };

  return { data, loading, invalidate };
}

// Fonction pour précharger les données critiques
export async function preloadCriticalData() {
  const criticalKeys = [
    'adhd-current-mood',
    'adhd-wellbeing-entries',
    'adhd-expenses',
    'adhd-reminders'
  ];

  criticalKeys.forEach(key => {
    const data = localStorage.getItem(key);
    if (data) {
      globalCache.set(`localStorage:${key}`, JSON.parse(data), 30 * 60 * 1000); // 30 minutes
    }
  });
}

export default DataCache;