'use client';

import React from 'react';
import { Recipe, Alternative, CookingMood } from '@/types/cooking';
import { useMood } from '@/modules/mood/MoodContext';
import { getCookingMoodResponse } from '@/lib/recipeDatabase';

interface RecipeListProps {
  cookingMood: CookingMood;
  onRecipeSelect: (recipe: Recipe) => void;
  onAlternativeSelect: (alternative: Alternative) => void;
}

export default function RecipeList({ 
  cookingMood, 
  onRecipeSelect, 
  onAlternativeSelect 
}: RecipeListProps) {
  const { getMoodConfig } = useMood();
  const moodConfig = getMoodConfig();
  
  const moodResponse = getCookingMoodResponse(cookingMood);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-orange-600 bg-orange-100';
      case 'hard': return 'text-red-600 bg-red-100';
      default: return 'text-slate-600 bg-slate-100';
    }
  };

  const getEnergyColor = (energy: string) => {
    switch (energy) {
      case 'low': return 'text-blue-600 bg-blue-100';
      case 'medium': return 'text-purple-600 bg-purple-100';
      case 'high': return 'text-pink-600 bg-pink-100';
      default: return 'text-slate-600 bg-slate-100';
    }
  };

  return (
    <div className="space-y-8">
      {/* Message d'accueil personnalisé */}
      <div className={`p-6 rounded-xl ${moodConfig.bgColor} ${moodConfig.textColor}`}>
        <h3 className="text-xl font-bold mb-2">
          {moodResponse.greeting}
        </h3>
        <p className="opacity-90">
          {moodResponse.suggestion}
        </p>
      </div>

      {/* Recettes suggérées */}
      {moodResponse.recipes.length > 0 && (
        <div>
          <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--mood-text)' }}>
            Recettes suggérées ✨
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {moodResponse.recipes.map((recipe) => (
              <div
                key={recipe.id}
                className="bg-white rounded-xl p-6 border border-slate-200 hover:shadow-lg transition-all hover:scale-105 cursor-pointer"
                onClick={() => onRecipeSelect(recipe)}
              >
                <div className="flex items-start gap-4">
                  <div className="text-4xl">{recipe.emoji}</div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-bold text-slate-800">{recipe.name}</h4>
                      {recipe.isComfort && (
                        <span className="text-xs px-2 py-1 bg-pink-100 text-pink-700 rounded-full">
                          💝 Réconfortant
                        </span>
                      )}
                    </div>
                    
                    <p className="text-sm text-slate-600 mb-3">
                      {recipe.description}
                    </p>
                    
                    <div className="flex items-center gap-3 text-xs">
                      <span className={`px-2 py-1 rounded-full ${getDifficultyColor(recipe.difficulty)}`}>
                        {recipe.difficulty === 'easy' ? '😌 Facile' : 
                         recipe.difficulty === 'medium' ? '🤔 Moyen' : '😤 Difficile'}
                      </span>
                      
                      <span className={`px-2 py-1 rounded-full ${getEnergyColor(recipe.energy)}`}>
                        {recipe.energy === 'low' ? '🔋 Peu d\'énergie' : 
                         recipe.energy === 'medium' ? '🔋🔋 Énergie modérée' : '🔋🔋🔋 Haute énergie'}
                      </span>
                      
                      <span className="text-slate-500">
                        ⏱️ {recipe.prepTime + recipe.cookingTime} min
                      </span>
                      
                      <span className="text-slate-500">
                        👥 {recipe.servings} pers.
                      </span>
                    </div>

                    {recipe.isBatchCookable && (
                      <div className="mt-2">
                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                          📦 Batch cooking possible
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Alternatives */}
      {moodResponse.alternatives.length > 0 && (
        <div>
          <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--mood-text)' }}>
            {cookingMood === 'not-feeling-it' ? 'Alternatives sans effort 🤗' : 'Ou alors... 💡'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {moodResponse.alternatives.map((alternative) => (
              <button
                key={alternative.id}
                onClick={() => onAlternativeSelect(alternative)}
                className="bg-slate-50 rounded-xl p-4 border border-slate-200 hover:bg-slate-100 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{alternative.emoji}</span>
                  <div>
                    <h4 className="font-semibold text-slate-800">{alternative.name}</h4>
                    <p className="text-sm text-slate-600 mb-1">{alternative.description}</p>
                    <span className="text-xs text-slate-500">
                      ⏱️ ~{alternative.estimatedTime} min
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Message encouragement selon mood */}
      <div className="text-center p-6 bg-white/70 backdrop-blur-sm rounded-xl border border-white/20">
        <p className="text-sm opacity-80" style={{ color: 'var(--mood-text)' }}>
          {getEncouragementMessage(cookingMood)}
        </p>
      </div>
    </div>
  );
}

function getEncouragementMessage(mood: CookingMood): string {
  const messages = {
    energetic: "Profite de cette énergie ! C'est le moment parfait pour essayer quelque chose de nouveau ou préparer plusieurs repas d'avance. 🚀",
    normal: "Une cuisine équilibrée fait du bien au corps et à l'esprit. Prends ton temps et savoure le processus ! 😌",
    tired: "C'est ok d'être fatigué(e). L'important c'est de te nourrir, peu importe comment. Sois doux/douce avec toi-même. 💙",
    stressed: "La cuisine peut être méditative. Respire, prends ton temps, et laisse les odeurs et gestes t'apaiser. 🌿",
    sad: "Les plats réconfortants ont le pouvoir de réchauffer le cœur. Tu mérites de prendre soin de toi, même les jours difficiles. 💜",
    'not-feeling-it': "Absolument aucune culpabilité ! Parfois on n'a pas envie de cuisiner et c'est parfaitement normal. Tu fais ce qu'il faut pour toi. 🤗"
  };
  return messages[mood];
}