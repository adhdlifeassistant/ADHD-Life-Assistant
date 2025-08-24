'use client';

import React, { useState } from 'react';
import { useFinance, CATEGORY_CONFIG } from './FinanceContext';
import { MonthlyBudget, ExpenseCategory } from '@/types/finance';

export function BudgetManager() {
  const { budget, setBudget, getCurrentMonthStats } = useFinance();
  const [editingBudget, setEditingBudget] = useState<MonthlyBudget>(budget);
  const [isEditing, setIsEditing] = useState(false);

  const stats = getCurrentMonthStats();

  const handleSave = () => {
    setBudget(editingBudget);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditingBudget(budget);
    setIsEditing(false);
  };

  const handleCategoryBudgetChange = (category: ExpenseCategory, value: string) => {
    const numValue = parseFloat(value) || 0;
    setEditingBudget(prev => ({
      ...prev,
      [category]: numValue
    }));
  };

  const totalBudget = Object.values(editingBudget).reduce((sum, amount) => sum + amount, 0);
  const recommendedBudget = {
    essential: Math.round(totalBudget * 0.6), // 60% pour l'essentiel
    health: Math.round(totalBudget * 0.15),   // 15% pour la santé
    pleasure: Math.round(totalBudget * 0.20), // 20% pour le plaisir
    impulse: Math.round(totalBudget * 0.05)   // 5% pour l'impulsif
  };

  const renderCategoryBudget = (category: ExpenseCategory) => {
    const config = CATEGORY_CONFIG[category];
    const currentSpent = stats.byCategory[category];
    const currentBudgetAmount = budget[category];
    const editingBudgetAmount = editingBudget[category];
    const recommended = recommendedBudget[category];
    
    const percentage = currentBudgetAmount > 0 ? (currentSpent / currentBudgetAmount) * 100 : 0;

    return (
      <div key={category} className={`p-4 rounded-lg border ${config.bgColor}`}>
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">{config.emoji}</span>
          <div className="flex-1">
            <h3 className={`font-medium ${config.textColor}`}>{config.label}</h3>
            <p className="text-sm text-gray-600">{config.description}</p>
          </div>
        </div>

        {/* Budget actuel vs dépensé */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Dépensé ce mois</span>
            <span>{currentSpent.toFixed(0)}€ / {currentBudgetAmount}€</span>
          </div>
          <div className="w-full bg-white bg-opacity-50 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                percentage >= 100 ? 'bg-red-500' : percentage >= 80 ? 'bg-orange-500' : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
        </div>

        {/* Édition du budget */}
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Budget mensuel (€)
            </label>
            <input
              type="number"
              min="0"
              step="1"
              value={editingBudgetAmount}
              onChange={(e) => handleCategoryBudgetChange(category, e.target.value)}
              disabled={!isEditing}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                isEditing ? 'border-gray-300' : 'border-gray-200 bg-gray-50'
              }`}
            />
          </div>

          {isEditing && (
            <div className="text-xs text-gray-500">
              💡 Recommandé: {recommended}€ ({((recommended / totalBudget) * 100).toFixed(0)}% du total)
            </div>
          )}
        </div>

        {/* Indicateur santé budget */}
        <div className="mt-3 flex items-center gap-2 text-sm">
          {percentage >= 100 ? (
            <span className="text-red-600">🔴 Budget dépassé</span>
          ) : percentage >= 80 ? (
            <span className="text-orange-600">🟡 Attention</span>
          ) : (
            <span className="text-green-600">🟢 Dans les limites</span>
          )}
          <span className="text-gray-500">({percentage.toFixed(0)}%)</span>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">Gestion du budget</h2>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <button
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Sauvegarder
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Modifier
            </button>
          )}
        </div>
      </div>

      {/* Résumé budget total */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-800 mb-2">
            Budget mensuel total: {totalBudget.toFixed(0)}€
          </div>
          <div className="text-gray-600">
            Dépensé: {stats.totalSpent.toFixed(0)}€ 
            <span className="ml-2">
              ({((stats.totalSpent / totalBudget) * 100).toFixed(0)}%)
            </span>
          </div>
        </div>
      </div>

      {/* Guide répartition */}
      {isEditing && (
        <div className="bg-yellow-50 p-4 rounded-lg">
          <h3 className="font-medium text-yellow-800 mb-2">💡 Guide de répartition ADHD-friendly</h3>
          <div className="text-sm text-yellow-700 space-y-1">
            <p><strong>Essentiel (60%)</strong>: Loyer, courses, transport, abonnements nécessaires</p>
            <p><strong>Santé (15%)</strong>: Médecin, médicaments, thérapie, sport</p>
            <p><strong>Plaisir (20%)</strong>: Sorties, hobbies, petits bonheurs assumés</p>
            <p><strong>Impulsif (5%)</strong>: Marge pour les achats spontanés inévitables</p>
          </div>
        </div>
      )}

      {/* Budgets par catégorie */}
      <div className="grid md:grid-cols-2 gap-6">
        {(Object.keys(CATEGORY_CONFIG) as ExpenseCategory[]).map(renderCategoryBudget)}
      </div>

      {/* Conseils personnalisés */}
      <div className="bg-purple-50 p-4 rounded-lg">
        <h4 className="font-medium text-purple-800 mb-2">🎯 Conseils budgétaires</h4>
        <div className="text-sm text-purple-700 space-y-2">
          {totalBudget < 1000 && (
            <p>• Pour un petit budget, privilégie l'essentiel et garde une petite marge plaisir.</p>
          )}
          {stats.impulseCount >= 3 && (
            <p>• Beaucoup d'achats impulsifs ce mois. Peut-être augmenter ce budget ?</p>
          )}
          {stats.byCategory.pleasure === 0 && (
            <p>• N'oublie pas de te faire plaisir ! Un petit budget plaisir est important pour le moral.</p>
          )}
          {Object.values(stats.budgetUsed).some(usage => usage >= 100) && (
            <p>• Certains budgets sont dépassés. Pas de panique, on ajuste pour le mois prochain !</p>
          )}
        </div>
      </div>
    </div>
  );
}