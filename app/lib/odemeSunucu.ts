// SERVER ONLY (imported by app/api/odeme/*). Never import this from a client component: it reads
// the Stripe and Supabase secret keys.
//
// Flow: /abonelik -> POST /api/odeme (Checkout page) -> Stripe sends events to /api/odeme/webhook ->
// aboneligiYaz() writes public.abonelikler (bitis = paid-until date). The app keeps reading only
// "bitis", exactly as with subscriptions entered by hand.
import Stripe from "stripe";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { type Donem, type Plan, donemMi, planMi, tutar } from "./paket";

const GUN = 86_400;
// A renewal whose payment fails (past_due) keeps the app open this many days while Stripe retries.
const ODEME_TOLERANS_GUN = 7;

let _stripe: Stripe | null = null;
export function stripe(): Stripe {
  const k = process.env.STRIPE_SECRET_KEY;
  if (!k) throw new Error("STRIPE_SECRET_KEY eksik");
  if (!_stripe) _stripe = new Stripe(k, { maxNetworkRetries: 2, appInfo: { name: "Fixnote" } });
  return _stripe;
}

let _sb: SupabaseClient | null = null;
// Supabase with the secret key: writes public.abonelikler (row level security does not apply).
export function yonetici(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const k = process.env.SUPABASE_SECRET_KEY;
  if (!url || !k) throw new Error("NEXT_PUBLIC_SUPABASE_URL ya da SUPABASE_SECRET_KEY eksik");
  if (!_sb) _sb = createClient(url, k, { auth: { persistSession: false, autoRefreshToken: false } });
  return _sb;
}

export const odemeAyarli = () =>
  !!(process.env.STRIPE_SECRET_KEY && process.env.SUPABASE_SECRET_KEY && process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_ODEME_ACIK === "1");

// The signed-in user from "Authorization: Bearer <access token>" (the browser's Supabase session).
export async function kullanici(req: Request) {
  const m = /^Bearer (.+)$/.exec(req.headers.get("authorization") ?? "");
  if (!m) return null;
  const { data, error } = await yonetici().auth.getUser(m[1]);
  if (error || !data.user) return null;
  return data.user;
}

export type AbonelikSatiri = {
  user_id: string;
  bitis: string;
  stripe_musteri: string | null;
  stripe_abonelik: string | null;
  durum: string | null;
};

export async function satirOku(userId: string): Promise<AbonelikSatiri | null> {
  const { data, error } = await yonetici()
    .from("abonelikler")
    .select("user_id, bitis, stripe_musteri, stripe_abonelik, durum")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw new Error("abonelikler okunamadı: " + error.message);
  return data as AbonelikSatiri | null;
}

// Stripe price for a plan. Prices are found by their metadata (plan=usta|firma, donem=aylik|yillik)
// and must match the amounts in app/lib/paket.ts, so a wrong price in Stripe can never be charged.
let fiyatOnbellek: { zaman: number; liste: Stripe.Price[] } | null = null;
export async function fiyatBul(plan: Plan, donem: Donem): Promise<Stripe.Price> {
  if (!fiyatOnbellek || Date.now() - fiyatOnbellek.zaman > 10 * 60_000) {
    const liste: Stripe.Price[] = [];
    for await (const p of stripe().prices.list({ active: true, type: "recurring", limit: 100 })) liste.push(p);
    fiyatOnbellek = { zaman: Date.now(), liste };
  }
  const bulunan = fiyatOnbellek.liste.filter((p) => p.metadata?.plan === plan && p.metadata?.donem === donem);
  if (bulunan.length !== 1) throw new Error(`Stripe'ta plan=${plan} donem=${donem} için ${bulunan.length} etkin fiyat var (1 olmalı)`);
  const f = bulunan[0];
  const aralik = donem === "aylik" ? "month" : "year";
  if (f.currency !== "usd" || f.unit_amount !== tutar(plan, donem) * 100 || f.recurring?.interval !== aralik || (f.recurring?.interval_count ?? 1) !== 1)
    throw new Error(`Stripe fiyatı ${f.id} beklenen tutarla uyuşmuyor (${plan} ${donem})`);
  return f;
}

const AKTIF = new Set<Stripe.Subscription.Status>(["active", "trialing"]);
const BITTI = new Set<Stripe.Subscription.Status>(["canceled", "unpaid", "incomplete_expired", "paused"]);

// Reads the subscription from Stripe (never trusts the event body) and writes the user's row.
// Safe to run any number of times, in any order.
export async function aboneligiYaz(abonelikId: string): Promise<string> {
  const s = await stripe().subscriptions.retrieve(abonelikId);
  const musteri = typeof s.customer === "string" ? s.customer : s.customer.id;
  let userId = s.metadata?.user_id || null;
  if (!userId) {
    const { data } = await yonetici().from("abonelikler").select("user_id").eq("stripe_musteri", musteri).maybeSingle();
    userId = (data?.user_id as string | undefined) ?? null;
  }
  if (!userId) return `atlandı: ${s.id} için kullanıcı bulunamadı`;

  const kalem = s.items.data[0];
  const fiyat = kalem?.price;
  const plan = planMi(fiyat?.metadata?.plan) ? fiyat.metadata.plan : null;
  const donem = donemMi(fiyat?.metadata?.donem) ? fiyat.metadata.donem : null;
  const simdi = Math.floor(Date.now() / 1000);
  const eski = await satirOku(userId);

  let bitis: number;
  if (AKTIF.has(s.status)) {
    bitis = kalem.current_period_end;
  } else if (s.status === "past_due") {
    bitis = Math.min(kalem.current_period_end, kalem.current_period_start + ODEME_TOLERANS_GUN * GUN);
  } else if (BITTI.has(s.status)) {
    // An old subscription ending must not close a newer one, or a date entered by hand.
    if (!eski || eski.stripe_abonelik !== s.id) return `atlandı: ${s.id} (${s.status}) kayıtlı abonelik değil`;
    bitis = Math.min(s.ended_at ?? simdi, simdi, Math.floor(new Date(eski.bitis).getTime() / 1000));
  } else {
    return `atlandı: ${s.id} durumu ${s.status}`; // incomplete: first payment not done yet
  }

  const { error } = await yonetici()
    .from("abonelikler")
    .upsert(
      {
        user_id: userId,
        bitis: new Date(bitis * 1000).toISOString(),
        stripe_musteri: musteri,
        stripe_abonelik: s.id,
        plan,
        donem,
        durum: s.status,
        guncelleme: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    );
  if (error) throw new Error("abonelikler yazılamadı: " + error.message);
  return `yazıldı: ${s.id} ${s.status} -> ${new Date(bitis * 1000).toISOString()}`;
}
