import { PENDING } from "@/lib/settings";

/**
 * Builds a WhatsApp deep link carrying a prewritten, context-aware message so
 * the founder receives a qualified enquiry, not a blank "hi" (Golden rule,
 * Part 1). The number comes from settings; never hard-coded.
 */
export function whatsappLink(rawNumber: string, message: string): string {
  const number = (rawNumber || "").replace(/[^\d]/g, "");
  const text = encodeURIComponent(message);
  if (!number || rawNumber.includes(PENDING)) {
    // No confirmed number yet — route to contact rather than a broken link.
    return "/contact";
  }
  return `https://wa.me/${number}?text=${text}`;
}

export function productEnquiry(name: string, sku: string): string {
  return `Hi, I'm looking at ${name} (${sku}) and have a question about`;
}

export function pageEnquiry(pageName: string): string {
  return `Hi, I'm on the ${pageName} page and have a question about`;
}
