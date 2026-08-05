-- ===========================================================================
-- 0002 · Identity and access (Part 4.2)
-- ===========================================================================

create table profiles (
  id uuid primary key references auth.users on delete cascade,
  email citext not null unique,
  first_name text,
  last_name text,
  phone text,
  role user_role not null default 'customer',
  buyer_type buyer_type not null default 'unknown',
  is_verified_buyer boolean not null default false,
  verified_at timestamptz,
  marketing_opt_in boolean not null default false,
  total_orders int not null default 0,
  lifetime_value_pence bigint not null default 0,
  first_order_at timestamptz,
  last_order_at timestamptz,
  acquisition_source text,
  notes text, -- admin only
  banned boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_profiles_updated before update on profiles for each row execute function set_updated_at();

create table addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles on delete cascade,
  label text,
  first_name text,
  last_name text,
  line1 text,
  line2 text,
  city text,
  county text,
  postcode text,
  country_code char(2) default 'GB',
  phone text,
  is_default_shipping boolean not null default false,
  is_default_billing boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_addresses_updated before update on addresses for each row execute function set_updated_at();

create table community_memberships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles on delete cascade,
  type membership_type not null,
  granted_at timestamptz not null default now(),
  granted_by uuid references profiles,
  revoked_at timestamptz,
  source text, -- first_purchase | manual | academy
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, type)
);
create trigger trg_memberships_updated before update on community_memberships for each row execute function set_updated_at();

-- Insert-only audit log. No update/delete policy exists for anyone (Part 4.2).
create table admin_audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid,
  actor_email text,
  action text,
  entity_type text,
  entity_id uuid,
  before jsonb,
  after jsonb,
  ip inet,
  user_agent text,
  created_at timestamptz not null default now()
);

-- --- New-user trigger (Part 4.7 #2) ----------------------------------------
create or replace function handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, first_name, last_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'first_name', ''),
    coalesce(new.raw_user_meta_data->>'last_name', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Guard: a non-admin may never change privileged columns on their own profile
-- (Part 5 critical rule). Enforced by trigger, not by policy alone.
create or replace function guard_profile_privileged_columns()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  caller_role user_role;
begin
  select role into caller_role from profiles where id = auth.uid();
  if caller_role is null or caller_role not in ('admin','super_admin') then
    if new.role is distinct from old.role
       or new.is_verified_buyer is distinct from old.is_verified_buyer
       or new.banned is distinct from old.banned
       or new.lifetime_value_pence is distinct from old.lifetime_value_pence
       or new.total_orders is distinct from old.total_orders then
      raise exception 'Not authorised to change privileged profile columns';
    end if;
  end if;
  return new;
end;
$$;

create trigger trg_profiles_guard before update on profiles
  for each row execute function guard_profile_privileged_columns();
