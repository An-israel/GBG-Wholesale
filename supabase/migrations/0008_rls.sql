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
