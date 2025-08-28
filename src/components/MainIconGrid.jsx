'use client';

import React from 'react';
import { useDashboard } from '@/modules/dashboard/DashboardContext';

const MAIN_ICONS = [
  {
    id: 'home',
    label: 'Home',
    icon: '🏠',
    color: 'bg-gradient-to-br from-blue-100 to-blue-200',
    hoverColor: 'hover:from-blue-200 hover:to-blue-300'
  },
  {
    id: 'cooking',
    label: 'Cuisine',
    icon: '🍳',
    color: 'bg-gradient-to-br from-orange-100 to-orange-200',
    hoverColor: 'hover:from-orange-200 hover:to-orange-300'
  },
  {
    id: 'checklists',
    label: 'Checklists',
    icon: '📋',
    color: 'bg-gradient-to-br from-teal-100 to-teal-200',
    hoverColor: 'hover:from-teal-200 hover:to-teal-300'
  },
  {
    id: 'chat',
    label: 'Chat Claude',
    icon: '💬',
    color: 'bg-gradient-to-br from-green-100 to-green-200',
    hoverColor: 'hover:from-green-200 hover:to-green-300'
  },
  {
    id: 'reminders',
    label: 'Rappels',
    icon: '💊',
    color: 'bg-gradient-to-br from-purple-100 to-purple-200',
    hoverColor: 'hover:from-purple-200 hover:to-purple-300'
  },
  {
    id: 'tasks',
    label: 'Tâches',
    icon: '✅',
    color: 'bg-gradient-to-br from-yellow-100 to-yellow-200',
    hoverColor: 'hover:from-yellow-200 hover:to-yellow-300'
  },
  {
    id: 'focus',
    label: 'Focus',
    icon: '🎯',
    color: 'bg-gradient-to-br from-red-100 to-red-200',
    hoverColor: 'hover:from-red-200 hover:to-red-300'
  },
  {
    id: 'finance',
    label: 'Finances',
    icon: '💰',
    color: 'bg-gradient-to-br from-emerald-100 to-emerald-200',
    hoverColor: 'hover:from-emerald-200 hover:to-emerald-300'
  },
  {
    id: 'cleaning',
    label: 'Ménage',
    icon: '🧹',
    color: 'bg-gradient-to-br from-pink-100 to-pink-200',
    hoverColor: 'hover:from-pink-200 hover:to-pink-300'
  },
  {
    id: 'health',
    label: 'Santé',
    icon: '🏥',
    color: 'bg-gradient-to-br from-indigo-100 to-indigo-200',
    hoverColor: 'hover:from-indigo-200 hover:to-indigo-300'
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: '📊',
    color: 'bg-gradient-to-br from-violet-100 to-violet-200',
    hoverColor: 'hover:from-violet-200 hover:to-violet-300'
  },
  {
    id: 'settings',
    label: 'Paramètres',
    icon: '⚙️',
    color: 'bg-gradient-to-br from-gray-100 to-gray-200',
    hoverColor: 'hover:from-gray-200 hover:to-gray-300'
  }
];

export default function MainIconGrid({ onSettingsClick }) {
  const { setView } = useDashboard();

  const handleIconClick = (iconId) => {
    if (iconId === 'settings') {
      onSettingsClick?.();
    } else {
      setView(iconId);
    }
  };

  return (
    <div className="main-icon-grid-container">
      <div className="main-icon-grid">
        {MAIN_ICONS.map((iconItem) => (
          <button
            key={iconItem.id}
            onClick={() => handleIconClick(iconItem.id)}
            className={`
              main-icon-item
              ${iconItem.color}
              ${iconItem.hoverColor}
              transition-all duration-300 ease-in-out
              transform hover:scale-105 hover:-translate-y-1
              focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50
              active:scale-95
            `}
            aria-label={iconItem.label}
          >
            <div className="icon-emoji">
              {iconItem.icon}
            </div>
            <span className="icon-label">
              {iconItem.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}