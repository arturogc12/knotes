-- Alinea chat_sessions con el esquema usado en producción (session_state + status).
-- Idempotente: seguro si la tabla ya tiene estas columnas o solo phase/closed_at.

alter table public.chat_sessions
  add column if not exists session_state jsonb not null default '{}'::jsonb;

alter table public.chat_sessions
  add column if not exists status text not null default 'active';

alter table public.chat_sessions
  add column if not exists updated_at timestamptz default now();

-- Migrar phase/closed_at legacy → session_state/status si existen esas columnas.
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'chat_sessions' and column_name = 'phase'
  ) then
    update public.chat_sessions
    set session_state = coalesce(session_state, '{}'::jsonb) || jsonb_build_object('phase', phase)
    where phase is not null and (session_state is null or session_state = '{}'::jsonb);

    update public.chat_sessions
    set status = 'closed'
    where closed_at is not null and status = 'active';
  end if;
end $$;

drop policy if exists "chat_sessions_update_own" on public.chat_sessions;
create policy "chat_sessions_update_own" on public.chat_sessions
  for update using (user_id = auth.uid());
