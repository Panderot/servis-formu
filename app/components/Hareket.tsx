"use client";
// Panel motion (task 76): only transform and opacity, 150-300 ms, ease-out. Every piece turns off with
// prefers-reduced-motion. Nothing here changes what a screen looks like at rest.
import { Children, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import NumberFlow from "@number-flow/react";
import autoAnimate, { type AnimationController } from "@formkit/auto-animate";
import { Toaster, toast } from "sonner";
import Ikon from "./Ikon";
import { para } from "../lib/servis";
import type { Dil, ParaBirimi } from "../lib/servis";

const PARA_ON: Record<ParaBirimi, string> = { TL: "", USD: "$", EUR: "€", GBP: "£" };
const DONUS = { duration: 300, easing: "ease-out" };
const SAYI_ZAMAN = { transformTiming: DONUS, spinTiming: DONUS, opacityTiming: { duration: 200, easing: "ease-out" } };

// Last value shown per figure, so a figure rolls from 0 only once per visit (switching tabs does not replay it).
const SON_SAYI = new Map<string, number>();

// A KPI figure that rolls when it changes (and once from 0 on the first load). The text is exactly the
// app's own: money as para() writes it, counts as plain digits. If Intl would write the value differently
// from para() (or the value is negative), the plain text is shown instead.
export function Sayi({ ad, n, birim, dil }: { ad: string; n: number; birim?: ParaBirimi; dil: Dil }) {
  const [v, setV] = useState(() => SON_SAYI.get(ad) ?? 0);
  useEffect(() => { setV(n); SON_SAYI.set(ad, n); }, [n, ad]);
  const yerel = dil === "en" ? "en-US" : "tr-TR";
  if (!birim) {
    if (!Number.isInteger(n) || n < 0) return <>{String(n)}</>;
    return <span className="sayi"><NumberFlow {...SAYI_ZAMAN} value={v} locales={yerel} format={{ useGrouping: false, maximumFractionDigits: 0 }} /></span>;
  }
  const bicim = { minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: true } as const;
  const on = PARA_ON[birim];
  const son = birim === "TL" ? " TL" : "";
  if (n < 0 || on + new Intl.NumberFormat(yerel, bicim).format(n) + son !== para(n, birim, dil)) return <>{para(n, birim, dil)}</>;
  return <span className="sayi"><NumberFlow {...SAYI_ZAMAN} value={v} locales={yerel} format={bicim} prefix={on || undefined} suffix={son || undefined} /></span>;
}

// A list whose items slide in and out when they are added, removed, filtered or searched (AutoAnimate).
// AutoAnimate stays off with prefers-reduced-motion, and for lists longer than 200 items.
const LISTE_SINIR = 200;
export function Liste({ children, className, style }: { children: ReactNode; className?: string; style?: CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null);
  const kontrol = useRef<AnimationController | null>(null);
  const n = Children.count(children);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (n > LISTE_SINIR) {
      kontrol.current?.disable();
      kontrol.current?.destroy?.();
      kontrol.current = null;
    } else if (!kontrol.current) {
      kontrol.current = autoAnimate(el, { duration: 200, easing: "ease-out" });
    }
  }, [n]);
  useEffect(() => () => { kontrol.current?.destroy?.(); kontrol.current = null; }, []);
  return <div ref={ref} className={className} style={style}>{children}</div>;
}

// Desktop layout (side menu) from 1024 px, as Tailwind's lg.
const GENIS = "(min-width: 1024px)";
export function useGenis() {
  const [g, setG] = useState(() => typeof window !== "undefined" && window.matchMedia(GENIS).matches);
  useEffect(() => {
    const m = window.matchMedia(GENIS);
    const d = () => setG(m.matches);
    d();
    m.addEventListener("change", d);
    return () => m.removeEventListener("change", d);
  }, []);
  return g;
}

// Toast messages (Sonner, unstyled): the same dark card as before. Phone and tablet: bottom centre above the
// bottom menu; desktop: bottom right. Only the enter and leave motion is new.
export function TostAlani({ etiket }: { etiket: string }) {
  const genis = useGenis();
  return (
    <Toaster
      position={genis ? "bottom-right" : "bottom-center"}
      offset={genis ? { bottom: 24, right: 24 } : { bottom: 92 }}
      mobileOffset={{ bottom: 92, left: 16, right: 16 }}
      visibleToasts={1}
      swipeDirections={[]}
      containerAriaLabel={etiket}
      toastOptions={{ unstyled: true }}
      style={{ ["--width" as string]: genis ? "min(560px, calc(100vw - 48px))" : "calc(100vw - 32px)" }}
    />
  );
}
// One message at a time: a new one replaces the one on screen and starts its own time.
let sonTost: string | number | undefined;
export function tostGoster(metin: string, ms: number) {
  if (sonTost !== undefined) toast.dismiss(sonTost);
  sonTost = toast.custom(() => (
    <div className="tost-sar">
      <div role="status" className="tost"><Ikon ad="tik" boy={16} kalinlik={2.6} style={{ color: "#7cc4d6" }} />{metin}</div>
    </div>
  ), { duration: ms });
}

// Web Animations, started after React has drawn the element: if an animation cannot run, the element is
// simply shown as it is. Off with prefers-reduced-motion.
const AZ_HAREKET = "(prefers-reduced-motion: reduce)";
const azHareket = () => typeof window === "undefined" || window.matchMedia(AZ_HAREKET).matches;

// Switching Raporlar / Müşteriler / Ayarlar / form: a short fade and 8 px rise. Give it a key per view.
export function Gecis({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    if (azHareket()) return;
    ref.current?.animate([{ opacity: 0, transform: "translateY(8px)" }, { opacity: 1, transform: "none" }], { duration: 200, easing: "ease-out" });
  }, []);
  return <div ref={ref}>{children}</div>;
}

// Desktop side menu: the active item's background slides to the new item. At rest it sits exactly under the
// active item (same colour and radius as .navlink.on).
export function NavGosterge({ y, h, gorunur }: { y: number; h: number; gorunur: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  const onceki = useRef<{ y: number; g: boolean } | null>(null);
  useLayoutEffect(() => {
    const p = onceki.current;
    onceki.current = { y, g: gorunur };
    if (!p || (p.y === y && p.g === gorunur) || azHareket()) return;
    ref.current?.animate(
      [{ transform: `translateY(${p.y}px)`, opacity: p.g ? 1 : 0 }, { transform: `translateY(${y}px)`, opacity: gorunur ? 1 : 0 }],
      { duration: 220, easing: "ease-out" },
    );
  }, [y, gorunur]);
  return <span ref={ref} aria-hidden="true" className="nav-gosterge" style={{ height: h, transform: `translateY(${y}px)`, opacity: gorunur ? 1 : 0 }} />;
}

// Phone report detail: slides in from the right, and out to the right before going back to the list
// (the list then comes in from the left). Web Animations on one element; nothing remounts.
export function kaydirGel(el: HTMLElement | null, x: number | null) {
  if (!el) return;
  el.getAnimations().forEach((a) => a.cancel()); // also ends a finished slide-out that holds its last frame
  if (x === null || azHareket()) return;
  el.animate([{ transform: `translateX(${x}px)`, opacity: 0 }, { transform: "none", opacity: 1 }], { duration: 220, easing: "ease-out" });
}
export function kaydirGit(el: HTMLElement | null, x: number, sonra: () => void) {
  if (!el || azHareket()) { sonra(); return; }
  const a = el.animate([{ transform: "none", opacity: 1 }, { transform: `translateX(${x}px)`, opacity: 0 }], { duration: 160, easing: "ease-out", fill: "forwards" });
  a.finished.catch(() => {}).finally(sonra); // kaydirGel (run when the state has changed) clears the last frame
}
