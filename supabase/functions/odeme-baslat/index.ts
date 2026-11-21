// odeme-baslat (task 81): the app asks for a card payment. POST, the user's JWT.
// Body { donem, donus: 'web'|'apk', dil: 'tr'|'en', fatura, onaylar: { on_bilgilendirme: true, isletme: true } }.
// Writes the order at the SERVER price, opens an iyzico Checkout Form, returns { odemeSayfasi, odeme }.
// Errors: 401 oturum, 400 gecersiz_* / onay, 403 teknisyen, 409 zaten_suresiz, 429 cok_deneme, 502 odeme_baslamadi.
import { DONEMLER, FIYAT, cfBaslat, cors, json, kullanici, log, yonetici, type Donem, type Fatura } from "../_shared/iyzico.ts";

const metin = (x: unknown, en: number, boy: number) => {
  const s = typeof x === "string" ? x.replace(/\s+/g, " ").trim() : "";
  return s.length >= en && s.length <= boy ? s : null;
};
// Turkish mobile as +905XXXXXXXXX (accepts 05.., 5.., 905.., +90 5.., with spaces or dashes).
function telefon(x: unknown): string | null {
  let d = typeof x === "string" ? x.replace(/\D/g, "") : "";
  if (d.startsWith("0090")) d = d.slice(4);
  else if (d.startsWith("90") && d.length === 12) d = d.slice(2);
  else if (d.startsWith("0") && d.length === 11) d = d.slice(1);
  return /^5\d{9}$/.test(d) ? "+90" + d : null;
}

function faturaOku(f: Record<string, unknown> | null): Fatura | string {
  if (!f || typeof f !== "object") return "gecersiz_fatura";
  const ad = metin(f.ad, 2, 120);
  if (!ad) return "gecersiz_ad";
  const tel = telefon(f.telefon);
  if (!tel) return "gecersiz_telefon";
  const il = metin(f.il, 2, 60);
  if (!il) return "gecersiz_il";
  const adres = metin(f.adres, 5, 300);
  if (!adres) return "gecersiz_adres";
  const vd = typeof f.vergi_dairesi === "string" ? f.vergi_dairesi.replace(/\s+/g, " ").trim() : "";
  if (vd.length > 80) return "gecersiz_vergi_dairesi";
  const vn = typeof f.vergi_no === "string" ? f.vergi_no.replace(/\s+/g, "") : "";
  if (vn && !/^\d{10}$/.test(vn)) return "gecersiz_vergi_no";
  return { ad, telefon: tel, il, adres, ...(vd ? { vergi_dairesi: vd } : {}), ...(vn ? { vergi_no: vn } : {}) };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors(req) });
  if (req.method !== "POST") return json(req, 405, { hata: "yontem" });
  const sb = yonetici();
  const k = await kullanici(req, sb);
  if (!k) return json(req, 401, { hata: "oturum" });

  let b: Record<string, unknown>;
  try {
    b = await req.json();
  } catch {
    return json(req, 400, { hata: "gecersiz_istek" });
  }
  const donem = b.donem as Donem;
  if (!DONEMLER.includes(donem)) return json(req, 400, { hata: "gecersiz_donem" });
  const donus = b.donus === "apk" ? "apk" : b.donus === "web" || b.donus === undefined ? "web" : null;
  if (!donus) return json(req, 400, { hata: "gecersiz_donus" });
  const dil = b.dil === "en" ? "en" : "tr";
  const fatura = faturaOku(b.fatura as Record<string, unknown> | null);
  if (typeof fatura === "string") return json(req, 400, { hata: fatura });
  const o = (b.onaylar ?? {}) as Record<string, unknown>;
  if (o.on_bilgilendirme !== true || o.isletme !== true) return json(req, 400, { hata: "onay" });

  // The licence belongs to the company owner; a lifetime licence needs no payment.
  const { data: uye } = await sb.from("ekip_uyeleri").select("user_id").eq("user_id", k.id).maybeSingle();
  if (uye) return json(req, 403, { hata: "teknisyen" });
  const { data: ab } = await sb.from("abonelikler").select("bitis").eq("user_id", k.id).maybeSingle();
  if (ab?.bitis && new Date(ab.bitis).getTime() >= Date.parse("2099-01-01T00:00:00Z")) return json(req, 409, { hata: "zaten_suresiz" });
  // At most 10 payment pages in 10 minutes per account.
  const { count } = await sb.from("odemeler").select("id", { count: "exact", head: true }).eq("user_id", k.id).gte("olusturma", new Date(Date.now() - 600_000).toISOString());
  if ((count ?? 0) >= 10) return json(req, 429, { hata: "cok_deneme" });

  const simdi = new Date().toISOString();
  const { data: siparis, error } = await sb.from("odemeler").insert({
    user_id: k.id,
    donem,
    tutar: FIYAT[donem],
    donus,
    fatura,
    onaylar: { on_bilgilendirme: simdi, isletme: simdi, dil },
  }).select("id").single();
  if (error || !siparis) {
    log("odeme-baslat", "siparis_yazilamadi");
    return json(req, 502, { hata: "odeme_baslamadi" });
  }

  const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "85.34.78.112";
  let r: Record<string, unknown>;
  try {
    r = await cfBaslat({
      odeme: siparis.id,
      donem,
      dil,
      userId: k.id,
      eposta: k.email ?? "",
      ip,
      fatura,
      callbackUrl: `${Deno.env.get("SUPABASE_URL")}/functions/v1/odeme-donus`,
    });
  } catch {
    r = { status: "failure", errorCode: "baglanti" };
  }
  if (r.status !== "success" || typeof r.token !== "string" || typeof r.paymentPageUrl !== "string") {
    const hata = String(r.errorCode ?? "baslatilamadi").slice(0, 60);
    await sb.from("odemeler").update({ durum: "basarisiz", hata }).eq("id", siparis.id);
    log("odeme-baslat", "iyzico_hata", siparis.id, hata);
    return json(req, 502, { hata: "odeme_baslamadi" });
  }
  await sb.from("odemeler").update({ iyzico_token: r.token }).eq("id", siparis.id);
  log("odeme-baslat", "basladi", siparis.id);
  return json(req, 200, { odemeSayfasi: r.paymentPageUrl, odeme: siparis.id });
});
