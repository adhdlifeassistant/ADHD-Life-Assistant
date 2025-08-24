'use client';

import React, { useState } from 'react';
import { useFinance, CATEGORY_CONFIG } from './FinanceContext';
import { ExpenseCategory, Expense } from '@/types/finance';

export function ExpenseList() {
  const { expenses, deleteExpense } = useFinance();
  const [filterCategory, setFilterCategory] = useState<ExpenseCategory | 'all'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');

  const filteredExpenses = expenses
    .filter(expense => filterCategory === 'all' || expense.category === filterCategory)
    .sort((a, b) => {
      if (sortBy === 'date') {
        return b.date - a.date; // Plus récent en premier
      } else {
        return b.amount - a.amount; // Plus cher en premier
      }
    });

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const isYesterday = date.toDateString() === new Date(now.getTime() - 24*60*60*1000).toDateString();
    
    if (isToday) return "Aujourd'hui";
    if (isYesterday) return "Hier";
    
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short'
    });
  };

  const groupExpensesByDate = (expenses: Expense[]) => {
    const grouped: { [key: string]: Expense[] } = {};
    
    expenses.forEach(expense => {
      const dateKey = new Date(expense.date).toDateString();
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(expense);
    });
    
    return Object.entries(grouped).sort((a, b) => 
      new Date(b[0]).getTime() - new Date(a[0]).getTime()
    );
  };

  const groupedExpenses = groupExpensesByDate(filteredExpenses);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">
          Mes dépenses
        </h2>
        <div className="text-sm text-gray-600">
          {filteredExpenses.length} dépense{filteredExpenses.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Filtres */}
      <div className="mb-6 space-y-4">
        <div className="flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setFilterCategory('all')}
            className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${
              filterCategory === 'all'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Tout
          </button>
          {Object.values(CATEGORY_CONFIG).map(category => (
            <button
              key={category.id}
              onClick={() => setFilterCategory(category.id)}
              className={`px-3 py-1 rounded-full text-sm whitespace-nowrap flex items-center gap-1 ${
                filterCategory === category.id
                  ? `${category.bgColor} ${category.textColor}`
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span>{category.emoji}</span>
              {category.label}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'date' | 'amount')}
            className="px-3 py-1 text-sm border border-gray-300 rounded-lg"
          >
            <option value="date">Trier par date</option>
            <option value="amount">Trier par montant</option>
          </select>
        </div>
      </div>

      {/* Liste des dépenses */}
      {groupedExpenses.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <span className="text-4xl block mb-4">💸</span>
          <p>Aucune dépense trouvée</p>
          <p className="text-sm mt-2">
            {filterCategory !== 'all' 
              ? 'Essayez de changer le filtre de catégorie'
              : 'Commencez par ajouter votre première dépense !'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {groupedExpenses.map(([dateKey, dayExpenses]) => (
            <div key={dateKey} className="space-y-3">
              <h3 className="text-sm font-medium text-gray-500 border-b pb-1">
                {formatDate(new Date(dateKey).getTime())} 
                <span className="ml-2 text-xs">
                  {dayExpenses.reduce((sum, e) => sum + e.amount, 0).toFixed(0)}€
                </span>
              </h3>
              
              <div className="space-y-2">
                {dayExpenses.map(expense => {
                  const categoryConfig = CATEGORY_CONFIG[expense.category];
                  return (
                    <div
                      key={expense.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div className={`w-10 h-10 rounded-full ${categoryConfig.bgColor} flex items-center justify-center`}>
                          <span className="text-lg">{categoryConfig.emoji}</span>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-gray-800 truncate">
                              {expense.description}
                            </h4>
                            {expense.mood && (
                              <span className="text-xs px-2 py-1 bg-white rounded-full text-gray-600">
                                {expense.mood}
                              </span>
                            )}
                          </div>
                          <p className={`text-sm ${categoryConfig.textColor}`}>
                            {categoryConfig.label}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="font-semibold text-gray-800">
                            {expense.amount.toFixed(2)}€
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(expense.date).toLocaleTimeString('fr-FR', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                        
                        <button
                          onClick={() => deleteExpense(expense.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors p-1"
                          title="Supprimer"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}