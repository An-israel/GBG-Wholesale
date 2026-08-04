/**
 * Site settings (Part 4.5 `site_settings`, Part 24 PENDING items).
 *
 * Every business fact the founder must confirm lives here as an editable
 * setting, never as hard-coded copy. Each unconfirmed value is marked
 * `PENDING_LAMI` so it is findable with a single search and editable from
 * Admin → Settings. At runtime these defaults are overlaid with the rows in
 * the `site_settings` table (see lib/data/settings.ts).
 */

export const PENDING = "PENDING_LAMI";

export type SiteSettings = {
  // Announcement bar
  "announcement.text": string;
  "announcement.link": string | null;
  "announcement.enabled": boolean;

  // Trust strip (only true claims)
  "trust.claims": string[];

  // Contact / support — PENDING_LAMI
  "support.whatsapp_number": string;
  "support.email": string;
  "support.hours": string;
  "support.response_promise": string;

  // Delivery & returns — PENDING_LAMI (drafts from the brief)
  "delivery.processing_days": string;
  "delivery.shipping_estimate": string;
  "delivery.customs_note": string;
  "returns.summary": string;
  "clearance.policy_summary": string;

  // Commerce rules — PENDING_LAMI
  "shipping.free_over_pence": number;
  "hub.auto_grant_on_first_purchase": boolean;
  "hub.minimum_spend_pence": number;

  // Links — PENDING_LAMI
  "links.sypb": string;
  "links.hub": string;
  "links.personal_shopper": string;
  "social.tiktok": string;
  "social.instagram": string;

  // Academy — PENDING_LAMI
  "academy.status": "waitlist" | "open";
  "academy.price": string;
  "academy.duration": string;
  "academy.curriculum": string[];

  // Legal / disclaimers — PENDING_LAMI
  "retail.disclaimer": string;

  // Trademark watchlist (Part 24 legal flag)
  "legal.trademark_watchlist": string[];
};

/**
 * Default values. Anything a real business decision has not yet set is marked
 * with the PENDING sentinel so admin knows it must be confirmed before launch.
 */
export const DEFAULT_SETTINGS: SiteSettings = {
  "announcement.text": "UK-based dispatch · Low minimum orders · Real photos of every item",
  "announcement.link": "/shop",
  "announcement.enabled": true,

  "trust.claims": [
    "UK-based dispatch",
    "Low minimum orders",
    "Real photos of every item",
    "Secure checkout",
  ],

  "support.whatsapp_number": process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || `${PENDING}_WHATSAPP`,
  "support.email": `${PENDING}_SUPPORT_EMAIL`,
  "support.hours": `${PENDING}: Mon–Fri, 9am–5pm (to be confirmed)`,
  "support.response_promise": `${PENDING}: We aim to reply within one working day`,

  "delivery.processing_days": `${PENDING} (draft: processed in 1–2 days)`,
  "delivery.shipping_estimate": `${PENDING} (draft: dispatched next day, delivered in 3–4 days)`,
  "delivery.customs_note": "International buyers are responsible for any customs duties.",
  "returns.summary": `${PENDING} (draft: faulty items only; clearance items are non-refundable)`,
  "clearance.policy_summary": `${PENDING} (draft: clearance stock is sold as-seen and non-refundable)`,

  "shipping.free_over_pence": 5000,
  "hub.auto_grant_on_first_purchase": true,
  "hub.minimum_spend_pence": 0,

  "links.sypb": `${PENDING}_SYPB_LINK`,
  "links.hub": `${PENDING}_HUB_LINK`,
  "links.personal_shopper": `${PENDING}_PERSONAL_SHOPPER_LINK`,
  "social.tiktok": `${PENDING}_TIKTOK`,
  "social.instagram": `${PENDING}_INSTAGRAM`,

  "academy.status": "waitlist",
  "academy.price": `${PENDING}_ACADEMY_PRICE`,
  "academy.duration": `${PENDING}_ACADEMY_DURATION`,
  "academy.curriculum": [],

  "retail.disclaimer":
    "Suggested retail prices are examples only, not a promise of earnings. Your results depend on how you price, market and sell.",

  "legal.trademark_watchlist": [
    "Stanley",
    "Coach",
    "Dior",
    "Chanel",
    "Love Shack Fancy",
    "SHEIN",
  ],
};

export type SettingKey = keyof SiteSettings;

/** Keys safe to read from the browser (Part 5 `is_public`). */
export const PUBLIC_SETTING_KEYS: SettingKey[] = [
  "announcement.text",
  "announcement.link",
  "announcement.enabled",
  "trust.claims",
  "support.whatsapp_number",
  "support.email",
  "support.hours",
  "support.response_promise",
  "delivery.processing_days",
  "delivery.shipping_estimate",
  "delivery.customs_note",
  "returns.summary",
  "clearance.policy_summary",
  "shipping.free_over_pence",
  "links.sypb",
  "links.hub",
  "links.personal_shopper",
  "social.tiktok",
  "social.instagram",
  "academy.status",
  "academy.price",
  "academy.duration",
  "academy.curriculum",
  "retail.disclaimer",
];
