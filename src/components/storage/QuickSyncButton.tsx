import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface QuickSyncButtonProps {
  onSync: () => void;
  isSyncing?: boolean;
  lastSyncTime?: Date;
  hasUnsavedChanges?: boolean;
  className?: string;
  position?: 'bottom-right' | 'bottom-center' | 'bottom-left';
  showTooltip?: boolean;
}

export const QuickSyncButton: React.FC<QuickSyncButtonProps> = ({
  onSync,
  isSyncing = false,
  lastSyncTime,
  hasUnsavedChanges = false,
  className = '',
  position = 'bottom-right',
  showTooltip = true
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const [showUrgentPulse, setShowUrgentPulse] = useState(false);
  const [timeAgo, setTimeAgo] = useState('');

  // Calculer le temps depuis dernière sync
  useEffect(() => {
    const updateTimeAgo = () => {
      if (!lastSyncTime) {
        setTimeAgo('Jamais synchronisé');
        return;
      }

      const now = new Date();
      const diffMs = now.getTime() - lastSyncTime.getTime();
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMinutes / 60);

      if (diffMinutes < 1) {
        setTimeAgo('À l\'instant');
      } else if (diffMinutes < 60) {
        setTimeAgo(`${diffMinutes}min`);
        
        // Pulse urgent si > 10min avec changements non sauvés
        if (diffMinutes > 10 && hasUnsavedChanges) {
          setShowUrgentPulse(true);
        }
      } else if (diffHours < 24) {
        setTimeAgo(`${diffHours}h`);
        if (hasUnsavedChanges) {
          setShowUrgentPulse(true);
        }
      } else {
        const days = Math.floor(diffHours / 24);
        setTimeAgo(`${days}j`);
        if (hasUnsavedChanges) {
          setShowUrgentPulse(true);
        }
      }
    };

    updateTimeAgo();
    const interval = setInterval(updateTimeAgo, 60000); // Mise à jour chaque minute

    return () => clearInterval(interval);
  }, [lastSyncTime, hasUnsavedChanges]);

  const handleSync = () => {
    if (isSyncing) return;
    
    setIsPressed(true);
    onSync();
    setShowUrgentPulse(false);
    
    // Feedback haptique
    if ('vibrate' in navigator) {
      navigator.vibrate([50, 50, 100]); // Pattern de succès
    }
    
    // Reset visual feedback
    setTimeout(() => setIsPressed(false), 150);
  };

  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-center': 'bottom-6 left-1/2 transform -translate-x-1/2',
    'bottom-left': 'bottom-6 left-6'
  };

  const getButtonColor = () => {
    if (isSyncing) return 'bg-blue-500 hover:bg-blue-600';
    if (hasUnsavedChanges) return 'bg-orange-500 hover:bg-orange-600';
    return 'bg-green-500 hover:bg-green-600';
  };

  const getButtonIcon = () => {
    if (isSyncing) return '⏳';
    if (hasUnsavedChanges) return '💾';
    return '☁️';
  };

  const getTooltipMessage = () => {
    if (isSyncing) return 'Synchronisation en cours...';
    if (hasUnsavedChanges) return `Sync maintenant (${timeAgo})`;
    return `Dernière sync: ${timeAgo}`;
  };

  return (
    <>
      {/* Bouton principal */}
      <motion.div
        className={`fixed z-40 ${positionClasses[position]} ${className}`}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ 
          type: "spring", 
          stiffness: 400, 
          damping: 25,
          delay: 0.2 
        }}
      >
        {/* Pulse urgent pour changements non sauvés */}
        <AnimatePresence>
          {showUrgentPulse && !isSyncing && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ 
                scale: [0.8, 1.2, 0.8],
                opacity: [0.3, 0.6, 0.3]
              }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute inset-0 bg-red-400 rounded-full -m-2"
            />
          )}
        </AnimatePresence>

        <motion.button
          onClick={handleSync}
          disabled={isSyncing}
          className={`
            relative w-16 h-16 rounded-full shadow-lg text-white
            flex items-center justify-center text-xl
            transition-all duration-200 group
            ${getButtonColor()}
            ${isSyncing ? 'cursor-wait' : 'cursor-pointer'}
            ${isPressed ? 'scale-95' : 'hover:scale-105'}
            disabled:cursor-wait
          `}
          whileHover={!isSyncing ? { scale: 1.05 } : {}}
          whileTap={!isSyncing ? { scale: 0.95 } : {}}
          animate={isSyncing ? {
            rotate: [0, 360],
          } : {}}
          transition={isSyncing ? {
            rotate: { duration: 2, repeat: Infinity, ease: "linear" }
          } : {}}
          aria-label={getTooltipMessage()}
        >
          {/* Icône avec animation */}
          <motion.span
            animate={isSyncing ? {
              scale: [1, 1.2, 1],
            } : hasUnsavedChanges ? {
              scale: [1, 1.1, 1],
            } : {}}
            transition={isSyncing ? {
              duration: 1,
              repeat: Infinity,
            } : hasUnsavedChanges ? {
              duration: 1.5,
              repeat: Infinity,
            } : {}}
          >
            {getButtonIcon()}
          </motion.span>

          {/* Badge indicateur changements */}
          <AnimatePresence>
            {hasUnsavedChanges && !isSyncing && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center"
              >
                <motion.div
                  animate={{ scale: [0.8, 1.2, 0.8] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="w-2 h-2 bg-white rounded-full"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>

        {/* Tooltip */}
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            whileHover={{ opacity: 1, y: 0, scale: 1 }}
            className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-lg whitespace-nowrap pointer-events-none group-hover:opacity-100 opacity-0 transition-all duration-200"
          >
            {getTooltipMessage()}
            
            {/* Flèche du tooltip */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2">
              <div className="w-2 h-2 bg-gray-900 rotate-45 transform translate-y-[-50%]" />
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Indicateur de progression flottant */}
      <AnimatePresence>
        {isSyncing && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className={`fixed z-30 ${positionClasses[position]} transform translate-x-[-50%] translate-y-[-80px]`}
          >
            <div className="bg-white rounded-lg shadow-lg px-4 py-2 border">
              <div className="flex items-center gap-2">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"
                />
                <span className="text-sm font-medium text-gray-700">
                  Synchronisation...
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// Version compacte pour intégration dans la barre de navigation
export const QuickSyncButtonCompact: React.FC<{
  onSync: () => void;
  isSyncing?: boolean;
  hasUnsavedChanges?: boolean;
}> = ({ onSync, isSyncing = false, hasUnsavedChanges = false }) => {
  return (
    <motion.button
      onClick={onSync}
      disabled={isSyncing}
      className={`
        p-2 rounded-lg transition-all duration-200
        ${isSyncing ? 'bg-blue-100 text-blue-600' : 
          hasUnsavedChanges ? 'bg-orange-100 text-orange-600' : 
          'bg-green-100 text-green-600'}
        ${isSyncing ? 'cursor-wait' : 'hover:scale-105'}
        disabled:cursor-wait
      `}
      whileHover={!isSyncing ? { scale: 1.05 } : {}}
      whileTap={!isSyncing ? { scale: 0.95 } : {}}
      animate={isSyncing ? {
        rotate: [0, 360],
      } : hasUnsavedChanges ? {
        scale: [1, 1.05, 1],
      } : {}}
      transition={isSyncing ? {
        rotate: { duration: 2, repeat: Infinity, ease: "linear" }
      } : hasUnsavedChanges ? {
        duration: 2,
        repeat: Infinity,
      } : {}}
    >
      <span className="text-lg">
        {isSyncing ? '⏳' : hasUnsavedChanges ? '💾' : '☁️'}
      </span>
    </motion.button>
  );
};