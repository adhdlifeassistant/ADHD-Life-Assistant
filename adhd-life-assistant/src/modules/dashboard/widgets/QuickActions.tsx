'use client';

import React from 'react';
import { useMood } from '@/modules/mood/MoodContext';
import { useDashboard } from '../DashboardContext';

interface QuickAction {
  id: string;
  label: string;
  icon: string;
  description: string;
  action: () => void;
  color: string;
}

export default function QuickActions() {
  const { getMoodConfig } = useMood();
  const { setView } = useDashboard();
  const moodConfig = getMoodConfig();

  const quickActions: QuickAction[] = [
    {
      id: 'new-reminder',
      label: 'Nouveau rappel',
      icon: '💊',
      description: 'Médicament',
      action: () => setView('reminders'),
      color: 'purple'
    },
    {
      id: 'start-focus',
      label: 'Session focus',
      icon: '🎯',
      description: 'Pomodoro',
      action: () => setView('focus'),
      color: 'red'
    },
    {
      id: 'add-task',
      label: 'Nouvelle tâche',
      icon: '✅',
      description: 'To-do',
      action: () => setView('tasks'),
      color: 'orange'
    },
    {
      id: 'chat-claude',
      label: 'Parler à Claude',
      icon: '💬',
      description: 'Assistant IA',
      action: () => setView('chat'),
      color: 'green'
    }
  ];

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">⚡</span>
        <h3 className="font-semibold" style={{ color: 'var(--mood-text)' }}>
          Actions rapides
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {quickActions.map(action => (
          <button
            key={action.id}
            onClick={action.action}
            className={`
              p-4 rounded-xl border-2 border-transparent transition-all
              hover:scale-105 active:scale-95 hover-lift
              ${moodConfig.bgColor.replace('-50', '-100')} ${moodConfig.hoverColor}
              hover:border-current
            `}
            style={{ 
              borderColor: 'var(--mood-primary)',
              boxShadow: 'var(--mood-shadow)'
            }}
          >
            <div className="text-center">
              <div className="text-2xl mb-2">{action.icon}</div>
              <p className="font-medium text-sm" style={{ color: 'var(--mood-text)' }}>
                {action.label}
              </p>
              <p className="text-xs opacity-70" style={{ color: 'var(--mood-text)' }}>
                {action.description}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}