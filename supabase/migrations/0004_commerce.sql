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
