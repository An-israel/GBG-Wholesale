/**
 * SYPB vs Wholesale Hub comparison (Part 11.5). Also used on the homepage
 * community section. Columns: who it's for, what you get, how to join, cost.
 */
export function CommunityComparison() {
  const rows = [
    { label: "Who it's for", sypb: "Anyone curious — before you buy", hub: "Verified buyers — after your first order" },
    { label: "What you get", sypb: "Education, encouragement, a place to ask questions", hub: "Restock alerts, buyer-only drops, direct guidance" },
    { label: "How to join", sypb: "Open to all", hub: "Unlocked automatically by a purchase" },
    { label: "Cost", sypb: "Free", hub: "Included with buying" },
  ];
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[560px] border-collapse text-sm">
        <thead>
          <tr>
            <th className="w-40 border-b border-line p-3 text-left text-micro text-ink-50">&nbsp;</th>
            <th className="border-b border-line bg-surface-alt p-3 text-left font-display text-lg">SYPB</th>
            <th className="border-b border-line bg-gold-pale p-3 text-left font-display text-lg">Wholesale Hub</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.label}>
              <th className="border-b border-line p-3 text-left align-top font-medium text-ink">{r.label}</th>
              <td className="border-b border-line p-3 align-top text-ink-70">{r.sypb}</td>
              <td className="border-b border-line bg-gold-pale/40 p-3 align-top text-ink-70">{r.hub}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
