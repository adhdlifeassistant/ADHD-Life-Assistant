'use client';

import { useState, useEffect } from 'react';
import { useSyncStatus } from '@/hooks/useSyncStatus';

interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  timestamp: number;
  autoClose?: boolean;
  duration?: number;
}

export function SyncToast() {
  const { status } = useSyncStatus();
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [lastStatus, setLastStatus] = useState(status.status);

  useEffect(() => {
    // Détecter les changements de statut pour afficher des notifications
    if (lastStatus !== status.status) {
      const now = Date.now();
      let newToast: ToastMessage | null = null;

      switch (status.status) {
        case 'synced':
          if (lastStatus === 'syncing') {
            newToast = {
              id: `sync-${now}`,
              type: 'success',
              title: '✅ Super !',
              message: 'Toutes tes données sont synchronisées et safe dans le cloud !',
              timestamp: now,
              autoClose: true,
              duration: 4000
            };
          }
          break;

        case 'error':
          if (lastStatus !== 'error') {
            newToast = {
              id: `error-${now}`,
              type: 'error',
              title: '🔄 Petit souci technique',
              message: 'Pas de panique ! On va réessayer automatiquement. Tes données sont safe localement.',
              timestamp: now,
              autoClose: true,
              duration: 6000
            };
          }
          break;

        case 'offline':
          if (lastStatus !== 'offline') {
            newToast = {
              id: `offline-${now}`,
              type: 'info',
              title: '📱 Mode hors-ligne',
              message: 'Pas de stress ! Tu peux continuer à utiliser l\'app, tout sera sync plus tard.',
              timestamp: now,
              autoClose: true,
              duration: 5000
            };
          }
          break;

        case 'syncing':
          // Pas de toast pour syncing, c'est géré par l'indicateur
          break;
      }

      if (newToast) {
        setToasts(prev => [...prev, newToast!]);
      }

      setLastStatus(status.status);
    }
  }, [status.status, lastStatus]);

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  useEffect(() => {
    // Auto-close des toasts
    toasts.forEach(toast => {
      if (toast.autoClose && toast.duration) {
        const timer = setTimeout(() => {
          removeToast(toast.id);
        }, toast.duration);

        return () => clearTimeout(timer);
      }
    });
  }, [toasts]);

  const getToastStyles = (type: ToastMessage['type']) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'info':
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  const getProgressColor = (type: ToastMessage['type']) => {
    switch (type) {
      case 'success':
        return 'bg-green-400';
      case 'error':
        return 'bg-red-400';
      case 'warning':
        return 'bg-yellow-400';
      case 'info':
      default:
        return 'bg-blue-400';
    }
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`max-w-sm w-full p-4 rounded-xl border shadow-lg transform transition-all duration-300 ease-out animate-in slide-in-from-right ${getToastStyles(toast.type)}`}
        >
          <div className="flex items-start">
            <div className="flex-1">
              <h4 className="font-medium text-sm mb-1">{toast.title}</h4>
              <p className="text-sm opacity-90">{toast.message}</p>
            </div>
            
            <button
              onClick={() => removeToast(toast.id)}
              className="ml-2 text-current opacity-60 hover:opacity-100 transition-opacity"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Progress bar pour auto-close */}
          {toast.autoClose && toast.duration && (
            <div className="mt-3 w-full h-1 bg-black bg-opacity-10 rounded-full overflow-hidden">
              <div
                className={`h-full ${getProgressColor(toast.type)} transition-all ease-linear`}
                style={{
                  width: '100%',
                  animation: `shrink ${toast.duration}ms linear forwards`
                }}
              />
            </div>
          )}
        </div>
      ))}
      
      <style jsx>{`
        @keyframes shrink {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
        
        @keyframes slide-in-from-right {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        .animate-in {
          animation-fill-mode: both;
        }
        
        .slide-in-from-right {
          animation: slide-in-from-right 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}