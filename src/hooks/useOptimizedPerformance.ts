import { useEffect, useRef, useState, useCallback, useMemo } from 'react';

// Hook pour pré-charger intelligemment les données
export const useSmartPreloader = (
  dataFetchers: Record<string, () => Promise<any>>,
  priority: Record<string, number> = {}
) => {
  const [preloadedData, setPreloadedData] = useState<Record<string, any>>({});
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  const abortController = useRef(new AbortController());

  useEffect(() => {
    const loadData = async () => {
      // Trier par priorité (plus haut = plus prioritaire)
      const sortedKeys = Object.keys(dataFetchers).sort((a, b) => 
        (priority[b] || 0) - (priority[a] || 0)
      );

      for (const key of sortedKeys) {
        if (abortController.current.signal.aborted) break;

        setLoadingStates(prev => ({ ...prev, [key]: true }));
        
        try {
          const data = await dataFetchers[key]();
          if (!abortController.current.signal.aborted) {
            setPreloadedData(prev => ({ ...prev, [key]: data }));
          }
        } catch (error) {
          console.warn(`Preload failed for ${key}:`, error);
        } finally {
          setLoadingStates(prev => ({ ...prev, [key]: false }));
        }

        // Petit délai pour ne pas bloquer l'interface
        await new Promise(resolve => setTimeout(resolve, 10));
      }
    };

    // Débuter le preload après un court délai pour laisser l'interface s'afficher
    const timeout = setTimeout(loadData, 100);

    return () => {
      clearTimeout(timeout);
      abortController.current.abort();
    };
  }, []);

  const getData = useCallback((key: string) => preloadedData[key], [preloadedData]);
  const isLoading = useCallback((key: string) => loadingStates[key] || false, [loadingStates]);

  return { getData, isLoading, preloadedData };
};

// Hook pour optimiser les animations selon la performance du device
export const useAdaptiveAnimations = () => {
  const [animationLevel, setAnimationLevel] = useState<'full' | 'reduced' | 'minimal'>('full');
  const [fps, setFps] = useState(60);
  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());

  useEffect(() => {
    // Mesurer les FPS sur quelques frames
    let animationId: number;
    const measureFps = () => {
      const now = performance.now();
      frameCount.current++;

      if (frameCount.current % 60 === 0) {
        const currentFps = Math.round(1000 / ((now - lastTime.current) / 60));
        setFps(currentFps);
        
        // Ajuster le niveau d'animation selon les performances
        if (currentFps < 30) {
          setAnimationLevel('minimal');
        } else if (currentFps < 50) {
          setAnimationLevel('reduced');
        } else {
          setAnimationLevel('full');
        }

        lastTime.current = now;
        frameCount.current = 0;
      }

      animationId = requestAnimationFrame(measureFps);
    };

    animationId = requestAnimationFrame(measureFps);

    return () => cancelAnimationFrame(animationId);
  }, []);

  // Vérifier les préférences utilisateur
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setAnimationLevel('minimal');
    }
  }, []);

  const getAnimationDuration = useCallback((baseDuration: number): number => {
    switch (animationLevel) {
      case 'minimal': return baseDuration * 0.3;
      case 'reduced': return baseDuration * 0.7;
      default: return baseDuration;
    }
  }, [animationLevel]);

  const shouldAnimate = useCallback((complexity: 'low' | 'medium' | 'high' = 'medium'): boolean => {
    if (animationLevel === 'minimal') return complexity === 'low';
    if (animationLevel === 'reduced') return complexity !== 'high';
    return true;
  }, [animationLevel]);

  return {
    animationLevel,
    fps,
    getAnimationDuration,
    shouldAnimate
  };
};

// Hook pour cache intelligent des données fréquemment utilisées
export const useSmartCache = <T>(
  key: string,
  fetcher: () => Promise<T>,
  options: {
    ttl?: number; // Time to live en ms
    staleWhileRevalidate?: boolean;
    maxSize?: number;
  } = {}
) => {
  const { ttl = 5 * 60 * 1000, staleWhileRevalidate = true, maxSize = 50 } = options;
  
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastFetch, setLastFetch] = useState<number>(0);

  // Cache global partagé entre toutes les instances
  const cache = useMemo(() => {
    if (typeof window === 'undefined') return new Map();
    
    if (!(window as any).__smartCache) {
      (window as any).__smartCache = new Map();
    }
    return (window as any).__smartCache;
  }, []);

  const isStale = useCallback(() => {
    return Date.now() - lastFetch > ttl;
  }, [lastFetch, ttl]);

  const fetchData = useCallback(async (forceRefresh = false) => {
    const cacheKey = `smart_cache_${key}`;
    const cached = cache.get(cacheKey);

    // Utiliser le cache si valide et pas de force refresh
    if (!forceRefresh && cached && !isStale()) {
      setData(cached.data);
      setLastFetch(cached.timestamp);
      return cached.data;
    }

    // Si stale mais on a des données, les retourner immédiatement
    if (staleWhileRevalidate && cached && isStale()) {
      setData(cached.data);
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await fetcher();
      const timestamp = Date.now();
      
      setData(result);
      setLastFetch(timestamp);
      
      // Gérer la taille max du cache
      if (cache.size >= maxSize) {
        const oldestKey = cache.keys().next().value;
        cache.delete(oldestKey);
      }
      
      cache.set(cacheKey, { data: result, timestamp });
      
      return result;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [key, fetcher, cache, isStale, staleWhileRevalidate, maxSize]);

  // Fetch initial
  useEffect(() => {
    fetchData();
  }, []);

  const refetch = useCallback(() => fetchData(true), [fetchData]);
  const invalidate = useCallback(() => {
    cache.delete(`smart_cache_${key}`);
    setData(null);
    setLastFetch(0);
  }, [cache, key]);

  return {
    data,
    isLoading,
    error,
    isStale: isStale(),
    refetch,
    invalidate
  };
};

// Hook pour optimiser les rendus lors du scroll
export const useVirtualScroll = (
  items: any[],
  itemHeight: number,
  containerHeight: number,
  overscan: number = 5
) => {
  const [scrollTop, setScrollTop] = useState(0);

  const visibleStartIndex = Math.floor(scrollTop / itemHeight);
  const visibleEndIndex = Math.min(
    Math.ceil((scrollTop + containerHeight) / itemHeight),
    items.length - 1
  );

  const startIndex = Math.max(0, visibleStartIndex - overscan);
  const endIndex = Math.min(items.length - 1, visibleEndIndex + overscan);

  const visibleItems = items.slice(startIndex, endIndex + 1).map((item, index) => ({
    ...item,
    index: startIndex + index,
    offsetY: (startIndex + index) * itemHeight
  }));

  const totalHeight = items.length * itemHeight;
  const offsetY = startIndex * itemHeight;

  const handleScroll = useCallback((event: Event) => {
    const target = event.target as HTMLElement;
    setScrollTop(target.scrollTop);
  }, []);

  return {
    visibleItems,
    totalHeight,
    offsetY,
    handleScroll,
    startIndex,
    endIndex
  };
};

// Hook pour optimiser les images avec lazy loading intelligent
export const useLazyImages = () => {
  const [imageCache, setImageCache] = useState<Map<string, string>>(new Map());
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            const src = img.dataset.src;
            
            if (src && !imageCache.has(src)) {
              // Précharger l'image
              const image = new Image();
              image.onload = () => {
                setImageCache(prev => new Map(prev.set(src, src)));
                img.src = src;
                img.classList.remove('loading');
                img.classList.add('loaded');
              };
              image.src = src;
              
              observerRef.current?.unobserve(img);
            }
          }
        });
      },
      {
        rootMargin: '100px', // Précharger 100px avant que l'image soit visible
        threshold: 0.1
      }
    );

    return () => {
      observerRef.current?.disconnect();
    };
  }, [imageCache]);

  const registerImage = useCallback((element: HTMLImageElement | null) => {
    if (element && observerRef.current) {
      observerRef.current.observe(element);
    }
  }, []);

  return { registerImage, imageCache };
};

// Hook pour détecter si l'app est en arrière-plan et suspendre les opérations coûteuses
export const useBackgroundOptimization = () => {
  const [isInBackground, setIsInBackground] = useState(false);
  const [performanceMode, setPerformanceMode] = useState<'normal' | 'power-saver'>('normal');

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsInBackground(document.hidden);
    };

    // Détecter le mode économie de batterie
    const checkPerformanceMode = () => {
      // @ts-ignore - API expérimentale
      if ('getBattery' in navigator) {
        // @ts-ignore
        navigator.getBattery().then((battery) => {
          setPerformanceMode(battery.charging || battery.level > 0.2 ? 'normal' : 'power-saver');
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    checkPerformanceMode();

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const shouldSkipExpensiveOperation = useCallback(() => {
    return isInBackground || performanceMode === 'power-saver';
  }, [isInBackground, performanceMode]);

  const getOptimizedInterval = useCallback((baseInterval: number) => {
    if (isInBackground) return baseInterval * 5; // 5x moins fréquent en arrière-plan
    if (performanceMode === 'power-saver') return baseInterval * 2;
    return baseInterval;
  }, [isInBackground, performanceMode]);

  return {
    isInBackground,
    performanceMode,
    shouldSkipExpensiveOperation,
    getOptimizedInterval
  };
};