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
