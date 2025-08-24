'use client';

import React, { createContext, useContext, useState } from 'react';
import { DashboardView, DashboardContextType, NavigationItem } from '@/types/dashboard';

export const NAVIGATION_ITEMS: NavigationItem[] = [
  {
    id: 'home',
    label: 'Accueil',
    icon: '🏠',
    description: 'Vue d\'ensemble',
    color: 'blue'
  },
  {
    id: 'chat',
    label: 'Chat Claude',
    icon: '💬',
    description: 'Assistant IA adaptatif',
    color: 'green'
  },
  {
    id: 'reminders',
    label: 'Rappels',
    icon: '💊',
    description: 'Médicaments & santé',
    color: 'purple'
  },
  {
    id: 'cooking',
    label: 'Cuisine',
    icon: '🍳',
    description: 'Recettes adaptées mood',
    color: 'yellow'
  },
  {
    id: 'checklists',
    label: 'Checklists',
    icon: '📋',
    description: 'Anti-oublis départ',
    color: 'teal'
  },
  {
    id: 'tasks',
    label: 'Tâches',
    icon: '✅',
    description: 'To-do lists ADHD',
    color: 'orange'
  },
  {
    id: 'focus',
    label: 'Focus',
    icon: '🎯',
    description: 'Sessions Pomodoro',
    color: 'red'
  },
  {
    id: 'finance',
    label: 'Finances',
    icon: '💰',
    description: 'Budget empathique ADHD',
    color: 'emerald'
  },
  {
    id: 'cleaning',
    label: 'Ménage',
    icon: '🧹',
    description: 'Gamification douce du ménage',
    color: 'pink'
  },
  {
    id: 'health',
    label: 'Santé',
    icon: '🏥',
    description: 'Suivi médical ADHD bienveillant',
    color: 'indigo'
  },
  {
    id: 'analytics',
    label: 'Insights',
    icon: '📊',
    description: 'Vos patterns personnels',
    color: 'violet'
  }
];

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [currentView, setCurrentView] = useState<DashboardView>('home');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const setView = (view: DashboardView) => {
    setCurrentView(view);
    setIsSidebarOpen(false); // Fermer sidebar sur mobile après sélection
  };

  const setSidebarOpen = (open: boolean) => {
    setIsSidebarOpen(open);
  };

  return (
    <DashboardContext.Provider value={{
      currentView,
      setView,
      isSidebarOpen,
      setSidebarOpen
    }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
}