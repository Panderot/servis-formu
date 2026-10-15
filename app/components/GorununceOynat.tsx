"use client";
import { useEffect, useRef, useState } from "react";

// Plays a section's entrance animation once, when it scrolls into view.
// data-gor: "statik" = final state, no animation (server render, no JS, reduced motion,
// or already visible on load); "hayir" = waiting off-screen; "evet" = playing / played.
export default function GorununceOynat({ children, className, style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null);
  const [gor, setGor] = useState<"statik" | "hayir" | "evet">("statik");

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let ilk = true;
    const io = new IntersectionObserver(
      ([e]) => {
        if (ilk) {
          ilk = false;
          if (e.isIntersecting) io.disconnect();
          else setGor("hayir");
          return;
        }
        if (e.isIntersecting) {
          setGor("evet");
          io.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} data-gor={gor} className={className} style={style}>
      {children}
    </div>
  );
}
