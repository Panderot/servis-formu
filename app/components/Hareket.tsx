"use client";
// Panel motion (task 76): only transform and opacity, 150-300 ms, ease-out. Every piece turns off with
// prefers-reduced-motion. Nothing here changes what a screen looks like at rest.
import { Children, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import NumberFlow from "@number-flow/react";
import autoAnimate, { type AnimationController } from "@formkit/auto-animate";
import { para } from "../lib/servis";
import type { Dil, ParaBirimi } from "../lib/servis";

const PARA_ON: Record<ParaBirimi, string> = { TL: "", USD: "$", EUR: "€", GBP: "£" };
const DONUS = { duration: 300, easing: "ease-out" };
const SAYI_ZAMAN = { transformTiming: DONUS, spinTiming: DONUS, opacityTiming: { duration: 200, easing: "ease-out" } };

// A KPI figure that rolls when it changes (and once from 0 on the first load). The text is exactly the
// app's own: money as para() writes it, counts as plain digits. If Intl would write the value differently
// from para() (or the value is negative), the plain text is shown instead.
export function Sayi({ n, birim, dil }: { n: number; birim?: ParaBirimi; dil: Dil }) {
  const [v, setV] = useState(0);
  useEffect(() => { setV(n); }, [n]);
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
