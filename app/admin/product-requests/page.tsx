import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

type RequestRow = { id: string; product_description: string; vote_count: number; status: string; created_at: string };

const pipeline = ["new", "reviewing", "sourcing", "stocked", "declined"];

export default async function AdminProductRequests() {
  let requests: RequestRow[] = [];
  if (isSupabaseConfigured) {
    const supabase = await createClient();
    const { data } = await supabase.from("product_requests").select("id,product_description,vote_count,status,created_at").order("vote_count", { ascending: false }).limit(100);
    requests = data ?? [];
  }

  return (
    <div>
      <h1 className="font-display text-h1">Product requests</h1>
      <p className="mt-2 text-ink-70">Demand intelligence, sorted by votes. Marking one <em>stocked</em> can email everyone who asked.</p>

      <div className="mt-6 grid gap-4 md:grid-cols-5">
        {pipeline.map((stage) => (
          <div key={stage} className="rounded-[var(--radius-card)] border border-line bg-surface p-3">
            <p className="text-micro capitalize text-ink-50">{stage}</p>
            <div className="mt-2 space-y-2">
              {requests.filter((r) => r.status === stage).map((r) => (
                <div key={r.id} className="rounded-[var(--radius-input)] border border-line p-2 text-sm">
                  <p className="line-clamp-2">{r.product_description}</p>
                  <p className="mt-1 text-xs text-gold">{r.vote_count} votes</p>
                </div>
              ))}
              {requests.filter((r) => r.status === stage).length === 0 && <p className="text-xs text-ink-25">—</p>}
            </div>
          </div>
        ))}
      </div>

      {requests.length === 0 && (
        <p className="mt-4 text-sm text-ink-70">
          {isSupabaseConfigured ? "No requests yet." : "Connect Supabase to see submitted requests. Requests come in via the shop and zero-result searches."}
        </p>
      )}
    </div>
  );
}
