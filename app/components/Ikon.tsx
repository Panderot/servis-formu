// Basit çizgi ikonlar (elle çizildi, dış kütüphane yok).
const YOL: Record<string, string> = {
  belge: "M7 3h7l5 5v13H7z M14 3v5h5 M10 13h6 M10 17h6",
  kisiler: "M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M2 21c0-3.9 3.1-7 7-7s7 3.1 7 7 M17 11a3 3 0 1 0 0-6 M19 21c0-2.6-1-4.6-3-6",
  ayar: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M19.4 13.5l1.6 1.2-2 3.4-1.9-.7a7 7 0 0 1-2 1.2L14.8 21h-4l-.3-2.4a7 7 0 0 1-2-1.2l-1.9.7-2-3.4 1.6-1.2a7 7 0 0 1 0-3L4.6 9.3l2-3.4 1.9.7a7 7 0 0 1 2-1.2L10.8 3h4l.3 2.4a7 7 0 0 1 2 1.2l1.9-.7 2 3.4-1.6 1.2a7 7 0 0 1 0 3z",
  arti: "M12 5v14 M5 12h14",
  ok: "M5 12h14 M13 6l6 6-6 6",
  sag: "M9 6l6 6-6 6",
  sol: "M15 6l-6 6 6 6",
  asagi: "M6 9l6 6 6-6",
  tik: "M5 12.5l4.5 4.5L19 7.5",
  carpi: "M6 6l12 12 M18 6L6 18",
  takvim: "M4 6h16v15H4z M4 10h16 M8 3v5 M16 3v5",
  kamera: "M4 8h3.5L9 5.5h6L16.5 8H20v11H4z M12 17a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z",
  kalem: "M4 20l1-5L15.5 4.5a2.1 2.1 0 0 1 3 3L8 18z M13.5 6.5l3 3",
  imza: "M3 17c3-1 4-9 6-9s0 9 2 9 3-5 4.5-5 1 3 2.5 3 2-1 3-1 M3 21h18",
  mesaj: "M4 5h16v11H9l-5 4z M8 9.5h8 M8 12.5h5",
  eposta: "M3 6h18v12H3z M3 7l9 6 9-6",
  telefon: "M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z",
  ara: "M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14z M20 20l-4-4",
  indir: "M12 4v11 M7 10l5 5 5-5 M5 20h14",
  anahtar: "M14.5 6.5a4 4 0 0 0-5.3 5.3L4 17v3h3l5.2-5.2a4 4 0 0 0 5.3-5.3l-2.5 2.5-2.5-.5-.5-2.5z",
  saat: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M12 7v5l3 2",
  liste: "M9 6h11 M9 12h11 M9 18h11 M4 6h.01 M4 12h.01 M4 18h.01",
  geri: "M9 14l-5-5 5-5 M4 9h11a5 5 0 0 1 0 10h-3",
  yildiz: "M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z",
};

export default function Ikon({ ad, boy = 18, kalinlik = 1.9, className, style }: { ad: keyof typeof YOL | string; boy?: number; kalinlik?: number; className?: string; style?: React.CSSProperties }) {
  return (
    <svg aria-hidden="true" width={boy} height={boy} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={kalinlik} strokeLinecap="round" strokeLinejoin="round" className={className} style={{ flex: "none", ...style }}>
      <path d={YOL[ad] || ""} />
    </svg>
  );
}

// Marka işareti: petrol mavisi kare içinde onay işareti (Valideo'nun eğik çizgisi alınmadı).
export function Isaret({ boy = 22 }: { boy?: number }) {
  return (
    <span aria-hidden="true" style={{ width: boy, height: boy, borderRadius: Math.round(boy * 0.3), background: "var(--accent)", color: "#fff", display: "inline-grid", placeItems: "center", flex: "none" }}>
      <svg width={boy * 0.62} height={boy * 0.62} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
    </span>
  );
}
