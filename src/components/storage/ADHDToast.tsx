import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ADHDMessage } from '../../utils/adhdMessages';

interface ADHDToastProps extends ADHDMessage {
  id: string;
  onClose: () => void;
  position?: 'top-right' | 'top-center' | 'bottom-right' | 'bottom-center';
}

const TOAST_VARIANTS = {
  hidden: { opacity: 0, y: -50, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, x: 100, scale: 0.95 }
};

const TYPE_STYLES = {
  success: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-800',
    icon: '✅',
    progressColor: 'bg-green-500'
  },
  error: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-800',
    icon: '❌',
    progressColor: 'bg-red-500'
  },
  warning: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-800',
    icon: '⚠️',
    progressColor: 'bg-amber-500'
  },
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-800',
    icon: 'ℹ️',
    progressColor: 'bg-blue-500'
  }
};

export const ADHDToast: React.FC<ADHDToastProps> = ({
  id,
  title,
  description,
  action,
  emoji,
  type,
  autoClose,
  onClose,
  position = 'top-right'
}) => {
  const [timeLeft, setTimeLeft] = useState(autoClose || 0);
  const [isPaused, setIsPaused] = useState(false);
  
  const styles = TYPE_STYLES[type];

  // Auto-close timer
  useEffect(() => {
    if (!autoClose || isPaused) return;

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 100) {
          onClose();
          return 0;
        }
        return prev - 100;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [autoClose, isPaused, onClose]);

  const progressPercentage = autoClose ? ((autoClose - timeLeft) / autoClose) * 100 : 0;

  const handleActionClick = () => {
    if (action?.onClick) {
      action.onClick();
      
      // Feedback haptique
      if ('vibrate' in navigator) {
        navigator.vibrate(30);
      }
    }
    onClose();
  };

  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
    'bottom-right': 'bottom-4 right-4',
    'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2'
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={TOAST_VARIANTS}
      transition={{ 
        type: "spring", 
        damping: 25, 
        stiffness: 300,
        duration: 0.3 
      }}
      className={`
        fixed z-50 max-w-sm w-full mx-4
        ${positionClasses[position]}
      `}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      role="alert"
      aria-live="polite"
    >
      <div className={`
        relative overflow-hidden rounded-xl border shadow-lg
        ${styles.bg} ${styles.border}
      `}>
        {/* Barre de progression auto-close */}
        {autoClose && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-gray-200">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              className={`h-full ${styles.progressColor}`}
              transition={{ duration: 0.1, ease: "linear" }}
            />
          </div>
        )}

        <div className="p-4">
          <div className="flex items-start gap-3">
            {/* Emoji principal avec animation subtile */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 500 }}
              className="text-2xl flex-shrink-0 mt-0.5"
            >
              {emoji || styles.icon}
            </motion.div>

            {/* Contenu principal */}
            <div className="flex-1 min-w-0">
              <h4 className={`font-semibold text-sm ${styles.text} mb-1`}>
                {title}
              </h4>
              
              <p className={`text-sm ${styles.text} opacity-80 leading-relaxed`}>
                {description}
              </p>

              {/* Action button si présente */}
              {action && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleActionClick}
                  className={`
                    mt-3 px-4 py-2 text-sm font-medium rounded-lg
                    bg-white border border-current opacity-90
                    hover:opacity-100 hover:shadow-sm
                    transition-all duration-150
                    ${styles.text}
                  `}
                >
                  {action.label}
                </motion.button>
              )}
            </div>

            {/* Bouton fermer */}
            <button
              onClick={onClose}
              className={`
                flex-shrink-0 p-1 rounded-full
                hover:bg-black hover:bg-opacity-10
                transition-colors duration-150
                ${styles.text}
              `}
              aria-label="Fermer la notification"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>

        {/* Pause indicator */}
        {isPaused && autoClose && (
          <div className="absolute top-2 left-2">
            <div className="w-1.5 h-1.5 bg-current opacity-30 rounded-full" />
          </div>
        )}
      </div>
    </motion.div>
  );
};

// Toast manager component
interface ToastManagerProps {
  toasts: (ADHDMessage & { id: string })[];
  onRemove: (id: string) => void;
  position?: 'top-right' | 'top-center' | 'bottom-right' | 'bottom-center';
  maxToasts?: number;
}

export const ADHDToastManager: React.FC<ToastManagerProps> = ({
  toasts,
  onRemove,
  position = 'top-right',
  maxToasts = 5
}) => {
  // Limiter le nombre de toasts affichés
  const visibleToasts = toasts.slice(-maxToasts);

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      <AnimatePresence mode="popLayout">
        {visibleToasts.map((toast, index) => (
          <motion.div
            key={toast.id}
            layout
            style={{
              zIndex: 50 + index
            }}
            className="pointer-events-auto"
          >
            <ADHDToast
              {...toast}
              onClose={() => onRemove(toast.id)}
              position={position}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

// Hook pour gérer les toasts
export const useADHDToasts = () => {
  const [toasts, setToasts] = useState<(ADHDMessage & { id: string })[]>([]);

  const addToast = (message: ADHDMessage) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newToast = { ...message, id };
    
    setToasts(prev => [...prev, newToast]);

    // Feedback sonore discret (si supporté)
    if ('speechSynthesis' in window && message.type === 'success') {
      // Son système très discret
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSgGJHfH8N+UQAoUXrTp66hVFApGn+DyvmEcBjiS2e3SfCQGl2+z0eJ0MQ...');
      audio.volume = 0.1;
      audio.play().catch(() => {}); // Ignorer si pas supporté
    }

    // Auto-remove si pas de autoClose spécifié
    if (!message.autoClose) {
      setTimeout(() => removeToast(id), 5000);
    }

    return id;
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const removeAllToasts = () => {
    setToasts([]);
  };

  return {
    toasts,
    addToast,
    removeToast,
    removeAllToasts
  };
};

// Toasts pré-configurés pour les cas communs
export const useStorageToasts = () => {
  const { addToast, ...rest } = useADHDToasts();

  const showSyncSuccess = () => addToast({
    title: 'Sync réussie ! ✨',
    description: 'Tes données sont bien sauvées dans ton Drive',
    emoji: '☁️',
    type: 'success',
    autoClose: 3000
  });

  const showSyncError = (error: string) => addToast({
    title: 'Petit souci de sync 🔄',
    description: 'Tes données restent safe sur ton téléphone, on va réessayer automatiquement',
    emoji: '📱',
    type: 'warning',
    action: {
      label: 'Réessayer maintenant',
      onClick: () => console.log('Retry sync')
    }
  });

  const showOfflineMode = () => addToast({
    title: 'Mode hors-ligne 🛫',
    description: 'Tu peux continuer à travailler, la sync reprendra automatiquement',
    emoji: '📴',
    type: 'info',
    autoClose: 4000
  });

  const showQuotaFull = () => addToast({
    title: 'Drive plein ! 📦',
    description: 'Veux-tu que je nettoie automatiquement les vieux backups ?',
    emoji: '🧹',
    type: 'warning',
    action: {
      label: 'Nettoyer',
      onClick: () => console.log('Clean backups')
    }
  });

  return {
    ...rest,
    addToast,
    showSyncSuccess,
    showSyncError,
    showOfflineMode,
    showQuotaFull
  };
};