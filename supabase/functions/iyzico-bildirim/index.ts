// iyzico-bildirim (task 81): iyzico merchant notification (webhook). No JWT (verify_jwt = false).
// Signature header X-IYZ-SIGNATURE-V3 is checked first (401 otherwise); the feature is enabled on the merchant account by
// iyzico (entegrasyon@iyzico.com). Then the order is found by token / paymentConversationId and finalised idempotently
// with the result read from iyzico (sonuclandir), never from this body. Always 200 after a valid signature.
import { bildirimImzasi, esit, log, sonuclandir, yonetici } from "../_shared/iyzico.ts";

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("yontem", { status: 405 });
  let b: Record<string, unknown> = {};
  try {
    const tur = req.headers.get("content-type") ?? "";
    b = tur.includes("application/json") ? await req.json() : Object.fromEntries((await req.formData()).entries());
  } catch {
    b = {};
  }
  const gelen = (req.headers.get("x-iyz-signature-v3") ?? "").trim().toLowerCase();
  if (!gelen || !esit(gelen, await bildirimImzasi(b))) {
    log("iyzico-bildirim", "imza_gecersiz");
    return new Response("imza", { status: 401 });
  }

  const sb = yonetici();
  const token = typeof b.token === "string" ? b.token : "";
  const konusma = typeof b.paymentConversationId === "string" ? b.paymentConversationId : "";
  let sorgu = sb.from("odemeler").select("id, durum, tutar, iyzico_token");
  if (token) sorgu = sorgu.eq("iyzico_token", token);
  else if (/^[0-9a-f-]{36}$/i.test(konusma)) sorgu = sorgu.eq("id", konusma);
  else return new Response("ok", { status: 200 });
  const { data: o } = await sorgu.maybeSingle();
  if (!o) {
    log("iyzico-bildirim", "siparis_yok");
    return new Response("ok", { status: 200 });
  }
  await sonuclandir(sb, o);
  return new Response("ok", { status: 200 });
});
