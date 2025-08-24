'use client';

import React, { useState } from 'react';
import { ChecklistTemplate, ActiveChecklist, ChecklistItem, ChecklistStats } from '@/types/checklists';
import { getTemplateById } from '@/lib/checklistTemplates';
import ChecklistSelector from './ChecklistSelector';
import InteractiveChecklist from './InteractiveChecklist';

type ViewState = 'selector' | 'checklist' | 'completed';

export default function ChecklistInterface() {
  const [currentView, setCurrentView] = useState<ViewState>('selector');
  const [activeChecklist, setActiveChecklist] = useState<ActiveChecklist | null>(null);

  const startChecklist = (template: ChecklistTemplate) => {
    const newChecklist: ActiveChecklist = {
      id: Date.now().toString(),
      templateId: template.id,
      name: template.name,
      type: template.type,
      items: template.items.map(item => ({
        ...item,
        isChecked: false
      })),
      createdAt: Date.now(),
      isCompleted: false,
      customItems: []
    };
    
    setActiveChecklist(newChecklist);
    setCurrentView('checklist');
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

  const addCustomItem = (text: string, emoji: string) => {
    if (!activeChecklist) return;
    
    const newItem: ChecklistItem = {
      id: `custom-${Date.now()}`,
      text,
      emoji,
      isChecked: false,
      isRequired: false,
      isCustom: true
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

  const completeChecklist = () => {
    if (!activeChecklist) return;
    
    setActiveChecklist(prev => ({
      ...prev!,
      isCompleted: true,
      completedAt: Date.now()
    }));
    
    setCurrentView('completed');
    
    // Auto-reset après 5 secondes
    setTimeout(() => {
      resetChecklist();
    }, 5000);
  };

  const resetChecklist = () => {
    setActiveChecklist(null);
    setCurrentView('selector');
  };

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

  const renderCurrentView = () => {
    switch (currentView) {
      case 'selector':
        return <ChecklistSelector onTemplateSelect={startChecklist} />;

      case 'checklist':
        return activeChecklist ? (
          <InteractiveChecklist
            checklist={activeChecklist}
            onToggleItem={toggleItem}
            onAddCustomItem={addCustomItem}
            onRemoveCustomItem={removeCustomItem}
            onComplete={completeChecklist}
            onBack={resetChecklist}
            stats={getStats()}
          />
        ) : null;

      case 'completed':
        return activeChecklist ? (
          <div className="text-center py-16 space-y-6">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-3xl font-bold" style={{ color: 'var(--mood-text)' }}>
              Bravo ! Tu es prêt(e) !
            </h2>
            <div className="max-w-md mx-auto space-y-4">
              <p className="text-lg opacity-80" style={{ color: 'var(--mood-text)' }}>
                Checklist "{activeChecklist.name}" terminée avec succès !
              </p>
              
              <div className="bg-green-50 p-6 rounded-xl border border-green-200">
                <div className="text-4xl mb-3">🚀</div>
                <h3 className="font-bold text-green-800 mb-2">
                  C'EST PARTI !
                </h3>
                <p className="text-sm text-green-600">
                  Tu as vérifié tous les essentiels.
                  <br />
                  Passe une excellente journée ! 💪
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-white/70 p-3 rounded-lg">
                  <div className="font-bold text-lg" style={{ color: 'var(--mood-text)' }}>
                    {getStats().checkedItems}
                  </div>
                  <div className="opacity-70" style={{ color: 'var(--mood-text)' }}>
                    Items vérifiés
                  </div>
                </div>
                
                <div className="bg-white/70 p-3 rounded-lg">
                  <div className="font-bold text-lg text-green-600">
                    {getStats().checkedRequiredItems}/{getStats().requiredItems}
                  </div>
                  <div className="text-green-600 opacity-70">
                    Essentiels OK
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={resetChecklist}
              className="px-6 py-3 rounded-xl font-medium transition-colors"
              style={{ backgroundColor: 'var(--mood-primary)', color: 'white' }}
            >
              Nouvelle checklist
            </button>
            
            <p className="text-xs opacity-60" style={{ color: 'var(--mood-text)' }}>
              Retour automatique dans 5 secondes...
            </p>
          </div>
        ) : null;

      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      {renderCurrentView()}
    </div>
  );
}