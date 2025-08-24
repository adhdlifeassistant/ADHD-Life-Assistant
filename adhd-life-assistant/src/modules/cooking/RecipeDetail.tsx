'use client';

import React, { useState, useEffect } from 'react';
import { Recipe, CookingTimer } from '@/types/cooking';
import { useMood } from '@/modules/mood/MoodContext';

interface RecipeDetailProps {
  recipe: Recipe;
  onBack: () => void;
}

export default function RecipeDetail({ recipe, onBack }: RecipeDetailProps) {
  const { getMoodConfig } = useMood();
  const moodConfig = getMoodConfig();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [timers, setTimers] = useState<CookingTimer[]>([]);
  const [isStarted, setIsStarted] = useState(false);

  useEffect(() => {
    // Cleanup timers on unmount
    return () => {
      timers.forEach(timer => {
        if (timer.isActive) {
          // In a real app, you'd clear actual intervals here
        }
      });
    };
  }, [timers]);

  const startTimer = (stepId: string, duration: number) => {
    const timer: CookingTimer = {
      id: Date.now().toString(),
      name: `Étape ${currentStep + 1}`,
      duration: duration * 60, // Convert to seconds
      startTime: Date.now(),
      isActive: true,
      isCompleted: false
    };
    
    setTimers(prev => [...prev, timer]);
    
    // Start actual timer
    setTimeout(() => {
      setTimers(prev => 
        prev.map(t => 
          t.id === timer.id ? { ...t, isActive: false, isCompleted: true } : t
        )
      );
      // Could add notification here
    }, duration * 60 * 1000);
  };

  const nextStep = () => {
    if (currentStep < recipe.steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const formatTime = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h${mins > 0 ? mins.toString().padStart(2, '0') : ''}`;
  };

  const currentStepData = recipe.steps[currentStep];
  const activeTimers = timers.filter(t => t.isActive);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={onBack}
          className="p-2 rounded-lg hover:bg-white/50 transition-colors"
        >
          ← Retour
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{recipe.emoji}</span>
            <div>
              <h1 className="text-2xl font-bold" style={{ color: 'var(--mood-text)' }}>
                {recipe.name}
              </h1>
              <p className="opacity-80" style={{ color: 'var(--mood-text)' }}>
                {recipe.description}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recipe info */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white/70 p-4 rounded-xl text-center">
          <div className="text-2xl mb-1">⏱️</div>
          <div className="font-semibold" style={{ color: 'var(--mood-text)' }}>
            {formatTime(recipe.prepTime + recipe.cookingTime)}
          </div>
          <div className="text-xs opacity-70" style={{ color: 'var(--mood-text)' }}>
            Total
          </div>
        </div>
        <div className="bg-white/70 p-4 rounded-xl text-center">
          <div className="text-2xl mb-1">👥</div>
          <div className="font-semibold" style={{ color: 'var(--mood-text)' }}>
            {recipe.servings} pers.
          </div>
          <div className="text-xs opacity-70" style={{ color: 'var(--mood-text)' }}>
            Portions
          </div>
        </div>
        <div className="bg-white/70 p-4 rounded-xl text-center">
          <div className="text-2xl mb-1">📊</div>
          <div className="font-semibold" style={{ color: 'var(--mood-text)' }}>
            {recipe.difficulty === 'easy' ? 'Facile' : 
             recipe.difficulty === 'medium' ? 'Moyen' : 'Difficile'}
          </div>
          <div className="text-xs opacity-70" style={{ color: 'var(--mood-text)' }}>
            Difficulté
          </div>
        </div>
        <div className="bg-white/70 p-4 rounded-xl text-center">
          <div className="text-2xl mb-1">🔋</div>
          <div className="font-semibold" style={{ color: 'var(--mood-text)' }}>
            {recipe.energy === 'low' ? 'Peu' : 
             recipe.energy === 'medium' ? 'Modérée' : 'Haute'}
          </div>
          <div className="text-xs opacity-70" style={{ color: 'var(--mood-text)' }}>
            Énergie
          </div>
        </div>
      </div>

      {/* Active timers */}
      {activeTimers.length > 0 && (
        <div className={`p-4 rounded-xl ${moodConfig.bgColor} ${moodConfig.textColor}`}>
          <h3 className="font-semibold mb-2">⏰ Timers actifs</h3>
          {activeTimers.map(timer => (
            <div key={timer.id} className="flex items-center gap-2">
              <span className="font-medium">{timer.name}</span>
              <span className="opacity-80">
                - {Math.ceil((timer.duration - (Date.now() - timer.startTime) / 1000) / 60)} min restantes
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Ingredients */}
        <div>
          <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--mood-text)' }}>
            🛒 Ingrédients
          </h2>
          <div className="bg-white/70 rounded-xl p-6">
            <div className="space-y-3">
              {recipe.ingredients.map((ingredient) => (
                <div key={ingredient.id} className="flex items-center gap-3">
                  <div className="w-4 h-4 border-2 border-slate-300 rounded"></div>
                  <span className="flex-1">
                    <span className="font-medium">{ingredient.quantity} {ingredient.unit}</span>{' '}
                    {ingredient.name}
                    {ingredient.isOptional && (
                      <span className="text-xs text-slate-500 ml-2">(optionnel)</span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Current step */}
        <div>
          <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--mood-text)' }}>
            👨‍🍳 Étapes ({currentStep + 1}/{recipe.steps.length})
          </h2>
          
          <div className={`p-6 rounded-xl ${moodConfig.bgColor} ${moodConfig.textColor} mb-4`}>
            <div className="flex items-start gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold">
                {currentStep + 1}
              </div>
              <div className="flex-1">
                <p className="font-medium mb-2">
                  {currentStepData.instruction}
                </p>
                {currentStepData.duration && (
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm opacity-80">
                      ⏱️ {currentStepData.duration} min
                    </span>
                    <button
                      onClick={() => startTimer(currentStepData.id, currentStepData.duration!)}
                      className="text-xs px-2 py-1 bg-white/20 rounded hover:bg-white/30 transition-colors"
                    >
                      Démarrer timer
                    </button>
                  </div>
                )}
                {currentStepData.tips && (
                  <p className="text-sm opacity-90 italic">
                    💡 {currentStepData.tips}
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex justify-between">
              <button
                onClick={previousStep}
                disabled={currentStep === 0}
                className="px-4 py-2 rounded-lg bg-white/20 hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                ← Précédent
              </button>
              
              {currentStep === recipe.steps.length - 1 ? (
                <div className="px-4 py-2 rounded-lg bg-green-500 text-white font-medium">
                  ✨ Terminé !
                </div>
              ) : (
                <button
                  onClick={nextStep}
                  className="px-4 py-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
                >
                  Suivant →
                </button>
              )}
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div
              className="h-2 rounded-full transition-all duration-300"
              style={{
                backgroundColor: 'var(--mood-primary)',
                width: `${((currentStep + 1) / recipe.steps.length) * 100}%`
              }}
            ></div>
          </div>
        </div>
      </div>

      {/* Encouragement message */}
      <div className="text-center p-6 bg-white/70 backdrop-blur-sm rounded-xl border border-white/20">
        <p className="text-sm opacity-80" style={{ color: 'var(--mood-text)' }}>
          {currentStep === 0 && "Tu vas y arriver ! Prends ton temps et profite du processus 😊"}
          {currentStep > 0 && currentStep < recipe.steps.length - 1 && "Super ! Tu es sur la bonne voie, continue comme ça ! 💪"}
          {currentStep === recipe.steps.length - 1 && "Bravo ! Tu as réussi à préparer ce délicieux plat ! 🎉"}
        </p>
      </div>
    </div>
  );
}