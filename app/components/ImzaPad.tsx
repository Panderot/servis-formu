"use client";
import { useEffect, useRef } from "react";
import { useC } from "../lib/dil";

// Parmakla / fareyle imza. Her vuruş bitince PNG dataURL döner (şeffaf arka plan).
export default function ImzaPad({ deger, onChange }: { deger: string; onChange: (v: string) => void }) {
  const yazi = useC();
  const cv = useRef<HTMLCanvasElement>(null);
  const ciz = useRef(false);
  const son = useRef<{ x: number; y: number } | null>(null);

  const hazirla = (yukle?: string) => {
    const c = cv.current;
    if (!c) return;
    const dpr = Math.max(1, Math.min(3, window.devicePixelRatio || 1));
    const w = c.clientWidth;
    const h = c.clientHeight;
    c.width = Math.round(w * dpr);
    c.height = Math.round(h * dpr);
    const ctx = c.getContext("2d")!;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#14213d";
    ctx.lineWidth = 2.6;
    if (yukle) {
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0, w, h);
      img.src = yukle;
    }
  };

  useEffect(() => {
    hazirla(deger);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const nokta = (e: React.PointerEvent) => {
    const r = cv.current!.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  const bas = (e: React.PointerEvent) => {
    e.preventDefault();
    cv.current?.setPointerCapture(e.pointerId);
    ciz.current = true;
    son.current = nokta(e);
    const ctx = cv.current!.getContext("2d")!;
    ctx.beginPath();
    ctx.arc(son.current.x, son.current.y, 1.2, 0, Math.PI * 2);
    ctx.fillStyle = "#14213d";
    ctx.fill();
  };
  const hareket = (e: React.PointerEvent) => {
    if (!ciz.current || !son.current) return;
    const p = nokta(e);
    const ctx = cv.current!.getContext("2d")!;
    ctx.beginPath();
    ctx.moveTo(son.current.x, son.current.y);
    const mx = (son.current.x + p.x) / 2;
    const my = (son.current.y + p.y) / 2;
    ctx.quadraticCurveTo(son.current.x, son.current.y, mx, my);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    son.current = p;
  };
  const birak = () => {
    if (!ciz.current) return;
    ciz.current = false;
    son.current = null;
    onChange(cv.current!.toDataURL("image/png"));
  };
  const temizle = () => {
    const c = cv.current!;
    c.getContext("2d")!.clearRect(0, 0, c.width, c.height);
    onChange("");
  };

  return (
    <div>
      <div style={{ position: "relative", border: "1.5px dashed var(--line-2)", borderRadius: 10, background: "#fff" }}>
        <canvas
          ref={cv}
          aria-label={yazi("İmza alanı", "Signature area")}
          onPointerDown={bas}
          onPointerMove={hareket}
          onPointerUp={birak}
          onPointerCancel={birak}
          onPointerLeave={birak}
          style={{ width: "100%", height: 190, display: "block", touchAction: "none", cursor: "crosshair" }}
        />
        <div style={{ position: "absolute", left: 18, right: 18, bottom: 38, borderBottom: "1px solid var(--line-2)", pointerEvents: "none" }} />
        {!deger && <div style={{ position: "absolute", left: 0, right: 0, bottom: 12, textAlign: "center", fontSize: 12.5, color: "var(--muted)", pointerEvents: "none" }}>{yazi("Müşteri parmağıyla buraya imza atsın", "Customer signs here with a finger")}</div>}
      </div>
      <button type="button" onClick={temizle} className="chip" style={{ marginTop: 8 }}>{yazi("İmzayı temizle", "Clear signature")}</button>
    </div>
  );
}
