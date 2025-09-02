import React, { useEffect, useRef, useState } from 'react';

export interface SwipeGestureCallbacks {
  onSwipeDown?: () => void;
  onSwipeUp?: () => void;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onPullToRefresh?: () => void;
}

export const useSwipeGestures = (callbacks: SwipeGestureCallbacks, options?: {
  threshold?: number; // Distance minimale pour déclencher
  restraint?: number; // Distance max perpendiculaire
  allowedTime?: number; // Temps max pour le swipe
  pullToRefreshThreshold?: number;
}) => {
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const [isPullingToRefresh, setIsPullingToRefresh] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  
  const config = {
    threshold: options?.threshold || 150,
    restraint: options?.restraint || 100,
    allowedTime: options?.allowedTime || 500,
    pullToRefreshThreshold: options?.pullToRefreshThreshold || 100,
  };

  const handleTouchStart = (e: TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: new Date().getTime()
    };
    setIsPullingToRefresh(false);
    setPullDistance(0);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!touchStartRef.current) return;
    
    const touch = e.touches[0];
    const deltaY = touch.clientY - touchStartRef.current.y;
    
    // Pull to refresh (seulement si on est en haut de page)
    if (window.scrollY === 0 && deltaY > 0 && callbacks.onPullToRefresh) {
      setIsPullingToRefresh(true);
      setPullDistance(Math.min(deltaY, config.pullToRefreshThreshold * 1.5));
      
      // Empêcher le scroll par défaut
      if (deltaY > 20) {
        e.preventDefault();
      }
    }
  };

  const handleTouchEnd = (e: TouchEvent) => {
    if (!touchStartRef.current) return;

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;
    const deltaTime = new Date().getTime() - touchStartRef.current.time;
    
    // Pull to refresh
    if (isPullingToRefresh && pullDistance >= config.pullToRefreshThreshold) {
      callbacks.onPullToRefresh?.();
      
      // Feedback haptique
      if ('vibrate' in navigator) {
        navigator.vibrate(50);
      }
    }

    // Swipe gestures normaux
    if (deltaTime <= config.allowedTime) {
      const absDeltaX = Math.abs(deltaX);
      const absDeltaY = Math.abs(deltaY);

      // Swipe horizontal
      if (absDeltaX >= config.threshold && absDeltaY <= config.restraint) {
        if (deltaX > 0) {
          callbacks.onSwipeRight?.();
        } else {
          callbacks.onSwipeLeft?.();
        }
        
        // Feedback haptique léger
        if ('vibrate' in navigator) {
          navigator.vibrate(20);
        }
      }
      
      // Swipe vertical
      else if (absDeltaY >= config.threshold && absDeltaX <= config.restraint) {
        if (deltaY > 0) {
          callbacks.onSwipeDown?.();
        } else {
          callbacks.onSwipeUp?.();
        }
        
        // Feedback haptique léger
        if ('vibrate' in navigator) {
          navigator.vibrate(20);
        }
      }
    }

    // Reset
    setIsPullingToRefresh(false);
    setPullDistance(0);
    touchStartRef.current = null;
  };

  useEffect(() => {
    // Options passives pour de meilleures performances
    const options = { passive: false };

    document.addEventListener('touchstart', handleTouchStart, options);
    document.addEventListener('touchmove', handleTouchMove, options);
    document.addEventListener('touchend', handleTouchEnd, options);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [callbacks, config]);

  return {
    isPullingToRefresh,
    pullDistance,
    pullProgress: Math.min(pullDistance / config.pullToRefreshThreshold, 1)
  };
};

// Hook spécialisé pour la navigation ADHD avec swipes
export const useADHDNavigationSwipes = (callbacks: {
  onRefresh?: () => void;
  onGoBack?: () => void;
  onOpenMenu?: () => void;
  onQuickActions?: () => void;
}) => {
  return useSwipeGestures({
    onSwipeDown: callbacks.onRefresh,
    onSwipeRight: callbacks.onGoBack,
    onSwipeLeft: callbacks.onOpenMenu,
    onSwipeUp: callbacks.onQuickActions,
    onPullToRefresh: callbacks.onRefresh,
  }, {
    threshold: 100, // Plus sensible pour ADHD
    pullToRefreshThreshold: 80
  });
};

// Component indicateur Pull to Refresh
export const PullToRefreshIndicator: React.FC<{
  isActive: boolean;
  progress: number;
  distance: number;
}> = ({ isActive, progress, distance }) => {
  if (!isActive) return null;

  return (
    <div 
      className="fixed top-0 left-0 right-0 flex justify-center z-50 transition-transform duration-200"
      style={{ 
        transform: `translateY(${Math.min(distance - 60, 0)}px)`,
        opacity: Math.min(progress, 1)
      }}
    >
      <div className="bg-white rounded-b-xl shadow-lg px-4 py-3 flex items-center gap-2">
        <div 
          className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full transition-transform duration-200"
          style={{
            transform: `rotate(${progress * 360}deg)`
          }}
        />
        <span className="text-sm text-gray-700">
          {progress >= 1 ? 'Relâche pour actualiser !' : 'Tire vers le bas...'}
        </span>
      </div>
    </div>
  );
};

// Hook pour les gestes de productivité ADHD
export const useADHDProductivitySwipes = (callbacks: {
  onQuickNote?: () => void;
  onFocusMode?: () => void;
  onBreakTime?: () => void;
  onTaskComplete?: () => void;
}) => {
  return useSwipeGestures({
    // Swipe vers le haut = Mode focus
    onSwipeUp: callbacks.onFocusMode,
    
    // Swipe vers le bas = Pause
    onSwipeDown: callbacks.onBreakTime,
    
    // Swipe droite = Note rapide
    onSwipeRight: callbacks.onQuickNote,
    
    // Swipe gauche = Tâche terminée
    onSwipeLeft: callbacks.onTaskComplete,
  }, {
    threshold: 120,
    restraint: 80
  });
};