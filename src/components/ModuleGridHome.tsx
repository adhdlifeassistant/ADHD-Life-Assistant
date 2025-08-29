'use client';

import React, { useState } from 'react';
import { useMood } from '@/modules/mood/MoodContext';
import { useProfile } from '@/hooks/useProfile';
import { useAppSettings } from '@/hooks/useAppSettings';
import { useDashboard } from '@/modules/dashboard/DashboardContext';
import { DashboardView } from '@/types/dashboard';
import { getPersonalizedDashboardGreeting } from '@/lib/personalizedDashboard';

interface ModuleConfig {
  id: DashboardView;
  title: string;
  description: string;
  emoji: string;
  colorClass: string;
}

const MODULES: ModuleConfig[] = [
  {
    id: 'chat',
    title: 'Chat Claude',
    description: 'Assistant IA qui s\'adapte à ton humeur',
    emoji: '💬',
    colorClass: 'module-chat'
  },
  {
    id: 'reminders',
    title: 'Rappels',
    description: 'Ne rate jamais tes médicaments',
    emoji: '⏰',
    colorClass: 'module-reminders'
  },
  {
    id: 'cooking',
    title: 'Cuisine',
    description: 'Recettes selon ton énergie',
    emoji: '🍳',
    colorClass: 'module-cooking'
  },
  {
    id: 'checklists',
    title: 'Checklists',
    description: 'Anti-oublis spécialement ADHD',
    emoji: '📋',
    colorClass: 'module-checklists'
  },
  {
    id: 'finance',
    title: 'Finances',
    description: 'Gestion empathique de l\'argent',
    emoji: '💰',
    colorClass: 'module-finance'
  },
  {
    id: 'cleaning',
    title: 'Ménage',
    description: 'Gamification douce du nettoyage',
    emoji: '🧹',
    colorClass: 'module-cleaning'
  },
  {
    id: 'health',
    title: 'Santé',
    description: 'Suivi médical bienveillant',
    emoji: '🏥',
    colorClass: 'module-health'
  },
  {
    id: 'analytics',
    title: 'Analytics',
    description: 'Découvre tes patterns personnels',
    emoji: '📈',
    colorClass: 'module-analytics'
  },
  {
    id: 'tasks',
    title: 'Tâches',
    description: 'To-do lists intelligentes',
    emoji: '✅',
    colorClass: 'module-tasks'
  },
  {
    id: 'focus',
    title: 'Focus',
    description: 'Sessions Pomodoro adaptatives',
    emoji: '🎯',
    colorClass: 'module-focus'
  }
];

type GridSize = 'small' | 'medium' | 'large';

export default function ModuleGridHome() {
  const { currentMood, getMoodConfig } = useMood();
  const { profile } = useProfile();
  const { settings } = useAppSettings();
  const { setView } = useDashboard();
  const [gridSize, setGridSize] = useState<GridSize>('medium');
  const moodConfig = getMoodConfig();

  const currentTime = new Date();
  const dateFormatted = currentTime.toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const dashboardContext = {
    profile,
    currentMood,
    currentTime
  };

  const handleModuleClick = (moduleId: DashboardView) => {
    setView(moduleId);
  };

  const getSizeClasses = (size: GridSize) => {
    switch (size) {
      case 'small':
        return 'icon-grid size-small';
      case 'large':
        return 'icon-grid size-large';
      default:
        return 'icon-grid';
    }
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--mood-background)' }}>
      {/* Header personnalisé */}
      <div className="text-center py-8 px-4">
        <div className="text-4xl mb-4 animated-emoji">
          {settings.avatar || moodConfig.emoji}
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-4 text-display" style={{ color: 'var(--mood-text)' }}>
          {profile.name 
            ? getPersonalizedDashboardGreeting(dashboardContext)
            : `Bonjour ! Comment te sens-tu ?`
          }
        </h1>
        <p className="text-sm opacity-70 text-caption" style={{ color: 'var(--mood-text)' }}>
          {dateFormatted}
          {profile.name && (
            <> • Salut {profile.name} ! Choisis un module ci-dessous</>
          )}
        </p>
      </div>

      {/* Grille d'icônes */}
      <div className={getSizeClasses(gridSize)}>
        {MODULES.map((module) => (
          <button
            key={module.id}
            onClick={() => handleModuleClick(module.id)}
            className={`module-icon ${module.colorClass} rounded-adhd-lg`}
            aria-label={`${module.title}: ${module.description}`}
          >
            <div className="module-icon-emoji">
              {module.emoji}
            </div>
            <h3 className="module-icon-title">
              {module.title}
            </h3>
            <p className="module-icon-description">
              {module.description}
            </p>
          </button>
        ))}
      </div>

      {/* Contrôles de taille */}
      <div className="size-controls">
        <button
          className={`size-control-btn ${gridSize === 'small' ? 'active' : ''}`}
          onClick={() => setGridSize('small')}
          aria-label="Petite grille"
          title="Petite grille"
        >
          ▫️
        </button>
        <button
          className={`size-control-btn ${gridSize === 'medium' ? 'active' : ''}`}
          onClick={() => setGridSize('medium')}
          aria-label="Grille moyenne"
          title="Grille moyenne"
        >
          ◻️
        </button>
        <button
          className={`size-control-btn ${gridSize === 'large' ? 'active' : ''}`}
          onClick={() => setGridSize('large')}
          aria-label="Grande grille"
          title="Grande grille"
        >
          ⬜
        </button>
      </div>

      {/* Sélecteur d'humeur compact en bas */}
      <div className="fixed bottom-4 left-4 bg-white/80 backdrop-blur-md rounded-adhd p-4 shadow-lg border border-white/20">
        <fieldset>
          <legend className="text-xs font-medium mb-2 text-caption">
            Humeur actuelle
          </legend>
          <div className="flex gap-2">
            <div className={`px-3 py-2 rounded-adhd text-sm font-medium ${moodConfig.bgColor} ${moodConfig.textColor}`}>
              <span className="mr-1">{moodConfig.emoji}</span>
              {moodConfig.label}
            </div>
          </div>
        </fieldset>
      </div>
    </div>
  );
}