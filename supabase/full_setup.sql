-- ===========================================================================
-- GBG Wholesale Hub — full database setup (one-paste).
-- Generated from supabase/migrations/*.sql + supabase/seed.sql, in order.
-- Paste this whole file into the Supabase SQL Editor and Run, on a FRESH
-- project. It creates the schema, RLS, triggers, storage buckets and the
-- essential settings/shipping seed. Run `npm run seed` afterwards for the
-- product catalogue, demo users and 40 sample orders (needs the service key).
-- ===========================================================================


-- >>>>>>>>>>>>>>>>>>>> supabase/migrations/0001_extensions_enums_functions.sql >>>>>>>>>>>>>>>>>>>>
-- ===========================================================================
-- 0001 · Extensions, enums, and shared functions (Part 4)
-- ===========================================================================
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm";
create extension if not exists "citext";
create extension if not exists "pgcrypto";

-- --- Enums (Part 4.1) ------------------------------------------------------
create type user_role as enum ('customer','verified_buyer','staff','admin','super_admin');
create type buyer_type as enum ('unknown','beginner','reseller','personal','graduate');
create type order_status as enum ('pending','paid','processing','shipped','delivered','cancelled','refunded','partially_refunded');
create type payment_status as enum ('unpaid','processing','paid','failed','refunded','partially_refunded');
create type fulfilment_status as enum ('unfulfilled','partially_fulfilled','fulfilled');
create type stock_status as enum ('in_stock','low_stock','sold_out','preorder','coming_soon');
create type product_status as enum ('draft','active','archived');
create type suitability as enum ('beginner_friendly','reseller','personal_use','clearance','new_arrival','best_seller');
create type request_status as enum ('new','reviewing','sourcing','stocked','declined');
create type contact_reason as enum ('order_issue','product_question','wholesale_enquiry','academy','community_access','returns','press','other');
create type submission_status as enum ('new','in_progress','resolved','spam');
create type article_status as enum ('draft','published','archived');
create type application_status as enum ('new','contacted','accepted','rejected','enrolled');
create type discount_type as enum ('percentage','fixed_amount','free_shipping');
create type membership_type as enum ('sypb','wholesale_hub');

-- --- Shared updated_at trigger (Part 4.7 #1) -------------------------------
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;


-- >>>>>>>>>>>>>>>>>>>> supabase/migrations/0002_identity.sql >>>>>>>>>>>>>>>>>>>>
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


-- >>>>>>>>>>>>>>>>>>>> supabase/migrations/0003_catalogue.sql >>>>>>>>>>>>>>>>>>>>
-- ===========================================================================
-- 0003 · Catalogue (Part 4.3)
-- ===========================================================================

create table categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  intro_copy text,
  who_it_suits text,
  banner_image text,
  icon text,
  parent_id uuid references categories,
  sort_order int not null default 0,
  is_active boolean not null default true,
  seo_title text,
  seo_description text,
  related_article_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_categories_updated before update on categories for each row execute function set_updated_at();

create table collections (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text,
  banner_image text,
  rule_type text not null default 'manual' check (rule_type in ('manual','automatic')),
  rules jsonb not null default '{}',
  sort_order int not null default 0,
  is_active boolean not null default true,
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_collections_updated before update on collections for each row execute function set_updated_at();

create table products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  sku text not null unique,
  category_id uuid references categories,
  status product_status not null default 'draft',
  short_description text,
  description_html text,
  what_you_receive text,
  who_it_suits text,
  why_buy text,
  materials text,
  dimensions text,
  weight_grams int,
  care_instructions text,
  box_contents text,
  wholesale_price_pence int not null,
  compare_at_price_pence int,
  suggested_retail_price_pence int,
  moq int not null default 1,
  pack_quantity int not null default 1,
  mix_and_match_allowed boolean not null default false,
  stock_quantity int not null default 0,
  low_stock_threshold int not null default 5,
  stock_status stock_status not null default 'sold_out', -- maintained by trigger
  allow_backorder boolean not null default false,
  suitability suitability[] not null default '{}',
  processing_days_min int,
  processing_days_max int,
  video_url text,
  is_featured boolean not null default false,
  sort_order int not null default 0,
  view_count bigint not null default 0,
  purchase_count bigint not null default 0,
  seo_title text,
  seo_description text,
  related_article_id uuid, -- FK added in 0005 once articles exists
  published_at timestamptz,
  search_vector tsvector,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_products_updated before update on products for each row execute function set_updated_at();

create table collection_products (
  collection_id uuid not null references collections on delete cascade,
  product_id uuid not null references products on delete cascade,
  position int not null default 0,
  primary key (collection_id, product_id)
);

create table product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products on delete cascade,
  name text not null,
  sku text not null unique,
  hex_or_swatch_url text,
  price_delta_pence int not null default 0,
  stock_quantity int not null default 0,
  moq_override int,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_variants_updated before update on product_variants for each row execute function set_updated_at();

create table product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products on delete cascade,
  variant_id uuid references product_variants on delete set null,
  storage_path text not null,
  alt_text text not null,
  position int not null default 0,
  is_primary boolean not null default false,
  width int,
  height int,
  blur_data_url text,
  created_at timestamptz not null default now()
);

create table product_faqs (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products on delete cascade,
  question text not null,
  answer text not null,
  position int not null default 0
);

create table product_relations (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products on delete cascade,
  related_product_id uuid not null references products on delete cascade,
  relation_type text not null check (relation_type in ('related','cross_sell','upsell')),
  position int not null default 0
);

-- Append-only stock ledger — the single source of stock truth (Part 4.3).
create table inventory_movements (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products on delete cascade,
  variant_id uuid references product_variants on delete cascade,
  delta int not null,
  reason text not null check (reason in ('order','refund','restock','correction','damage','reservation','release')),
  order_id uuid,
  actor_id uuid,
  note text,
  created_at timestamptz not null default now()
);


-- >>>>>>>>>>>>>>>>>>>> supabase/migrations/0004_commerce.sql >>>>>>>>>>>>>>>>>>>>
-- ===========================================================================
-- 0004 · Commerce (Part 4.4)
-- ===========================================================================

create table carts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles on delete cascade,
  anonymous_id text,
  currency char(3) not null default 'GBP',
  abandoned_email_sent_at timestamptz,
  converted_order_id uuid,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_carts_updated before update on carts for each row execute function set_updated_at();

create table cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null references carts on delete cascade,
  product_id uuid not null references products,
  variant_id uuid references product_variants,
  quantity int not null check (quantity > 0),
  unit_price_pence int not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_cart_items_updated before update on cart_items for each row execute function set_updated_at();

-- Order number sequence + generator (Part 4.7 #3): GBG- plus 6-digit sequence.
create sequence if not exists order_number_seq start 100001;

create table discount_codes (
  id uuid primary key default gen_random_uuid(),
  code citext not null unique,
  type discount_type not null,
  value int not null default 0,
  min_subtotal_pence int not null default 0,
  usage_limit int,
  usage_count int not null default 0,
  per_user_limit int,
  starts_at timestamptz,
  ends_at timestamptz,
  is_active boolean not null default true,
  applies_to jsonb not null default '{"all": true}',
  first_order_only boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_discounts_updated before update on discount_codes for each row execute function set_updated_at();

create table orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  user_id uuid references profiles on delete set null,
  email citext not null,
  status order_status not null default 'pending',
  payment_status payment_status not null default 'unpaid',
  fulfilment_status fulfilment_status not null default 'unfulfilled',
  currency char(3) not null default 'GBP',
  subtotal_pence int not null default 0,
  discount_pence int not null default 0,
  shipping_pence int not null default 0,
  tax_pence int not null default 0,
  total_pence int not null default 0,
  discount_code_id uuid references discount_codes,
  shipping_address jsonb,
  billing_address jsonb,
  shipping_method text,
  customer_note text,
  admin_note text,
  stripe_checkout_session_id text,
  stripe_payment_intent_id text,
  tracking_number text,
  tracking_url text,
  carrier text,
  shipped_at timestamptz,
  delivered_at timestamptz,
  cancelled_at timestamptz,
  is_international boolean not null default false,
  attribution jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_orders_updated before update on orders for each row execute function set_updated_at();

alter table carts add constraint carts_converted_order_fk
  foreign key (converted_order_id) references orders on delete set null;
alter table inventory_movements add constraint inventory_order_fk
  foreign key (order_id) references orders on delete set null;

-- Snapshots are mandatory so historical orders survive product edits (Part 4.4).
create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders on delete cascade,
  product_id uuid references products on delete set null,
  variant_id uuid references product_variants on delete set null,
  product_name_snapshot text not null,
  sku_snapshot text not null,
  variant_name_snapshot text,
  image_url_snapshot text,
  unit_price_pence int not null,
  quantity int not null,
  line_total_pence int not null,
  created_at timestamptz not null default now()
);

create table payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders on delete cascade,
  stripe_payment_intent_id text unique,
  amount_pence int not null,
  status text,
  method text,
  last4 text,
  brand text,
  receipt_url text,
  raw jsonb,
  created_at timestamptz not null default now()
);

create table refunds (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders on delete cascade,
  stripe_refund_id text unique,
  amount_pence int not null,
  reason text,
  actor_id uuid,
  status text,
  raw jsonb,
  created_at timestamptz not null default now()
);

create table shipping_zones (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  country_codes text[] not null default '{}',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table shipping_rates (
  id uuid primary key default gen_random_uuid(),
  zone_id uuid not null references shipping_zones on delete cascade,
  name text not null,
  description text,
  price_pence int not null default 0,
  min_subtotal_pence int,
  max_subtotal_pence int,
  free_over_pence int,
  estimated_days_min int,
  estimated_days_max int,
  sort_order int not null default 0
);

-- Webhook idempotency (Part 4.4 / Part 8.2).
create table stripe_events (
  id uuid primary key default gen_random_uuid(),
  stripe_event_id text not null unique,
  type text,
  payload jsonb,
  processed_at timestamptz not null default now()
);


-- >>>>>>>>>>>>>>>>>>>> supabase/migrations/0005_content.sql >>>>>>>>>>>>>>>>>>>>
-- ===========================================================================
-- 0005 · Content (Part 4.5)
-- ===========================================================================

create table learning_pillars (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text,
  icon text,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_pillars_updated before update on learning_pillars for each row execute function set_updated_at();

create table articles (
  id uuid primary key default gen_random_uuid(),
  pillar_id uuid references learning_pillars on delete set null,
  title text not null,
  slug text not null unique,
  excerpt text,
  key_takeaway text not null,
  body_html text,
  reading_minutes int,
  cover_image text,
  status article_status not null default 'draft',
  author_name text,
  published_at timestamptz,
  next_action_label text not null,
  next_action_href text not null,
  seo_title text,
  seo_description text,
  view_count bigint not null default 0,
  search_vector tsvector,
  is_recommended_for_beginners boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_articles_updated before update on articles for each row execute function set_updated_at();

-- Now that articles exists, wire the deferred FKs from 0003.
alter table products add constraint products_related_article_fk
  foreign key (related_article_id) references articles on delete set null;
alter table categories add constraint categories_related_article_fk
  foreign key (related_article_id) references articles on delete set null;

create table article_products (
  article_id uuid not null references articles on delete cascade,
  product_id uuid not null references products on delete cascade,
  position int not null default 0,
  primary key (article_id, product_id)
);

create table article_relations (
  article_id uuid not null references articles on delete cascade,
  related_article_id uuid not null references articles on delete cascade,
  position int not null default 0,
  primary key (article_id, related_article_id)
);

create table success_stories (
  id uuid primary key default gen_random_uuid(),
  customer_name text,
  customer_handle text,
  is_anonymised boolean not null default false,
  headline text,
  starting_point text,
  action_taken text,
  result text,
  lesson text,
  image_paths text[] not null default '{}',
  platform text,
  is_published boolean not null default false,
  is_featured boolean not null default false,
  sort_order int not null default 0,
  submitted_by_user_id uuid references profiles on delete set null,
  consent_given boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_stories_updated before update on success_stories for each row execute function set_updated_at();

create table story_submissions (
  id uuid primary key default gen_random_uuid(),
  name text,
  email citext,
  story text,
  images text[] not null default '{}',
  consent boolean not null default false,
  status submission_status not null default 'new',
  created_at timestamptz not null default now()
);

create table testimonials (
  id uuid primary key default gen_random_uuid(),
  author_name text,
  quote text,
  platform text,
  image_path text,
  rating int check (rating between 1 and 5),
  is_published boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table faq_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  sort_order int not null default 0
);

create table faqs (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references faq_categories on delete set null,
  question text not null,
  answer_html text not null,
  next_link_label text,
  next_link_href text,
  sort_order int not null default 0,
  is_published boolean not null default false,
  helpful_yes int not null default 0,
  helpful_no int not null default 0,
  search_vector tsvector,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_faqs_updated before update on faqs for each row execute function set_updated_at();

create table pages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  body_html text,
  last_reviewed_at timestamptz,
  is_published boolean not null default false,
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_pages_updated before update on pages for each row execute function set_updated_at();

-- Single-row-per-key settings (Part 4.5). is_public gates browser reads.
create table site_settings (
  key text primary key,
  value jsonb not null,
  description text,
  is_public boolean not null default false,
  updated_at timestamptz not null default now()
);
create trigger trg_settings_updated before update on site_settings for each row execute function set_updated_at();

create table academy_applications (
  id uuid primary key default gen_random_uuid(),
  name text,
  email citext,
  phone text,
  current_situation text,
  experience_level text,
  goals text,
  budget_confirmed boolean not null default false,
  status application_status not null default 'new',
  admin_notes text,
  source text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_academy_updated before update on academy_applications for each row execute function set_updated_at();

-- Demand intelligence (Part 4.5). Near-duplicate descriptions increment votes.
create table product_requests (
  id uuid primary key default gen_random_uuid(),
  name text,
  email citext,
  product_description text not null,
  category_hint text,
  quantity_interest text,
  price_expectation text,
  source_page text,
  status request_status not null default 'new',
  admin_notes text,
  vote_count int not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_requests_updated before update on product_requests for each row execute function set_updated_at();

create table contact_submissions (
  id uuid primary key default gen_random_uuid(),
  name text,
  email citext,
  phone text,
  reason contact_reason not null default 'other',
  order_number text,
  message text,
  attachments text[] not null default '{}',
  status submission_status not null default 'new',
  assigned_to uuid references profiles on delete set null,
  resolved_at timestamptz,
  ip inet,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_contact_updated before update on contact_submissions for each row execute function set_updated_at();

create table newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email citext not null unique,
  source text,
  confirmed boolean not null default false,
  confirmed_at timestamptz,
  unsubscribed_at timestamptz,
  tags text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table analytics_events (
  id uuid primary key default gen_random_uuid(),
  session_id text,
  user_id uuid references profiles on delete set null,
  event_name text not null,
  properties jsonb not null default '{}',
  path text,
  referrer text,
  utm jsonb,
  ttclid text,
  device text,
  created_at timestamptz not null default now()
);

create table search_queries (
  id uuid primary key default gen_random_uuid(),
  query text not null,
  results_count int not null default 0,
  user_id uuid references profiles on delete set null,
  clicked_result text,
  created_at timestamptz not null default now()
);

-- Email delivery log (Part 15).
create table email_log (
  id uuid primary key default gen_random_uuid(),
  to_email text not null,
  template text not null,
  subject text,
  status text not null default 'sent',
  error text,
  created_at timestamptz not null default now()
);


-- >>>>>>>>>>>>>>>>>>>> supabase/migrations/0006_indexes_search.sql >>>>>>>>>>>>>>>>>>>>
-- ===========================================================================
-- 0006 · Indexes and full-text search (Part 4.6)
-- ===========================================================================

create index idx_products_search on products using gin (search_vector);
create index idx_products_status_cat on products (status, category_id, published_at desc);
create index idx_products_stock_active on products (stock_status) where status = 'active';
create index idx_products_name_trgm on products using gin (name gin_trgm_ops);
create index idx_order_items_order on order_items (order_id);
create index idx_orders_user on orders (user_id, created_at desc);
create index idx_orders_email on orders (email);
create index idx_orders_status on orders (status, created_at desc);
create index idx_inventory_product on inventory_movements (product_id, created_at desc);
create index idx_analytics_created on analytics_events using brin (created_at);
create index idx_articles_search on articles using gin (search_vector);
create index idx_faqs_search on faqs using gin (search_vector);
create index idx_cart_items_cart on cart_items (cart_id);
create index idx_collection_products_col on collection_products (collection_id, position);

-- --- Search-vector maintenance (Part 4.6, weighting A/B/C) ------------------
create or replace function products_search_vector()
returns trigger language plpgsql as $$
begin
  new.search_vector :=
    setweight(to_tsvector('english', coalesce(new.name,'') || ' ' || coalesce(new.sku,'')), 'A') ||
    setweight(to_tsvector('english', coalesce(new.short_description,'')), 'B') ||
    setweight(to_tsvector('english', coalesce(new.description_html,'')), 'C');
  return new;
end;
$$;
create trigger trg_products_search before insert or update on products
  for each row execute function products_search_vector();

create or replace function articles_search_vector()
returns trigger language plpgsql as $$
begin
  new.search_vector :=
    setweight(to_tsvector('english', coalesce(new.title,'')), 'A') ||
    setweight(to_tsvector('english', coalesce(new.excerpt,'') || ' ' || coalesce(new.key_takeaway,'')), 'B') ||
    setweight(to_tsvector('english', coalesce(new.body_html,'')), 'C');
  return new;
end;
$$;
create trigger trg_articles_search before insert or update on articles
  for each row execute function articles_search_vector();

create or replace function faqs_search_vector()
returns trigger language plpgsql as $$
begin
  new.search_vector :=
    setweight(to_tsvector('english', coalesce(new.question,'')), 'A') ||
    setweight(to_tsvector('english', coalesce(new.answer_html,'')), 'B');
  return new;
end;
$$;
create trigger trg_faqs_search before insert or update on faqs
  for each row execute function faqs_search_vector();

-- --- Unified search used by /search (Part 4.6) -----------------------------
create or replace function search_all(q text, lim int default 20)
returns table (kind text, id uuid, title text, slug text, excerpt text, image text, price_pence int, rank real)
language sql stable as $$
  select 'product' as kind, p.id, p.name as title, p.slug,
         p.short_description as excerpt,
         (select storage_path from product_images pi where pi.product_id = p.id order by is_primary desc, position asc limit 1) as image,
         p.wholesale_price_pence as price_pence,
         ts_rank(p.search_vector, plainto_tsquery('english', q)) as rank
  from products p
  where p.status = 'active' and p.search_vector @@ plainto_tsquery('english', q)
  union all
  select 'collection', c.id, c.title, c.slug, c.description, c.banner_image, null,
         similarity(c.title, q) as rank
  from collections c
  where c.is_active and (c.title ilike '%'||q||'%' or c.description ilike '%'||q||'%')
  union all
  select 'article', a.id, a.title, a.slug, a.excerpt, a.cover_image, null,
         ts_rank(a.search_vector, plainto_tsquery('english', q)) as rank
  from articles a
  where a.status = 'published' and a.search_vector @@ plainto_tsquery('english', q)
  union all
  select 'faq', f.id, f.question, null, f.answer_html, null, null,
         ts_rank(f.search_vector, plainto_tsquery('english', q)) as rank
  from faqs f
  where f.is_published and f.search_vector @@ plainto_tsquery('english', q)
  order by rank desc nulls last
  limit lim;
$$;


-- >>>>>>>>>>>>>>>>>>>> supabase/migrations/0007_business_triggers.sql >>>>>>>>>>>>>>>>>>>>
-- ===========================================================================
-- 0007 · Business logic triggers and functions (Part 4.7)
-- ===========================================================================

-- --- Order number (Part 4.7 #3): GBG- plus a 6-digit sequence --------------
create or replace function generate_order_number()
returns trigger language plpgsql as $$
begin
  if new.order_number is null or new.order_number = '' then
    new.order_number := 'GBG-' || lpad(nextval('order_number_seq')::text, 6, '0');
  end if;
  return new;
end;
$$;
create trigger trg_orders_number before insert on orders
  for each row execute function generate_order_number();

-- --- Stock ledger → cached stock + status (Part 4.7 #4) --------------------
-- Stock is only ever changed by inserting an inventory_movements row.
create or replace function apply_inventory_movement()
returns trigger language plpgsql as $$
declare
  new_qty int;
  threshold int;
begin
  if new.variant_id is not null then
    update product_variants
      set stock_quantity = stock_quantity + new.delta
      where id = new.variant_id
      returning stock_quantity into new_qty;
  end if;

  update products
    set stock_quantity = stock_quantity + new.delta
    where id = new.product_id
    returning stock_quantity, low_stock_threshold into new_qty, threshold;

  update products
    set stock_status = case
      when allow_backorder and new_qty <= 0 then 'preorder'::stock_status
      when new_qty <= 0 then 'sold_out'::stock_status
      when new_qty <= threshold then 'low_stock'::stock_status
      else 'in_stock'::stock_status
    end
    where id = new.product_id;

  return new;
end;
$$;
create trigger trg_inventory_apply after insert on inventory_movements
  for each row execute function apply_inventory_movement();

-- --- On order paid (Part 4.7 #5) -------------------------------------------
-- Writes negative movements per line, bumps counters, grants Hub membership
-- subject to the hub.auto_grant_on_first_purchase / minimum_spend settings.
create or replace function on_order_paid()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  item record;
  auto_grant boolean;
  min_spend int;
begin
  if new.payment_status = 'paid' and old.payment_status is distinct from 'paid' then
    -- Decrement stock through the ledger (never a direct write).
    for item in select * from order_items where order_id = new.id loop
      insert into inventory_movements (product_id, variant_id, delta, reason, order_id)
      values (item.product_id, item.variant_id, -item.quantity, 'order', new.id);

      update products set purchase_count = purchase_count + item.quantity
        where id = item.product_id;
    end loop;

    -- Update the buyer profile counters.
    if new.user_id is not null then
      update profiles set
        total_orders = total_orders + 1,
        lifetime_value_pence = lifetime_value_pence + new.total_pence,
        last_order_at = now(),
        first_order_at = coalesce(first_order_at, now())
      where id = new.user_id;

      select coalesce((value)::boolean, true) into auto_grant
        from site_settings where key = 'hub.auto_grant_on_first_purchase';
      select coalesce((value)::int, 0) into min_spend
        from site_settings where key = 'hub.minimum_spend_pence';

      if coalesce(auto_grant, true) and new.total_pence >= coalesce(min_spend, 0) then
        update profiles set is_verified_buyer = true, verified_at = coalesce(verified_at, now())
          where id = new.user_id;
        insert into community_memberships (user_id, type, source)
          values (new.user_id, 'wholesale_hub', 'first_purchase')
          on conflict (user_id, type) do nothing;
      end if;
    end if;
  end if;
  return new;
end;
$$;
create trigger trg_order_paid after update on orders
  for each row execute function on_order_paid();

-- --- On order refunded with restock (Part 4.7 #6) --------------------------
create or replace function on_order_refunded()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  item record;
begin
  if new.status in ('refunded','partially_refunded') and old.status is distinct from new.status then
    if coalesce((new.admin_note ilike '%restock%'), false) then
      for item in select * from order_items where order_id = new.id loop
        insert into inventory_movements (product_id, variant_id, delta, reason, order_id)
        values (item.product_id, item.variant_id, item.quantity, 'refund', new.id);
      end loop;
    end if;
  end if;
  return new;
end;
$$;
create trigger trg_order_refunded after update on orders
  for each row execute function on_order_refunded();

-- --- Generic audit trigger (Part 4.7 #7) -----------------------------------
create or replace function audit_trigger()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  actor uuid := auth.uid();
  actor_email text;
  rec jsonb;
  eid uuid;
begin
  select email into actor_email from profiles where id = actor;
  -- Derive the entity id from the row as JSON, so this works for any audited
  -- table regardless of its primary key. Tables without a uuid `id` column
  -- (e.g. site_settings, keyed by `key`) simply record a null entity_id.
  rec := case when tg_op = 'DELETE' then to_jsonb(old) else to_jsonb(new) end;
  begin
    eid := nullif(rec->>'id', '')::uuid;
  exception when others then
    eid := null;
  end;
  insert into admin_audit_log (actor_id, actor_email, action, entity_type, entity_id, before, after)
  values (
    actor, actor_email, tg_op, tg_table_name, eid,
    case when tg_op in ('UPDATE','DELETE') then to_jsonb(old) else null end,
    case when tg_op in ('UPDATE','INSERT') then to_jsonb(new) else null end
  );
  return coalesce(new, old);
end;
$$;

create trigger trg_audit_products after insert or update or delete on products for each row execute function audit_trigger();
create trigger trg_audit_orders after insert or update or delete on orders for each row execute function audit_trigger();
create trigger trg_audit_discounts after insert or update or delete on discount_codes for each row execute function audit_trigger();
create trigger trg_audit_pages after insert or update or delete on pages for each row execute function audit_trigger();
create trigger trg_audit_settings after insert or update or delete on site_settings for each row execute function audit_trigger();
create trigger trg_audit_profiles after update on profiles for each row execute function audit_trigger();

-- --- Rate-limited view-count increment (Part 4.7 #9) -----------------------
create table if not exists view_count_guard (
  key text primary key,
  last_at timestamptz not null default now()
);

create or replace function increment_view_count(p_product_id uuid, p_session text)
returns void language plpgsql security definer set search_path = public as $$
declare
  guard_key text := 'pv:' || p_product_id || ':' || coalesce(p_session,'anon');
  last timestamptz;
begin
  select last_at into last from view_count_guard where key = guard_key;
  if last is not null and last > now() - interval '30 minutes' then
    return; -- already counted this session recently
  end if;
  insert into view_count_guard (key) values (guard_key)
    on conflict (key) do update set last_at = now();
  update products set view_count = view_count + 1 where id = p_product_id;
end;
$$;


-- >>>>>>>>>>>>>>>>>>>> supabase/migrations/0008_rls.sql >>>>>>>>>>>>>>>>>>>>
-- ===========================================================================
-- 0008 · Row Level Security (Part 5)
-- RLS is enabled on EVERY table without exception, including content tables.
-- ===========================================================================

-- --- Role helper functions (security definer) ------------------------------
create or replace function auth_role() returns user_role
  language sql stable security definer set search_path = public as $$
  select role from profiles where id = auth.uid()
$$;

create or replace function is_staff() returns boolean
  language sql stable security definer set search_path = public as $$
  select coalesce(auth_role() in ('staff','admin','super_admin'), false)
$$;

create or replace function is_admin() returns boolean
  language sql stable security definer set search_path = public as $$
  select coalesce(auth_role() in ('admin','super_admin'), false)
$$;

create or replace function is_super_admin() returns boolean
  language sql stable security definer set search_path = public as $$
  select coalesce(auth_role() = 'super_admin', false)
$$;

create or replace function is_verified_buyer() returns boolean
  language sql stable security definer set search_path = public as $$
  select coalesce((select is_verified_buyer from profiles where id = auth.uid()), false)
$$;

-- Guest order lookup (Part 5): returns exactly one order matched by number+email.
create or replace function lookup_order(p_order_number text, p_email text)
returns table (order_number text, status order_status, fulfilment_status fulfilment_status,
               total_pence int, tracking_number text, tracking_url text, carrier text, created_at timestamptz)
language sql stable security definer set search_path = public as $$
  select o.order_number, o.status, o.fulfilment_status, o.total_pence,
         o.tracking_number, o.tracking_url, o.carrier, o.created_at
  from orders o
  where o.order_number = p_order_number and lower(o.email) = lower(p_email)
  limit 1;
$$;

-- --- Enable RLS on every table ---------------------------------------------
do $$
declare t text;
begin
  for t in
    select tablename from pg_tables where schemaname = 'public'
      and tablename not in ('view_count_guard')
  loop
    execute format('alter table public.%I enable row level security;', t);
  end loop;
end $$;

-- --- Public catalogue: read active/published only --------------------------
create policy pub_read_products on products for select
  using (status = 'active' or is_staff());
create policy staff_all_products on products for all using (is_admin()) with check (is_admin());

create policy pub_read_variants on product_variants for select
  using (exists (select 1 from products p where p.id = product_id and (p.status='active' or is_staff())));
create policy staff_all_variants on product_variants for all using (is_admin()) with check (is_admin());

create policy pub_read_images on product_images for select
  using (exists (select 1 from products p where p.id = product_id and (p.status='active' or is_staff())));
create policy staff_all_images on product_images for all using (is_admin()) with check (is_admin());

create policy pub_read_pfaqs on product_faqs for select
  using (exists (select 1 from products p where p.id = product_id and (p.status='active' or is_staff())));
create policy staff_all_pfaqs on product_faqs for all using (is_admin()) with check (is_admin());

create policy pub_read_prelations on product_relations for select using (true);
create policy staff_all_prelations on product_relations for all using (is_admin()) with check (is_admin());

create policy pub_read_categories on categories for select using (is_active or is_staff());
create policy staff_all_categories on categories for all using (is_admin()) with check (is_admin());

create policy pub_read_collections on collections for select using (is_active or is_staff());
create policy staff_all_collections on collections for all using (is_admin()) with check (is_admin());

create policy pub_read_collprod on collection_products for select using (true);
create policy staff_all_collprod on collection_products for all using (is_admin()) with check (is_admin());

create policy pub_read_pillars on learning_pillars for select using (true);
create policy staff_all_pillars on learning_pillars for all using (is_admin()) with check (is_admin());

create policy pub_read_articles on articles for select using (status = 'published' or is_staff());
create policy staff_all_articles on articles for all using (is_admin()) with check (is_admin());

create policy pub_read_artprod on article_products for select using (true);
create policy staff_all_artprod on article_products for all using (is_admin()) with check (is_admin());
create policy pub_read_artrel on article_relations for select using (true);
create policy staff_all_artrel on article_relations for all using (is_admin()) with check (is_admin());

create policy pub_read_faqcats on faq_categories for select using (true);
create policy staff_all_faqcats on faq_categories for all using (is_admin()) with check (is_admin());

create policy pub_read_faqs on faqs for select using (is_published or is_staff());
create policy staff_all_faqs on faqs for all using (is_admin()) with check (is_admin());

create policy pub_read_pages on pages for select using (is_published or is_staff());
create policy staff_all_pages on pages for all using (is_admin()) with check (is_admin());

create policy pub_read_testimonials on testimonials for select using (is_published or is_staff());
create policy staff_all_testimonials on testimonials for all using (is_admin()) with check (is_admin());

create policy pub_read_stories on success_stories for select using (is_published or is_staff());
create policy staff_all_stories on success_stories for all using (is_admin()) with check (is_admin());

-- site_settings: only keys flagged is_public are readable by anon/customers.
create policy pub_read_settings on site_settings for select using (is_public or is_staff());
create policy staff_all_settings on site_settings for all using (is_admin()) with check (is_admin());

-- --- Profiles: self read/update, privileged columns blocked by trigger -----
create policy self_read_profile on profiles for select using (id = auth.uid() or is_staff());
create policy self_update_profile on profiles for update using (id = auth.uid()) with check (id = auth.uid());
create policy admin_all_profiles on profiles for all using (is_admin()) with check (is_admin());

-- --- Addresses: full CRUD on own rows --------------------------------------
create policy own_addresses on addresses for all
  using (user_id = auth.uid() or is_staff())
  with check (user_id = auth.uid() or is_admin());

-- --- Carts: own rows (anon carts are resolved server-side via signed cookie)
create policy own_carts on carts for all
  using (user_id = auth.uid() or is_staff())
  with check (user_id = auth.uid() or user_id is null or is_admin());
create policy own_cart_items on cart_items for all
  using (exists (select 1 from carts c where c.id = cart_id and (c.user_id = auth.uid() or c.user_id is null)) or is_staff())
  with check (exists (select 1 from carts c where c.id = cart_id and (c.user_id = auth.uid() or c.user_id is null)) or is_admin());

-- --- Orders: customers read own; no customer insert (server-only) ----------
create policy own_orders on orders for select using (user_id = auth.uid() or is_staff());
create policy staff_update_orders on orders for update using (is_staff()) with check (is_staff());
create policy admin_insert_orders on orders for insert with check (is_admin());
create policy admin_delete_orders on orders for delete using (is_super_admin());

create policy own_order_items on order_items for select
  using (exists (select 1 from orders o where o.id = order_id and (o.user_id = auth.uid() or is_staff())));
create policy admin_write_order_items on order_items for all using (is_admin()) with check (is_admin());

-- --- Payments / refunds / stripe_events: staff read, admin write -----------
create policy staff_read_payments on payments for select using (is_staff());
create policy admin_all_payments on payments for all using (is_admin()) with check (is_admin());
create policy staff_read_refunds on refunds for select using (is_staff());
create policy admin_all_refunds on refunds for all using (is_admin()) with check (is_admin());
create policy staff_read_events on stripe_events for select using (is_staff());
create policy admin_all_events on stripe_events for all using (is_admin()) with check (is_admin());

-- --- Inventory movements: staff read; insert only; never update/delete -----
create policy staff_read_inventory on inventory_movements for select using (is_staff());
create policy staff_insert_inventory on inventory_movements for insert with check (is_staff());

-- --- Discount codes: validated only through server functions ---------------
create policy staff_read_discounts on discount_codes for select using (is_staff());
create policy admin_all_discounts on discount_codes for all using (is_admin()) with check (is_admin());

-- --- Shipping ---------------------------------------------------------------
create policy pub_read_zones on shipping_zones for select using (true);
create policy admin_all_zones on shipping_zones for all using (is_admin()) with check (is_admin());
create policy pub_read_rates on shipping_rates for select using (true);
create policy admin_all_rates on shipping_rates for all using (is_admin()) with check (is_admin());

-- --- Public submission tables: insert only, no public select ---------------
create policy insert_product_requests on product_requests for insert with check (true);
create policy staff_manage_product_requests on product_requests for select using (is_staff());
create policy admin_all_product_requests on product_requests for all using (is_admin()) with check (is_admin());

create policy insert_contact on contact_submissions for insert with check (true);
create policy staff_read_contact on contact_submissions for select using (is_staff());
create policy staff_update_contact on contact_submissions for update using (is_staff()) with check (is_staff());
create policy admin_all_contact on contact_submissions for all using (is_admin()) with check (is_admin());

create policy insert_story on story_submissions for insert with check (true);
create policy staff_read_story on story_submissions for select using (is_staff());
create policy admin_all_story on story_submissions for all using (is_admin()) with check (is_admin());

create policy insert_academy on academy_applications for insert with check (true);
create policy staff_read_academy on academy_applications for select using (is_staff());
create policy staff_update_academy on academy_applications for update using (is_staff()) with check (is_staff());
create policy admin_all_academy on academy_applications for all using (is_admin()) with check (is_admin());

create policy insert_newsletter on newsletter_subscribers for insert with check (true);
create policy staff_read_newsletter on newsletter_subscribers for select using (is_staff());
create policy admin_all_newsletter on newsletter_subscribers for all using (is_admin()) with check (is_admin());

-- --- Analytics / search: insert only; staff read ---------------------------
create policy insert_analytics on analytics_events for insert with check (true);
create policy staff_read_analytics on analytics_events for select using (is_staff());
create policy insert_search on search_queries for insert with check (true);
create policy staff_read_search on search_queries for select using (is_staff());

-- --- Community memberships --------------------------------------------------
create policy own_memberships on community_memberships for select using (user_id = auth.uid() or is_staff());
create policy admin_all_memberships on community_memberships for all using (is_admin()) with check (is_admin());

-- --- Audit log: staff read, insert only, never update/delete ---------------
create policy staff_read_audit on admin_audit_log for select using (is_staff());
create policy insert_audit on admin_audit_log for insert with check (true);

-- --- Email log --------------------------------------------------------------
create policy staff_read_email_log on email_log for select using (is_staff());
create policy insert_email_log on email_log for insert with check (true);


-- >>>>>>>>>>>>>>>>>>>> supabase/migrations/0009_storage.sql >>>>>>>>>>>>>>>>>>>>
-- ===========================================================================
-- 0009 · Storage buckets and policies (Part 7)
-- Only staff and above may write to public buckets, enforced here (not just UI).
-- ===========================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  ('products', 'products', true, 5242880, array['image/jpeg','image/png','image/webp','image/avif']),
  ('product-videos', 'product-videos', true, 104857600, array['video/mp4','video/webm']),
  ('content', 'content', true, 5242880, array['image/jpeg','image/png','image/webp','image/avif']),
  ('stories', 'stories', true, 5242880, array['image/jpeg','image/png','image/webp','image/avif']),
  ('founder', 'founder', true, 5242880, array['image/jpeg','image/png','image/webp','image/avif']),
  ('submissions', 'submissions', false, 5242880, array['image/jpeg','image/png','image/webp','application/pdf'])
on conflict (id) do nothing;

-- Public read on the public buckets.
create policy "public read public buckets" on storage.objects for select
  using (bucket_id in ('products','product-videos','content','stories','founder'));

-- Only staff may write/update/delete in public buckets.
create policy "staff write public buckets" on storage.objects for insert
  with check (bucket_id in ('products','product-videos','content','stories','founder') and is_staff());
create policy "staff update public buckets" on storage.objects for update
  using (bucket_id in ('products','product-videos','content','stories','founder') and is_staff());
create policy "staff delete public buckets" on storage.objects for delete
  using (bucket_id in ('products','product-videos','content','stories','founder') and is_admin());

-- Submissions bucket: anyone may upload (public forms), only staff may read.
create policy "anyone upload submissions" on storage.objects for insert
  with check (bucket_id = 'submissions');
create policy "staff read submissions" on storage.objects for select
  using (bucket_id = 'submissions' and is_staff());


-- >>>>>>>>>>>>>>>>>>>> supabase/migrations/0010_shipping_zone_unique.sql >>>>>>>>>>>>>>>>>>>>
-- ===========================================================================
-- 0010 · Add a unique constraint on shipping_zones.name
-- Both seeders (supabase/seed.sql and supabase/seed.ts) upsert shipping zones
-- by name, which requires this constraint to exist. Without it the seed errors
-- with "no unique or exclusion constraint matching the ON CONFLICT".
-- ===========================================================================
alter table shipping_zones add constraint shipping_zones_name_key unique (name);


-- >>>>>>>>>>>>>>>>>>>> supabase/seed.sql >>>>>>>>>>>>>>>>>>>>
-- ===========================================================================
-- seed.sql — essential non-user seed data (settings + shipping).
-- The full catalogue, users and 40 demo orders are seeded by `npm run seed`
-- (supabase/seed.ts), which needs the service role key. This file covers the
-- data that `supabase db reset` can safely apply on its own.
-- ===========================================================================

insert into site_settings (key, value, is_public, description) values
  ('announcement.enabled', 'true', true, 'Show the announcement bar'),
  ('announcement.text', '"UK-based dispatch · Low minimum orders · Real photos of every item"', true, 'Announcement bar text'),
  ('announcement.link', '"/shop"', true, 'Announcement bar link'),
  ('trust.claims', '["UK-based dispatch","Low minimum orders","Real photos of every item","Secure checkout"]', true, 'Trust strip claims'),
  ('shipping.free_over_pence', '5000', true, 'Free shipping threshold in pence'),
  ('hub.auto_grant_on_first_purchase', 'true', false, 'Grant Wholesale Hub on first paid order'),
  ('hub.minimum_spend_pence', '0', false, 'Minimum spend to unlock the Hub'),
  ('retail.disclaimer', '"Suggested retail prices are examples only, not a promise of earnings. Your results depend on how you price, market and sell."', true, 'Retail disclaimer wording'),
  ('support.whatsapp_number', '"PENDING_LAMI_WHATSAPP"', true, 'PENDING_LAMI — confirmed WhatsApp number'),
  ('support.email', '"PENDING_LAMI_SUPPORT_EMAIL"', true, 'PENDING_LAMI — support email'),
  ('academy.status', '"waitlist"', true, 'PENDING_LAMI — academy open or waitlist')
on conflict (key) do nothing;

insert into shipping_zones (name, country_codes, is_active) values
  ('United Kingdom', array['GB'], true),
  ('International', array['IE','FR','DE','US'], true)
on conflict do nothing;
