"use client";

import { useState } from "react";
import { upsertSetting } from "@/lib/actions/admin";
import { Button } from "@/components/ui/button";

export function SettingRow({ settingKey, value, isPublic, pending }: { settingKey: string; value: string; isPublic: boolean; pending: boolean }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(value);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);

  async function save() {
    setBusy(true); setError(undefined);
    const res = await upsertSetting({ key: settingKey, value: val });
    setBusy(false);
    if (res.ok) { setSaved(true); setEditing(false); }
    else if (!res.ok) setError(res.error.message);
  }

  return (
    <tr className="border-b border-line align-top last:border-0">
      <td className="p-3 font-mono text-xs">{settingKey}</td>
      <td className="p-3">
        {editing ? (
          <textarea value={val} onChange={(e) => setVal(e.target.value)} rows={2} className="w-full rounded-[var(--radius-input)] border border-line px-2 py-1 font-mono text-xs" />
        ) : (
          <span className="block max-w-md truncate text-ink-70">{val}</span>
        )}
        {error && <span className="text-xs text-danger">{error}</span>}
        {saved && !editing && <span className="text-xs text-profit">Saved</span>}
      </td>
      <td className="p-3">{isPublic ? "yes" : "no"}</td>
      <td className="p-3">
        {pending && !saved ? <span className="rounded bg-danger/10 px-1.5 py-0.5 text-xs text-danger">PENDING</span> : <span className="rounded bg-profit/10 px-1.5 py-0.5 text-xs text-profit">set</span>}
      </td>
      <td className="p-3">
        {editing ? (
          <div className="flex gap-1">
            <Button type="button" variant="primary" size="sm" onClick={save} disabled={busy}>Save</Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => setEditing(false)}>Cancel</Button>
          </div>
        ) : (
          <Button type="button" variant="ghost" size="sm" onClick={() => setEditing(true)}>Edit</Button>
        )}
      </td>
    </tr>
  );
}
