import { NextResponse } from "next/server";
import { donemMi, planMi } from "../../lib/paket";
import { fiyatBul, kullanici, odemeAyarli, satirOku, stripe } from "../../lib/odemeSunucu";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST { plan: "usta"|"firma", donem: "aylik"|"yillik", dil: "tr"|"en", isletme: true } with the user's session
// token -> { url } of the Stripe payment page. A user whose Stripe subscription is still running
// gets the billing page instead, so nobody pays twice.
export async function POST(req: Request) {
  if (!odemeAyarli()) return NextResponse.json({ hata: "kapali" }, { status: 503 });
  try {
    const k = await kullanici(req);
    if (!k) return NextResponse.json({ hata: "oturum" }, { status: 401 });
    const g = (await req.json().catch(() => ({}))) as { plan?: unknown; donem?: unknown; dil?: unknown; isletme?: unknown };
    if (!planMi(g.plan) || !donemMi(g.donem)) return NextResponse.json({ hata: "paket" }, { status: 400 });
    // Business use only (Terms > Service): the user must confirm it; the confirmation is kept on the subscription.
    if (g.isletme !== true) return NextResponse.json({ hata: "isletme" }, { status: 400 });
    const beyan = { isletme_beyani: "evet", beyan_zamani: new Date().toISOString() };
    const dil = g.dil === "en" ? "en" : "tr";
    const kok = new URL(req.url).origin;

    const satir = await satirOku(k.id);
    const suruyor = satir?.stripe_abonelik && ["active", "trialing", "past_due"].includes(satir.durum ?? "") && new Date(satir.bitis).getTime() > Date.now();
    if (suruyor && satir?.stripe_musteri) {
      const p = await stripe().billingPortal.sessions.create({ customer: satir.stripe_musteri, return_url: `${kok}/app`, locale: dil });
      return NextResponse.json({ url: p.url, yonet: true });
    }

    const fiyat = await fiyatBul(g.plan, g.donem);
    const oturum = await stripe().checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: fiyat.id, quantity: 1 }],
      client_reference_id: k.id,
      metadata: { user_id: k.id, ...beyan },
      subscription_data: { metadata: { user_id: k.id, ...beyan } },
      ...(satir?.stripe_musteri ? { customer: satir.stripe_musteri } : k.email ? { customer_email: k.email } : {}),
      locale: dil,
      billing_address_collection: "auto",
      success_url: `${kok}/app?odeme=tamam`,
      cancel_url: `${kok}/abonelik?iptal=1`,
    });
    if (!oturum.url) throw new Error("Checkout adresi gelmedi");
    return NextResponse.json({ url: oturum.url });
  } catch (e) {
    console.error("odeme:", e instanceof Error ? e.message : e);
    return NextResponse.json({ hata: "sunucu" }, { status: 500 });
  }
}
