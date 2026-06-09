-- Migración idempotente: segura si profiles (u otras tablas) ya existen.

-- profiles: datos de app vinculados a auth.users
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  locale text default 'es',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- chat_sessions: historial de conversaciones
create table if not exists public.chat_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  messages jsonb not null default '[]',
  phase text not null default 'welcome',
  closed_at timestamptz,
  created_at timestamptz default now()
);

-- nudos: entradas A-B-C por usuario
create table if not exists public.nudos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  chat_session_id uuid references public.chat_sessions(id) on delete set null,
  date timestamptz not null default now(),
  title text not null,
  emotion text,
  summary text,
  excerpt text,
  abc_antecedent text,
  abc_belief text,
  abc_consequence text,
  alternative_thought text,
  created_at timestamptz default now()
);

-- trigger: crear profile al registrarse
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = coalesce(excluded.full_name, public.profiles.full_name),
    avatar_url = coalesce(excluded.avatar_url, public.profiles.avatar_url),
    updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- RLS
alter table public.profiles enable row level security;
alter table public.chat_sessions enable row level security;
alter table public.nudos enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (id = auth.uid());

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (id = auth.uid());

drop policy if exists "chat_sessions_select_own" on public.chat_sessions;
create policy "chat_sessions_select_own" on public.chat_sessions
  for select using (user_id = auth.uid());

drop policy if exists "chat_sessions_insert_own" on public.chat_sessions;
create policy "chat_sessions_insert_own" on public.chat_sessions
  for insert with check (user_id = auth.uid());

drop policy if exists "nudos_select_own" on public.nudos;
create policy "nudos_select_own" on public.nudos
  for select using (user_id = auth.uid());

drop policy if exists "nudos_insert_own" on public.nudos;
create policy "nudos_insert_own" on public.nudos
  for insert with check (user_id = auth.uid());

drop policy if exists "nudos_update_own" on public.nudos;
create policy "nudos_update_own" on public.nudos
  for update using (user_id = auth.uid());
