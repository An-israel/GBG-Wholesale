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
