'use client';

import React from 'react';
import { useFinance, CATEGORY_CONFIG } from './FinanceContext';
import { useMood } from '../mood/MoodContext';
import { ExpenseCategory } from '@/types/finance';

export function MonthlyOverview() {
  const { getCurrentMonthStats, budget } = useFinance();
  const { getMoodConfig } = useMood();
  
  const stats = getCurrentMonthStats();
  const moodConfig = getMoodConfig();

  const renderCategoryBudget = (category: ExpenseCategory) => {
    const config = CATEGORY_CONFIG[category];
    const spent = stats.byCategory[category];
    const budgetAmount = budget[category];
    const percentage = (spent / budgetAmount) * 100;
    
    const getColorClass = (percentage: number) => {
      if (percentage >= 100) return 'text-red-600 bg-red-50 border-red-200';
      if (percentage >= 80) return 'text-orange-600 bg-orange-50 border-orange-200';
      return `${config.textColor} ${config.bgColor} border-gray-200`;
    };

    return (
      <div key={category} className={`p-4 rounded-lg border ${getColorClass(percentage)}`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">{config.emoji}</span>
            <span className="font-medium">{config.label}</span>
          </div>
          <div className="text-sm opacity-75">
            {spent.toFixed(0)}€ / {budgetAmount}€
          </div>
        </div>
        
        <div className="w-full bg-white bg-opacity-50 rounded-full h-2 mb-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              percentage >= 100 
                ? 'bg-red-500' 
                : percentage >= 80 
                ? 'bg-orange-500' 
                : `bg-${config.color}`
            }`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
        
        <div className="flex justify-between text-xs">
          <span>{percentage.toFixed(0)}% utilisé</span>
          <span>
            {percentage >= 100 ? 'Dépassé !' : `${(budgetAmount - spent).toFixed(0)}€ restants`}
          </span>
        </div>
        
        {percentage >= 90 && (
          <div className="mt-2 text-xs px-2 py-1 bg-white bg-opacity-75 rounded text-center">
            ⚠️ Attention au budget !
          </div>
        )}
      </div>
    );
  };

  const totalBudget = Object.values(budget).reduce((sum, amount) => sum + amount, 0);
  const totalSpentPercentage = (stats.totalSpent / totalBudget) * 100;

  return (
    <div className="p-6 space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Vue d'ensemble - {new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
        </h2>
        <p className="text-gray-600">
          Suivi de vos finances avec bienveillance 💙
        </p>
      </div>

      {/* Budget global */}
      <div className={`p-6 rounded-xl ${moodConfig.bgColor} border-l-4`}
           style={{ borderLeftColor: moodConfig.color }}>
        <div className="text-center">
          <div className="text-3xl font-bold text-gray-800 mb-1">
            {stats.totalSpent.toFixed(0)}€
          </div>
          <div className="text-lg text-gray-600 mb-3">
            sur {totalBudget}€ de budget
          </div>
          
          <div className="w-full bg-white bg-opacity-50 rounded-full h-3 mb-3">
            <div
              className={`h-3 rounded-full transition-all duration-500 ${
                totalSpentPercentage >= 100 
                  ? 'bg-red-500' 
                  : totalSpentPercentage >= 80 
                  ? 'bg-orange-500' 
                  : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(totalSpentPercentage, 100)}%` }}
            />
          </div>
          
          <div className="text-sm text-gray-600">
            {totalSpentPercentage.toFixed(0)}% de votre budget mensuel
          </div>
        </div>
      </div>

      {/* Budgets par catégorie */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">
          Répartition par catégorie
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          {(Object.keys(CATEGORY_CONFIG) as ExpenseCategory[]).map(renderCategoryBudget)}
        </div>
      </div>

      {/* Statistiques utiles */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-blue-600">
            {stats.averageDailySpending.toFixed(0)}€
          </div>
          <div className="text-sm text-blue-700">Moyenne par jour</div>
        </div>
        
        <div className="bg-orange-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-orange-600">
            {stats.impulseCount}
          </div>
          <div className="text-sm text-orange-700">Achats impulsifs</div>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg text-center md:col-span-1 col-span-2">
          <div className="text-2xl font-bold text-green-600">
            {Math.max(0, totalBudget - stats.totalSpent).toFixed(0)}€
          </div>
          <div className="text-sm text-green-700">Budget restant</div>
        </div>
      </div>

      {/* Conseils personnalisés */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg">
        <h4 className="font-medium text-gray-800 mb-2">💡 Conseil du jour</h4>
        <div className="text-sm text-gray-600">
          {totalSpentPercentage >= 100 ? (
            "Tu as dépassé ton budget mensuel. C'est ok, ça arrive ! Focus sur l'essentiel jusqu'à la fin du mois."
          ) : totalSpentPercentage >= 80 ? (
            "Tu approches de la limite de ton budget. Peut-être ralentir un peu sur les achats plaisir ?"
          ) : stats.impulseCount >= 5 ? (
            "Beaucoup d'achats impulsifs ce mois ! Essaie la wishlist pour tes prochaines envies."
          ) : (
            "Tu gères bien tes finances ! Continue comme ça, tu peux même te faire plaisir un peu 😊"
          )}
        </div>
      </div>
    </div>
  );
}