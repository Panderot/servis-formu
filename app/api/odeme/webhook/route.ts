import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { aboneligiYaz, stripe } from "../../../lib/odemeSunucu";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Stripe events. Only the signature-checked event's subscription id is used; the subscription
// itself is read again from Stripe. Errors return 500 so Stripe retries later.
const OLAYLAR = new Set([
  "checkout.session.completed",
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
  "customer.subscription.paused",
  "customer.subscription.resumed",
]);

export async function POST(req: Request) {
  const gizli = process.env.STRIPE_WEBHOOK_SECRET;
  const imza = req.headers.get("stripe-signature");
  if (!gizli || !process.env.STRIPE_SECRET_KEY) return NextResponse.json({ hata: "kapali" }, { status: 503 });
  if (!imza) return NextResponse.json({ hata: "imza" }, { status: 400 });

  let olay: Stripe.Event;
  try {
    olay = stripe().webhooks.constructEvent(await req.text(), imza, gizli);
  } catch {
    return NextResponse.json({ hata: "imza" }, { status: 400 });
  }
  if (!OLAYLAR.has(olay.type)) return NextResponse.json({ alindi: true, islem: "yok" });

  try {
    let abonelikId: string | null = null;
    if (olay.type === "checkout.session.completed") {
      const s = olay.data.object as Stripe.Checkout.Session;
      if (s.mode === "subscription" && s.subscription) abonelikId = typeof s.subscription === "string" ? s.subscription : s.subscription.id;
    } else {
      abonelikId = (olay.data.object as Stripe.Subscription).id;
    }
    const sonuc = abonelikId ? await aboneligiYaz(abonelikId) : "abonelik yok";
    console.log(`webhook ${olay.id} ${olay.type}: ${sonuc}`);
    return NextResponse.json({ alindi: true });
  } catch (e) {
    console.error(`webhook ${olay.id} ${olay.type}:`, e instanceof Error ? e.message : e);
    return NextResponse.json({ hata: "sunucu" }, { status: 500 });
  }
}
