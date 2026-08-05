/**
 * Transactional email templates (Part 15). Brand-tokened, mobile-first, single
 * column, 600px max, each with a plain-text fallback. Rendered as self-contained
 * HTML strings (inlined styles for Gmail/Outlook/iOS Mail compatibility) and
 * sent through the single `sendEmail()` wrapper.
 */
import { formatPence } from "@/lib/utils/format";

const NAVY = "#0D1B2A";
const CREAM = "#FFFDD0";
const GOLD = "#C9A84C";
const INK = "#0D1B2A";
const INK70 = "#46525F";
const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export type EmailTemplate = { subject: string; html: string; text: string };

function shell(title: string, bodyHtml: string): string {
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title></head>
  <body style="margin:0;padding:0;background:#FBF9F4;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:${INK};">
    <div style="max-width:600px;margin:0 auto;padding:24px;">
      <div style="background:${NAVY};color:${CREAM};padding:20px 24px;border-radius:12px 12px 0 0;">
        <span style="font-size:22px;font-weight:700;font-family:Georgia,serif;">GBG Wholesale</span>
      </div>
      <div style="background:#ffffff;padding:24px;border:1px solid #E6E3DA;border-top:0;border-radius:0 0 12px 12px;">
        ${bodyHtml}
      </div>
      <p style="color:${INK70};font-size:12px;text-align:center;margin-top:16px;">
        GBG — Global Biz Gateway · <a href="${SITE}" style="color:${INK70};">${SITE.replace(/^https?:\/\//, "")}</a>
      </p>
    </div>
  </body></html>`;
}

function button(href: string, label: string): string {
  return `<a href="${href}" style="display:inline-block;background:${GOLD};color:${NAVY};font-weight:700;text-decoration:none;padding:12px 22px;border-radius:6px;margin-top:12px;">${label}</a>`;
}

export function welcomeEmail(firstName?: string): EmailTemplate {
  const name = firstName ? ` ${firstName}` : "";
  return {
    subject: "Welcome to GBG Wholesale",
    html: shell("Welcome", `<h1 style="font-family:Georgia,serif;">Welcome${name}</h1>
      <p style="color:${INK70};">You're all set. Start with a small, beginner-friendly order, or read a guide first — no pressure either way.</p>
      ${button(`${SITE}/start-here`, "Start here")}`),
    text: `Welcome${name}. Start here: ${SITE}/start-here`,
  };
}

export function orderConfirmationEmail(args: {
  orderNumber: string;
  items: { name: string; quantity: number; lineTotalPence: number }[];
  totalPence: number;
  hubUnlocked: boolean;
  hubLink?: string;
}): EmailTemplate {
  const rows = args.items
    .map((i) => `<tr><td style="padding:6px 0;color:${INK70};">${i.quantity} × ${i.name}</td><td style="padding:6px 0;text-align:right;">${formatPence(i.lineTotalPence)}</td></tr>`)
    .join("");
  const hub = args.hubUnlocked
    ? `<div style="background:#FBF4E0;border:1px solid ${GOLD};border-radius:8px;padding:16px;margin-top:16px;">
         <strong>Your Wholesale Hub is unlocked.</strong>
         <p style="color:${INK70};margin:6px 0 0;">Restock alerts, buyer-only drops and direct guidance.</p>
         ${button(args.hubLink ?? `${SITE}/account/hub`, "Open the Hub")}
       </div>`
    : `<p style="color:${INK70};margin-top:16px;">Place a qualifying order to unlock the Wholesale Hub.</p>`;
  return {
    subject: `Order confirmed — ${args.orderNumber}`,
    html: shell("Order confirmed", `<h1 style="font-family:Georgia,serif;">Thank you — order confirmed</h1>
      <p style="color:${INK70};">Order <strong>${args.orderNumber}</strong>. We'll email tracking when it ships (processed in 1–2 working days).</p>
      <table style="width:100%;border-collapse:collapse;margin-top:12px;border-top:1px solid #E6E3DA;">${rows}
        <tr><td style="padding:10px 0;font-weight:700;border-top:1px solid #E6E3DA;">Total</td><td style="padding:10px 0;text-align:right;font-weight:700;border-top:1px solid #E6E3DA;">${formatPence(args.totalPence)}</td></tr>
      </table>
      ${hub}
      <p style="color:${INK70};margin-top:16px;">While you wait, get your listings ready:</p>
      ${button(`${SITE}/learn/selling-successfully/photos-that-sell`, "Photos that sell")}`),
    text: `Order ${args.orderNumber} confirmed. Total ${formatPence(args.totalPence)}. ${SITE}/order/${args.orderNumber}/confirmation`,
  };
}

export function orderShippedEmail(args: { orderNumber: string; trackingNumber: string; trackingUrl?: string; carrier?: string }): EmailTemplate {
  return {
    subject: `Your order has shipped — ${args.orderNumber}`,
    html: shell("Shipped", `<h1 style="font-family:Georgia,serif;">On its way</h1>
      <p style="color:${INK70};">Order <strong>${args.orderNumber}</strong> has been dispatched${args.carrier ? ` with ${args.carrier}` : ""}.</p>
      <p style="color:${INK70};">Tracking: <strong>${args.trackingNumber}</strong></p>
      ${args.trackingUrl ? button(args.trackingUrl, "Track your parcel") : ""}`),
    text: `Order ${args.orderNumber} shipped. Tracking ${args.trackingNumber}. ${args.trackingUrl ?? ""}`,
  };
}

export function paymentFailedEmail(args: { recoveryUrl: string }): EmailTemplate {
  return {
    subject: "There was a problem with your payment",
    html: shell("Payment failed", `<h1 style="font-family:Georgia,serif;">Let's try that again</h1>
      <p style="color:${INK70};">Your payment didn't go through, so your order isn't confirmed yet. You can pick up where you left off.</p>
      ${button(args.recoveryUrl, "Complete your order")}`),
    text: `Your payment failed. Complete your order: ${args.recoveryUrl}`,
  };
}

export function abandonedCartEmail(args: { cartUrl: string }): EmailTemplate {
  return {
    subject: "You left something behind",
    html: shell("Your cart", `<h1 style="font-family:Georgia,serif;">Still thinking it over?</h1>
      <p style="color:${INK70};">Your cart is waiting. Prices and stock are re-checked at checkout, so you're only ever charged the right amount.</p>
      ${button(args.cartUrl, "Return to your cart")}`),
    text: `Your cart is waiting: ${args.cartUrl}`,
  };
}

export function contactReceivedEmail(args: { responsePromise: string }): EmailTemplate {
  return {
    subject: "We've got your message",
    html: shell("Message received", `<h1 style="font-family:Georgia,serif;">Thanks for reaching out</h1>
      <p style="color:${INK70};">${args.responsePromise}</p>`),
    text: `Thanks for reaching out. ${args.responsePromise}`,
  };
}
