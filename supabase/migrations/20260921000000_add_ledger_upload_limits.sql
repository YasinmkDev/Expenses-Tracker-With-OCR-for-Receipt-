create table if not exists public.ledger_upload_usage (
  user_id uuid primary key references auth.users(id) on delete cascade,
  upload_count integer not null default 0 check (upload_count >= 0 and upload_count <= 3),
  updated_at timestamptz not null default now()
);

alter table public.ledger_upload_usage enable row level security;

drop policy if exists "Ledger users can read their own upload usage" on public.ledger_upload_usage;
create policy "Ledger users can read their own upload usage"
  on public.ledger_upload_usage for select to authenticated
  using ((select auth.uid()) = user_id);

grant select on public.ledger_upload_usage to authenticated;

create or replace function public.reserve_ledger_upload()
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  current_count integer;
  next_count integer;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  insert into public.ledger_upload_usage (user_id, upload_count)
  values (auth.uid(), 0)
  on conflict (user_id) do nothing;

  update public.ledger_upload_usage
  set upload_count = upload_count + 1, updated_at = now()
  where user_id = auth.uid() and upload_count < 3
  returning upload_count into next_count;

  if next_count is null then
    select upload_count into current_count
    from public.ledger_upload_usage
    where user_id = auth.uid();
    return jsonb_build_object('allowed', false, 'remaining', greatest(0, 3 - current_count));
  end if;

  return jsonb_build_object('allowed', true, 'remaining', 3 - next_count);
end;
$$;

grant execute on function public.reserve_ledger_upload() to authenticated;
