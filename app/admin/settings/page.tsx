import { DEFAULT_SETTINGS, PENDING, PUBLIC_SETTING_KEYS, type SettingKey } from "@/lib/settings";

/**
 * Settings screen — the mechanism by which the site launches without blocking on
 * the founder (Part 14.12). Every PENDING_LAMI item is an editable field here.
 * (Persisting edits writes to the `site_settings` table via an admin action;
 * this view lists the current values and flags what still needs confirming.)
 */
export default function AdminSettings() {
  const keys = Object.keys(DEFAULT_SETTINGS) as SettingKey[];
  const pending = keys.filter((k) => JSON.stringify(DEFAULT_SETTINGS[k]).includes(PENDING));

  return (
    <div>
      <h1 className="font-display text-h1">Settings</h1>
      <p className="mt-2 text-ink-70">
        Every business fact lives here as an editable setting — never hard-coded copy. Items marked{" "}
        <span className="rounded bg-danger/10 px-1 text-danger">PENDING</span> still need confirming
        before launch.
      </p>

      {pending.length > 0 && (
        <div className="mt-4 rounded-[var(--radius-card)] border border-danger/40 bg-danger/5 p-4 text-sm">
          <p className="font-medium text-danger">{pending.length} setting(s) still need a confirmed value.</p>
        </div>
      )}

      <div className="mt-6 overflow-x-auto rounded-[var(--radius-card)] border border-line bg-surface">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="border-b border-line text-left text-ink-50">
            <tr><th className="p-3">Key</th><th>Value</th><th>Public</th><th>Status</th></tr>
          </thead>
          <tbody>
            {keys.map((k) => {
              const raw = JSON.stringify(DEFAULT_SETTINGS[k]);
              const isPending = raw.includes(PENDING);
              return (
                <tr key={k} className="border-b border-line last:border-0 align-top">
                  <td className="p-3 font-mono text-xs">{k}</td>
                  <td className="p-3 max-w-md truncate text-ink-70">{raw}</td>
                  <td className="p-3">{PUBLIC_SETTING_KEYS.includes(k) ? "yes" : "no"}</td>
                  <td className="p-3">
                    {isPending ? (
                      <span className="rounded bg-danger/10 px-1.5 py-0.5 text-xs text-danger">PENDING</span>
                    ) : (
                      <span className="rounded bg-profit/10 px-1.5 py-0.5 text-xs text-profit">set</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
