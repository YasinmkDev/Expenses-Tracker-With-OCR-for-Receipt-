export type CategoryType =
  | "Dining"
  | "Groceries"
  | "Transport"
  | "Shopping"
  | "Health"
  | "Entertain"
  | "Travel"
  | "Electronics"
  | "Utilities"
  | "Misc";

export interface LineItem {
  id: string;
  name: string;
  price: number;
  category: CategoryType | string;
  confidence: "high" | "medium" | "low";
}

export interface Transaction {
  id: string;
  merchant: string;
  amount: number;
  date: string; // e.g. "Oct 12, 2023" or "Today"
  time?: string; // e.g. "10:42 AM"
  category: CategoryType;
  isAiScanned: boolean;
  confidence?: "high" | "medium" | "low";
  lineItems: LineItem[];
  receiptImage?: string;
  note?: string;
  tax?: number;
  paymentMethod?: string;
  rawInsight?: string;
  createdAt: number;
}

export interface BudgetCategory {
  id: string;
  name: CategoryType | string;
  spent: number;
  budget: number;
  transactionCount: number;
  icon: string; // e.g. 'utensils', 'shopping-bag', 'car', 'laptop', etc.
  colorType?: "emerald" | "signal-gold" | "amber-rust" | "slate" | "cyan" | "purple";
}

export type ScreenType =
  | "home"
  | "insights"
  | "transactions"
  | "budgets"
  | "scanner"
  | "review"
  | "manual-add"
  | "auth";

export interface UserProfile {
  name: string;
  email: string;
  avatarUrl: string;
  role: string;
  currencySymbol: string;
  monthlyBudgetLimit: number;
}
