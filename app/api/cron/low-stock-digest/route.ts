import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email/send";

export const runtime = "nodejs";

/** Daily low-stock digest to the admin (Part 15). */
export async function GET(req: NextRequest) {
  if (process.env.NODE_ENV === "production" && req.headers.get("authorization") !== `Bearer ${process.env.REVALIDATE_SECRET}`) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ ok: true, skipped: "no db" });
  }

  const supabase = createAdminClient();
  const { data: low } = await supabase
    .from("products")
    .select("name, sku, stock_quantity")
    .in("stock_status", ["low_stock", "sold_out"])
    .eq("status", "active")
    .order("stock_quantity", { ascending: true });

  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL;
  if (adminEmail && low && low.length > 0) {
    const rows = low.map((p) => `<li>${p.name} (${p.sku}) — ${p.stock_quantity} left</li>`).join("");
    await sendEmail({
      to: adminEmail,
      subject: `Low stock digest — ${low.length} item(s) need attention`,
      template: "low_stock_digest",
      html: `<p>These products are low or out of stock:</p><ul>${rows}</ul>`,
    });
  }

  return NextResponse.json({ ok: true, count: low?.length ?? 0 });
}
