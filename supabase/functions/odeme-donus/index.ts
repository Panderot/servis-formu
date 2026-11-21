// odeme-donus (task 81): iyzico sends the customer's browser here after the payment page (POST, form field "token").
// No JWT (verify_jwt = false in config.toml). The result is read again from iyzico with our secret (sonuclandir), never
// taken from this POST. Answers 303 to the app: web /abonelik?odeme=<id>, apk fixnote://odeme?odeme=<id>.
import { donusAdresi, log, sonuclandir, yonetici } from "../_shared/iyzico.ts";

const git = (adres: string) => new Response(null, { status: 303, headers: { Location: adres } });

Deno.serve(async (req) => {
  if (req.method !== "POST") return git(donusAdresi("web"));
  let token = "";
  try {
    const tur = req.headers.get("content-type") ?? "";
    if (tur.includes("application/json")) token = String((await req.json()).token ?? "");
    else token = String((await req.formData()).get("token") ?? "");
  } catch {
    token = "";
  }
  token = token.trim().slice(0, 200);
  if (!token) return git(donusAdresi("web"));

  const sb = yonetici();
  const { data: o } = await sb.from("odemeler").select("id, durum, tutar, iyzico_token, donus").eq("iyzico_token", token).maybeSingle();
  if (!o) {
    log("odeme-donus", "bilinmeyen_token");
    return git(donusAdresi("web"));
  }
  await sonuclandir(sb, o);
  return git(donusAdresi(o.donus, o.id));
});
