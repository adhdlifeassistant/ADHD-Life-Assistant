import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export type CloudSyncStatus = 'connected' | 'syncing' | 'network_issue' | 'offline' | 'error';

interface CloudStatusIndicatorProps {
  status: CloudSyncStatus;
  lastSyncTime?: Date;
  onSyncNow?: () => void;
  className?: string;
}

interface StatusConfig {
  emoji: string;
  color: string;
  bgColor: string;
  borderColor: string;
  message: string;
  description: string;
  showSyncButton?: boolean;
}

const STATUS_CONFIG: Record<CloudSyncStatus, StatusConfig> = {
  connected: {
    emoji: '🟢',
    color: 'text-green-700',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    message: 'Connecté',
    description: 'Tes données sont sauvées dans ton Drive',
    showSyncButton: true
  },
  syncing: {
    emoji: '🟡',
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    message: 'Synchronisation...',
    description: 'On sauvegarde tes dernières modifications',
    showSyncButton: false
  },
  network_issue: {
    emoji: '🟠',
    color: 'text-orange-700',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    message: 'Connexion lente',
    description: 'Tes données restent safe, sync reprendra automatiquement',
    showSyncButton: true
  },
  offline: {
    emoji: '🛫',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    message: 'Mode avion',
    description: 'Tout fonctionne normalement, sync reprendra à la connexion',
    showSyncButton: false
  },
  error: {
    emoji: '⚠️',
    color: 'text-red-700',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    message: 'Petit souci',
    description: 'Tes données sont en sécurité, on va régler ça ensemble',
    showSyncButton: true
  }
};

export const CloudStatusIndicator: React.FC<CloudStatusIndicatorProps> = ({
  status,
  lastSyncTime,
  onSyncNow,
  className = ''
}) => {
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);
  const [timeAgo, setTimeAgo] = useState<string>('');

  const config = STATUS_CONFIG[status];

  // Mettre à jour le "temps écoulé" toutes les minutes
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
      const diffDays = Math.floor(diffHours / 24);

      if (diffMinutes < 1) {
        setTimeAgo('À l\'instant');
      } else if (diffMinutes < 60) {
        setTimeAgo(`il y a ${diffMinutes}min`);
      } else if (diffHours < 24) {
        setTimeAgo(`il y a ${diffHours}h`);
      } else {
        setTimeAgo(`il y a ${diffDays}j`);
      }
    };

    updateTimeAgo();
    const interval = setInterval(updateTimeAgo, 60000); // Mise à jour chaque minute

    return () => clearInterval(interval);
  }, [lastSyncTime]);

  const handleSyncClick = () => {
    if (onSyncNow && config.showSyncButton) {
      onSyncNow();
      
      // Feedback haptique sur mobile
      if ('vibrate' in navigator) {
        navigator.vibrate(50);
      }
    }
  };

  return (
    <div className={`relative inline-block ${className}`}>
      {/* Indicateur principal */}
      <motion.div
        className={`
          flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer
          ${config.bgColor} ${config.borderColor} ${config.color}
          transition-all duration-200 hover:shadow-sm
        `}
        onMouseEnter={() => setIsTooltipVisible(true)}
        onMouseLeave={() => setIsTooltipVisible(false)}
        onClick={handleSyncClick}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Emoji avec animation pour sync */}
        <motion.span 
          className="text-lg"
          animate={status === 'syncing' ? { 
            rotate: [0, 360],
            scale: [1, 1.1, 1] 
          } : {}}
          transition={status === 'syncing' ? { 
            rotate: { duration: 2, repeat: Infinity, ease: "linear" },
            scale: { duration: 1, repeat: Infinity }
          } : {}}
        >
          {config.emoji}
        </motion.span>

        {/* Status et temps */}
        <div className="flex flex-col">
          <span className="text-sm font-medium">
            {config.message}
          </span>
          {lastSyncTime && (
            <span className="text-xs opacity-75">
              Sync: {timeAgo}
            </span>
          )}
        </div>

        {/* Bouton sync rapide */}
        {config.showSyncButton && onSyncNow && (
          <motion.button
            className="ml-2 p-1 rounded opacity-60 hover:opacity-100"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation();
              handleSyncClick();
            }}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
          </motion.button>
        )}
      </motion.div>

      {/* Tooltip explicatif */}
      <AnimatePresence>
        {isTooltipVisible && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 z-50"
          >
            <div className="bg-gray-900 text-white text-sm rounded-lg px-3 py-2 shadow-lg max-w-xs">
              <div className="font-medium mb-1">{config.message}</div>
              <div className="text-gray-300 text-xs">
                {config.description}
              </div>
              
              {/* Flèche du tooltip */}
              <div className="absolute -top-1 left-1/2 transform -translate-x-1/2">
                <div className="w-2 h-2 bg-gray-900 rotate-45"></div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Indicateur de pulse pour sync */}
      {status === 'syncing' && (
        <motion.div
          className="absolute inset-0 rounded-lg border-2 border-amber-300"
          animate={{
            scale: [1, 1.05, 1],
            opacity: [0.5, 0.8, 0.5]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      )}
    </div>
  );
};

// Hook pour gérer le status automatiquement
export const useCloudStatus = () => {
  const [status, setStatus] = useState<CloudSyncStatus>('offline');
  const [lastSyncTime, setLastSyncTime] = useState<Date | undefined>();

  useEffect(() => {
    // Détecter le status de connexion
    const updateOnlineStatus = () => {
      if (navigator.onLine) {
        setStatus('connected');
      } else {
        setStatus('offline');
      }
    };

    updateOnlineStatus();
    
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  const startSync = () => {
    setStatus('syncing');
    // Simuler sync
    setTimeout(() => {
      setStatus('connected');
      setLastSyncTime(new Date());
    }, 2000);
  };

  const setError = () => {
    setStatus('error');
  };

  const setNetworkIssue = () => {
    setStatus('network_issue');
  };

  return {
    status,
    lastSyncTime,
    startSync,
    setError,
    setNetworkIssue,
    setStatus
  };
};