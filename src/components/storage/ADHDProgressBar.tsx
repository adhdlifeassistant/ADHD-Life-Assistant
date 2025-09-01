import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ADHDProgressBarProps {
  progress: number; // 0-100
  operation: string;
  estimatedTimeRemaining?: number; // en secondes
  onCancel?: () => void;
  showEncouragement?: boolean;
  className?: string;
}

const ENCOURAGING_MESSAGES = [
  "Tu y es presque ! 🌟",
  "Encore quelques instants ! ⏳",
  "Ça avance super bien ! 🚀",
  "Presque terminé ! 🎯",
  "Plus que quelques secondes ! ⚡",
  "Tu gères comme un chef ! 👏",
  "C'est parti, ça roule ! 🔥",
  "On y arrive ensemble ! 💪"
];

export const ADHDProgressBar: React.FC<ADHDProgressBarProps> = ({
  progress,
  operation,
  estimatedTimeRemaining,
  onCancel,
  showEncouragement = true,
  className = ''
}) => {
  const [currentMessage, setCurrentMessage] = useState(ENCOURAGING_MESSAGES[0]);
  const [isComplete, setIsComplete] = useState(false);

  // Changer le message d'encouragement régulièrement
  useEffect(() => {
    if (!showEncouragement) return;

    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * ENCOURAGING_MESSAGES.length);
      setCurrentMessage(ENCOURAGING_MESSAGES[randomIndex]);
    }, 3000);

    return () => clearInterval(interval);
  }, [showEncouragement]);

  // Détecter la completion
  useEffect(() => {
    if (progress >= 100 && !isComplete) {
      setIsComplete(true);
      setCurrentMessage("Parfait ! ✨");
      
      // Feedback haptique de succès
      if ('vibrate' in navigator) {
        navigator.vibrate([50, 50, 100]);
      }
    }
  }, [progress, isComplete]);

  const formatTime = (seconds: number): string => {
    if (seconds < 60) {
      return `${Math.ceil(seconds)} seconde${seconds > 1 ? 's' : ''}`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}min ${Math.ceil(remainingSeconds)}s`;
  };

  const getProgressColor = (): string => {
    if (progress >= 100) return 'bg-green-500';
    if (progress >= 75) return 'bg-blue-500';
    if (progress >= 50) return 'bg-indigo-500';
    if (progress >= 25) return 'bg-purple-500';
    return 'bg-amber-500';
  };

  const getGradientFromProgress = (): string => {
    if (progress >= 100) return 'from-green-400 to-green-600';
    if (progress >= 75) return 'from-blue-400 to-blue-600';
    if (progress >= 50) return 'from-indigo-400 to-indigo-600';
    if (progress >= 25) return 'from-purple-400 to-purple-600';
    return 'from-amber-400 to-amber-600';
  };

  return (
    <div className={`bg-white rounded-xl shadow-lg p-6 border border-gray-100 ${className}`}>
      {/* En-tête avec operation et temps */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <motion.div
            animate={progress < 100 ? { 
              rotate: [0, 360],
              scale: [1, 1.1, 1] 
            } : {}}
            transition={progress < 100 ? { 
              rotate: { duration: 2, repeat: Infinity, ease: "linear" },
              scale: { duration: 1, repeat: Infinity }
            } : {}}
            className="text-2xl"
          >
            {progress >= 100 ? '✅' : '⚡'}
          </motion.div>
          
          <div>
            <h3 className="font-semibold text-gray-800 capitalize">
              {operation} en cours...
            </h3>
            {estimatedTimeRemaining && progress < 100 && (
              <p className="text-sm text-gray-600">
                Plus que {formatTime(estimatedTimeRemaining)}
              </p>
            )}
          </div>
        </div>

        {/* Bouton d'annulation */}
        {onCancel && progress < 100 && (
          <button
            onClick={onCancel}
            className="px-3 py-1.5 text-sm text-gray-600 hover:text-red-600 border border-gray-300 hover:border-red-300 rounded-lg transition-colors"
          >
            Annuler
          </button>
        )}
      </div>

      {/* Barre de progression principale */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-600">Progression</span>
          <span className="font-semibold text-gray-800">{Math.round(progress)}%</span>
        </div>
        
        <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
          {/* Barre de progression animée */}
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(progress, 100)}%` }}
            transition={{ 
              duration: 0.5,
              ease: "easeInOut"
            }}
            className={`h-full bg-gradient-to-r ${getGradientFromProgress()} relative`}
          >
            {/* Effet de brillance qui se déplace */}
            <motion.div
              animate={progress < 100 && progress > 0 ? {
                x: ['-100%', '100%']
              } : {}}
              transition={progress < 100 && progress > 0 ? {
                duration: 2,
                repeat: Infinity,
                ease: "linear"
              } : {}}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30"
              style={{ width: '50%' }}
            />
          </motion.div>
        </div>
      </div>

      {/* Message d'encouragement */}
      {showEncouragement && (
        <AnimatePresence mode="wait">
          <motion.div
            key={currentMessage}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="text-center"
          >
            <p className="text-sm font-medium text-gray-700">
              {currentMessage}
            </p>
            
            {progress >= 100 && (
              <motion.p
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="text-xs text-green-600 mt-1"
              >
                {operation.charAt(0).toUpperCase() + operation.slice(1)} terminé avec succès !
              </motion.p>
            )}
          </motion.div>
        </AnimatePresence>
      )}

      {/* Barre de détail pour le temps restant */}
      {progress < 100 && estimatedTimeRemaining && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex justify-between items-center text-xs text-gray-500">
            <span>Temps estimé</span>
            <span>{formatTime(estimatedTimeRemaining)}</span>
          </div>
          
          {/* Mini barre de temps */}
          <div className="mt-1 h-1 bg-gray-100 rounded-full">
            <motion.div
              animate={{ width: `${progress}%` }}
              className="h-full bg-gray-400 rounded-full"
            />
          </div>
        </div>
      )}
    </div>
  );
};

// Version compacte pour les notifications
export const ADHDProgressBarMini: React.FC<{
  progress: number;
  operation: string;
  className?: string;
}> = ({ progress, operation, className = '' }) => {
  return (
    <div className={`flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm border ${className}`}>
      <motion.div
        animate={progress < 100 ? { rotate: [0, 360] } : {}}
        transition={progress < 100 ? { duration: 2, repeat: Infinity, ease: "linear" } : {}}
        className="text-lg"
      >
        {progress >= 100 ? '✅' : '⚡'}
      </motion.div>
      
      <div className="flex-1">
        <div className="flex justify-between text-sm mb-1">
          <span className="font-medium text-gray-700">{operation}</span>
          <span className="text-gray-500">{Math.round(progress)}%</span>
        </div>
        
        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(progress, 100)}%` }}
            className="h-full bg-gradient-to-r from-blue-400 to-blue-600"
          />
        </div>
      </div>
    </div>
  );
};

// Hook pour simuler une progression réaliste
export const useRealisticProgress = (
  duration: number, // en millisecondes
  onComplete?: () => void
) => {
  const [progress, setProgress] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(duration / 1000);
  const [isRunning, setIsRunning] = useState(false);

  const start = () => {
    setIsRunning(true);
    setProgress(0);
    
    const startTime = Date.now();
    
    const updateProgress = () => {
      const elapsed = Date.now() - startTime;
      const rawProgress = (elapsed / duration) * 100;
      
      // Progression réaliste avec ralentissements
      let adjustedProgress;
      if (rawProgress < 10) {
        // Démarrage rapide
        adjustedProgress = rawProgress * 2;
      } else if (rawProgress < 80) {
        // Phase normale
        adjustedProgress = 20 + (rawProgress - 10) * 0.8;
      } else {
        // Ralentissement final réaliste
        adjustedProgress = 76 + (rawProgress - 80) * 1.2;
      }
      
      const finalProgress = Math.min(adjustedProgress, 100);
      setProgress(finalProgress);
      setTimeRemaining(Math.max(0, (duration - elapsed) / 1000));
      
      if (finalProgress >= 100) {
        setIsRunning(false);
        onComplete?.();
      } else if (isRunning) {
        requestAnimationFrame(updateProgress);
      }
    };
    
    requestAnimationFrame(updateProgress);
  };

  const stop = () => {
    setIsRunning(false);
  };

  const reset = () => {
    setProgress(0);
    setTimeRemaining(duration / 1000);
    setIsRunning(false);
  };

  return {
    progress,
    timeRemaining,
    isRunning,
    start,
    stop,
    reset
  };
};