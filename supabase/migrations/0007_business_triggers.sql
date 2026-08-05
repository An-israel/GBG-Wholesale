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
