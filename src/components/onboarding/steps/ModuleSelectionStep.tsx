'use client';

import React, { useState } from 'react';
import { OnboardingStepProps } from '@/types/profile';
import { NAVIGATION_ITEMS } from '@/modules/dashboard/DashboardContext';

export function ModuleSelectionStep({ data, updateData }: OnboardingStepProps) {
  const [selectedModules, setSelectedModules] = useState<string[]>(
    data.favoriteModules || []
  );

  const handleModuleToggle = (moduleId: string) => {
    let newSelection: string[];
    
    if (selectedModules.includes(moduleId)) {
      // Retirer le module
      newSelection = selectedModules.filter(id => id !== moduleId);
    } else {
      // Ajouter le module (max 3)
      if (selectedModules.length >= 3) {
        // Remplacer le plus ancien
        newSelection = [...selectedModules.slice(1), moduleId];
      } else {
        newSelection = [...selectedModules, moduleId];
      }
    }
    
    setSelectedModules(newSelection);
    updateData({ favoriteModules: newSelection });
  };

  const isModuleSelected = (moduleId: string) => {
    return selectedModules.includes(moduleId);
  };

  const canSelectMoreModules = selectedModules.length < 3;

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <div className="text-4xl mb-4">🎯</div>
        <h2 className="text-xl font-bold text-gray-800">
          Quels modules t'intéressent le plus ?
        </h2>
        <p className="text-gray-600">
          Choisis jusqu'à 3 modules qui apparaîtront en premier dans ton menu
        </p>
      </div>

      {/* Indicateur de progression */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-200 shadow-sm">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-3">
            <div className="flex space-x-1">
              {[...Array(3)].map((_, index) => (
                <div
                  key={index}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index < selectedModules.length
                      ? 'bg-blue-500 scale-110 shadow-md'
                      : 'bg-blue-200'
                  }`}
                />
              ))}
            </div>
          </div>
          <p className="font-medium text-blue-700 mb-1">
            {selectedModules.length} / 3 modules sélectionnés
          </p>
          <p className="text-sm text-blue-600">
            Tes modules favoris apparaissent en premier dans le menu
          </p>
          {selectedModules.length >= 3 ? (
            <p className="text-sm text-blue-600 mt-1">
              ✨ Parfait ! Tu peux encore les modifier
            </p>
          ) : (
            <p className="text-sm text-blue-600 mt-1">
              Encore {3 - selectedModules.length} module(s) à choisir
            </p>
          )}
        </div>
      </div>
      
      {/* Grille des modules */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {NAVIGATION_ITEMS.filter(module => module.id !== 'home').map((module) => {
          const isSelected = isModuleSelected(module.id);
          const canSelect = canSelectMoreModules || isSelected;
          const selectionIndex = selectedModules.indexOf(module.id);
          
          return (
            <button
              key={module.id}
              onClick={() => handleModuleToggle(module.id)}
              disabled={!canSelect}
              className={`
                relative p-6 rounded-2xl border-3 transition-all duration-300 transform hover:scale-105
                focus:outline-none focus:ring-4 focus:ring-blue-500/50
                ${isSelected 
                  ? 'module-card-selected' 
                  : canSelect 
                  ? 'module-card-unselected'
                  : 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed opacity-60'
                }
              `}
              aria-pressed={isSelected}
              aria-describedby={`module-${module.id}-desc`}
            >
              {/* Indicateur de sélection avec numéro d'ordre */}
              {isSelected && (
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-lg selection-indicator border-2 border-white">
                  {selectionIndex + 1}
                </div>
              )}
              
              {/* Checkmark pour les modules sélectionnés */}
              {isSelected && (
                <div className="absolute top-3 left-3 w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center selection-checkmark shadow-md">
                  <span className="text-sm font-bold">✓</span>
                </div>
              )}
              
              <div className="flex flex-col items-center space-y-3">
                <span className="text-4xl">{module.icon}</span>
                <div className="text-center">
                  <h3 className={`font-bold text-base ${isSelected ? 'text-blue-700' : 'text-gray-800'}`}>
                    {module.label}
                  </h3>
                  <p 
                    id={`module-${module.id}-desc`}
                    className={`text-sm mt-1 ${isSelected ? 'text-blue-600' : 'text-gray-500'}`}
                  >
                    {module.description}
                  </p>
                </div>
              </div>
              
              {/* Effet de sélection avec glow */}
              {isSelected && (
                <div className="absolute inset-0 border-3 border-blue-500 rounded-2xl bg-blue-500/5 pointer-events-none">
                  <div className="absolute inset-1 border border-blue-400/50 rounded-xl bg-gradient-to-br from-blue-50/80 via-transparent to-blue-50/40"></div>
                  {/* Glow effect */}
                  <div className="absolute -inset-1 bg-blue-500/20 rounded-2xl blur-sm -z-10"></div>
                </div>
              )}
            </button>
          );
        })}
      </div>
      
      {/* Résumé des modules sélectionnés */}
      {selectedModules.length > 0 && (
        <div className="mt-6 p-4 bg-white rounded-lg border border-blue-200">
          <h4 className="font-medium text-blue-800 mb-2">Tes modules préférés:</h4>
          <div className="flex flex-wrap gap-2">
            {selectedModules.map((moduleId) => {
              const module = NAVIGATION_ITEMS.find(m => m.id === moduleId);
              return module ? (
                <div key={moduleId} className="flex items-center gap-2 px-3 py-1 bg-blue-100 rounded-full text-sm text-blue-700">
                  <span>{module.icon}</span>
                  <span>{module.label}</span>
                </div>
              ) : null;
            })}
          </div>
        </div>
      )}

      {selectedModules.length === 0 && (
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <p className="text-gray-600 text-sm">
            💡 Pas d'inquiétude ! Tu peux aussi passer cette étape et choisir tes modules plus tard dans les paramètres
          </p>
        </div>
      )}
    </div>
  );
}