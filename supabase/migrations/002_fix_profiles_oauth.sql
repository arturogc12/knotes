-- Corrige "Database error saving new user" al registrar con Google.
-- Ejecutar en Supabase → SQL Editor si el login OAuth falla.

-- Asegurar columnas (profiles puede existir con esquema distinto)
alter table public.profiles add column if not exists email text;
alter table public.profiles add column if not exists full_name text;
alter table public.profiles add column if not exists avatar_url text;
alter table public.profiles add column if not exists locale text default 'es';
alter table public.profiles add column if not exists created_at timestamptz default now();
alter table public.profiles add column if not exists updated_at timestamptz default now();

-- Si existe username (plantilla Supabase), no bloquear el alta
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'profiles' and column_name = 'username'
  ) then
    alter table public.profiles alter column username drop not null;
  end if;
end $$;

-- Permisos para que auth.users pueda insertar el perfil vía trigger
grant usage on schema public to supabase_auth_admin;
grant insert, update, select on table public.profiles to supabase_auth_admin;
grant insert, update, select on table public.profiles to service_role;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_full_name text;
  v_avatar text;
  v_username text;
begin
  v_full_name := coalesce(
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'name'
  );
  v_avatar := coalesce(
    new.raw_user_meta_data->>'avatar_url',
    new.raw_user_meta_data->>'picture'
  );
  v_username := coalesce(
    new.raw_user_meta_data->>'preferred_username',
    split_part(coalesce(new.email, ''), '@', 1),
    substring(new.id::text, 1, 8)
  );

  -- Insertar según columnas disponibles (compatible con plantillas Supabase)
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'profiles' and column_name = 'username'
  ) then
    insert into public.profiles (id, email, full_name, avatar_url, username)
    values (new.id, new.email, v_full_name, v_avatar, v_username)
    on conflict (id) do update set
      email = excluded.email,
      full_name = coalesce(excluded.full_name, public.profiles.full_name),
      avatar_url = coalesce(excluded.avatar_url, public.profiles.avatar_url),
      username = coalesce(public.profiles.username, excluded.username),
      updated_at = now();
  else
    insert into public.profiles (id, email, full_name, avatar_url)
    values (new.id, new.email, v_full_name, v_avatar)
    on conflict (id) do update set
      email = excluded.email,
      full_name = coalesce(excluded.full_name, public.profiles.full_name),
      avatar_url = coalesce(excluded.avatar_url, public.profiles.avatar_url),
      updated_at = now();
  end if;

  return new;
exception
  when others then
    raise log 'handle_new_user error for %: %', new.id, sqlerrm;
    return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

revoke execute on function public.handle_new_user() from public;
grant execute on function public.handle_new_user() to supabase_auth_admin;
grant execute on function public.handle_new_user() to service_role;
