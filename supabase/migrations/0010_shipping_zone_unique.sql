-- ===========================================================================
-- 0010 · Add a unique constraint on shipping_zones.name
-- Both seeders (supabase/seed.sql and supabase/seed.ts) upsert shipping zones
-- by name, which requires this constraint to exist. Without it the seed errors
-- with "no unique or exclusion constraint matching the ON CONFLICT".
-- ===========================================================================
alter table shipping_zones add constraint shipping_zones_name_key unique (name);
