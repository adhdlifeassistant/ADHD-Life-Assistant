'use client';

import React, { useState } from 'react';
import { useFinance } from './FinanceContext';
import { useMood } from '../mood/MoodContext';
import { keyboardNavService } from '@/lib/keyboardNavigation';
import { ExpenseForm } from './ExpenseForm';
import { ExpenseList } from './ExpenseList';
import { MonthlyOverview } from './MonthlyOverview';
import { BudgetManager } from './BudgetManager';
import { Wishlist } from './Wishlist';

type FinanceView = 'overview' | 'add' | 'expenses' | 'budget' | 'wishlist';

export function FinanceInterface() {
  const [currentView, setCurrentView] = useState<FinanceView>('overview');
  const { getCurrentMonthStats, getFinancialAdvice } = useFinance();
  const { currentMood, getMoodConfig } = useMood();

  const stats = getCurrentMonthStats();
  const advice = getFinancialAdvice(currentMood);
  const moodConfig = getMoodConfig();
  
  // Initialize keyboard navigation for tab interface
  React.useEffect(() => {
    const financeContainer = document.getElementById('finance-interface');
    if (financeContainer) {
      return keyboardNavService.initializeComponent(financeContainer, {
        tabList: true
      });
    }
  }, []);

  const renderView = () => {
    switch (currentView) {
      case 'add':
        return <ExpenseForm onSuccess={() => setCurrentView('overview')} />;
      case 'expenses':
        return <ExpenseList />;
      case 'budget':
        return <BudgetManager />;
      case 'wishlist':
        return <Wishlist />;
      default:
        return <MonthlyOverview />;
    }
  };

  const navItems = [
    { id: 'overview', label: 'Vue d\'ensemble', emoji: '📊' },
    { id: 'add', label: 'Ajouter', emoji: '➕' },
    { id: 'expenses', label: 'Dépenses', emoji: '🧾' },
    { id: 'budget', label: 'Budget', emoji: '💰' },
    { id: 'wishlist', label: 'Wishlist', emoji: '🎁' }
  ];

  return (
    <div id="finance-interface" className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Header avec conseil mood */}
      <div className={`p-4 rounded-lg ${moodConfig.bgColor} border-l-4`} 
           style={{ borderLeftColor: moodConfig.color }}>
        <div className="flex items-center gap-3">
          <span className="text-2xl">{moodConfig.emoji}</span>
          <div>
            <h3 className={`font-medium ${moodConfig.textColor}`}>
              Conseil finances du moment
            </h3>
            <p className={`text-sm ${moodConfig.textColor} opacity-80`}>
              {advice.message}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex gap-2 overflow-x-auto pb-2" role="tablist" aria-label="Sections des finances">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => setCurrentView(item.id as FinanceView)}
            className={`px-4 py-2 rounded-lg whitespace-nowrap flex items-center gap-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              currentView === item.id
                ? `bg-${moodConfig.color.replace('-500', '-100')} text-${moodConfig.color.replace('-500', '-700')}`
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            role="tab"
            aria-selected={currentView === item.id}
            aria-controls={`finance-panel-${item.id}`}
            id={`finance-tab-${item.id}`}
          >
            <span role="img" aria-hidden="true">{item.emoji}</span>
            <span className="text-sm font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Quick stats */}
      {currentView === 'overview' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4" role="group" aria-label="Statistiques financières du mois">
          <div className="bg-white p-4 rounded-lg border" role="region" aria-labelledby="total-spent-title">
            <div className="text-2xl font-bold text-gray-800" id="total-spent-title">
              {stats.totalSpent.toFixed(0)}€
            </div>
            <div className="text-sm text-gray-600">Dépensé ce mois</div>
          </div>
          <div className="bg-white p-4 rounded-lg border" role="region" aria-labelledby="impulse-count-title">
            <div className="text-2xl font-bold text-orange-600" id="impulse-count-title">
              {stats.impulseCount}
            </div>
            <div className="text-sm text-gray-600">Achats impulsifs</div>
          </div>
          <div className="bg-white p-4 rounded-lg border" role="region" aria-labelledby="daily-average-title">
            <div className="text-2xl font-bold text-blue-600" id="daily-average-title">
              {stats.averageDailySpending.toFixed(0)}€
            </div>
            <div className="text-sm text-gray-600">Moyenne par jour</div>
          </div>
          <div className="bg-white p-4 rounded-lg border" role="region" aria-labelledby="wise-ratio-title">
            <div className="text-2xl font-bold text-green-600" id="wise-ratio-title">
              {Math.max(0, (stats.byCategory.essential + stats.byCategory.health) / (stats.byCategory.pleasure + stats.byCategory.impulse) * 100).toFixed(0)}%
            </div>
            <div className="text-sm text-gray-600">Ratio de dépenses raisonnables</div>
          </div>
        </div>
      )}

      {/* Content */}
      <div 
        className="bg-white rounded-lg border min-h-[400px]"
        role="tabpanel"
        id={`finance-panel-${currentView}`}
        aria-labelledby={`finance-tab-${currentView}`}
      >
        {renderView()}
      </div>
    </div>
  );
}