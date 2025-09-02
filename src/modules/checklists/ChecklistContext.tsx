'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  ChecklistContextType, 
  UserChecklist, 
  CompletedChecklist, 
  ChecklistUsageStats,
  ActiveChecklist,
  ChecklistItem,
  ChecklistStats,
  ChecklistTemplate,
  ChecklistType
} from '@/types/checklists';
import { CHECKLIST_TEMPLATES } from '@/lib/checklistTemplates';
import { useMood } from '@/modules/mood/MoodContext';

const STORAGE_KEYS = {
  USER_CHECKLISTS: 'adhd-user-checklists',
  COMPLETED_CHECKLISTS: 'adhd-completed-checklists',
  USAGE_STATS: 'adhd-checklist-stats'
};

const DEFAULT_USAGE_STATS: ChecklistUsageStats = {
  totalChecklistsCreated: 0,
  totalChecklistsCompleted: 0,
  totalItemsCompleted: 0,
  averageCompletionTime: 0,
  favoriteType: 'custom',
  completionStreak: 0,
  lastCompletionDate: null,
  mostUsedChecklist: null
};

const ChecklistContext = createContext<ChecklistContextType | undefined>(undefined);

export function ChecklistProvider({ children }: { children: React.ReactNode }) {
  const { currentMood } = useMood();
  const [userChecklists, setUserChecklists] = useState<UserChecklist[]>([]);
  const [completedChecklists, setCompletedChecklists] = useState<CompletedChecklist[]>([]);
  const [usageStats, setUsageStats] = useState<ChecklistUsageStats>(DEFAULT_USAGE_STATS);
  const [activeChecklist, setActiveChecklist] = useState<ActiveChecklist | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);

  // Charger les données au démarrage
  useEffect(() => {
    loadUserData();
  }, []);

  // Sauvegarder automatiquement les changements
  useEffect(() => {
    if (!isLoading) {
      saveToStorage();
    }
  }, [userChecklists, completedChecklists, usageStats, isLoading]);

  const loadUserData = () => {
    try {
      const savedChecklists = localStorage.getItem(STORAGE_KEYS.USER_CHECKLISTS);
      const savedCompleted = localStorage.getItem(STORAGE_KEYS.COMPLETED_CHECKLISTS);
      const savedStats = localStorage.getItem(STORAGE_KEYS.USAGE_STATS);

      if (savedChecklists) {
        setUserChecklists(JSON.parse(savedChecklists));
      }
      
      if (savedCompleted) {
        setCompletedChecklists(JSON.parse(savedCompleted));
      }
      
      if (savedStats) {
        setUsageStats(JSON.parse(savedStats));
      }

      // Créer les templates système en tant que checklists utilisateur si première utilisation
      if (!savedChecklists) {
        createSystemTemplatesAsUser();
      }
    } catch (error) {
      console.error('Erreur chargement données checklists:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveToStorage = () => {
    try {
      localStorage.setItem(STORAGE_KEYS.USER_CHECKLISTS, JSON.stringify(userChecklists));
      localStorage.setItem(STORAGE_KEYS.COMPLETED_CHECKLISTS, JSON.stringify(completedChecklists));
      localStorage.setItem(STORAGE_KEYS.USAGE_STATS, JSON.stringify(usageStats));
    } catch (error) {
      console.error('Erreur sauvegarde données checklists:', error);
    }
  };

  const createSystemTemplatesAsUser = () => {
    const systemChecklists: UserChecklist[] = CHECKLIST_TEMPLATES.map(template => ({
      id: `system-${template.id}`,
      name: template.name,
      emoji: template.emoji,
      description: template.description,
      type: template.type,
      items: template.items.map(item => ({ ...item, isChecked: false })),
      color: template.color,
      estimatedTime: template.estimatedTime,
      isTemplate: true,
      isCustom: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      createdBy: 'system',
      timesUsed: 0
    }));
    
    setUserChecklists(systemChecklists);
  };

  const generateId = () => `checklist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // CRUD Checklists
  const createChecklist = (checklist: Omit<UserChecklist, 'id' | 'createdAt' | 'updatedAt' | 'timesUsed'>) => {
    const newChecklist: UserChecklist = {
      ...checklist,
      id: generateId(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      timesUsed: 0
    };

    setUserChecklists(prev => [...prev, newChecklist]);
    setUsageStats(prev => ({
      ...prev,
      totalChecklistsCreated: prev.totalChecklistsCreated + 1
    }));
  };

  const updateChecklist = (id: string, updates: Partial<UserChecklist>) => {
    setUserChecklists(prev => prev.map(checklist => 
      checklist.id === id 
        ? { ...checklist, ...updates, updatedAt: Date.now() }
        : checklist
    ));
  };

  const deleteChecklist = (id: string) => {
    setUserChecklists(prev => prev.filter(checklist => checklist.id !== id));
    
    // Nettoyer les sessions complétées liées
    setCompletedChecklists(prev => prev.filter(completed => completed.checklistId !== id));
  };

  const duplicateChecklist = (id: string, newName?: string) => {
    const original = userChecklists.find(c => c.id === id);
    if (!original) return;

    const duplicated: UserChecklist = {
      ...original,
      id: generateId(),
      name: newName || `${original.name} (Copie)`,
      isCustom: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      timesUsed: 0,
      createdBy: 'user'
    };

    setUserChecklists(prev => [...prev, duplicated]);
    setUsageStats(prev => ({
      ...prev,
      totalChecklistsCreated: prev.totalChecklistsCreated + 1
    }));
  };

  const getSystemTemplates = (): ChecklistTemplate[] => {
    return CHECKLIST_TEMPLATES;
  };

  const createFromTemplate = (templateId: string, customizations?: Partial<UserChecklist>) => {
    const template = CHECKLIST_TEMPLATES.find(t => t.id === templateId);
    if (!template) return;

    const newChecklist: UserChecklist = {
      id: generateId(),
      name: customizations?.name || `${template.name} (Personnalisé)`,
      emoji: customizations?.emoji || template.emoji,
      description: customizations?.description || template.description,
      type: customizations?.type || template.type,
      items: template.items.map(item => ({ ...item, isChecked: false })),
      color: customizations?.color || template.color,
      estimatedTime: customizations?.estimatedTime || template.estimatedTime,
      isTemplate: false,
      isCustom: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      createdBy: 'user',
      timesUsed: 0,
      ...customizations
    };

    setUserChecklists(prev => [...prev, newChecklist]);
    setUsageStats(prev => ({
      ...prev,
      totalChecklistsCreated: prev.totalChecklistsCreated + 1
    }));
  };

  // Session active
  const startChecklist = (checklistId: string) => {
    const checklist = userChecklists.find(c => c.id === checklistId);
    if (!checklist) return;

    // Incrémenter usage
    updateChecklist(checklistId, { 
      timesUsed: checklist.timesUsed + 1,
      lastUsedAt: Date.now()
    });

    // Créer session active
    const activeSession: ActiveChecklist = {
      id: generateId(),
      templateId: checklist.id,
      name: checklist.name,
      type: checklist.type,
      items: checklist.items.map(item => ({ ...item, isChecked: false })),
      createdAt: Date.now(),
      isCompleted: false,
      customItems: []
    };

    setActiveChecklist(activeSession);
    setSessionStartTime(Date.now());
  };

  const toggleItem = (itemId: string) => {
    if (!activeChecklist) return;

    setActiveChecklist(prev => ({
      ...prev!,
      items: prev!.items.map(item =>
        item.id === itemId ? { ...item, isChecked: !item.isChecked } : item
      )
    }));
  };

  const addCustomItem = (text: string, emoji: string, category?: string) => {
    if (!activeChecklist) return;

    const newItem: ChecklistItem = {
      id: `custom-${Date.now()}`,
      text,
      emoji,
      isChecked: false,
      isRequired: false,
      isCustom: true,
      category
    };

    setActiveChecklist(prev => ({
      ...prev!,
      items: [...prev!.items, newItem]
    }));
  };

  const removeCustomItem = (itemId: string) => {
    if (!activeChecklist) return;

    setActiveChecklist(prev => ({
      ...prev!,
      items: prev!.items.filter(item => item.id !== itemId)
    }));
  };

  const updateItem = (itemId: string, updates: Partial<ChecklistItem>) => {
    if (!activeChecklist) return;

    setActiveChecklist(prev => ({
      ...prev!,
      items: prev!.items.map(item =>
        item.id === itemId ? { ...item, ...updates } : item
      )
    }));
  };

  const completeChecklist = () => {
    if (!activeChecklist || !sessionStartTime) return;

    const endTime = Date.now();
    const duration = Math.round((endTime - sessionStartTime) / 1000);
    const stats = getStats();

    // Enregistrer session complétée
    const completedSession: CompletedChecklist = {
      id: generateId(),
      checklistId: activeChecklist.templateId,
      checklistName: activeChecklist.name,
      completedAt: endTime,
      duration,
      totalItems: stats.totalItems,
      completedItems: stats.checkedItems,
      requiredCompleted: stats.checkedRequiredItems,
      customItemsAdded: activeChecklist.items.filter(item => item.isCustom),
      mood: currentMood
    };

    setCompletedChecklists(prev => [...prev, completedSession]);

    // Mettre à jour statistiques
    updateUsageStats(completedSession);

    // Marquer session comme complétée
    setActiveChecklist(prev => ({
      ...prev!,
      isCompleted: true,
      completedAt: endTime
    }));
  };

  const resetChecklist = () => {
    setActiveChecklist(null);
    setSessionStartTime(null);
  };

  const updateUsageStats = (completedSession: CompletedChecklist) => {
    setUsageStats(prev => {
      const newTotalCompleted = prev.totalChecklistsCompleted + 1;
      const newTotalItems = prev.totalItemsCompleted + completedSession.completedItems;
      const newAvgTime = Math.round(
        ((prev.averageCompletionTime * prev.totalChecklistsCompleted) + completedSession.duration) / newTotalCompleted
      );

      // Calculer streak
      const isConsecutive = prev.lastCompletionDate 
        ? (completedSession.completedAt - prev.lastCompletionDate) < 24 * 60 * 60 * 1000 * 2 // 2 jours
        : true;
      const newStreak = isConsecutive ? prev.completionStreak + 1 : 1;

      // Trouver type favori
      const typeCount = completedChecklists.reduce((acc, comp) => {
        const checklist = userChecklists.find(c => c.id === comp.checklistId);
        if (checklist) {
          acc[checklist.type] = (acc[checklist.type] || 0) + 1;
        }
        return acc;
      }, {} as Record<ChecklistType, number>);
      
      const favoriteType = Object.entries(typeCount).reduce((a, b) => 
        typeCount[a[0] as ChecklistType] > typeCount[b[0] as ChecklistType] ? a : b
      )?.[0] as ChecklistType || 'custom';

      // Checklist la plus utilisée
      const checklistUsage = userChecklists.reduce((acc, checklist) => {
        acc[checklist.id] = {
          id: checklist.id,
          name: checklist.name,
          timesUsed: checklist.timesUsed
        };
        return acc;
      }, {} as Record<string, { id: string; name: string; timesUsed: number }>);

      const mostUsedChecklist = Object.values(checklistUsage).reduce((a, b) => 
        a.timesUsed > b.timesUsed ? a : b
      ) || null;

      return {
        totalChecklistsCreated: prev.totalChecklistsCreated,
        totalChecklistsCompleted: newTotalCompleted,
        totalItemsCompleted: newTotalItems,
        averageCompletionTime: newAvgTime,
        favoriteType,
        completionStreak: newStreak,
        lastCompletionDate: completedSession.completedAt,
        mostUsedChecklist
      };
    });
  };

  // Statistiques et analytics
  const getStats = (): ChecklistStats => {
    if (!activeChecklist) {
      return {
        totalItems: 0,
        checkedItems: 0,
        requiredItems: 0,
        checkedRequiredItems: 0,
        progressPercentage: 0,
        isReadyToGo: false
      };
    }

    const totalItems = activeChecklist.items.length;
    const checkedItems = activeChecklist.items.filter(item => item.isChecked).length;
    const requiredItems = activeChecklist.items.filter(item => item.isRequired).length;
    const checkedRequiredItems = activeChecklist.items.filter(item => item.isRequired && item.isChecked).length;
    const progressPercentage = totalItems > 0 ? (checkedItems / totalItems) * 100 : 0;
    const isReadyToGo = requiredItems === checkedRequiredItems;

    return {
      totalItems,
      checkedItems,
      requiredItems,
      checkedRequiredItems,
      progressPercentage,
      isReadyToGo
    };
  };

  const getUsageStats = (): ChecklistUsageStats => {
    return usageStats;
  };

  const getPersonalizedRecommendations = (): string[] => {
    const recommendations = [];
    
    if (usageStats.totalChecklistsCompleted === 0) {
      recommendations.push("🚀 Commence par une checklist simple pour créer l'habitude !");
    }
    
    if (usageStats.completionStreak >= 7) {
      recommendations.push(`🔥 Incroyable ! ${usageStats.completionStreak} jours de suite !`);
    }
    
    if (usageStats.averageCompletionTime > 300) { // 5 minutes
      recommendations.push("⚡ Essaie des checklists plus courtes pour rester motivé(e)");
    }
    
    if (userChecklists.filter(c => c.isCustom).length === 0) {
      recommendations.push("✨ Crée ta première checklist personnalisée selon tes besoins");
    }
    
    const recentCompletions = completedChecklists.filter(c => 
      Date.now() - c.completedAt < 7 * 24 * 60 * 60 * 1000 // 7 jours
    );
    
    if (recentCompletions.length >= 3) {
      recommendations.push("🎯 Tu es sur une excellente lancée cette semaine !");
    }

    return recommendations.slice(0, 3);
  };

  // Utilitaires
  const exportUserData = (): string => {
    const exportData = {
      userChecklists,
      completedChecklists,
      usageStats,
      exportDate: Date.now(),
      version: '1.0'
    };
    
    return JSON.stringify(exportData, null, 2);
  };

  const importUserData = (data: string): boolean => {
    try {
      const importedData = JSON.parse(data);
      
      if (importedData.userChecklists) {
        setUserChecklists(importedData.userChecklists);
      }
      
      if (importedData.completedChecklists) {
        setCompletedChecklists(importedData.completedChecklists);
      }
      
      if (importedData.usageStats) {
        setUsageStats(importedData.usageStats);
      }
      
      return true;
    } catch (error) {
      console.error('Erreur import données checklists:', error);
      return false;
    }
  };

  return (
    <ChecklistContext.Provider value={{
      // État
      activeChecklist,
      userChecklists,
      completedChecklists,
      usageStats,
      isLoading,
      
      // CRUD Checklists
      createChecklist,
      updateChecklist,
      deleteChecklist,
      duplicateChecklist,
      
      // Gestion templates système
      getSystemTemplates,
      createFromTemplate,
      
      // Session active
      startChecklist,
      toggleItem,
      addCustomItem,
      removeCustomItem,
      updateItem,
      completeChecklist,
      resetChecklist,
      
      // Statistiques et analytics
      getStats,
      getUsageStats,
      getPersonalizedRecommendations,
      
      // Utilitaires
      exportUserData,
      importUserData
    }}>
      {children}
    </ChecklistContext.Provider>
  );
}

export function useChecklists() {
  const context = useContext(ChecklistContext);
  if (context === undefined) {
    throw new Error('useChecklists must be used within a ChecklistProvider');
  }
  return context;
}