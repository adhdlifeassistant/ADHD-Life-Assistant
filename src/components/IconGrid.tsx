'use client';

import React from 'react';
import { useMood } from '@/modules/mood/MoodContext';
import { useDashboard, NAVIGATION_ITEMS } from '@/modules/dashboard/DashboardContext';
import { isModuleRecommended, getModuleReason } from '@/lib/moodPriorities';

type IconSize = 'small' | 'medium' | 'large';

interface IconGridProps {
  onSettingsClick?: () => void;
}

export default function IconGrid({ onSettingsClick }: IconGridProps) {
  const { currentMood } = useMood();
  const { setView } = useDashboard();
  const [iconSize, setIconSize] = React.useState<IconSize>('medium');

  // Ajouter Paramètres et Réglages à la grille
  const gridItems = [
    ...NAVIGATION_ITEMS,
    {
      id: 'settings',
      label: 'Paramètres',
      icon: '⚙️',
      description: 'Configuration de l\'app',
      color: 'gray'
    },
    {
      id: 'preferences',
      label: 'Réglages',
      icon: '🔧',
      description: 'Personnalisation avancée',
      color: 'slate'
    }
  ];

  const handleItemClick = (itemId: string) => {
    if (itemId === 'settings' || itemId === 'preferences') {
      onSettingsClick?.();
    } else {
      setView(itemId as any);
    }
  };

  const getSizeClasses = () => {
    switch (iconSize) {
      case 'small':
        return 'icon-grid size-small';
      case 'large':
        return 'icon-grid size-large';
      default:
        return 'icon-grid';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 relative">
      {/* Header */}
      <header className="text-center py-8 px-4">
        <h1 className="text-4xl font-bold mb-2" style={{ color: 'var(--mood-text)' }}>
          ADHD Assistant
        </h1>
        <p className="text-lg opacity-80" style={{ color: 'var(--mood-text)' }}>
          Choisissez votre module
        </p>
      </header>

      {/* Grille d'icônes */}
      <div className={getSizeClasses()}>
        {gridItems.map((item) => {
          const isRecommended = isModuleRecommended(currentMood, item.id);
          const reason = getModuleReason(currentMood, item.id);
          
          return (
            <button
              key={item.id}
              onClick={() => handleItemClick(item.id)}
              className={`
                module-icon module-${item.id}
                ${isRecommended ? 'ring-2 ring-yellow-400' : ''}
                focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-offset-2
                relative
              `}
              aria-label={`${item.label}: ${reason || item.description}`}
            >
              {/* Badge recommandation */}
              {isRecommended && (
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-sm">⭐</span>
                </div>
              )}
              
              <div className="module-icon-emoji">
                {item.icon}
              </div>
              <div className="module-icon-title">
                {item.label}
              </div>
              <div className="module-icon-description">
                {reason || item.description}
              </div>
            </button>
          );
        })}
      </div>

      {/* Contrôles de taille d'icônes */}
      <div className="size-controls">
        <button
          onClick={() => setIconSize('small')}
          className={`size-control-btn ${iconSize === 'small' ? 'active' : ''}`}
          aria-label="Petites icônes"
          title="Petites icônes"
        >
          <span className="text-sm">🔸</span>
        </button>
        <button
          onClick={() => setIconSize('medium')}
          className={`size-control-btn ${iconSize === 'medium' ? 'active' : ''}`}
          aria-label="Icônes moyennes"
          title="Icônes moyennes"
        >
          <span className="text-base">🔷</span>
        </button>
        <button
          onClick={() => setIconSize('large')}
          className={`size-control-btn ${iconSize === 'large' ? 'active' : ''}`}
          aria-label="Grosses icônes"
          title="Grosses icônes"
        >
          <span className="text-lg">🔶</span>
        </button>
      </div>
    </div>
  );
}