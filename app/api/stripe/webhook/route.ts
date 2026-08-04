import { NextResponse, type NextRequest } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Must run on the Node runtime and read the raw body (Part 8.2).
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !webhookSecret) {
    return NextResponse.json({ ok: false, error: "stripe not configured" }, { status: 503 });
  }

  const sig = req.headers.get("stripe-signature");
  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig ?? "", webhookSecret);
  } catch (err) {
    console.error("[webhook] signature verification failed", err);
    return NextResponse.json({ ok: false, error: "invalid signature" }, { status: 400 });
  }

  const supabase = createAdminClient();

  // Idempotency guard: insert the event id first; abort if it already exists.
  const { error: insertError } = await supabase
    .from("stripe_events")
    .insert({ stripe_event_id: event.id, type: event.type, payload: event as unknown as Record<string, unknown> });
  if (insertError) {
    // Duplicate → already processed. Acknowledge without reprocessing.
    return NextResponse.json({ ok: true, duplicate: true });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const orderId = session.metadata?.order_id;
        if (orderId) {
          // Reconcile against the stored total; never trust amount_total alone.
          const { data: order } = await supabase.from("orders").select("total_pence").eq("id", orderId).single();
          if (order && session.amount_total && session.amount_total !== order.total_pence) {
            await supabase.from("admin_audit_log").insert({
              action: "stripe_total_mismatch",
              entity_type: "orders",
              entity_id: orderId,
              after: { stripe_amount: session.amount_total, order_total: order.total_pence },
            });
          }
          // Marking payment_status = 'paid' fires on_order_paid (stock, Hub, counters).
          await supabase
            .from("orders")
            .update({
              payment_status: "paid",
              status: "paid",
              stripe_checkout_session_id: session.id,
              stripe_payment_intent_id: (session.payment_intent as string) ?? null,
            })
            .eq("id", orderId);
        }
        break;
      }
      case "payment_intent.payment_failed": {
        const intent = event.data.object as Stripe.PaymentIntent;
        await supabase.from("orders").update({ payment_status: "failed" }).eq("stripe_payment_intent_id", intent.id);
        break;
      }
      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        await supabase.from("orders").update({ status: "refunded", payment_status: "refunded" }).eq("stripe_payment_intent_id", charge.payment_intent as string);
        break;
      }
      case "checkout.session.expired": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.metadata?.order_id) {
          await supabase.from("orders").update({ status: "cancelled" }).eq("id", session.metadata.order_id);
        }
        break;
      }
      default:
        break;
    }
  } catch (err) {
    console.error("[webhook] handler error", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
