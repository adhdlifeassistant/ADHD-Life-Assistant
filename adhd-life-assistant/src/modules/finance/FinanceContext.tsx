'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Expense, 
  ExpenseCategory, 
  MonthlyBudget, 
  WishlistItem, 
  FinanceContextType, 
  CategoryConfig, 
  MonthlyStats,
  FinancialAdvice,
  ReflectionQuestion
} from '@/types/finance';

const CATEGORY_CONFIG: Record<ExpenseCategory, CategoryConfig> = {
  essential: {
    id: 'essential',
    label: 'Essentiel',
    emoji: '🏠',
    color: 'blue-500',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    description: 'Loyer, courses, transport'
  },
  pleasure: {
    id: 'pleasure',
    label: 'Plaisir',
    emoji: '🎉',
    color: 'green-500',
    bgColor: 'bg-green-50',
    textColor: 'text-green-700',
    description: 'Sorties, loisirs, hobbies'
  },
  impulse: {
    id: 'impulse',
    label: 'Impulsif',
    emoji: '⚡',
    color: 'orange-500',
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-700',
    description: 'Achats spontanés'
  },
  health: {
    id: 'health',
    label: 'Santé',
    emoji: '💊',
    color: 'purple-500',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-700',
    description: 'Médecin, médicaments, bien-être'
  }
};

const DEFAULT_BUDGET: MonthlyBudget = {
  essential: 800,
  pleasure: 200,
  impulse: 100,
  health: 150
};

const REFLECTION_QUESTIONS: ReflectionQuestion[] = [
  {
    id: 'need',
    question: 'En ai-je vraiment besoin maintenant ?',
    mood: 'all'
  },
  {
    id: 'budget',
    question: 'Est-ce que ça rentre dans mon budget du mois ?',
    mood: 'all'
  },
  {
    id: 'mood_driven',
    question: 'Est-ce que mon mood actuel influence cet achat ?',
    mood: 'all'
  },
  {
    id: 'alternatives',
    question: 'Y a-t-il une alternative moins chère ?',
    mood: 'all'
  },
  {
    id: 'regret',
    question: 'Est-ce que je pourrais le regretter demain ?',
    mood: 'impulse'
  }
];

const MOOD_FINANCIAL_ADVICE: Record<string, FinancialAdvice> = {
  energetic: {
    mood: 'energetic',
    message: 'Tu peux te faire plaisir intelligemment ! Vérifie juste ton budget plaisir avant.',
    tone: 'encouraging',
    suggestedAction: 'check_pleasure_budget'
  },
  normal: {
    mood: 'normal',
    message: 'Vérifions si c\'est dans le budget. Tu gères bien !',
    tone: 'supportive',
    suggestedAction: 'review_budget'
  },
  tired: {
    mood: 'tired',
    message: 'Mode économies activé. Garde ton énergie pour l\'essentiel.',
    tone: 'gentle',
    suggestedAction: 'focus_essentials'
  },
  stressed: {
    mood: 'stressed',
    message: 'Pause achats impulsifs ! Respirons d\'abord, les finances peuvent attendre.',
    tone: 'calming',
    suggestedAction: 'delay_purchases'
  },
  sad: {
    mood: 'sad',
    message: 'Pas de shopping thérapie aujourd\'hui. Tu mérites mieux que ça ❤️',
    tone: 'empathetic',
    suggestedAction: 'find_alternatives'
  }
};

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [budget, setBudgetState] = useState<MonthlyBudget>(DEFAULT_BUDGET);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);

  useEffect(() => {
    const savedExpenses = localStorage.getItem('adhd-expenses');
    const savedBudget = localStorage.getItem('adhd-budget');
    const savedWishlist = localStorage.getItem('adhd-wishlist');

    if (savedExpenses) {
      setExpenses(JSON.parse(savedExpenses));
    }

    if (savedBudget) {
      setBudgetState(JSON.parse(savedBudget));
    }

    if (savedWishlist) {
      setWishlist(JSON.parse(savedWishlist));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('adhd-expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('adhd-budget', JSON.stringify(budget));
  }, [budget]);

  useEffect(() => {
    localStorage.setItem('adhd-wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const addExpense = (expenseData: Omit<Expense, 'id' | 'date'>) => {
    const newExpense: Expense = {
      ...expenseData,
      id: Date.now().toString(),
      date: Date.now()
    };

    setExpenses(prev => [newExpense, ...prev]);
  };

  const updateExpense = (id: string, updates: Partial<Expense>) => {
    setExpenses(prev => 
      prev.map(expense => 
        expense.id === id ? { ...expense, ...updates } : expense
      )
    );
  };

  const deleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(expense => expense.id !== id));
  };

  const setBudget = (newBudget: MonthlyBudget) => {
    setBudgetState(newBudget);
  };

  const addToWishlist = (itemData: Omit<WishlistItem, 'id' | 'addedDate'>) => {
    const newItem: WishlistItem = {
      ...itemData,
      id: Date.now().toString(),
      addedDate: Date.now()
    };

    setWishlist(prev => [newItem, ...prev]);
  };

  const removeFromWishlist = (id: string) => {
    setWishlist(prev => prev.filter(item => item.id !== id));
  };

  const updateWishlistItem = (id: string, updates: Partial<WishlistItem>) => {
    setWishlist(prev => 
      prev.map(item => 
        item.id === id ? { ...item, ...updates } : item
      )
    );
  };

  const getCurrentMonthStats = (): MonthlyStats => {
    const now = new Date();
    const currentMonthExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getMonth() === now.getMonth() && 
             expenseDate.getFullYear() === now.getFullYear();
    });

    const totalSpent = currentMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    const byCategory: Record<ExpenseCategory, number> = {
      essential: 0,
      pleasure: 0,
      impulse: 0,
      health: 0
    };

    currentMonthExpenses.forEach(expense => {
      byCategory[expense.category] += expense.amount;
    });

    const budgetUsed: Record<ExpenseCategory, number> = {
      essential: (byCategory.essential / budget.essential) * 100,
      pleasure: (byCategory.pleasure / budget.pleasure) * 100,
      impulse: (byCategory.impulse / budget.impulse) * 100,
      health: (byCategory.health / budget.health) * 100
    };

    const impulseCount = currentMonthExpenses.filter(e => e.category === 'impulse').length;
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const averageDailySpending = totalSpent / Math.max(now.getDate(), 1);

    return {
      totalSpent,
      byCategory,
      budgetUsed,
      impulseCount,
      averageDailySpending
    };
  };

  const getExpensesByMonth = (year: number, month: number): Expense[] => {
    return expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getMonth() === month && expenseDate.getFullYear() === year;
    });
  };

  const shouldTriggerReflection = (amount: number, category: ExpenseCategory): boolean => {
    if (amount >= 50) return true;
    if (category === 'impulse' && amount >= 20) return true;
    
    const stats = getCurrentMonthStats();
    const categoryBudgetUsed = stats.budgetUsed[category];
    
    return categoryBudgetUsed >= 80;
  };

  const getFinancialAdvice = (mood: string): FinancialAdvice => {
    return MOOD_FINANCIAL_ADVICE[mood] || MOOD_FINANCIAL_ADVICE.normal;
  };

  return (
    <FinanceContext.Provider value={{
      expenses,
      budget,
      wishlist,
      addExpense,
      updateExpense,
      deleteExpense,
      setBudget,
      addToWishlist,
      removeFromWishlist,
      updateWishlistItem,
      getCurrentMonthStats,
      getExpensesByMonth,
      shouldTriggerReflection,
      getFinancialAdvice
    }}>
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance() {
  const context = useContext(FinanceContext);
  if (context === undefined) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
}

export { CATEGORY_CONFIG, REFLECTION_QUESTIONS, MOOD_FINANCIAL_ADVICE };