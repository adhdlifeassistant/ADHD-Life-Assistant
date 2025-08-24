export type ExpenseCategory = 'essential' | 'pleasure' | 'impulse' | 'health';

export interface Expense {
  id: string;
  amount: number;
  category: ExpenseCategory;
  description: string;
  date: number;
  receiptPhoto?: string;
  mood?: string; // Mood au moment de la dépense
}

export interface CategoryConfig {
  id: ExpenseCategory;
  label: string;
  emoji: string;
  color: string;
  bgColor: string;
  textColor: string;
  description: string;
}

export interface MonthlyBudget {
  essential: number;
  pleasure: number;
  impulse: number;
  health: number;
}

export interface WishlistItem {
  id: string;
  name: string;
  price: number;
  category: ExpenseCategory;
  addedDate: number;
  reflection?: string;
  priority: 'low' | 'medium' | 'high';
}

export interface ReflectionQuestion {
  id: string;
  question: string;
  mood: string;
  category?: ExpenseCategory;
}

export interface FinancialAdvice {
  mood: string;
  message: string;
  tone: string;
  suggestedAction?: string;
}

export interface MonthlyStats {
  totalSpent: number;
  byCategory: Record<ExpenseCategory, number>;
  budgetUsed: Record<ExpenseCategory, number>;
  impulseCount: number;
  averageDailySpending: number;
}

export interface FinanceContextType {
  expenses: Expense[];
  budget: MonthlyBudget;
  wishlist: WishlistItem[];
  
  // Actions pour les dépenses
  addExpense: (expense: Omit<Expense, 'id' | 'date'>) => void;
  updateExpense: (id: string, updates: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
  
  // Actions pour les budgets
  setBudget: (budget: MonthlyBudget) => void;
  
  // Actions pour la wishlist
  addToWishlist: (item: Omit<WishlistItem, 'id' | 'addedDate'>) => void;
  removeFromWishlist: (id: string) => void;
  updateWishlistItem: (id: string, updates: Partial<WishlistItem>) => void;
  
  // Utils
  getCurrentMonthStats: () => MonthlyStats;
  getExpensesByMonth: (year: number, month: number) => Expense[];
  shouldTriggerReflection: (amount: number, category: ExpenseCategory) => boolean;
  getFinancialAdvice: (mood: string) => FinancialAdvice;
}

export interface ExpenseFormData {
  amount: string;
  category: ExpenseCategory;
  description: string;
  receiptPhoto?: string;
}

export interface ImpulseReflectionData {
  amount: number;
  category: ExpenseCategory;
  description: string;
  reflectionAnswers: Record<string, string>;
  decision: 'buy_now' | 'add_to_wishlist' | 'cancel';
}