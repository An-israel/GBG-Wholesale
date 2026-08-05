import "server-only";
import DOMPurify from "isomorphic-dompurify";

/**
 * Server-side HTML sanitisation (Part 18.3). All rich text is sanitised on save
 * with a strict allowlist. No value reaches `dangerouslySetInnerHTML` unless it
 * has passed through here.
 */
const ALLOWED_TAGS = [
  "p", "br", "strong", "em", "u", "s", "a", "ul", "ol", "li",
  "h2", "h3", "h4", "blockquote", "code", "pre", "hr", "span",
];
const ALLOWED_ATTR = ["href", "title", "target", "rel"];

export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty ?? "", {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    FORBID_TAGS: ["script", "style", "iframe", "object", "embed", "form"],
    FORBID_ATTR: ["onerror", "onload", "onclick", "style"],
    ALLOW_DATA_ATTR: false,
  });
}
