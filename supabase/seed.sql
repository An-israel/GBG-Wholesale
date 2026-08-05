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
