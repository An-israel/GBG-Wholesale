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
