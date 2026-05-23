-- =============================================================
-- DISCIPLINA APP — Schema completo de Supabase
-- Ejecutar en: Supabase → SQL Editor → New query → Run
-- =============================================================


-- ─────────────────────────────────────────────────────────────
-- PARTE 1: TABLAS
-- ─────────────────────────────────────────────────────────────

-- 1. PROFILES (extiende auth.users)
create table public.profiles (
  id               uuid primary key references auth.users(id) on delete cascade,
  name             text        not null,
  email            text        not null,
  role             text        not null default 'user'   check (role   in ('admin','user')),
  status           text        not null default 'active' check (status in ('active','inactive')),
  diet_plan        jsonb       default null,
  selected_day     int         default 0,
  progress_history jsonb       default '{}',
  created_at       date        not null default current_date
);

-- 2. SUBSCRIPTIONS
create table public.subscriptions (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null unique references auth.users(id) on delete cascade,
  plan               text not null default 'free' check (plan in ('free','pro')),
  status             text not null default 'active',
  stripe_customer_id text,
  stripe_session_id  text,
  started_at         timestamptz not null default now(),
  expires_at         timestamptz,
  created_at         timestamptz not null default now()
);

-- 3. HABITS
create table public.habits (
  id         uuid  primary key default gen_random_uuid(),
  user_id    uuid  not null references auth.users(id) on delete cascade,
  name       text  not null,
  cat        text  not null,
  streak     int   not null default 0,
  history    jsonb not null default '{}',
  created_at timestamptz not null default now()
);

-- 4. HABIT_LOGS (registro diario — un fila por hábito por día)
create table public.habit_logs (
  id         uuid    primary key default gen_random_uuid(),
  habit_id   uuid    not null references public.habits(id) on delete cascade,
  user_id    uuid    not null references auth.users(id)    on delete cascade,
  log_date   date    not null,
  done       boolean not null default false,
  created_at timestamptz not null default now(),
  unique (habit_id, log_date)
);

-- 5. SAVINGS (metas de ahorro)
create table public.savings (
  id             uuid    primary key default gen_random_uuid(),
  user_id        uuid    not null references auth.users(id) on delete cascade,
  name           text    not null,
  goal           numeric not null,
  current_amount numeric not null default 0,
  deadline       date,
  created_at     timestamptz not null default now()
);

-- 6. SAVING_CONTRIBUTIONS (aportaciones individuales)
create table public.saving_contributions (
  id         uuid    primary key default gen_random_uuid(),
  saving_id  uuid    not null references public.savings(id) on delete cascade,
  user_id    uuid    not null references auth.users(id)     on delete cascade,
  amount     numeric not null,
  note       text,
  created_at timestamptz not null default now()
);

-- 7. MEALS (comidas por día de la semana y tiempo)
create table public.meals (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  day_of_week int  not null check (day_of_week between 0 and 6),
  slot        text not null,  -- desayuno | intermedio | comida | post_entreno | cena
  food        text default '',
  time        text default '',
  updated_at  timestamptz default now(),
  unique (user_id, day_of_week, slot)
);

-- 8. WORKOUTS (rutinas de ejercicio)
create table public.workouts (
  id         uuid   primary key default gen_random_uuid(),
  user_id    uuid   not null references auth.users(id) on delete cascade,
  name       text   not null,
  days       text[] not null default '{}',
  color      text   not null default '#185FA5',
  created_at timestamptz not null default now()
);

-- 9. WORKOUT_LOGS (días en que se completó cada rutina)
create table public.workout_logs (
  id         uuid primary key default gen_random_uuid(),
  workout_id uuid not null references public.workouts(id) on delete cascade,
  user_id    uuid not null references auth.users(id)      on delete cascade,
  log_date   date not null,
  created_at timestamptz not null default now(),
  unique (workout_id, log_date)
);

-- 10. INVENTORY (inventario de cocina)
create table public.inventory (
  id         uuid    primary key default gen_random_uuid(),
  user_id    uuid    not null references auth.users(id) on delete cascade,
  name       text    not null,
  cat        text    not null,
  unit       text    not null,
  qty        numeric not null default 0,
  max_qty    numeric not null default 100,
  created_at timestamptz not null default now()
);

-- 11. INVENTORY_LOGS (movimientos de inventario)
create table public.inventory_logs (
  id           uuid    primary key default gen_random_uuid(),
  inventory_id uuid    not null references public.inventory(id) on delete cascade,
  user_id      uuid    not null references auth.users(id)       on delete cascade,
  item_name    text    not null,
  move_type    text    not null check (move_type in ('use','buy')),
  qty          numeric not null,
  unit         text    not null,
  note         text    default '',
  log_date     text,
  created_at   timestamptz not null default now()
);


-- ─────────────────────────────────────────────────────────────
-- PARTE 2: FUNCIÓN HELPER + TRIGGER AUTOMÁTICO
-- ─────────────────────────────────────────────────────────────

-- Verifica si el usuario autenticado es admin.
-- "security definer" evita recursión infinita en las políticas RLS.
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- Trigger: crea perfil + suscripción FREE automáticamente al registrarse.
-- Actúa como red de seguridad si el insert del cliente falla.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.profiles (id, name, email, role, status)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    'user',
    'active'
  )
  on conflict (id) do nothing;

  insert into public.subscriptions (user_id, plan)
  values (new.id, 'free')
  on conflict (user_id) do nothing;

  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ─────────────────────────────────────────────────────────────
-- PARTE 3: ROW LEVEL SECURITY (RLS)
-- ─────────────────────────────────────────────────────────────

alter table public.profiles             enable row level security;
alter table public.subscriptions        enable row level security;
alter table public.habits               enable row level security;
alter table public.habit_logs           enable row level security;
alter table public.savings              enable row level security;
alter table public.saving_contributions enable row level security;
alter table public.meals                enable row level security;
alter table public.workouts             enable row level security;
alter table public.workout_logs         enable row level security;
alter table public.inventory            enable row level security;
alter table public.inventory_logs       enable row level security;

-- PROFILES
create policy "profiles_select" on public.profiles
  for select using ( auth.uid() = id or public.is_admin() );

create policy "profiles_insert" on public.profiles
  for insert with check ( auth.uid() = id );

create policy "profiles_update" on public.profiles
  for update using ( auth.uid() = id or public.is_admin() );

-- SUBSCRIPTIONS
create policy "subs_select" on public.subscriptions
  for select using ( auth.uid() = user_id );

create policy "subs_insert" on public.subscriptions
  for insert with check ( auth.uid() = user_id );

create policy "subs_update" on public.subscriptions
  for update using ( auth.uid() = user_id );

-- HABITS
create policy "habits_select" on public.habits for select using ( auth.uid() = user_id );
create policy "habits_insert" on public.habits for insert with check ( auth.uid() = user_id );
create policy "habits_update" on public.habits for update using ( auth.uid() = user_id );
create policy "habits_delete" on public.habits for delete using ( auth.uid() = user_id );

-- HABIT_LOGS
create policy "hlogs_select" on public.habit_logs for select using ( auth.uid() = user_id );
create policy "hlogs_insert" on public.habit_logs for insert with check ( auth.uid() = user_id );
create policy "hlogs_update" on public.habit_logs for update using ( auth.uid() = user_id );
create policy "hlogs_delete" on public.habit_logs for delete using ( auth.uid() = user_id );

-- SAVINGS
create policy "savings_select" on public.savings for select using ( auth.uid() = user_id );
create policy "savings_insert" on public.savings for insert with check ( auth.uid() = user_id );
create policy "savings_update" on public.savings for update using ( auth.uid() = user_id );
create policy "savings_delete" on public.savings for delete using ( auth.uid() = user_id );

-- SAVING_CONTRIBUTIONS
create policy "contrib_select" on public.saving_contributions
  for select using ( auth.uid() = user_id );
create policy "contrib_insert" on public.saving_contributions
  for insert with check ( auth.uid() = user_id );

-- MEALS
create policy "meals_select" on public.meals for select using ( auth.uid() = user_id );
create policy "meals_insert" on public.meals for insert with check ( auth.uid() = user_id );
create policy "meals_update" on public.meals for update using ( auth.uid() = user_id );
create policy "meals_delete" on public.meals for delete using ( auth.uid() = user_id );

-- WORKOUTS
create policy "wo_select" on public.workouts for select using ( auth.uid() = user_id );
create policy "wo_insert" on public.workouts for insert with check ( auth.uid() = user_id );
create policy "wo_update" on public.workouts for update using ( auth.uid() = user_id );
create policy "wo_delete" on public.workouts for delete using ( auth.uid() = user_id );

-- WORKOUT_LOGS
create policy "wlogs_select" on public.workout_logs for select using ( auth.uid() = user_id );
create policy "wlogs_insert" on public.workout_logs for insert with check ( auth.uid() = user_id );
create policy "wlogs_update" on public.workout_logs for update using ( auth.uid() = user_id );
create policy "wlogs_delete" on public.workout_logs for delete using ( auth.uid() = user_id );

-- INVENTORY
create policy "inv_select" on public.inventory for select using ( auth.uid() = user_id );
create policy "inv_insert" on public.inventory for insert with check ( auth.uid() = user_id );
create policy "inv_update" on public.inventory for update using ( auth.uid() = user_id );
create policy "inv_delete" on public.inventory for delete using ( auth.uid() = user_id );

-- INVENTORY_LOGS
create policy "invlog_select" on public.inventory_logs for select using ( auth.uid() = user_id );
create policy "invlog_insert" on public.inventory_logs for insert with check ( auth.uid() = user_id );


-- ─────────────────────────────────────────────────────────────
-- PARTE 4: CREAR EL PRIMER ADMIN
-- ─────────────────────────────────────────────────────────────
-- Ejecuta esto DESPUÉS de registrarte en la app por primera vez.
-- Reemplaza 'tu@correo.com' con tu correo real.

-- update public.profiles
-- set role = 'admin'
-- where email = 'tu@correo.com';


-- ─────────────────────────────────────────────────────────────
-- CONFIGURACIÓN EN SUPABASE DASHBOARD (no es SQL)
-- ─────────────────────────────────────────────────────────────
-- Authentication → Settings:
--   • Enable email confirmations → OFF
--   • Site URL → http://localhost:5173 (dev)
-- ─────────────────────────────────────────────────────────────
