import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Transaction, BudgetCategory, UserProfile } from '../types';

const STORAGE_KEY_TX = '@ledger_app_transactions_v2';
const STORAGE_KEY_BUDGETS = '@ledger_app_budgets_v2';
const STORAGE_KEY_PROFILE = '@ledger_app_profile_v2';

const DEFAULT_BUDGET_CATEGORIES: BudgetCategory[] = [
  { id: 'b-dining', name: 'Dining', spent: 0, budget: 1200, transactionCount: 0, icon: 'utensils', colorType: 'emerald' },
  { id: 'b-groceries', name: 'Groceries', spent: 0, budget: 900, transactionCount: 0, icon: 'shopping-bag', colorType: 'emerald' },
  { id: 'b-transport', name: 'Transport', spent: 0, budget: 500, transactionCount: 0, icon: 'car', colorType: 'signal-gold' },
  { id: 'b-shopping', name: 'Shopping', spent: 0, budget: 600, transactionCount: 0, icon: 'tag', colorType: 'emerald' },
  { id: 'b-electronics', name: 'Electronics', spent: 0, budget: 1500, transactionCount: 0, icon: 'laptop', colorType: 'emerald' },
  { id: 'b-health', name: 'Health', spent: 0, budget: 400, transactionCount: 0, icon: 'heart-pulse', colorType: 'emerald' },
  { id: 'b-travel', name: 'Travel', spent: 0, budget: 1000, transactionCount: 0, icon: 'plane', colorType: 'emerald' },
  { id: 'b-utilities', name: 'Utilities', spent: 0, budget: 400, transactionCount: 0, icon: 'zap', colorType: 'emerald' },
];

const DEFAULT_USER_PROFILE: UserProfile = {
  name: 'Alex Vance',
  email: 'alex.vance@institutional.capital',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
  role: 'Primary Account Holder',
  currencySymbol: '$',
  monthlyBudgetLimit: 6500,
};

interface LedgerContextType {
  transactions: Transaction[];
  budgets: BudgetCategory[];
  userProfile: UserProfile;
  isLoading: boolean;
  addTransaction: (tx: Omit<Transaction, 'id' | 'createdAt'>) => Promise<Transaction>;
  updateTransaction: (id: string, updates: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  addCategory: (category: Omit<BudgetCategory, 'id' | 'spent' | 'transactionCount'>) => Promise<BudgetCategory>;
  deleteCategory: (id: string) => Promise<void>;
  updateCategory: (id: string, updates: Partial<BudgetCategory>) => Promise<void>;
  updateMonthlyLimit: (limit: number) => Promise<void>;
  clearAllTransactions: () => Promise<void>;
  totalMonthlySpend: number;
  monthlyLimit: number;
  percentUsed: number;
  daysRemaining: number;
  dailyBurnRate: number;
  computedBudgets: BudgetCategory[];
}

const LedgerContext = createContext<LedgerContextType | null>(null);

export const LedgerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<BudgetCategory[]>(DEFAULT_BUDGET_CATEGORIES);
  const [userProfile, setUserProfile] = useState<UserProfile>(DEFAULT_USER_PROFILE);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Initial Load from Persistent Storage
  useEffect(() => {
    async function loadData() {
      try {
        const [storedTx, storedBudgets, storedProfile] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEY_TX),
          AsyncStorage.getItem(STORAGE_KEY_BUDGETS),
          AsyncStorage.getItem(STORAGE_KEY_PROFILE),
        ]);

        if (storedTx) {
          setTransactions(JSON.parse(storedTx));
        }
        if (storedBudgets) {
          setBudgets(JSON.parse(storedBudgets));
        }
        if (storedProfile) {
          setUserProfile(JSON.parse(storedProfile));
        }
      } catch (err) {
        console.warn('Failed to load ledger data from storage:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  // 2. Compute dynamic live budgets by cross-referencing real transactions
  const computedBudgets = useMemo(() => {
    return budgets.map((cat) => {
      const matchingTxs = transactions.filter(
        (t) => (t.category || '').toLowerCase() === (cat.name || '').toLowerCase()
      );
      const spent = matchingTxs.reduce((sum, t) => sum + (t.amount || 0), 0);
      return {
        ...cat,
        spent: Math.round(spent * 100) / 100,
        transactionCount: matchingTxs.length,
      };
    });
  }, [budgets, transactions]);

  // 3. Computed Overall Monthly Spend
  const totalMonthlySpend = useMemo(() => {
    return Math.round(transactions.reduce((sum, t) => sum + (t.amount || 0), 0) * 100) / 100;
  }, [transactions]);

  const monthlyLimit = userProfile.monthlyBudgetLimit || 6500;
  const percentUsed = Math.min(100, Math.round((totalMonthlySpend / (monthlyLimit || 1)) * 100));

  // Compute days remaining in the current calendar month
  const daysRemaining = useMemo(() => {
    const now = new Date();
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    return Math.max(1, lastDayOfMonth - now.getDate());
  }, []);

  // Compute actual daily burn rate
  const dailyBurnRate = useMemo(() => {
    const now = new Date();
    const dayOfMonth = Math.max(1, now.getDate());
    return Math.round((totalMonthlySpend / dayOfMonth) * 100) / 100;
  }, [totalMonthlySpend]);

  // 4. Store Operations
  const addTransaction = async (txData: Omit<Transaction, 'id' | 'createdAt'>): Promise<Transaction> => {
    const newTx: Transaction = {
      ...txData,
      id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: Date.now(),
    };

    const updated = [newTx, ...transactions];
    setTransactions(updated);
    try {
      await AsyncStorage.setItem(STORAGE_KEY_TX, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save transaction:', e);
    }
    return newTx;
  };

  const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
    const updated = transactions.map((t) => (t.id === id ? { ...t, ...updates } : t));
    setTransactions(updated);
    try {
      await AsyncStorage.setItem(STORAGE_KEY_TX, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to update transaction:', e);
    }
  };

  const deleteTransaction = async (id: string) => {
    const updated = transactions.filter((t) => t.id !== id);
    setTransactions(updated);
    try {
      await AsyncStorage.setItem(STORAGE_KEY_TX, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to delete transaction:', e);
    }
  };

  const addCategory = async (catData: Omit<BudgetCategory, 'id' | 'spent' | 'transactionCount'>): Promise<BudgetCategory> => {
    const newCat: BudgetCategory = {
      ...catData,
      id: `cat_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      spent: 0,
      transactionCount: 0,
    };
    const updated = [...budgets, newCat];
    setBudgets(updated);
    try {
      await AsyncStorage.setItem(STORAGE_KEY_BUDGETS, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save category:', e);
    }
    return newCat;
  };

  const deleteCategory = async (id: string) => {
    const updated = budgets.filter((b) => b.id !== id);
    setBudgets(updated);
    try {
      await AsyncStorage.setItem(STORAGE_KEY_BUDGETS, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to delete category:', e);
    }
  };

  const updateCategory = async (id: string, updates: Partial<BudgetCategory>) => {
    const updated = budgets.map((b) => (b.id === id ? { ...b, ...updates } : b));
    setBudgets(updated);
    try {
      await AsyncStorage.setItem(STORAGE_KEY_BUDGETS, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to update category:', e);
    }
  };

  const updateMonthlyLimit = async (limit: number) => {
    const updatedProfile = { ...userProfile, monthlyBudgetLimit: limit };
    setUserProfile(updatedProfile);
    try {
      await AsyncStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(updatedProfile));
    } catch (e) {
      console.warn('Failed to update monthly limit:', e);
    }
  };

  const clearAllTransactions = async () => {
    setTransactions([]);
    try {
      await AsyncStorage.removeItem(STORAGE_KEY_TX);
    } catch (e) {
      console.warn('Failed to clear transactions:', e);
    }
  };

  return (
    <LedgerContext.Provider
      value={{
        transactions,
        budgets,
        computedBudgets,
        userProfile,
        isLoading,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        addCategory,
        deleteCategory,
        updateCategory,
        updateMonthlyLimit,
        clearAllTransactions,
        totalMonthlySpend,
        monthlyLimit,
        percentUsed,
        daysRemaining,
        dailyBurnRate,
      }}
    >
      {children}
    </LedgerContext.Provider>
  );
};

export function useLedgerStore(): LedgerContextType {
  const context = useContext(LedgerContext);
  if (!context) {
    throw new Error('useLedgerStore must be used within a LedgerProvider');
  }
  return context;
}
