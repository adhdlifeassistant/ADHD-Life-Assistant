export type ChecklistType = 'work' | 'shopping' | 'sport' | 'appointment' | 'travel' | 'custom';

export interface ChecklistItem {
  id: string;
  text: string;
  emoji: string;
  isChecked: boolean;
  isRequired: boolean;
  isCustom?: boolean;
  category?: string;
  tips?: string;
}

export interface ChecklistTemplate {
  id: string;
  name: string;
  emoji: string;
  description: string;
  type: ChecklistType;
  items: Omit<ChecklistItem, 'isChecked'>[];
  color: string;
  estimatedTime: number; // en minutes
}

export interface ActiveChecklist {
  id: string;
  templateId: string;
  name: string;
  type: ChecklistType;
  items: ChecklistItem[];
  createdAt: number;
  completedAt?: number;
  isCompleted: boolean;
  customItems?: ChecklistItem[];
}

export interface ChecklistStats {
  totalItems: number;
  checkedItems: number;
  requiredItems: number;
  checkedRequiredItems: number;
  progressPercentage: number;
  isReadyToGo: boolean;
}

export interface ChecklistContextType {
  activeChecklist: ActiveChecklist | null;
  templates: ChecklistTemplate[];
  startChecklist: (templateId: string) => void;
  toggleItem: (itemId: string) => void;
  addCustomItem: (text: string, emoji: string) => void;
  removeCustomItem: (itemId: string) => void;
  completeChecklist: () => void;
  resetChecklist: () => void;
  getStats: () => ChecklistStats;
}