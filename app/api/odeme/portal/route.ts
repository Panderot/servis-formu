import { NextResponse } from "next/server";
import { kullanici, odemeAyarli, satirOku, stripe } from "../../../lib/odemeSunucu";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST { dil } with the user's session token -> { url } of the Stripe billing page, where the
// customer changes card or plan, sees invoices and cancels.
export async function POST(req: Request) {
  if (!odemeAyarli()) return NextResponse.json({ hata: "kapali" }, { status: 503 });
  try {
    const k = await kullanici(req);
    if (!k) return NextResponse.json({ hata: "oturum" }, { status: 401 });
    const g = (await req.json().catch(() => ({}))) as { dil?: unknown };
    const satir = await satirOku(k.id);
    if (!satir?.stripe_musteri) return NextResponse.json({ hata: "musteri" }, { status: 404 });
    const p = await stripe().billingPortal.sessions.create({
      customer: satir.stripe_musteri,
      return_url: `${new URL(req.url).origin}/app`,
      locale: g.dil === "en" ? "en" : "tr",
    });
    return NextResponse.json({ url: p.url });
  } catch (e) {
    console.error("portal:", e instanceof Error ? e.message : e);
    return NextResponse.json({ hata: "sunucu" }, { status: 500 });
  }
}
