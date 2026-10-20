"use client";
import { useEffect, useReducer, useRef, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { type Dil, type Firma, type Rapor, type Sablon, DEMO_FIRMA, demoFirma, demoRaporlar, uid, yeniNo } from "../lib/servis";
import { supabase } from "./supabase";
import { aktifDil } from "../lib/dil";

// Messages are written in the language in use at the moment they appear.
const c = (tr: string, en: string) => (aktifDil() === "en" ? en : tr);

// Where the panel keeps its records.
// demo:  this browser only (localStorage fx_demo_* in Turkish, fx_demo_en_* in English), seeded with
//        the sample records of that language. /demo
// bulut: the signed-in account in Supabase (tables firmalar, raporlar; bucket rapor-dosyalari). /app
//        Every change goes into an outbox in localStorage first, so a report saved without
//        internet waits on the phone and is sent when the connection is back.
//        Records belong to the firm account (hesap): the owner's id; a technician of the team
//        (app/components/ekip.ts) reads and writes the owner's records but never deletes reports,
//        files or changes the firm settings. Local keys (outbox, cache) stay per signed-in user.

export type Mod = "demo" | "bulut";
export type Hesap = { id: string; sahip: boolean }; // firm account of the signed-in user
export type DepoDurum = { bekleyen: number; cevrimdisi: boolean; gonderiliyor: boolean; hata: string };
export type Yedek = { firma?: Firma; raporlar: Rapor[]; sablonlar?: Sablon[] };
export type Aktarim = { rapor: number; firma: boolean; sablon: number };
export type Depo = {
  hazir: boolean;
  firma: Firma;
  raporlar: Rapor[];
  ozelSablon: Sablon[];
  durum: DepoDurum | null; // null in demo
  aktarim: Aktarim | null; // records from the old local-only version waiting for a decision
  aktar: () => void;
  aktarimGizle: () => void;
  raporKaydet: (r: Rapor) => boolean;
  raporSil: (id: string) => void;
  firmaKaydet: (f: Firma) => boolean;
  sablonKaydet: (l: Sablon[]) => void;
  yedekYukle: (d: Yedek) => Promise<void>;
  ornekYukle: () => void;
  tumunuSil: () => Promise<void>;
  yedekVerisi: () => Promise<Required<Yedek>>;
  coz: (r: Rapor) => Rapor;
  cozSrc: (s: string) => string;
  gorselHazirla: (r: Rapor) => Promise<Rapor>;
  duzenlemeHazirla: (r: Rapor) => Promise<Rapor>;
};

export const BOS_FIRMA: Firma = { ad: "", telefon: "", eposta: "", adres: "", vergiDairesi: "", vergiNo: "", logo: "", kdv: 20, onek: "SR", teknisyen: "", altNot: "" };
const KOVA = "rapor-dosyalari";
const BOS_GORSEL = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
const SAYFA = 1000;
const YENILEME_ARA = 15000;
const KAPALI_SURE = 30000;

function oku<T>(k: string, v: T): T {
  try {
    const s = localStorage.getItem(k);
    return s ? (JSON.parse(s) as T) : v;
  } catch {
    return v;
  }
}
const kopya = <T,>(x: T): T => JSON.parse(JSON.stringify(x)) as T;

// Records written by older versions may miss newer fields.
function normal(r: Rapor): Rapor {
  return {
    ...r,
    musteri: { ad: r.musteri?.ad || "", telefon: r.musteri?.telefon || "", adres: r.musteri?.adres || "" },
    cihaz: { tur: r.cihaz?.tur || "", marka: r.cihaz?.marka || "", model: r.cihaz?.model || "", seriNo: r.cihaz?.seriNo || "" },
    maddeler: Array.isArray(r.maddeler) ? r.maddeler : [],
    parcalar: Array.isArray(r.parcalar) ? r.parcalar : [],
    fotolar: Array.isArray(r.fotolar) ? r.fotolar : [],
    imza: r.imza || "",
    imzalayan: r.imzalayan || "",
    teknisyen: r.teknisyen || "",
    not: r.not || "",
    sonrakiBakim: r.sonrakiBakim || "",
    sikayet: r.sikayet || "",
    tespit: r.tespit || "",
  };
}

const refler = (r: Rapor) => [...r.fotolar.map((f) => f.src), r.imza].filter((s) => s.startsWith("sb:")).map((s) => s.slice(3));
// Same content whatever the key order (jsonb reorders keys).
const sirali = (x: unknown): unknown =>
  Array.isArray(x) ? x.map(sirali) : x && typeof x === "object" ? Object.fromEntries(Object.keys(x).sort().map((k) => [k, sirali((x as Record<string, unknown>)[k])])) : x;
const ayni = (a: unknown, b: unknown) => JSON.stringify(sirali(kopya(a))) === JSON.stringify(sirali(kopya(b)));
// A file not used by the report it was saved with is removed only after this long: another phone may
// have just uploaded it and be about to save the report that uses it.
const DOSYA_BEKLEME = 60 * 60 * 1000;

function dataUrl(b: Blob): Promise<string> {
  return new Promise((coz, red) => {
    const o = new FileReader();
    o.onload = () => coz(String(o.result));
    o.onerror = () => red(o.error);
    o.readAsDataURL(b);
  });
}

type HataTuru = "ag" | "izin" | "oturum" | "kalici";
function hataTuru(e: unknown): HataTuru {
  const x = (e || {}) as { code?: string; status?: number; statusCode?: string | number; message?: string; name?: string };
  const m = String(x.message || e || "").toLowerCase();
  if (typeof navigator !== "undefined" && !navigator.onLine) return "ag";
  if (x.name === "StorageUnknownError" || m.includes("failed to fetch") || m.includes("networkerror") || m.includes("load failed") || m.includes("network request failed") || m.includes("fetch failed")) return "ag";
  if (x.code === "42501" || m.includes("row-level security") || Number(x.status) === 403 || String(x.statusCode) === "403") return "izin";
  if (x.code === "PGRST301" || x.code === "PGRST303" || m.includes("jwt") || Number(x.status) === 401 || String(x.statusCode) === "401") return "oturum";
  return "kalici";
}

// ======================= DEMO (this browser only) =======================
// Turkish keys stay as they were; the English demo keeps its own copy.
const demoAnahtar = (dil: Dil) => {
  const o = dil === "en" ? "fx_demo_en_" : "fx_demo_";
  return { firma: o + "firma", raporlar: o + "raporlar", sablon: o + "sablonlar", ilk: o + "baslatildi" };
};

function useDemoDepo(aktif: boolean, bildir: (m: string, ms?: number) => void, dil: Dil): Depo {
  const DK = demoAnahtar(dil);
  const [hazir, setHazir] = useState(false);
  const [firma, setFirma] = useState<Firma>(demoFirma(dil));
  const [raporlar, setRaporlar] = useState<Rapor[]>([]);
  const [ozelSablon, setOzelSablon] = useState<Sablon[]>([]);

  useEffect(() => {
    // dil !== aktifDil(): the first (server-language) render before the browser language applies
    if (!aktif || dil !== aktifDil()) return;
    let ilk = false;
    try { ilk = !localStorage.getItem(DK.ilk); } catch {}
    let f = demoFirma(dil);
    let l = demoRaporlar(dil);
    let s: Sablon[] = [];
    if (ilk) {
      try {
        localStorage.setItem(DK.ilk, "1");
        localStorage.setItem(DK.firma, JSON.stringify(f));
        localStorage.setItem(DK.raporlar, JSON.stringify(l));
      } catch {}
    } else {
      f = oku(DK.firma, BOS_FIRMA);
      l = oku<Rapor[]>(DK.raporlar, []);
      s = oku<Sablon[]>(DK.sablon, []);
    }
    setFirma(f);
    setRaporlar(l);
    setOzelSablon(s);
    setHazir(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aktif, dil]);

  const yazRaporlar = (l: Rapor[]) => {
    try { localStorage.setItem(DK.raporlar, JSON.stringify(l)); setRaporlar(l); return true; }
    catch { bildir(c("Depolama dolu: bazı fotoğrafları silip yeniden dene ya da Ayarlar'dan yedek alıp eski kayıtları temizle.", "Storage is full: delete some photos and try again, or download a backup in Settings and clear old records.")); return false; }
  };
  const firmaKaydet = (f: Firma) => {
    setFirma(f);
    try { localStorage.setItem(DK.firma, JSON.stringify(f)); return true; }
    catch { bildir(c("Logo çok büyük, daha küçük bir dosya dene.", "The logo is too large, try a smaller file.")); return false; }
  };
  const sablonKaydet = (l: Sablon[]) => { setOzelSablon(l); try { localStorage.setItem(DK.sablon, JSON.stringify(l)); } catch {} };

  return {
    hazir,
    firma,
    raporlar,
    ozelSablon,
    durum: null,
    aktarim: null,
    aktar: () => {},
    aktarimGizle: () => {},
    raporKaydet: (r) => yazRaporlar(raporlar.some((x) => x.id === r.id) ? raporlar.map((x) => (x.id === r.id ? r : x)) : [r, ...raporlar]),
    raporSil: (id) => { yazRaporlar(raporlar.filter((x) => x.id !== id)); },
    firmaKaydet,
    sablonKaydet,
    yedekYukle: async (d) => {
      if (d.firma) firmaKaydet(d.firma);
      yazRaporlar(d.raporlar.map(normal));
      if (Array.isArray(d.sablonlar)) sablonKaydet(d.sablonlar);
      bildir(c(`${d.raporlar.length} rapor yüklendi`, `${d.raporlar.length} reports loaded`));
    },
    ornekYukle: () => { firmaKaydet(demoFirma(dil)); yazRaporlar(demoRaporlar(dil)); bildir(c("Örnek kayıtlar yüklendi", "Sample records loaded")); },
    tumunuSil: async () => { yazRaporlar([]); bildir(c("Raporlar silindi", "Reports deleted")); },
    yedekVerisi: async () => ({ firma, raporlar, sablonlar: ozelSablon }),
    coz: (r) => r,
    cozSrc: (s) => s,
    gorselHazirla: async (r) => r,
    duzenlemeHazirla: async (r) => kopya(r),
  };
}

// ======================= BULUT (Supabase account) =======================
const BILINMEYEN = "?"; // firm account of an older waiting change that can't be known

type Islem = (
  // save a report (photos stay data: URLs until it is written). b = server version (guncelleme) the change
  // was made on, null = a report not on the server yet, missing = older change without one (written as before).
  | { k: string; t: "r"; r: Rapor; b?: string | null }
  | { k: string; t: "a"; id: string } // import a report of the old local-only version (read from sf_raporlar)
  | { k: string; t: "s"; id: string } // delete a report
  | { k: string; t: "f"; firma: Firma; sablonlar: Sablon[] } // firm settings and own templates
) & { h?: string }; // firm account the change was made for (older changes: see eskiHesap)

class BulutMotor {
  sb: SupabaseClient;
  uid: string;
  hesap: string; // firm account id: records, files and numbering
  eskiHesap: string; // firm account of waiting changes written before they carried one (h); "?" = unknown
  sahip: boolean; // false for a technician of the team
  bildir: (m: string, ms?: number) => void;
  sunucuFirma: Firma | null = null;
  sunucuSablon: Sablon[] = [];
  sunucuRapor = new Map<string, Rapor>();
  sunucuSurum = new Map<string, string>(); // report id -> its guncelleme on the server
  kendi = new Map<string, string>(); // "id version" -> version this phone wrote over it
  kuyruk: Islem[] = [];
  eski: Map<string, Rapor> | null = null;
  yuklendi = false;
  cevrimdisi = false;
  gonderiliyor = false;
  hata = "";
  aktarim: Aktarim | null = null;
  sonYenileme = 0;
  islemdeki = "";
  urller = new Map<string, { url: string; bitis: number }>();
  bekleyenUrl = new Set<string>();
  cozuluyor = new Set<string>();
  basarisizUrl = new Map<string, number>();
  urlZamanlayici = 0;
  zincir: Promise<unknown> = Promise.resolve();
  dinleyiciler = new Set<() => void>();
  temizlik: (() => void)[] = [];
  kapandi = false;
  // what the panel shows
  liste: Rapor[] = [];
  gFirma: Firma = BOS_FIRMA;
  gSablon: Sablon[] = [];

  constructor(sb: SupabaseClient, kullanici: string, hesap: Hesap, bildir: (m: string, ms?: number) => void) {
    this.sb = sb;
    this.uid = kullanici;
    this.hesap = hesap.id;
    this.sahip = hesap.sahip;
    this.bildir = bildir;
    // Older changes (no h) belong to the firm account of the list cache. Without a cache their firm can't
    // be known: they are kept on the phone under "?" and never sent automatically (no guessing).
    this.eskiHesap = oku<{ hesap?: string } | null>(`fx_onbellek_${kullanici}`, null)?.hesap ?? BILINMEYEN;
  }

  get kK() { return `fx_kuyruk_${this.uid}`; }
  get kO() { return `fx_onbellek_${this.uid}`; }
  get kA() { return `fx_aktarim_${this.uid}`; }

  abone(f: () => void) { this.dinleyiciler.add(f); return () => { this.dinleyiciler.delete(f); }; }
  degisti() {
    if (this.kapandi) return;
    this.yeniden();
    this.dinleyiciler.forEach((f) => f());
  }
  sirada<T>(f: () => Promise<T>): Promise<T> {
    const p = this.zincir.then(f, f);
    this.zincir = p.catch(() => {});
    return p;
  }

  // ---------- outbox (localStorage) ----------
  // Every waiting change carries the firm account it was made for. Changes of another firm account
  // (the user left or was removed from a team and joined another one) stay on this phone: they are
  // never shown, counted or sent here, and go out only if the user is back in that firm account.
  islemHesabi(o: Islem) { return o.h ?? this.eskiHesap; }
  hamKuyruk(): Islem[] | null {
    try {
      const v = JSON.parse(localStorage.getItem(this.kK) || "[]");
      return Array.isArray(v) ? (v as Islem[]) : [];
    } catch {
      return null;
    }
  }
  kuyrukOku(): Islem[] {
    const l = this.hamKuyruk();
    return l ? l.filter((o) => this.islemHesabi(o) === this.hesap) : this.kuyruk;
  }
  baskaHesabin(): Islem[] {
    return (this.hamKuyruk() ?? []).filter((o) => this.islemHesabi(o) !== this.hesap).map((o) => ({ ...o, h: this.islemHesabi(o) }));
  }
  kuyrukYaz(l: Islem[]): boolean {
    const s = JSON.stringify([...this.baskaHesabin(), ...l.map((o) => ({ ...o, h: o.h ?? this.hesap }))]);
    try {
      localStorage.setItem(this.kK, s);
    } catch {
      try {
        localStorage.removeItem(this.kO); // the cache can be rebuilt, the outbox cannot
        localStorage.setItem(this.kK, s);
      } catch {
        return false;
      }
    }
    this.kuyruk = l;
    return true;
  }
  kuyrukEkle(op: Islem): boolean {
    if (op.t === "r" && !("b" in op)) {
      // The version this change is made on: the one the edit started from (duzenlemeHazirla; a copy
      // under a new id doesn't count), otherwise the current one.
      const { surum, ...r } = op.r;
      const b = this.kendiYazimi(r.id, surum && surum.id === r.id ? surum.b : this.temelSurum(r.id));
      op = b === undefined ? { ...op, r } : { ...op, r, b };
    }
    const hedef = op.t === "f" ? "" : op.t === "r" ? op.r.id : op.id;
    // A newer change replaces older waiting changes of the same report (never the one being sent).
    const l = this.kuyrukOku().filter((o) => {
      if (o.k === this.islemdeki) return true;
      if (op.t === "f") return o.t !== "f";
      return !((o.t === "r" && o.r.id === hedef) || (o.t === "a" && o.id === hedef));
    });
    l.push({ ...op, h: this.hesap });
    if (!this.kuyrukYaz(l)) return false;
    this.degisti();
    return true;
  }
  kuyrukCikar(k: string) { this.kuyrukYaz(this.kuyrukOku().filter((o) => o.k !== k)); }
  kuyrukDegistir(k: string, yeni: Islem) {
    const l = this.kuyrukOku();
    const i = l.findIndex((o) => o.k === k);
    if (i >= 0) { l[i] = { ...yeni, h: this.hesap }; this.kuyrukYaz(l); }
  }

  // ---------- what the panel shows: server state + waiting changes ----------
  eskiRapor(id: string): Rapor | undefined {
    if (!this.eski) {
      const l = oku<Rapor[]>("sf_raporlar", []);
      this.eski = new Map((Array.isArray(l) ? l : []).filter((r) => r && r.id).map((r) => [r.id, normal(r)]));
    }
    return this.eski.get(id);
  }
  yeniden() {
    const m = new Map(this.sunucuRapor); // newest first
    const yeni: string[] = []; // reports not on the server yet, newest first
    let f: Firma = this.sunucuFirma ?? BOS_FIRMA;
    let s = this.sunucuSablon;
    for (const op of this.kuyruk) {
      const r = op.t === "r" ? op.r : op.t === "a" ? this.eskiRapor(op.id) : undefined;
      if (r) { if (!m.has(r.id)) yeni.unshift(r.id); m.set(r.id, r); }
      else if (op.t === "s") m.delete(op.id);
      else if (op.t === "f") { f = op.firma; s = op.sablonlar; }
    }
    const ust = new Set(yeni.filter((id) => m.has(id)));
    this.liste = [...[...ust].map((id) => m.get(id)!), ...[...m.values()].filter((r) => !ust.has(r.id))];
    this.gFirma = { ...BOS_FIRMA, ...f };
    this.gSablon = s;
  }
  bekleyen() { return this.kuyruk.filter((o) => o.t !== "f").length + (this.kuyruk.some((o) => o.t === "f") ? 1 : 0); }

  // ---------- cache (so the list opens fast and offline) ----------
  onbellekOku() {
    const o = oku<{ hesap?: string; firma: Firma | null; sablonlar: Sablon[]; raporlar: Rapor[]; surumler?: Record<string, string> } | null>(this.kO, null);
    if (!o) return false;
    // A cache of another firm account (left or removed from a team) is dropped, never shown.
    if ((o.hesap ?? this.uid) !== this.hesap) {
      try { localStorage.removeItem(this.kO); } catch {}
      return false;
    }
    this.sunucuFirma = o.firma;
    this.sunucuSablon = o.sablonlar || [];
    this.sunucuRapor = new Map((o.raporlar || []).map((r) => [r.id, normal(r)]));
    this.sunucuSurum = new Map(Object.entries(o.surumler || {}));
    return true;
  }
  onbellekYaz() {
    // Older changes without h take their firm account from this cache. If giving them one failed (phone
    // storage full), a cache of this firm account would hand them to it on the next start: not written.
    if (this.eskiHesap !== this.hesap && this.hamKuyruk()?.some((o) => !o.h)) return;
    try {
      localStorage.setItem(this.kO, JSON.stringify({ hesap: this.hesap, firma: this.sunucuFirma, sablonlar: this.sunucuSablon, raporlar: [...this.sunucuRapor.values()], surumler: Object.fromEntries(this.sunucuSurum) }));
    } catch {
      try { localStorage.removeItem(this.kO); } catch {}
    }
  }

  // ---------- start / stop ----------
  async baslat() {
    this.kuyruk = this.kuyrukOku();
    // Older changes get their firm account once (tried again on every start until it is written).
    if (this.hamKuyruk()?.some((o) => !o.h) && !this.kuyrukYaz(this.kuyruk))
      this.bildir(c("Telefonun hafızası dolu; bekleyen eski değişiklikler düzenlenemedi. Biraz yer açıp sayfayı yenile.", "Your phone's storage is full; older waiting changes couldn't be updated. Free up some space and refresh the page."), 10000);
    const baska = this.baskaHesabin();
    const bilinmeyen = baska.filter((o) => o.h === BILINMEYEN).length;
    if (bilinmeyen) this.bildir(c(`Bu telefonda hangi firmaya ait olduğu bilinmeyen ${bilinmeyen} eski değişiklik var; güvenlik için gönderilmedi. Yardım için info@motiqai.com'a yaz.`, `This phone has ${bilinmeyen} older change(s) whose company account is unknown; for safety they weren't sent. Email info@motiqai.com for help.`), 10000);
    else if (baska.length) this.bildir(c(`Bu telefonda başka bir firma hesabına ait gönderilmemiş ${baska.length} değişiklik var; bu hesaba gönderilmez.`, `This phone has ${baska.length} unsent change(s) from another company account; they won't be sent to this account.`), 8000);
    if (this.onbellekOku()) { this.yuklendi = true; this.degisti(); }
    await this.sirada(() => this.sunucudanYukle());
    this.aktarimKontrol();
    this.yuklendi = true;
    this.degisti();

    const cevrimici = () => { this.cevrimdisi = false; this.degisti(); this.gonder(); this.yenile(); };
    const cevrimdisi = () => { this.cevrimdisi = true; this.degisti(); };
    const gorunur = () => { if (document.visibilityState === "visible") { this.gonder(); this.yenile(); } };
    const depoOlayi = (e: StorageEvent) => { if (e.key === this.kK) { this.kuyruk = this.kuyrukOku(); this.degisti(); } };
    window.addEventListener("online", cevrimici);
    window.addEventListener("offline", cevrimdisi);
    document.addEventListener("visibilitychange", gorunur);
    window.addEventListener("storage", depoOlayi);
    const t = window.setInterval(() => { if (this.kuyruk.length) this.gonder(); }, 20000);
    this.temizlik.push(() => {
      window.removeEventListener("online", cevrimici);
      window.removeEventListener("offline", cevrimdisi);
      document.removeEventListener("visibilitychange", gorunur);
      window.removeEventListener("storage", depoOlayi);
      window.clearInterval(t);
    });
    this.gonder();
  }
  kapat() {
    this.kapandi = true;
    this.temizlik.forEach((f) => f());
    this.dinleyiciler.clear();
  }

  // Reads are not retried by the client library (it would wait 1 + 2 + 4 s per request without internet).
  async sunucudanYukle() {
    try {
      if (!navigator.onLine) throw new Error("Failed to fetch");
      const f = await this.sb.from("firmalar").select("firma, sablonlar").eq("user_id", this.hesap).retry(false).maybeSingle();
      if (f.error) throw f.error;
      const liste: { r: Rapor; z: string; g: string }[] = [];
      for (let i = 0; ; i += SAYFA) {
        const { data, error } = await this.sb.from("raporlar").select("id, no, veri, olusturma, guncelleme").eq("user_id", this.hesap).order("id").range(i, i + SAYFA - 1).retry(false);
        if (error) throw error;
        for (const s of data || []) liste.push({ r: normal({ ...(s.veri as Rapor), id: s.id as string, no: s.no as string }), z: String(s.olusturma || ""), g: String(s.guncelleme || "") });
        if (!data || data.length < SAYFA) break;
      }
      liste.sort((a, b) => b.z.localeCompare(a.z));
      this.sunucuFirma = f.data ? ({ ...BOS_FIRMA, ...(f.data.firma as Firma) }) : null;
      this.sunucuSablon = f.data && Array.isArray(f.data.sablonlar) ? (f.data.sablonlar as Sablon[]) : [];
      this.sunucuRapor = new Map(liste.map((x) => [x.r.id, x.r]));
      this.sunucuSurum = new Map(liste.filter((x) => x.g).map((x) => [x.r.id, x.g]));
      this.sonYenileme = Date.now();
      this.cevrimdisi = false;
      this.onbellekYaz();
    } catch (e) {
      const t = hataTuru(e);
      if (t === "ag") this.cevrimdisi = true;
      else if (t === "oturum") this.hata = c("Oturumun kapanmış. Çıkış yapıp yeniden giriş yap.", "Your session has ended. Sign out and sign in again.");
      else this.hata = c("Kayıtlar yüklenemedi. Sayfayı yenileyip tekrar dene.", "Your records couldn't be loaded. Refresh the page and try again.");
    }
  }
  yenile() {
    if (Date.now() - this.sonYenileme < YENILEME_ARA || this.kuyruk.length || this.gonderiliyor) return;
    this.sonYenileme = Date.now();
    this.sirada(async () => { if (!this.kuyrukOku().length) { await this.sunucudanYukle(); this.degisti(); } });
  }

  // ---------- sending ----------
  gonder(): Promise<void> {
    if (this.gonderiliyor || this.kapandi) return Promise.resolve();
    return this.sirada(async () => {
      const calis = async () => {
        this.kuyruk = this.kuyrukOku();
        if (!this.kuyruk.length) return;
        this.gonderiliyor = true;
        this.degisti();
        let kalici = "";
        const atla = new Set<string>();
        try {
          for (;;) {
            const op = this.kuyrukOku().find((o) => !atla.has(o.k));
            if (!op) break;
            if (this.kapandi) break;
            this.islemdeki = op.k;
            try {
              await this.uygula(op);
              atla.add(op.k);
              this.kuyrukCikar(op.k);
              this.cevrimdisi = false;
              this.hata = "";
            } catch (e) {
              const t = hataTuru(e);
              if (t === "ag") { this.cevrimdisi = true; break; }
              if (t === "izin") { this.hata = this.sahip ? c("Deneme ya da abonelik süren bittiği için kayıtlar buluta gönderilemiyor.", "Your trial or subscription has ended, so records can't be sent to the cloud.") : c("Firmanın ekibi kapalı ya da aboneliği bitti; kayıtlar telefonda bekliyor. Firma sahibine haber ver.", "The company's team is off or its subscription has ended; your records are waiting on this phone. Let the owner know."); break; }
              if (t === "oturum") { this.hata = c("Oturumun kapanmış. Çıkış yapıp yeniden giriş yap; kayıtların telefonda bekliyor.", "Your session has ended. Sign out and sign in again; your records are waiting on this phone."); break; }
              atla.add(op.k);
              kalici = String((e as { message?: string })?.message || e).slice(0, 140);
            } finally {
              this.islemdeki = "";
            }
            this.degisti();
          }
          if (kalici) this.hata = c(`Bir kayıt gönderilemedi (${kalici}). Tekrar denenecek.`, `A record couldn't be sent (${kalici}). It will be retried.`);
          if (!this.kuyruk.length) this.onbellekYaz();
        } finally {
          this.gonderiliyor = false;
          this.degisti();
        }
      };
      const kilit = typeof navigator !== "undefined" ? (navigator as Navigator & { locks?: LockManager }).locks : undefined;
      if (kilit) await kilit.request(`fx-gonder-${this.uid}`, { ifAvailable: true }, async (l) => { if (l) await calis(); });
      else await calis();
    });
  }

  async yukle(yol: string, src: string) {
    const blob = await (await fetch(src)).blob();
    const { error } = await this.sb.storage.from(KOVA).upload(yol, blob, { upsert: true, contentType: blob.type || "image/jpeg", cacheControl: "3600" });
    if (error) throw error;
    this.urller.set(yol, { url: src, bitis: Date.now() + 3500 * 1000 }); // keep showing the local copy, no flicker
  }
  // hepsi: the report is deleted, every file goes. Otherwise unused files go only once older than
  // DOSYA_BEKLEME (a file without a date stays).
  async klasorTemizle(id: string, kullanilan: Set<string>, hepsi = false) {
    if (!this.sahip) return; // only the owner deletes files; a technician leaves unused ones
    const yol = `${this.hesap}/${id}`;
    const { data, error } = await this.sb.storage.from(KOVA).list(yol, { limit: 1000 });
    if (error) throw error;
    const sinir = Date.now() - DOSYA_BEKLEME;
    const sil = (data || [])
      .filter((o) => { const t = Date.parse(o.updated_at || o.created_at || ""); return hepsi || (t > 0 && t < sinir); })
      .map((o) => `${yol}/${o.name}`)
      .filter((p) => !kullanilan.has(p));
    if (sil.length) {
      const { error: e } = await this.sb.storage.from(KOVA).remove(sil);
      if (e) throw e;
    }
  }
  async bosNo(r: Rapor): Promise<string> {
    const nolar: { no: string }[] = [];
    for (let i = 0; ; i += SAYFA) {
      const { data, error } = await this.sb.from("raporlar").select("no").eq("user_id", this.hesap).order("no").range(i, i + SAYFA - 1).retry(false);
      if (error) throw error;
      nolar.push(...((data || []) as { no: string }[]));
      if (!data || data.length < SAYFA) break;
    }
    const yerel = this.liste.filter((x) => x.id !== r.id).map((x) => ({ no: x.no }));
    const m = /^(.+)-(\d{4})-\d+$/.exec(r.no);
    const onek = m ? m[1] : this.gFirma.onek || "SR";
    const yil = m ? Number(m[2]) : Number(r.tarih.slice(0, 4)) || new Date().getFullYear();
    return yeniNo([...nolar, ...yerel] as unknown as Rapor[], onek, yil);
  }

  async uygula(op: Islem) {
    if (op.t === "f") {
      if (!this.sahip) return; // firm settings are the owner's
      const { error } = await this.sb.from("firmalar").upsert({ user_id: this.hesap, firma: op.firma, sablonlar: op.sablonlar }, { onConflict: "user_id" });
      if (error) throw error;
      this.sunucuFirma = op.firma;
      this.sunucuSablon = op.sablonlar;
      return;
    }
    if (op.t === "s") {
      if (!this.sahip) return; // only the owner deletes reports
      const { error } = await this.sb.from("raporlar").delete().eq("user_id", this.hesap).eq("id", op.id);
      if (error) throw error;
      await this.klasorTemizle(op.id, new Set(), true);
      this.sunucuRapor.delete(op.id);
      this.sunucuSurum.delete(op.id);
      return;
    }
    const kaynak = op.t === "r" ? op.r : this.eskiRapor(op.id);
    if (!kaynak) return; // the old local record is gone
    let ham = normal(kopya(kaynak)); // as waiting: photos stay data: URLs until the report is written
    let r = await this.dosyalariYukle(ham, op.k);
    const b = op.t === "r" ? op.b : undefined;
    let sonuc: Awaited<ReturnType<BulutMotor["raporYaz"]>>;
    for (let deneme = 0; ; deneme++) {
      try {
        sonuc = await this.raporYaz(r, b);
        break;
      } catch (error) {
        const e = error as { code?: string; message?: string };
        if (e.code === "23505" && /raporlar_no_tekil/.test(e.message || "") && deneme < 3) {
          const eskiNo = r.no;
          const no = await this.bosNo(r);
          r = { ...r, no };
          ham = { ...ham, no };
          this.kuyrukDegistir(op.k, op.t === "r" ? { ...op, r: ham } : { k: op.k, t: "r", r: ham });
          this.bildir(c(`${eskiNo} numarası başka bir telefonda kullanılmış. Bu rapor ${r.no} olarak kaydedildi.`, `Number ${eskiNo} was already used on another phone. This report was saved as ${r.no}.`), 8000);
          continue;
        }
        throw error;
      }
    }
    if (sonuc.s === "silinmis") {
      // Deleted on another device after this change was made: not brought back.
      this.sunucuRapor.delete(r.id);
      this.sunucuSurum.delete(r.id);
      this.bildir(c(`${r.no} raporu başka bir cihazda silinmiş; bu telefondaki değişiklik onu geri getirmedi.`, `Report ${r.no} was deleted on another device; the change on this phone didn't bring it back.`), 10000);
      return;
    }
    if (sonuc.s === "cakisma") {
      this.sunucuRapor.set(r.id, normal({ ...(sonuc.veri as Rapor), id: r.id }));
      this.sunucuSurum.set(r.id, sonuc.surum);
      await this.cakismaKopyasi({ ...ham, no: r.no }, op.k);
      return;
    }
    this.surumYenile(r.id, b, sonuc.surum, op.k);
    await this.klasorTemizle(r.id, new Set(refler(r).map(String)));
    if (this.sunucuRapor.has(r.id)) this.sunucuRapor.set(r.id, r);
    else this.sunucuRapor = new Map([[r.id, r], ...this.sunucuRapor]); // new report on top
  }

  // Photos and the signature go up at fixed paths (photo id, change key) on every try, so the report
  // never points to a file that a cleanup on another phone removed in the meantime.
  async dosyalariYukle(ham: Rapor, k: string): Promise<Rapor> {
    const r = kopya(ham);
    for (const f of r.fotolar) {
      if (f.src.startsWith("data:")) {
        const yol = `${this.hesap}/${r.id}/${f.id}.${f.src.startsWith("data:image/png") ? "png" : "jpg"}`;
        await this.yukle(yol, f.src);
        f.src = "sb:" + yol;
      }
    }
    if (r.imza.startsWith("data:")) {
      const yol = `${this.hesap}/${r.id}/imza-${k}.png`;
      await this.yukle(yol, r.imza);
      r.imza = "sb:" + yol;
    }
    return r;
  }

  // Writes the report only over the version the change was made on (b). Not written: "silinmis" (gone
  // from the server) or "cakisma" (changed on another device; veri/surum = the server's version).
  async raporYaz(r: Rapor, b: string | null | undefined): Promise<{ s: "tamam"; surum: string } | { s: "silinmis" } | { s: "cakisma"; veri: unknown; surum: string }> {
    const satir = { user_id: this.hesap, id: r.id, no: r.no, veri: r };
    if (b === undefined) {
      const { data, error } = await this.sb.from("raporlar").upsert(satir, { onConflict: "user_id,id" }).select("guncelleme").single();
      if (error) throw error;
      return { s: "tamam", surum: String(data.guncelleme) };
    }
    if (b === null) {
      const { data, error } = await this.sb.from("raporlar").insert(satir).select("guncelleme").single();
      if (!error) return { s: "tamam", surum: String(data.guncelleme) };
      if (!(error.code === "23505" && /raporlar_pkey/.test(error.message || ""))) throw error;
    } else {
      const { data, error } = await this.sb.from("raporlar").update({ no: r.no, veri: r }).eq("user_id", this.hesap).eq("id", r.id).eq("guncelleme", b).select("guncelleme");
      if (error) throw error;
      if (data?.length) return { s: "tamam", surum: String(data[0].guncelleme) };
    }
    // Not written: changed or deleted since, or this is a retry of a write whose answer was lost.
    const { data, error } = await this.sb.from("raporlar").select("veri, guncelleme").eq("user_id", this.hesap).eq("id", r.id).retry(false).maybeSingle();
    if (error) throw error;
    if (!data) return { s: "silinmis" };
    if (ayni(data.veri, r)) return { s: "tamam", surum: String(data.guncelleme) };
    return { s: "cakisma", veri: data.veri, surum: String(data.guncelleme) };
  }

  // Version of report id the screen shows: that of its waiting change (the server hasn't seen it yet),
  // otherwise the server's; null = not on the server, undefined = not known (written as before).
  temelSurum(id: string): string | null | undefined {
    const o = this.kuyrukOku().filter((x) => x.t === "r" && x.r.id === id).pop(); // the newest one is shown
    if (o?.t === "r") return o.b;
    return this.sunucuSurum.get(id) ?? (this.sunucuRapor.has(id) ? undefined : null);
  }
  // A version replaced by this phone's own write counts as that write (the edit was opened while it was being sent).
  kendiYazimi(id: string, b: string | null | undefined): string | null | undefined {
    for (let i = 0; i < 20 && b !== undefined && this.kendi.has(`${id} ${b}`); i++) b = this.kendi.get(`${id} ${b}`);
    return b;
  }

  // After a write: other waiting changes of the report made on the same version now build on the new one.
  surumYenile(id: string, eski: string | null | undefined, yeni: string, k: string) {
    this.sunucuSurum.set(id, yeni);
    if (eski === undefined) return;
    this.kendi.set(`${id} ${eski}`, yeni);
    const l = this.kuyrukOku();
    let degisti = false;
    for (const o of l) if (o.t === "r" && o.k !== k && o.r.id === id && o.b === eski) { o.b = yeni; degisti = true; }
    if (degisti) this.kuyrukYaz(l);
  }

  // Both versions are kept: the server keeps the other device's, this phone's becomes a new report (id
  // from the change key, so a retry finds the same copy). Its files are copied into its own folder.
  // ham: the change as waiting; photos not uploaded yet (data:) go up into the copy's folder.
  async cakismaKopyasi(ham: Rapor, k: string) {
    const r = ham;
    const id = "c" + k;
    let eksik = 0;
    const tasi = async (src: string) => {
      if (!src.startsWith("sb:")) return src;
      const hedef = `${this.hesap}/${id}/${src.split("/").pop()}`;
      const { error } = await this.sb.storage.from(KOVA).copy(src.slice(3), hedef);
      if (!error) return "sb:" + hedef;
      const e = error as { code?: string; statusCode?: string; status?: number };
      const kod = e.code || String(e.statusCode ?? e.status ?? "");
      if (kod === "ResourceAlreadyExists" || kod === "409") {
        // Copied by an earlier try: used only if it is really there.
        const { data: bulundu, error: ve } = await this.sb.storage.from(KOVA).exists(hedef);
        if (!ve && bulundu) return "sb:" + hedef;
      }
      if (kod === "NoSuchKey" || kod === "404") { eksik++; return ""; } // removed with the other version: counted and told
      throw error; // anything else: the change stays waiting and is tried again
    };
    const fotolar: Rapor["fotolar"] = [];
    for (const f of r.fotolar) { const src = await tasi(f.src); if (src) fotolar.push({ ...f, src }); }
    let kopyaR: Rapor = await this.dosyalariYukle({ ...r, id, fotolar, imza: await tasi(r.imza) }, k);
    // A retry finds the copy already written: it keeps its number (and is then the same content).
    const { data: mevcut, error: ve } = await this.sb.from("raporlar").select("no").eq("user_id", this.hesap).eq("id", id).retry(false).maybeSingle();
    if (ve) throw ve;
    kopyaR = { ...kopyaR, no: mevcut ? String(mevcut.no) : await this.bosNo(kopyaR) };
    for (let deneme = 0; ; deneme++) {
      if (deneme) kopyaR = { ...kopyaR, no: await this.bosNo(kopyaR) };
      try {
        const s = await this.raporYaz(kopyaR, null);
        if (s.s !== "tamam") throw new Error("kopya yazılamadı");
        this.sunucuSurum.set(id, s.surum);
        break;
      } catch (error) {
        const e = error as { code?: string; message?: string };
        if (e.code === "23505" && /raporlar_no_tekil/.test(e.message || "") && deneme < 3) continue;
        throw error;
      }
    }
    this.sunucuRapor = new Map([[id, kopyaR], ...this.sunucuRapor]);
    const ek = eksik ? c(` Diğer sürümde silinmiş ${eksik} fotoğraf ya da imza bu rapora alınamadı.`, ` ${eksik} photo(s) or signature removed in the other version couldn't be added to it.`) : "";
    this.bildir(c(`${r.no} raporu başka bir cihazda da değiştirilmiş. İki sürüm de saklandı: bu telefondaki değişiklik ${kopyaR.no} numarasıyla ayrı rapor oldu.`, `Report ${r.no} was also changed on another device. Both versions were kept: the change on this phone became a separate report, ${kopyaR.no}.`) + ek, 12000);
  }

  // ---------- photos and signatures: short-lived private links ----------
  cozSrc(src: string): string {
    if (!src || !src.startsWith("sb:")) return src;
    const yol = src.slice(3);
    const u = this.urller.get(yol);
    if (u && u.bitis > Date.now() + 60000) return u.url;
    const b = this.basarisizUrl.get(yol);
    if (!b || Date.now() - b > KAPALI_SURE) this.urlIste(yol);
    return u ? u.url : BOS_GORSEL;
  }
  coz(r: Rapor): Rapor {
    if (!refler(r).length) return r;
    return { ...r, fotolar: r.fotolar.map((f) => ({ ...f, src: this.cozSrc(f.src) })), imza: this.cozSrc(r.imza) };
  }
  urlIste(yol: string) {
    if (this.cozuluyor.has(yol)) return;
    this.bekleyenUrl.add(yol);
    if (!this.urlZamanlayici) this.urlZamanlayici = window.setTimeout(() => { this.urlZamanlayici = 0; this.urlCoz(); }, 0);
  }
  async urlCoz() {
    const yollar = [...this.bekleyenUrl].filter((y) => !this.cozuluyor.has(y));
    this.bekleyenUrl.clear();
    if (!yollar.length) return;
    yollar.forEach((y) => this.cozuluyor.add(y));
    try {
      const { data, error } = await this.sb.storage.from(KOVA).createSignedUrls(yollar, 3600);
      if (error) throw error;
      const gelen = new Set<string>();
      for (const d of data || []) {
        if (d.path && d.signedUrl) { this.urller.set(d.path, { url: d.signedUrl, bitis: Date.now() + 3500 * 1000 }); gelen.add(d.path); }
      }
      yollar.filter((y) => !gelen.has(y)).forEach((y) => this.basarisizUrl.set(y, Date.now()));
    } catch {
      yollar.forEach((y) => this.basarisizUrl.set(y, Date.now()));
    } finally {
      yollar.forEach((y) => this.cozuluyor.delete(y));
      this.degisti();
    }
  }
  // Before printing: wait until every photo and the signature has a link (at most 8 seconds).
  async gorselHazirla(r: Rapor): Promise<Rapor> {
    const denendi = new Set<string>();
    const son = Date.now() + 8000;
    while (Date.now() < son) {
      const eksik = refler(r).filter((y) => !((this.urller.get(y)?.bitis || 0) > Date.now() + 60000));
      if (!eksik.length) break;
      const yeni = eksik.filter((y) => !this.cozuluyor.has(y) && !denendi.has(y));
      if (yeni.length) {
        yeni.forEach((y) => { denendi.add(y); this.basarisizUrl.delete(y); this.bekleyenUrl.add(y); });
        await this.urlCoz();
      } else if (eksik.some((y) => this.cozuluyor.has(y))) {
        await new Promise((c) => setTimeout(c, 100));
      } else break;
    }
    return this.coz(r);
  }
  async indir(src: string): Promise<string> {
    if (!src.startsWith("sb:")) return src;
    const { data, error } = await this.sb.storage.from(KOVA).download(src.slice(3));
    if (error || !data) throw error || new Error("indirilemedi");
    return dataUrl(data);
  }
  async duzenlemeHazirla(r: Rapor): Promise<Rapor> {
    const t = kopya(r);
    t.surum = { id: t.id, b: this.temelSurum(t.id) }; // saved over this version only, whatever is loaded meanwhile
    // The signature pad redraws the old signature on a canvas, so it needs the image itself, not a link.
    if (t.imza.startsWith("sb:")) { try { t.imza = await this.indir(t.imza); } catch {} }
    return t;
  }

  // ---------- old local-only records ----------
  aktarimKontrol() {
    if (!this.sahip) return; // old local records go to the owner's own account only
    try { if (localStorage.getItem(this.kA)) return; } catch { return; }
    const l = oku<Rapor[]>("sf_raporlar", []);
    const raporlar = (Array.isArray(l) ? l : []).filter((r) => r && r.id && !String(r.id).startsWith("demo"));
    const f = oku<Firma | null>("sf_firma", null);
    const firmaVar = !!(f && f.ad && f.ad !== DEMO_FIRMA.ad);
    const s = oku<Sablon[]>("sf_sablonlar", []);
    const sablon = Array.isArray(s) ? s.length : 0;
    this.aktarim = raporlar.length || firmaVar || sablon ? { rapor: raporlar.length, firma: firmaVar, sablon } : null;
  }
  aktar() {
    if (!this.aktarim) return;
    const l = oku<Rapor[]>("sf_raporlar", []);
    const raporlar = (Array.isArray(l) ? l : []).filter((r) => r && r.id && !String(r.id).startsWith("demo"));
    const varolan = new Set(this.liste.map((r) => r.id));
    let n = 0;
    for (const r of raporlar) {
      if (varolan.has(r.id)) continue;
      if (!this.kuyrukEkle({ k: uid() + uid(), t: "a", id: r.id })) { this.bildir(c("Telefonun depolama alanı dolu; aktarım tamamlanamadı.", "Your phone's storage is full; the transfer couldn't finish.")); return; }
      n++;
    }
    const f = oku<Firma | null>("sf_firma", null);
    const s = oku<Sablon[]>("sf_sablonlar", []);
    const eskiSablon = Array.isArray(s) ? s : [];
    const birlesik = [...this.gSablon, ...eskiSablon.filter((x) => !this.gSablon.some((y) => y.id === x.id))];
    const firmaVar = !!(f && f.ad && f.ad !== DEMO_FIRMA.ad);
    if ((firmaVar && !this.gFirma.ad) || birlesik.length !== this.gSablon.length) {
      this.kuyrukEkle({ k: uid() + uid(), t: "f", firma: firmaVar && !this.gFirma.ad && f ? { ...BOS_FIRMA, ...f } : this.gFirma, sablonlar: birlesik });
    }
    try { localStorage.setItem(this.kA, "tamam"); } catch {}
    this.aktarim = null;
    this.degisti();
    this.bildir(n ? c(`${n} rapor hesabına aktarılıyor`, `Moving ${n} reports to your account`) : c("Bilgilerin hesabına aktarılıyor", "Moving your details to your account"));
    this.gonder();
  }
  aktarimGizle() {
    try { localStorage.setItem(this.kA, "gizlendi"); } catch {}
    this.aktarim = null;
    this.degisti();
  }

  // ---------- actions ----------
  raporKaydet(r: Rapor): boolean {
    if (!this.kuyrukEkle({ k: uid() + uid(), t: "r", r: normal(kopya(r)) })) {
      this.bildir(c("Telefonun depolama alanı dolu: bazı fotoğrafları silip yeniden dene.", "Your phone's storage is full: delete some photos and try again."), 6000);
      return false;
    }
    this.gonder();
    return true;
  }
  raporSil(id: string) {
    this.kuyrukEkle({ k: uid() + uid(), t: "s", id });
    this.gonder();
  }
  firmaKaydet(f: Firma): boolean {
    if (!this.kuyrukEkle({ k: uid() + uid(), t: "f", firma: f, sablonlar: this.gSablon })) {
      this.bildir(c("Logo çok büyük, daha küçük bir dosya dene.", "The logo is too large, try a smaller file."));
      return false;
    }
    this.gonder();
    return true;
  }
  sablonKaydet(l: Sablon[]) {
    this.kuyrukEkle({ k: uid() + uid(), t: "f", firma: this.gFirma, sablonlar: l });
    this.gonder();
  }
  async yedekYukle(d: Yedek) {
    if (!navigator.onLine) { this.bildir(c("Yedek yüklemek için internet bağlantısı gerekli.", "You need an internet connection to restore a backup.")); return; }
    await this.sirada(async () => {
      let n = 0;
      try {
        if (d.firma || Array.isArray(d.sablonlar)) {
          await this.uygula({ k: "yedek", t: "f", firma: d.firma ? { ...BOS_FIRMA, ...d.firma } : this.gFirma, sablonlar: Array.isArray(d.sablonlar) ? d.sablonlar : this.gSablon });
        }
        for (const r of d.raporlar) {
          await this.uygula({ k: "yedek", t: "r", r: normal(r) });
          n++;
          if (n % 5 === 0) { this.bildir(c(`Yedek yükleniyor: ${n} / ${d.raporlar.length}`, `Restoring backup: ${n} / ${d.raporlar.length}`)); this.degisti(); }
        }
        this.bildir(c(`${n} rapor yüklendi`, `${n} reports loaded`));
      } catch (e) {
        this.bildir(hataTuru(e) === "ag" ? c(`Bağlantı kesildi; ${n} rapor yüklendi. Kalanı için yedeği yeniden yükle.`, `Connection lost; ${n} reports loaded. Restore the backup again for the rest.`) : c(`Yedek yüklenemedi (${n} rapor yüklendi).`, `The backup couldn't be restored (${n} reports loaded).`), 7000);
      } finally {
        this.onbellekYaz();
        this.degisti();
      }
    });
  }
  async tumunuSil() {
    if (!this.sahip) return;
    if (!navigator.onLine) { this.bildir(c("Raporları silmek için internet bağlantısı gerekli.", "You need an internet connection to delete reports.")); return; }
    await this.sirada(async () => {
      try {
        const { error } = await this.sb.from("raporlar").delete().eq("user_id", this.hesap);
        if (error) throw error;
        const { data } = await this.sb.storage.from(KOVA).list(this.hesap, { limit: 1000 });
        for (const k of data || []) await this.klasorTemizle(k.name, new Set(), true);
        this.kuyrukYaz(this.kuyrukOku().filter((o) => o.t === "f"));
        this.sunucuRapor.clear();
        this.sunucuSurum.clear();
        this.onbellekYaz();
        this.bildir(c("Raporlar silindi", "Reports deleted"));
      } catch {
        this.bildir(c("Raporlar silinemedi. Bağlantını kontrol edip tekrar dene.", "Reports couldn't be deleted. Check your connection and try again."));
      } finally {
        this.degisti();
      }
    });
  }
  async yedekVerisi(): Promise<Required<Yedek>> {
    const raporlar: Rapor[] = [];
    for (const r0 of this.liste) {
      const r = kopya(r0);
      for (const f of r.fotolar) f.src = await this.indir(f.src);
      if (r.imza) r.imza = await this.indir(r.imza);
      raporlar.push(r);
    }
    return { firma: this.gFirma, raporlar, sablonlar: this.gSablon };
  }
}

function useBulutDepo(aktif: boolean, bildir: (m: string, ms?: number) => void, hesap: Hesap | null): Depo {
  const [motor, setMotor] = useState<BulutMotor | null>(null);
  const [, tik] = useReducer((x: number) => x + 1, 0);
  const bildirRef = useRef(bildir);
  bildirRef.current = bildir;

  useEffect(() => {
    if (!aktif) return;
    let iptal = false;
    let m: BulutMotor | null = null;
    (async () => {
      const sb = supabase();
      if (!sb) return;
      const { data } = await sb.auth.getSession();
      const kim = data.session?.user.id;
      if (!kim || iptal) return;
      m = new BulutMotor(sb, kim, hesap ?? { id: kim, sahip: true }, (t, ms) => bildirRef.current(t, ms));
      m.abone(tik);
      setMotor(m);
      await m.baslat();
    })();
    return () => { iptal = true; m?.kapat(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aktif, hesap?.id, hesap?.sahip]);

  const m = motor;
  const bos = async () => {};
  return {
    hazir: !!m?.yuklendi,
    firma: m ? m.gFirma : BOS_FIRMA,
    raporlar: m ? m.liste : [],
    ozelSablon: m ? m.gSablon : [],
    durum: m ? { bekleyen: m.bekleyen(), cevrimdisi: m.cevrimdisi, gonderiliyor: m.gonderiliyor, hata: m.hata } : { bekleyen: 0, cevrimdisi: false, gonderiliyor: false, hata: "" },
    aktarim: m ? m.aktarim : null,
    aktar: () => m?.aktar(),
    aktarimGizle: () => m?.aktarimGizle(),
    raporKaydet: (r) => (m ? m.raporKaydet(r) : false),
    raporSil: (id) => m?.raporSil(id),
    firmaKaydet: (f) => (m ? m.firmaKaydet(f) : false),
    sablonKaydet: (l) => m?.sablonKaydet(l),
    yedekYukle: (d) => (m ? m.yedekYukle(d) : bos()),
    ornekYukle: () => {},
    tumunuSil: () => (m ? m.tumunuSil() : bos()),
    yedekVerisi: () => (m ? m.yedekVerisi() : Promise.resolve({ firma: BOS_FIRMA, raporlar: [], sablonlar: [] })),
    coz: (r) => (m ? m.coz(r) : r),
    cozSrc: (s) => (m ? m.cozSrc(s) : s),
    gorselHazirla: (r) => (m ? m.gorselHazirla(r) : Promise.resolve(r)),
    duzenlemeHazirla: (r) => (m ? m.duzenlemeHazirla(r) : Promise.resolve(kopya(r))),
  };
}

export function useDepo(mod: Mod, bildir: (m: string, ms?: number) => void, dil: Dil = "tr", hesap: Hesap | null = null): Depo {
  const demo = useDemoDepo(mod === "demo", bildir, dil);
  const bulut = useBulutDepo(mod === "bulut", bildir, hesap);
  return mod === "demo" ? demo : bulut;
}
