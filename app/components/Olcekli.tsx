"use client";
import { useEffect, useRef, useState } from "react";

// A4 (794px) sayfayı kapsayıcının genişliğine sığacak şekilde küçültür.
export default function Olcekli({ children, max = 1 }: { children: React.ReactNode; max?: number }) {
  const dis = useRef<HTMLDivElement>(null);
  const ic = useRef<HTMLDivElement>(null);
  const [o, setO] = useState({ s: max, h: 0 });

  useEffect(() => {
    const hesap = () => {
      if (!dis.current || !ic.current) return;
      const s = Math.min(max, dis.current.clientWidth / 794);
      setO({ s, h: ic.current.offsetHeight * s });
    };
    hesap();
    const ro = new ResizeObserver(hesap);
    if (dis.current) ro.observe(dis.current);
    if (ic.current) ro.observe(ic.current);
    return () => ro.disconnect();
  }, [max]);

  return (
    <div ref={dis} className="a4-wrap" style={{ width: "100%", height: o.h || undefined, overflow: "hidden" }}>
      <div ref={ic} className="a4-scale" style={{ width: 794, transform: `scale(${o.s})`, transformOrigin: "top left" }}>
        {children}
      </div>
    </div>
  );
}
