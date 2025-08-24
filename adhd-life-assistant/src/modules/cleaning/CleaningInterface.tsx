'use client';

import React, { useState } from 'react';
import { useCleaning } from './CleaningContext';
import { useMood } from '../mood/MoodContext';
import { MoodPlanSelector } from './MoodPlanSelector';
import { TaskList } from './TaskList';
import { TimerDisplay } from './TimerDisplay';
import { StatsOverview } from './StatsOverview';
import { MicroVictories } from './MicroVictories';

type CleaningView = 'plan' | 'tasks' | 'timer' | 'stats';

export function CleaningInterface() {
  const [currentView, setCurrentView] = useState<CleaningView>('plan');
  const { tasks, currentSession, getStats } = useCleaning();
  const { getMoodConfig } = useMood();

  const moodConfig = getMoodConfig();
  const stats = getStats();
  const activeTasks = tasks.filter(t => !t.isCompleted);
  const hasActiveTasks = activeTasks.length > 0;

  const renderView = () => {
    switch (currentView) {
      case 'tasks':
        return <TaskList />;
      case 'timer':
        return <TimerDisplay />;
      case 'stats':
        return <StatsOverview />;
      default:
        return <MoodPlanSelector onPlanSelected={() => setCurrentView('tasks')} />;
    }
  };

  const navItems = [
    { id: 'plan', label: 'Plan', emoji: '📋', disabled: false },
    { id: 'tasks', label: 'Tâches', emoji: '✅', disabled: !hasActiveTasks },
    { id: 'timer', label: 'Timer', emoji: '⏰', disabled: false },
    { id: 'stats', label: 'Stats', emoji: '📊', disabled: false }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header avec encouragement mood */}
      <div className={`p-4 rounded-lg ${moodConfig.bgColor} border-l-4`} 
           style={{ borderLeftColor: moodConfig.color }}>
        <div className="flex items-center gap-3">
          <span className="text-2xl">{moodConfig.emoji}</span>
          <div>
            <h3 className={`font-medium ${moodConfig.textColor}`}>
              Ménage adapté à ton mood
            </h3>
            <p className={`text-sm ${moodConfig.textColor} opacity-80`}>
              {stats.today.tasksCompleted > 0 
                ? `Déjà ${stats.today.tasksCompleted} tâche${stats.today.tasksCompleted > 1 ? 's' : ''} terminée${stats.today.tasksCompleted > 1 ? 's' : ''} aujourd'hui ! 🎉`
                : 'Prêt(e) pour quelques petites victoires ? 💪'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => !item.disabled && setCurrentView(item.id as CleaningView)}
            disabled={item.disabled}
            className={`px-4 py-2 rounded-lg whitespace-nowrap flex items-center gap-2 transition-colors ${
              currentView === item.id
                ? `bg-${moodConfig.color.replace('-500', '-100')} text-${moodConfig.color.replace('-500', '-700')}`
                : item.disabled
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <span>{item.emoji}</span>
            <span className="text-sm font-medium">{item.label}</span>
            {item.id === 'tasks' && hasActiveTasks && (
              <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-1">
                {activeTasks.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Timer actuel en cours (sticky) */}
      {currentSession && currentSession.status === 'running' && currentView !== 'timer' && (
        <div className="sticky top-4 z-10">
          <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white p-3 rounded-lg shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">⏰</span>
                <span className="font-medium">Timer en cours</span>
              </div>
              <button
                onClick={() => setCurrentView('timer')}
                className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded text-sm"
              >
                Voir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Micro-victoires récentes */}
      <MicroVictories />

      {/* Quick stats bar */}
      {currentView === 'plan' && stats.today.tasksCompleted > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white p-3 rounded-lg border text-center">
            <div className="text-lg font-bold text-green-600">{stats.today.tasksCompleted}</div>
            <div className="text-xs text-gray-600">Terminées</div>
          </div>
          <div className="bg-white p-3 rounded-lg border text-center">
            <div className="text-lg font-bold text-blue-600">{stats.today.pointsEarned}</div>
            <div className="text-xs text-gray-600">Points</div>
          </div>
          <div className="bg-white p-3 rounded-lg border text-center">
            <div className="text-lg font-bold text-purple-600">{stats.today.timeSpent}min</div>
            <div className="text-xs text-gray-600">Temps</div>
          </div>
        </div>
      )}

      {/* Contenu principal */}
      <div className="bg-white rounded-lg border min-h-[400px]">
        {renderView()}
      </div>
    </div>
  );
}