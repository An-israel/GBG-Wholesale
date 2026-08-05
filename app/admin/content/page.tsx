import Link from "next/link";
import { articles, faqs, policyPages, successStories, testimonials } from "@/lib/data/catalog";

const modules = [
  { label: "Articles", count: articles.length, desc: "Guides with key takeaway, next action, linked products" },
  { label: "Success stories", count: successStories.length, desc: "Approval queue from public submissions" },
  { label: "Testimonials", count: testimonials.length, desc: "Short quotes, ordered" },
  { label: "FAQ", count: faqs.length, desc: "Drag ordering & helpfulness stats" },
  { label: "Policy pages", count: policyPages.length, desc: "Editable copy with a Last reviewed stamp" },
];

export default function AdminContent() {
  return (
    <div>
      <h1 className="font-display text-h1">Content</h1>
      <p className="mt-2 text-ink-70">Everything the founder can edit without a deploy.</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {modules.map((m) => (
          <div key={m.label} className="rounded-[var(--radius-card)] border border-line bg-surface p-4">
            <div className="flex items-center justify-between">
              <p className="font-medium">{m.label}</p>
              <span className="rounded-full bg-surface-alt px-2 py-0.5 text-xs text-ink-70">{m.count}</span>
            </div>
            <p className="mt-1 text-sm text-ink-70">{m.desc}</p>
          </div>
        ))}
      </div>
      <p className="mt-4 text-sm text-ink-50">
        Policy pages, homepage section toggles and article editing write to the content tables and
        trigger on-demand revalidation. See <Link href="/admin/settings" className="text-navy underline">Settings</Link>.
      </p>
    </div>
  );
}
