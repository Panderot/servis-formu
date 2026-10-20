import { NextResponse } from "next/server";
import { donemMi, planMi } from "../../lib/paket";
import { acikOdemeleriKapat, fiyatBul, istegeAitOdemeyiKapat, kullanici, musteriBul, odemeAyarli, odemeKilidiAl, odemeKilidiBirak, odemeKilidiTut, satirOku, stripe, suruyorMu } from "../../lib/odemeSunucu";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST { plan: "usta"|"firma", donem: "aylik"|"yillik", dil: "tr"|"en", isletme: true } with the user's session
// token -> { url } of the Stripe payment page. A user whose Stripe subscription is still running
// (asked from Stripe, not from public.abonelikler) gets the billing page instead, and older open
// payment pages are closed first, so nobody pays twice. All of it runs under a per-user lock, so two
// requests at the same moment can't both open a page ("mesgul" if the lock stays busy).
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

    const fiyat = await fiyatBul(g.plan, g.donem);
    const jeton = await odemeKilidiAl(k.id);
    if (!jeton) return NextResponse.json({ hata: "mesgul" }, { status: 409 });
    try {
      const satir = await satirOku(k.id);
      const musteri = await musteriBul(k, satir);
      if (await suruyorMu(musteri)) {
        const p = await stripe().billingPortal.sessions.create({ customer: musteri, return_url: `${kok}/app`, locale: dil });
        return NextResponse.json({ url: p.url, yonet: true });
      }
      await acikOdemeleriKapat(musteri);

      // The lock lasts 30 s. If it ran out during the calls above, another request may already be
      // opening its page: stop here. Renewing gives the page creation a full 30 s, and its time is
      // capped below that (8 s, one retry), so it can't outlive the lock.
      if (!(await odemeKilidiTut(k.id, jeton))) return NextResponse.json({ hata: "mesgul" }, { status: 409 });
      const oturum = await stripe().checkout.sessions.create({
        mode: "subscription",
        line_items: [{ price: fiyat.id, quantity: 1 }],
        client_reference_id: k.id,
        metadata: { user_id: k.id, istek: jeton, ...beyan },
        subscription_data: { metadata: { user_id: k.id, ...beyan } },
        customer: musteri,
        locale: dil,
        billing_address_collection: "auto",
        success_url: `${kok}/app?odeme=tamam`,
        cancel_url: `${kok}/abonelik?iptal=1`,
      }, { timeout: 8000, maxNetworkRetries: 1, idempotencyKey: `fx-odeme-${jeton}` }).catch(async (e) => {
        // A request that timed out may still have created the page: close only this request's page
        // (metadata istek), never another one, which may belong to a request that took the lock over.
        await istegeAitOdemeyiKapat(musteri, jeton).catch(() => {});
        throw e;
      });
      // Still ours? Otherwise (this request stalled past the lock) the new holder has opened its own
      // page after closing the open ones, so this one is closed and never handed out.
      if (!(await odemeKilidiTut(k.id, jeton))) {
        await stripe().checkout.sessions.expire(oturum.id).catch(() => {});
        return NextResponse.json({ hata: "mesgul" }, { status: 409 });
      }
      if (!oturum.url) throw new Error("Checkout adresi gelmedi");
      return NextResponse.json({ url: oturum.url });
    } finally {
      await odemeKilidiBirak(k.id, jeton);
    }
  } catch (e) {
    console.error("odeme:", e instanceof Error ? e.message : e);
    return NextResponse.json({ hata: "sunucu" }, { status: 500 });
  }
}
