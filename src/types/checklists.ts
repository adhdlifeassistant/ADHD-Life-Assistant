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

// Nouvelles interfaces pour gestion utilisateur
export interface UserChecklist {
  id: string;
  name: string;
  emoji: string;
  description: string;
  type: ChecklistType;
  items: ChecklistItem[];
  color: string;
  estimatedTime: number;
  isTemplate: boolean;
  isCustom: boolean;
  createdAt: number;
  updatedAt: number;
  createdBy: 'user' | 'system';
  timesUsed: number;
  lastUsedAt?: number;
}

export interface CompletedChecklist {
  id: string;
  checklistId: string;
  checklistName: string;
  completedAt: number;
  duration: number; // en secondes
  totalItems: number;
  completedItems: number;
  requiredCompleted: number;
  customItemsAdded: ChecklistItem[];
  mood?: string;
}

export interface ChecklistUsageStats {
  totalChecklistsCreated: number;
  totalChecklistsCompleted: number;
  totalItemsCompleted: number;
  averageCompletionTime: number;
  favoriteType: ChecklistType;
  completionStreak: number;
  lastCompletionDate: number | null;
  mostUsedChecklist: {
    id: string;
    name: string;
    timesUsed: number;
  } | null;
}

export interface ChecklistContextType {
  // État
  activeChecklist: ActiveChecklist | null;
  userChecklists: UserChecklist[];
  completedChecklists: CompletedChecklist[];
  usageStats: ChecklistUsageStats;
  isLoading: boolean;
  
  // CRUD Checklists
  createChecklist: (checklist: Omit<UserChecklist, 'id' | 'createdAt' | 'updatedAt' | 'timesUsed'>) => void;
  updateChecklist: (id: string, updates: Partial<UserChecklist>) => void;
  deleteChecklist: (id: string) => void;
  duplicateChecklist: (id: string, newName?: string) => void;
  
  // Gestion templates système
  getSystemTemplates: () => ChecklistTemplate[];
  createFromTemplate: (templateId: string, customizations?: Partial<UserChecklist>) => void;
  
  // Session active
  startChecklist: (checklistId: string) => void;
  toggleItem: (itemId: string) => void;
  addCustomItem: (text: string, emoji: string, category?: string) => void;
  removeCustomItem: (itemId: string) => void;
  updateItem: (itemId: string, updates: Partial<ChecklistItem>) => void;
  completeChecklist: () => void;
  resetChecklist: () => void;
  
  // Statistiques et analytics
  getStats: () => ChecklistStats;
  getUsageStats: () => ChecklistUsageStats;
  getPersonalizedRecommendations: () => string[];
  
  // Utilitaires
  exportUserData: () => string;
  importUserData: (data: string) => boolean;
}