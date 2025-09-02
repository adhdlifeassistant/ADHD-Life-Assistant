'use client';

import React, { useState } from 'react';
import { ChecklistProvider, useChecklists } from './ChecklistContext';
import { UserChecklistSelector } from './UserChecklistSelector';
import InteractiveChecklist from './InteractiveChecklist';

type ViewState = 'selector' | 'checklist' | 'completed';

function ChecklistInterfaceContent() {
  const {
    activeChecklist,
    startChecklist,
    toggleItem,
    addCustomItem,
    removeCustomItem,
    completeChecklist,
    resetChecklist,
    getStats
  } = useChecklists();
  
  const [currentView, setCurrentView] = useState<ViewState>('selector');

  const handleStartChecklist = (checklistId: string) => {
    startChecklist(checklistId);
    setCurrentView('checklist');
  };

  const handleCompleteChecklist = () => {
    completeChecklist();
    setCurrentView('completed');
    
    // Auto-reset après 5 secondes
    setTimeout(() => {
      handleResetChecklist();
    }, 5000);
  };

  const handleResetChecklist = () => {
    resetChecklist();
    setCurrentView('selector');
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'selector':
        return <UserChecklistSelector onChecklistSelect={handleStartChecklist} />;

      case 'checklist':
        return activeChecklist ? (
          <InteractiveChecklist
            checklist={activeChecklist}
            onToggleItem={toggleItem}
            onAddCustomItem={addCustomItem}
            onRemoveCustomItem={removeCustomItem}
            onComplete={handleCompleteChecklist}
            onBack={handleResetChecklist}
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
              onClick={handleResetChecklist}
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

export default function ChecklistInterface() {
  return (
    <ChecklistProvider>
      <ChecklistInterfaceContent />
    </ChecklistProvider>
  );
}