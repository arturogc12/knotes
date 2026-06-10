-- Borradores incrementales: UPDATE en chat_sessions y estado draft/complete en nudos.

drop policy if exists "chat_sessions_update_own" on public.chat_sessions;
create policy "chat_sessions_update_own" on public.chat_sessions
  for update using (user_id = auth.uid());

alter table public.nudos
  add column if not exists status text not null default 'draft'
  check (status in ('draft', 'complete'));

-- Nudos existentes (creados antes de borradores) se consideran completos.
update public.nudos set status = 'complete';

create index if not exists nudos_user_status_idx on public.nudos (user_id, status);
