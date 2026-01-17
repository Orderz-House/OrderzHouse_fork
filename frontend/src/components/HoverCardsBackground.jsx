import { useRef } from "react";

export default function HoverCardsBackground({
  children,
  radius = 240, // ✅ أصغر شوي
  className = "",
  accent = "#F97316", // برتقالي
  tile = 360, // حجم الـ SVG الأصلي
  patternScale = 0.78, // ✅ تصغير شكل الكروت/الأيقونات (كل ما قل = أصغر)
}) {
  const layerRef = useRef(null);

  // ✅ حجم تكرار الخلفية بعد التصغير
  const bgSize = Math.max(220, Math.round(tile * patternScale));

  const svg = encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="${tile}" height="${tile}" viewBox="0 0 ${tile} ${tile}">
      <defs>
        <filter id="shadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="14" stdDeviation="12" flood-color="#000" flood-opacity="0.06"/>
          <feDropShadow dx="0" dy="3"  stdDeviation="3"  flood-color="#000" flood-opacity="0.05"/>
        </filter>

        <linearGradient id="acc" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="${accent}" stop-opacity="0.22"/>
          <stop offset="1" stop-color="${accent}" stop-opacity="0.05"/>
        </linearGradient>

        <linearGradient id="acc2" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stop-color="${accent}" stop-opacity="0.18"/>
          <stop offset="1" stop-color="${accent}" stop-opacity="0.00"/>
        </linearGradient>
      </defs>

      <!-- ===== Card: Client posts a task ===== -->
      <rect x="18" y="18" width="324" height="94" rx="20" fill="#fff" stroke="#111827" stroke-opacity="0.075" filter="url(#shadow)"/>
      <rect x="34" y="34" width="54" height="54" rx="16" fill="url(#acc)" stroke="#111827" stroke-opacity="0.06"/>
      <!-- clipboard -->
      <path d="M55 44h12" stroke="#111827" stroke-opacity="0.12" stroke-width="2.2" stroke-linecap="round"/>
      <path d="M48 46.5a6 6 0 0 1 6-6h16a6 6 0 0 1 6 6v26a6 6 0 0 1-6 6H54a6 6 0 0 1-6-6v-26z"
            fill="none" stroke="#111827" stroke-opacity="0.12" stroke-width="2.2" stroke-linejoin="round"/>
      <!-- plus -->
      <path d="M74 60h-16" stroke="${accent}" stroke-opacity="0.30" stroke-width="3.4" stroke-linecap="round"/>
      <path d="M66 52v16" stroke="${accent}" stroke-opacity="0.30" stroke-width="3.4" stroke-linecap="round"/>

      <!-- task title + meta -->
      <path d="M104 42h170" stroke="#111827" stroke-opacity="0.10" stroke-width="7" stroke-linecap="round"/>
      <path d="M104 64h140" stroke="#111827" stroke-opacity="0.07" stroke-width="7" stroke-linecap="round"/>
      <path d="M104 86h90"  stroke="#111827" stroke-opacity="0.06" stroke-width="7" stroke-linecap="round"/>

      <!-- ===== Card: Freelancer profile / briefcase ===== -->
      <rect x="18" y="128" width="186" height="214" rx="20" fill="#fff" stroke="#111827" stroke-opacity="0.075" filter="url(#shadow)"/>
      <rect x="34" y="146" width="62" height="62" rx="20" fill="url(#acc2)" stroke="#111827" stroke-opacity="0.05"/>
      <!-- briefcase -->
      <path d="M54 162v-3.5a4.5 4.5 0 0 1 4.5-4.5h13a4.5 4.5 0 0 1 4.5 4.5v3.5"
            fill="none" stroke="#111827" stroke-opacity="0.12" stroke-width="2.3" stroke-linecap="round"/>
      <path d="M44 168a6 6 0 0 1 6-6h30a6 6 0 0 1 6 6v28a5 5 0 0 1-5 5H49a5 5 0 0 1-5-5v-28z"
            fill="none" stroke="#111827" stroke-opacity="0.12" stroke-width="2.3" stroke-linejoin="round"/>
      <path d="M44 182h42" stroke="${accent}" stroke-opacity="0.20" stroke-width="2.8" stroke-linecap="round"/>

      <!-- profile lines -->
      <path d="M34 232h118" stroke="#111827" stroke-opacity="0.10" stroke-width="7" stroke-linecap="round"/>
      <path d="M34 256h96"  stroke="#111827" stroke-opacity="0.07" stroke-width="7" stroke-linecap="round"/>
      <path d="M34 280h72"  stroke="#111827" stroke-opacity="0.06" stroke-width="7" stroke-linecap="round"/>

      <!-- rating dots -->
      <circle cx="42" cy="310" r="4" fill="${accent}" opacity="0.22"/>
      <circle cx="56" cy="310" r="4" fill="${accent}" opacity="0.18"/>
      <circle cx="70" cy="310" r="4" fill="${accent}" opacity="0.14"/>

      <!-- ===== Card: Chat / messages ===== -->
      <rect x="222" y="132" width="120" height="110" rx="20" fill="#fff" stroke="#111827" stroke-opacity="0.075" filter="url(#shadow)"/>
      <path d="M246 165c0-11 9-20 20-20h32c11 0 20 9 20 20v16c0 11-9 20-20 20h-12l-14 12v-12h-6c-11 0-20-9-20-20v-16z"
            fill="none" stroke="#111827" stroke-opacity="0.12" stroke-width="2.2" stroke-linejoin="round"/>
      <path d="M266 180h.01M282 180h.01M298 180h.01" stroke="${accent}" stroke-opacity="0.32" stroke-width="4" stroke-linecap="round"/>

      <!-- ===== Card: Payout / $ ===== -->
      <rect x="222" y="256" width="120" height="86" rx="20" fill="#fff" stroke="#111827" stroke-opacity="0.075" filter="url(#shadow)"/>

      <!-- coin stack -->
      <ellipse cx="254" cy="314" rx="20" ry="6" fill="url(#acc)" stroke="#111827" stroke-opacity="0.05"/>
      <path d="M234 314v-18c0-3 9-6 20-6s20 3 20 6v18" fill="url(#acc2)" stroke="#111827" stroke-opacity="0.06"/>
      <ellipse cx="254" cy="296" rx="20" ry="6" fill="#fff" stroke="#111827" stroke-opacity="0.08"/>
      <!-- dollar -->
      <path d="M300 286c-8 0-14 4-14 10 0 14 26 6 26 18 0 6-6 10-14 10"
            fill="none" stroke="${accent}" stroke -opacity="0.28" stroke-width="3" stroke-linecap="round"/>
      <path d="M299 280v42" stroke="${accent}" stroke-opacity="0.20" stroke-width="3" stroke-linecap="round"/>

      <!-- ===== Subtle connectors (client ⇄ freelancer) ===== -->
      <path d="M176 112C210 128 218 138 222 162" fill="none" stroke="${accent}" stroke-opacity="0.10" stroke-width="2" stroke-linecap="round"/>
      <path d="M204 238C220 244 232 252 252 262" fill="none" stroke="${accent}" stroke-opacity="0.09" stroke-width="2" stroke-linecap="round"/>
      <path d="M200 200C224 206 238 210 252 222" fill="none" stroke="#111827" stroke-opacity="0.06" stroke-width="2" stroke-linecap="round" stroke-dasharray="5 8"/>

      <!-- connector dots -->
      <circle cx="176" cy="112" r="3.3" fill="${accent}" opacity="0.16"/>
      <circle cx="222" cy="162" r="3.3" fill="${accent}" opacity="0.14"/>
      <circle cx="252" cy="262" r="3.3" fill="${accent}" opacity="0.12"/>
    </svg>
  `);

  const onMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const el = layerRef.current;
    if (!el) return;

    el.style.opacity = "1";
    el.style.setProperty("--mx", `${x}px`);
    el.style.setProperty("--my", `${y}px`);
  };

  const onLeave = () => {
    const el = layerRef.current;
    if (!el) return;

    el.style.opacity = "0";
    el.style.setProperty("--mx", `-9999px`);
    el.style.setProperty("--my", `-9999px`);
  };

  return (
    <div
      className={`relative overflow-hidden bg-white ${className}`}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      {/* طبقة الكروت تظهر فقط تحت الماوس */}
      <div
        ref={layerRef}
        className="pointer-events-none absolute inset-0"
        style={{
          opacity: 0,
          transition: "opacity 180ms ease",
          backgroundImage: `url("data:image/svg+xml,${svg}")`,
          backgroundRepeat: "repeat",

          // ✅ هنا التصغير الحقيقي
          backgroundSize: `${bgSize}px ${bgSize}px`,

          WebkitMaskImage: `radial-gradient(circle ${radius}px at var(--mx) var(--my), rgba(0,0,0,1) 0px, rgba(0,0,0,0) 70%)`,
          maskImage: `radial-gradient(circle ${radius}px at var(--mx) var(--my), rgba(0,0,0,1) 0px, rgba(0,0,0,0) 70%)`,
          WebkitMaskRepeat: "no-repeat",
          maskRepeat: "no-repeat",
        }}
      />

      <div className="relative z-10">{children}</div>
    </div>
  );
}
