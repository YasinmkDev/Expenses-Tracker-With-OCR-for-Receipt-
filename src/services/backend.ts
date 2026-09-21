import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Transaction } from '../types';
import { SupabaseStorage } from './safeStorage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const TRANSACTIONS_TABLE = 'ledger_transactions';
const UPLOAD_LIMIT = 3;
const GUEST_ID = 'guest';

export const supabase: SupabaseClient | null = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey, {
      auth: {
        storage: SupabaseStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    })
  : null;

export const BackendService = {
  isConfigured: Boolean(supabase),

  async signIn(email: string, password: string) {
    if (!supabase) throw new Error('Supabase is not configured.');
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data.user;
  },

  async signUp(email: string, password: string) {
    if (!supabase) throw new Error('Supabase is not configured.');
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    return data;
  },

  async signOut(): Promise<void> {
    if (!supabase) return;
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async reserveUpload(): Promise<{ allowed: boolean; remaining: number }> {
    const { data: { user } } = supabase ? await supabase.auth.getUser() : { data: { user: null } };
    const key = `@ledger_uploads_${user?.id || GUEST_ID}`;

    if (supabase && user) {
      const { data, error } = await supabase.rpc('reserve_ledger_upload');
      if (!error && data) return { allowed: Boolean(data.allowed), remaining: Number(data.remaining) };
    }

    const stored = await SupabaseStorage.getItem(key);
    const used = Number(stored || 0);
    if (used >= UPLOAD_LIMIT) return { allowed: false, remaining: 0 };
    const next = used + 1;
    await SupabaseStorage.setItem(key, String(next));
    return { allowed: true, remaining: UPLOAD_LIMIT - next };
  },

  async saveTransaction(transaction: Transaction): Promise<void> {
    if (!supabase) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from(TRANSACTIONS_TABLE).upsert({
      id: transaction.id,
      user_id: user.id,
      merchant: transaction.merchant,
      amount: transaction.amount,
      date: transaction.date,
      time: transaction.time ?? null,
      category: transaction.category,
      is_ai_scanned: transaction.isAiScanned,
      confidence: transaction.confidence ?? null,
      line_items: transaction.lineItems,
      receipt_image: transaction.receiptImage ?? null,
      note: transaction.note ?? null,
      tax: transaction.tax ?? 0,
      payment_method: transaction.paymentMethod ?? null,
      raw_insight: transaction.rawInsight ?? null,
      created_at: new Date(transaction.createdAt).toISOString(),
    });
    if (error) throw error;
  },

  async deleteTransaction(id: string): Promise<void> {
    if (!supabase) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from(TRANSACTIONS_TABLE).delete().eq('id', id).eq('user_id', user.id);
    if (error) throw error;
  },
};
