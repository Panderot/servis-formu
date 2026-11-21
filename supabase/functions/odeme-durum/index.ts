// odeme-durum (task 81): the app asks how its order stands. POST, the user's JWT. Body { odeme }.
// Only the order's owner. A waiting order (or one marked failed in the last hour) is read again from iyzico and finalised
// exactly like odeme-donus: this covers a customer who closed the browser before the redirect.
// Returns { durum, donem, bitis?, hata? }.
import { cors, json, kullanici, sonuclandir, yonetici } from "../_shared/iyzico.ts";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors(req) });
  if (req.method !== "POST") return json(req, 405, { hata: "yontem" });
  const sb = yonetici();
  const k = await kullanici(req, sb);
  if (!k) return json(req, 401, { hata: "oturum" });
  let odeme = "";
  try {
    odeme = String((await req.json()).odeme ?? "");
  } catch {
    odeme = "";
  }
  if (!UUID.test(odeme)) return json(req, 400, { hata: "gecersiz_istek" });

  const { data: o } = await sb.from("odemeler").select("id, user_id, durum, donem, tutar, iyzico_token, hata, olusturma").eq("id", odeme).maybeSingle();
  if (!o || o.user_id !== k.id) return json(req, 404, { hata: "yok" });

  let durum = o.durum as string, hata = (o.hata as string | null) ?? undefined;
  const yeni = Date.now() - new Date(o.olusturma).getTime() < 3_600_000;
  if (o.iyzico_token && (durum === "bekliyor" || (durum === "basarisiz" && yeni))) {
    const s = await sonuclandir(sb, o);
    durum = s.durum;
    hata = s.hata;
  }
  let bitis: string | undefined;
  if (durum === "odendi") {
    const { data: ab } = await sb.from("abonelikler").select("bitis").eq("user_id", k.id).maybeSingle();
    bitis = ab?.bitis ?? undefined;
    const { data: son } = await sb.from("odemeler").select("hata").eq("id", o.id).maybeSingle();
    hata = son?.hata ?? undefined;
  }
  return json(req, 200, { durum, donem: o.donem, ...(bitis ? { bitis } : {}), ...(hata ? { hata } : {}) });
});
