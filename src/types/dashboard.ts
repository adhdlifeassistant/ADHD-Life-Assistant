export type DashboardView = 'home' | 'chat' | 'reminders' | 'tasks' | 'focus' | 'cooking' | 'checklists' | 'finance' | 'cleaning' | 'health' | 'analytics';

export interface NavigationItem {
  id: DashboardView;
  label: string;
  icon: string;
  description: string;
  color: string;
}

export interface DashboardContextType {
  currentView: DashboardView;
  setView: (view: DashboardView) => void;
  isSidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export interface WidgetProps {
  isCompact?: boolean;
}