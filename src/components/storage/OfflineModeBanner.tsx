import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface OfflineModeBannerProps {
  isOffline: boolean;
  onRetry?: () => void;
  onDismiss?: () => void;
  unsavedChangesCount?: number;
  className?: string;
}

export const OfflineModeBanner: React.FC<OfflineModeBannerProps> = ({
  isOffline,
  onRetry,
  onDismiss,
  unsavedChangesCount = 0,
  className = ''
}) => {
  const [isDismissed, setIsDismissed] = useState(false);

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
  };

  const handleRetry = () => {
    onRetry?.();
    
    // Feedback haptique
    if ('vibrate' in navigator) {
      navigator.vibrate(30);
    }
  };

  return (
    <AnimatePresence>
      {isOffline && !isDismissed && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{ 
            type: "spring", 
            stiffness: 300, 
            damping: 30 
          }}
          className={`w-full ${className}`}
        >
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg shadow-sm">
            <div className="px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* Icône animée */}
                  <motion.div
                    animate={{ 
                      rotate: [0, 10, -10, 0],
                      scale: [1, 1.1, 1] 
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="text-2xl"
                  >
                    🛫
                  </motion.div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-blue-800 text-sm">
                        Mode avion activé !
                      </h3>
                      
                      {/* Badge changements non sauvés */}
                      {unsavedChangesCount > 0 && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="bg-orange-100 text-orange-700 text-xs px-2 py-0.5 rounded-full font-medium"
                        >
                          {unsavedChangesCount} modification{unsavedChangesCount > 1 ? 's' : ''}
                        </motion.span>
                      )}
                    </div>
                    
                    <p className="text-blue-700 text-sm mt-0.5">
                      Tout fonctionne normalement ! La synchronisation reprendra automatiquement dès que tu auras du réseau.
                    </p>

                    {/* Informations rassurantes */}
                    <div className="flex items-center gap-4 mt-2 text-xs text-blue-600">
                      <span className="flex items-center gap-1">
                        💾 <span>Données sauvées localement</span>
                      </span>
                      <span className="flex items-center gap-1">
                        🔄 <span>Sync auto à la reconnexion</span>
                      </span>
                      {unsavedChangesCount > 0 && (
                        <span className="flex items-center gap-1">
                          📝 <span>Modifications protégées</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 ml-4">
                  {/* Bouton retry */}
                  {onRetry && (
                    <motion.button
                      onClick={handleRetry}
                      className="px-3 py-1.5 text-sm font-medium text-blue-700 bg-white border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span className="flex items-center gap-1">
                        🔄 <span>Réessayer</span>
                      </span>
                    </motion.button>
                  )}

                  {/* Bouton fermer */}
                  <button
                    onClick={handleDismiss}
                    className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-lg transition-colors"
                    aria-label="Fermer la notification"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Barre de progression pour la reconnexion (optionnel) */}
            <div className="h-1 bg-blue-200">
              <motion.div
                className="h-full bg-blue-500"
                animate={{
                  width: ["0%", "100%"],
                  opacity: [0.7, 1, 0.7]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Version compacte pour la barre de status
export const OfflineModeBadge: React.FC<{
  isOffline: boolean;
  unsavedChangesCount?: number;
  onClick?: () => void;
}> = ({ isOffline, unsavedChangesCount = 0, onClick }) => {
  return (
    <AnimatePresence>
      {isOffline && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: "spring", stiffness: 400 }}
          onClick={onClick}
          className={`
            inline-flex items-center gap-2 px-3 py-1.5 
            bg-blue-100 text-blue-700 rounded-full text-sm font-medium
            ${onClick ? 'cursor-pointer hover:bg-blue-200' : ''}
            transition-colors
          `}
        >
          <motion.span
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            🛫
          </motion.span>
          
          <span>Hors ligne</span>
          
          {unsavedChangesCount > 0 && (
            <span className="bg-orange-500 text-white text-xs px-1.5 py-0.5 rounded-full">
              {unsavedChangesCount}
            </span>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Banner d'information sur les capacités offline
export const OfflineCapabilitiesBanner: React.FC<{
  show: boolean;
  onDismiss: () => void;
}> = ({ show, onDismiss }) => {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="overflow-hidden"
        >
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <div className="flex items-start justify-between">
              <div className="flex gap-3">
                <div className="text-2xl">💪</div>
                <div>
                  <h3 className="font-semibold text-green-800 mb-2">
                    Tu peux tout faire, même hors ligne !
                  </h3>
                  
                  <ul className="text-sm text-green-700 space-y-1">
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                      Ajouter et modifier tes données
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                      Consulter ton historique
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                      Utiliser tous les outils
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                      Exporter tes données
                    </li>
                  </ul>

                  <p className="text-sm text-green-600 mt-2 italic">
                    🔄 Tout sera synchronisé automatiquement dès que tu retrouves une connexion
                  </p>
                </div>
              </div>

              <button
                onClick={onDismiss}
                className="text-green-600 hover:text-green-800 p-1 hover:bg-green-100 rounded"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};