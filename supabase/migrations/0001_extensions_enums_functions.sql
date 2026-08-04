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
