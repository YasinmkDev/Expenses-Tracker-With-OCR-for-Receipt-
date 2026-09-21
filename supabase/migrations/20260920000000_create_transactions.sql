create table if not exists public.ledger_transactions (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  merchant text not null,
  amount numeric(12, 2) not null check (amount >= 0),
  date text not null,
  time text,
  category text not null,
  is_ai_scanned boolean not null default false,
  confidence text check (confidence in ('high', 'medium', 'low')),
  line_items jsonb not null default '[]'::jsonb,
  receipt_image text,
  note text,
  tax numeric(12, 2) not null default 0 check (tax >= 0),
  payment_method text,
  raw_insight text,
  created_at timestamptz not null default now()
);

create index if not exists ledger_transactions_user_created_at_idx
  on public.ledger_transactions (user_id, created_at desc);

alter table public.ledger_transactions enable row level security;

drop policy if exists "Ledger users can read their own transactions" on public.ledger_transactions;
create policy "Ledger users can read their own transactions"
  on public.ledger_transactions for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Ledger users can insert their own transactions" on public.ledger_transactions;
create policy "Ledger users can insert their own transactions"
  on public.ledger_transactions for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Ledger users can update their own transactions" on public.ledger_transactions;
create policy "Ledger users can update their own transactions"
  on public.ledger_transactions for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "Ledger users can delete their own transactions" on public.ledger_transactions;
create policy "Ledger users can delete their own transactions"
  on public.ledger_transactions for delete to authenticated
  using ((select auth.uid()) = user_id);

grant select, insert, update, delete on public.ledger_transactions to authenticated;
