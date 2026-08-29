import { Transaction, BudgetCategory } from '../types';

let AsyncStorage: any = null;
try {
  AsyncStorage = require('@react-native-async-storage/async-storage').default;
} catch {
  // AsyncStorage module not yet installed or running in memory
}

const STORAGE_KEY_TX = '@ledger_transactions';
const STORAGE_KEY_BUDGETS = '@ledger_budgets';

let memoryTransactions: Transaction[] = [];
let memoryBudgets: BudgetCategory[] = [];

export const StorageService = {
  async getTransactions(): Promise<Transaction[]> {
    if (AsyncStorage) {
      try {
        const data = await AsyncStorage.getItem(STORAGE_KEY_TX);
        if (data) return JSON.parse(data);
      } catch (e) {}
    }
    return memoryTransactions;
  },

  async saveTransactions(txs: Transaction[]): Promise<void> {
    memoryTransactions = txs;
    if (AsyncStorage) {
      try {
        await AsyncStorage.setItem(STORAGE_KEY_TX, JSON.stringify(txs));
      } catch (e) {}
    }
  },

  async getBudgets(): Promise<BudgetCategory[]> {
    if (AsyncStorage) {
      try {
        const data = await AsyncStorage.getItem(STORAGE_KEY_BUDGETS);
        if (data) return JSON.parse(data);
      } catch (e) {}
    }
    return memoryBudgets;
  },

  async saveBudgets(budgets: BudgetCategory[]): Promise<void> {
    memoryBudgets = budgets;
    if (AsyncStorage) {
      try {
        await AsyncStorage.setItem(STORAGE_KEY_BUDGETS, JSON.stringify(budgets));
      } catch (e) {}
    }
  },
};
