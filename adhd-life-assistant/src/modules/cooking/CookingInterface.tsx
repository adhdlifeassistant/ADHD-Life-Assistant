'use client';

import React, { useState } from 'react';
import { Recipe, Alternative, CookingMood } from '@/types/cooking';
import CookingMoodSelector from './CookingMoodSelector';
import RecipeList from './RecipeList';
import RecipeDetail from './RecipeDetail';

type ViewState = 'mood-selection' | 'recipe-list' | 'recipe-detail' | 'alternative-selected';

export default function CookingInterface() {
  const [currentView, setCurrentView] = useState<ViewState>('mood-selection');
  const [selectedCookingMood, setSelectedCookingMood] = useState<CookingMood | null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [selectedAlternative, setSelectedAlternative] = useState<Alternative | null>(null);

  const handleMoodSelect = (mood: CookingMood) => {
    setSelectedCookingMood(mood);
    setCurrentView('recipe-list');
  };

  const handleRecipeSelect = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setCurrentView('recipe-detail');
  };

  const handleAlternativeSelect = (alternative: Alternative) => {
    setSelectedAlternative(alternative);
    setCurrentView('alternative-selected');
  };

  const handleBack = () => {
    if (currentView === 'recipe-detail') {
      setCurrentView('recipe-list');
      setSelectedRecipe(null);
    } else if (currentView === 'recipe-list' || currentView === 'alternative-selected') {
      setCurrentView('mood-selection');
      setSelectedCookingMood(null);
      setSelectedAlternative(null);
    }
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'mood-selection':
        return (
          <CookingMoodSelector
            selectedMood={selectedCookingMood}
            onMoodSelect={handleMoodSelect}
          />
        );

      case 'recipe-list':
        return selectedCookingMood ? (
          <div>
            <div className="flex items-center gap-4 mb-6">
              <button
                onClick={handleBack}
                className="p-2 rounded-lg hover:bg-white/50 transition-colors"
              >
                ← Retour
              </button>
              <h2 className="text-xl font-bold" style={{ color: 'var(--mood-text)' }}>
                Suggestions cuisine
              </h2>
            </div>
            <RecipeList
              cookingMood={selectedCookingMood}
              onRecipeSelect={handleRecipeSelect}
              onAlternativeSelect={handleAlternativeSelect}
            />
          </div>
        ) : null;

      case 'recipe-detail':
        return selectedRecipe ? (
          <RecipeDetail
            recipe={selectedRecipe}
            onBack={handleBack}
          />
        ) : null;

      case 'alternative-selected':
        return selectedAlternative ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">{selectedAlternative.emoji}</div>
            <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--mood-text)' }}>
              {selectedAlternative.name}
            </h2>
            <p className="text-lg opacity-80 mb-6" style={{ color: 'var(--mood-text)' }}>
              {selectedAlternative.description}
            </p>
            <p className="text-sm opacity-60 mb-8" style={{ color: 'var(--mood-text)' }}>
              Temps estimé : ~{selectedAlternative.estimatedTime} minutes
            </p>
            
            <div className="space-y-4">
              {getAlternativeInstructions(selectedAlternative).map((instruction, index) => (
                <div key={index} className="bg-white/70 rounded-xl p-4 text-left max-w-md mx-auto">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-500 text-white text-sm flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                    <p className="flex-1">{instruction}</p>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={handleBack}
              className="mt-8 px-6 py-3 rounded-xl font-medium transition-colors"
              style={{ backgroundColor: 'var(--mood-primary)', color: 'white' }}
            >
              ← Choisir autre chose
            </button>
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

function getAlternativeInstructions(alternative: Alternative): string[] {
  switch (alternative.type) {
    case 'delivery':
      return [
        `Ouvre ton app de livraison favorite (Uber Eats, Deliveroo...)`,
        `Choisis ton plat réconfort préféré`,
        `Commande et détends-toi en attendant`,
        `Aucune culpabilité ! Parfois on a besoin de ça 💙`
      ];
    
    case 'prepared':
      return [
        `Regarde dans ton frigo/congélateur`,
        `Choisis un plat préparé qui te fait envie`,
        `Réchauffe selon les instructions`,
        `Ajoute éventuellement un fruit ou légume frais`
      ];
    
    case 'snack':
      return [
        `Sors fromage, pain, fruits de ton frigo`,
        `Ajoute olives, tomates cerises, jambon si tu en as`,
        `Dispose joliment sur une assiette`,
        `Un plateau apéro, c'est un vrai repas ! 🧀`
      ];
    
    case 'takeout':
      return [
        `Trouve le commerce le plus proche (boulangerie, traiteur...)`,
        `Va chercher une salade, sandwich ou plat du jour`,
        `Profite de la petite balade à pied`,
        `Parfois sortir fait du bien au moral ! ☀️`
      ];
    
    default:
      return [`Choisis l'option qui te convient le mieux aujourd'hui`];
  }
}