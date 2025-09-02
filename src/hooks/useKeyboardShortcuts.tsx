import { useEffect, useCallback } from 'react';

export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  meta?: boolean; // Cmd sur Mac
  description: string;
  action: () => void;
}

export const useKeyboardShortcuts = (shortcuts: KeyboardShortcut[]) => {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Ignorer si l'utilisateur tape dans un input/textarea
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true') {
      return;
    }

    // Chercher le raccourci correspondant
    const matchingShortcut = shortcuts.find(shortcut => {
      const keyMatch = shortcut.key.toLowerCase() === event.key.toLowerCase();
      const ctrlMatch = !!shortcut.ctrl === event.ctrlKey;
      const altMatch = !!shortcut.alt === event.altKey;
      const shiftMatch = !!shortcut.shift === event.shiftKey;
      const metaMatch = !!shortcut.meta === event.metaKey;

      return keyMatch && ctrlMatch && altMatch && shiftMatch && metaMatch;
    });

    if (matchingShortcut) {
      event.preventDefault();
      matchingShortcut.action();
      
      // Feedback haptique léger
      if ('vibrate' in navigator) {
        navigator.vibrate(20);
      }
    }
  }, [shortcuts]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
};

// Hook spécialisé pour les raccourcis de stockage ADHD
export const useStorageShortcuts = (callbacks: {
  onSyncNow?: () => void;
  onExportData?: () => void;
  onToggleOffline?: () => void;
  onShowStatus?: () => void;
  onQuickSave?: () => void;
}) => {
  const shortcuts: KeyboardShortcut[] = [
    // Ctrl+S - Sync maintenant
    {
      key: 's',
      ctrl: true,
      description: 'Synchroniser maintenant',
      action: () => callbacks.onSyncNow?.()
    },
    
    // Ctrl+E - Export rapide
    {
      key: 'e',
      ctrl: true,
      description: 'Export rapide des données',
      action: () => callbacks.onExportData?.()
    },
    
    // Ctrl+Shift+O - Toggle mode offline
    {
      key: 'o',
      ctrl: true,
      shift: true,
      description: 'Basculer mode hors-ligne',
      action: () => callbacks.onToggleOffline?.()
    },
    
    // Ctrl+I - Afficher infos sync
    {
      key: 'i',
      ctrl: true,
      description: 'Afficher statut synchronisation',
      action: () => callbacks.onShowStatus?.()
    },
    
    // Ctrl+Q - Sauvegarde rapide
    {
      key: 'q',
      ctrl: true,
      description: 'Sauvegarde rapide locale',
      action: () => callbacks.onQuickSave?.()
    }
  ];

  useKeyboardShortcuts(shortcuts);
  
  return shortcuts; // Retourner pour affichage dans l'aide
};

// Hook pour la navigation rapide
export const useNavigationShortcuts = (callbacks: {
  onGoHome?: () => void;
  onGoBack?: () => void;
  onGoToSettings?: () => void;
  onToggleMenu?: () => void;
  onFocusSearch?: () => void;
}) => {
  const shortcuts: KeyboardShortcut[] = [
    // Alt+H - Accueil
    {
      key: 'h',
      alt: true,
      description: 'Aller à l\'accueil',
      action: () => callbacks.onGoHome?.()
    },
    
    // Alt+Backspace ou Échap - Retour
    {
      key: 'Backspace',
      alt: true,
      description: 'Retour page précédente',
      action: () => callbacks.onGoBack?.()
    },
    
    // Alt+S - Paramètres
    {
      key: 's',
      alt: true,
      description: 'Ouvrir les paramètres',
      action: () => callbacks.onGoToSettings?.()
    },
    
    // Alt+M - Toggle menu
    {
      key: 'm',
      alt: true,
      description: 'Ouvrir/fermer le menu',
      action: () => callbacks.onToggleMenu?.()
    },
    
    // Ctrl+K ou Cmd+K - Recherche
    {
      key: 'k',
      ctrl: true,
      description: 'Rechercher (Ctrl+K)',
      action: () => callbacks.onFocusSearch?.()
    },
    {
      key: 'k',
      meta: true,
      description: 'Rechercher (Cmd+K)',
      action: () => callbacks.onFocusSearch?.()
    },
    
    // Échap - Fermer modales/overlays
    {
      key: 'Escape',
      description: 'Fermer modal ou retour',
      action: () => {
        // Fermer toute modal ouverte
        const modals = document.querySelectorAll('[role="dialog"], .modal, .overlay');
        if (modals.length > 0) {
          const lastModal = modals[modals.length - 1] as HTMLElement;
          const closeButton = lastModal.querySelector('[aria-label="Fermer"], .close-button, button[aria-label*="close"]') as HTMLElement;
          closeButton?.click();
        } else {
          callbacks.onGoBack?.();
        }
      }
    }
  ];

  useKeyboardShortcuts(shortcuts);
  
  return shortcuts;
};

// Hook pour les raccourcis de productivité ADHD
export const useADHDProductivityShortcuts = (callbacks: {
  onFocusMode?: () => void;
  onBreakReminder?: () => void;
  onQuickNote?: () => void;
  onTimerStart?: () => void;
  onToggleMusic?: () => void;
}) => {
  const shortcuts: KeyboardShortcut[] = [
    // F - Mode focus
    {
      key: 'f',
      ctrl: true,
      shift: true,
      description: 'Activer mode focus',
      action: () => callbacks.onFocusMode?.()
    },
    
    // B - Pause reminder
    {
      key: 'b',
      ctrl: true,
      shift: true,
      description: 'Rappel pause',
      action: () => callbacks.onBreakReminder?.()
    },
    
    // N - Note rapide
    {
      key: 'n',
      ctrl: true,
      shift: true,
      description: 'Note rapide',
      action: () => callbacks.onQuickNote?.()
    },
    
    // T - Timer/Pomodoro
    {
      key: 't',
      ctrl: true,
      shift: true,
      description: 'Démarrer timer',
      action: () => callbacks.onTimerStart?.()
    },
    
    // M - Toggle musique focus
    {
      key: 'm',
      ctrl: true,
      shift: true,
      description: 'Musique de focus',
      action: () => callbacks.onToggleMusic?.()
    }
  ];

  useKeyboardShortcuts(shortcuts);
  
  return shortcuts;
};

// Component d'aide pour afficher les raccourcis
export const KeyboardShortcutsHelp: React.FC<{ shortcuts: KeyboardShortcut[] }> = ({ shortcuts }) => {
  const formatShortcut = (shortcut: KeyboardShortcut): string => {
    const parts: string[] = [];
    
    if (shortcut.ctrl) parts.push('Ctrl');
    if (shortcut.alt) parts.push('Alt');
    if (shortcut.shift) parts.push('Shift');
    if (shortcut.meta) parts.push('Cmd');
    
    parts.push(shortcut.key.toUpperCase());
    
    return parts.join(' + ');
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
        ⌨️ Raccourcis clavier
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {shortcuts.map((shortcut, index) => (
          <div key={index} className="flex justify-between items-center py-1">
            <span className="text-sm text-gray-600">
              {shortcut.description}
            </span>
            <kbd className="px-2 py-1 text-xs bg-white border border-gray-300 rounded shadow-sm">
              {formatShortcut(shortcut)}
            </kbd>
          </div>
        ))}
      </div>
      
      <div className="mt-3 text-xs text-gray-500">
        💡 Les raccourcis ne fonctionnent pas quand tu tapes dans un champ de texte
      </div>
    </div>
  );
};