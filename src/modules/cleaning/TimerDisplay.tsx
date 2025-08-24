'use client';

import React, { useState, useEffect } from 'react';
import { useCleaning, TIMER_CONFIGS } from './CleaningContext';
import { TimerType, SessionStatus } from '@/types/cleaning';

export function TimerDisplay() {
  const { 
    currentSession, 
    startTimer, 
    pauseTimer, 
    resumeTimer, 
    stopTimer, 
    completeTimer,
    tasks 
  } = useCleaning();
  
  const [timeLeft, setTimeLeft] = useState(0);
  const [selectedTimerType, setSelectedTimerType] = useState<TimerType>('sprint');

  // Mettre à jour le temps restant
  useEffect(() => {
    if (!currentSession || currentSession.status !== 'running') {
      return;
    }

    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = Math.floor((now - (currentSession.startTime || 0)) / 1000);
      const remaining = Math.max(0, currentSession.duration - elapsed);
      
      setTimeLeft(remaining);
      
      if (remaining === 0) {
        completeTimer();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [currentSession, completeTimer]);

  // Initialiser le temps lors du démarrage
  useEffect(() => {
    if (currentSession && currentSession.status === 'running') {
      const now = Date.now();
      const elapsed = Math.floor((now - (currentSession.startTime || 0)) / 1000);
      const remaining = Math.max(0, currentSession.duration - elapsed);
      setTimeLeft(remaining);
    }
  }, [currentSession]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = (): number => {
    if (!currentSession) return 0;
    const elapsed = currentSession.duration - timeLeft;
    return (elapsed / currentSession.duration) * 100;
  };

  const currentTask = currentSession?.taskId 
    ? tasks.find(t => t.id === currentSession.taskId)
    : null;

  const renderTimerControls = () => {
    if (!currentSession) {
      return (
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Choisir un timer
            </h3>
            <p className="text-gray-600">
              Sélectionnez le format qui correspond à votre énergie du moment
            </p>
          </div>

          <div className="grid gap-4">
            {Object.values(TIMER_CONFIGS).map(config => (
              <button
                key={config.type}
                onClick={() => setSelectedTimerType(config.type)}
                className={`p-4 rounded-lg border-2 text-left transition-all ${
                  selectedTimerType === config.type
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{config.emoji}</span>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-800">{config.name}</h4>
                    <p className="text-sm text-gray-600">{config.description}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Travail: {config.workDuration}min • Pause: {config.shortBreak}min
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <button
            onClick={() => startTimer(selectedTimerType)}
            className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
          >
            🚀 Démarrer {TIMER_CONFIGS[selectedTimerType].name}
          </button>
        </div>
      );
    }

    const config = TIMER_CONFIGS[currentSession.type];
    const isRunning = currentSession.status === 'running';
    const isPaused = currentSession.status === 'paused';
    const isCompleted = currentSession.status === 'completed';

    return (
      <div className="space-y-6">
        {/* Header du timer */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-2xl">{config.emoji}</span>
            <h3 className="text-xl font-semibold text-gray-800">
              {config.name}
            </h3>
          </div>
          {currentTask && (
            <p className="text-gray-600">
              {currentTask.emoji} {currentTask.name}
            </p>
          )}
        </div>

        {/* Timer principal */}
        <div className="relative">
          {/* Cercle de progression */}
          <div className="mx-auto w-64 h-64 relative">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="#e5e7eb"
                strokeWidth="8"
                fill="transparent"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke={isCompleted ? "#10b981" : isRunning ? "#3b82f6" : "#f59e0b"}
                strokeWidth="8"
                fill="transparent"
                strokeLinecap="round"
                strokeDasharray="282.743"
                strokeDashoffset={282.743 - (282.743 * getProgressPercentage()) / 100}
                className="transition-all duration-300"
              />
            </svg>
            
            {/* Temps au centre */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className={`text-4xl font-mono font-bold ${
                  isCompleted ? 'text-green-600' :
                  isRunning ? 'text-blue-600' : 
                  'text-yellow-600'
                }`}>
                  {isCompleted ? '00:00' : formatTime(timeLeft)}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  {isCompleted ? 'Terminé !' :
                   isRunning ? 'En cours' :
                   isPaused ? 'En pause' : 'Prêt'
                  }
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contrôles */}
        <div className="flex justify-center gap-4">
          {isRunning ? (
            <button
              onClick={pauseTimer}
              className="px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
            >
              ⏸️ Pause
            </button>
          ) : isPaused ? (
            <button
              onClick={resumeTimer}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              ▶️ Reprendre
            </button>
          ) : isCompleted ? (
            <div className="text-center">
              <div className="text-green-600 text-lg font-medium mb-4">
                🎉 Session terminée ! Bien joué !
              </div>
            </div>
          ) : null}

          <button
            onClick={stopTimer}
            className="px-6 py-3 border border-red-300 text-red-600 rounded-lg hover:bg-red-50"
          >
            ⏹️ Arrêter
          </button>
        </div>

        {/* Infos session */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="grid grid-cols-2 gap-4 text-center text-sm">
            <div>
              <div className="font-medium text-gray-800">Type</div>
              <div className="text-gray-600">{config.name}</div>
            </div>
            <div>
              <div className="font-medium text-gray-800">Durée</div>
              <div className="text-gray-600">{config.workDuration} minutes</div>
            </div>
          </div>
          
          {currentTask && (
            <div className="mt-3 pt-3 border-t">
              <div className="text-sm text-gray-600 text-center">
                Tâche associée: <span className="font-medium">{currentTask.name}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="p-6">
      <div className="max-w-md mx-auto">
        {renderTimerControls()}

        {/* Conseils timer */}
        <div className="mt-8 bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2">💡 Conseils timer</h4>
          <div className="text-sm text-blue-700 space-y-1">
            <p>• Choisissez la durée selon votre énergie du moment</p>
            <p>• Prenez TOUJOURS vos pauses, c'est important</p>
            <p>• Une session = une tâche pour rester focus</p>
            <p>• Pas de culpabilité si vous n'arrivez pas au bout ❤️</p>
          </div>
        </div>
      </div>
    </div>
  );
}