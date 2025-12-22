import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import HoverCardsBackground from "../../HoverCardsBackground";
import { fetchCategories, fetchSubCategoriesByCategoryId } from "../../Catigories/api/category";
import { AnimatePresence, motion } from "framer-motion";



function NetworkLines() {
  const STROKE = "#E5E7EB";
  const DOT = "#111827";
  const strokeWidth = 2;

  const W = 1365;
  const H = 420;

  const P = (xPct, yPct) => ({ x: xPct * W, y: yPct * H });

  // ====== مركز الشبكة ======
  const center = P(0.5, 0.585); // نفس top-[58.5%] في DOM

  // join points يمين/يسار قرب المركز (بنفس فكرة Y)
  const joinOffset = 200;
  const stagger = 48;

  const leftJoinTop = { x: center.x - joinOffset, y: center.y };
  const leftJoinBottom = { x: center.x - joinOffset - stagger, y: center.y };

  const rightJoinTop = { x: center.x + joinOffset, y: center.y };
  const rightJoinBottom = { x: center.x + joinOffset + stagger, y: center.y };

  // ====== نقاط (dots) مثل التصميم الأصلي (مبنية على نسب الكود القديم) ======
  // === NEW: sync lines with the DOM positions of the 4 squares ===
  // (match these % with your absolute left/top in the DOM)
  const yellowC = P(0.22, 0.274); // YellowIdeaIcon  left-[22%] top-[27.4%]
  const blueC = P(0.18, 0.811); // BluePeopleIcon  left-[18%] top-[81.1%]
  const redC = P(0.78, 0.347); // RedShieldIcon   left-[78%] top-[34.7%]
  const chatC = P(0.82, 0.839); // ChatCard        left-[82%] top-[83.9%]

  // sizes (same as your components)
  const yellowSize = 74;
  const blueSize = 88;
  const redSize = 92;
  const chatSize = 88;

  // distance from square edge -> dot
  const gap = 28;

  // left side (dot is to the right of the square)
  const TL_START_X = yellowC.x + yellowSize / 2;
  const TL = { x: TL_START_X + gap, y: yellowC.y };

  const BL_START_X = blueC.x + blueSize / 2;
  const BL = { x: BL_START_X + gap, y: blueC.y };

  // right side (dot is to the left of the square)
  const TR_END_X = redC.x - redSize / 2;
  const TR = { x: TR_END_X - gap, y: redC.y };

  const BR_END_X = chatC.x - chatSize / 2;
  const BR = { x: BR_END_X - gap, y: chatC.y };

  // ====== الخط الأفقي الرئيسي ======
  // (خليه ثابت عشان ما ندخل في حسابات responsive معقدة)
  const MAIN_X1 = 0.131 * W;
  const MAIN_X2 = 0.869 * W;

  // ====== ✅ امتداد سفلي جديد (Bottom expansion) ======
  // نقطة فرع وسطية تحت المركز
  const bottomHub = P(0.5, 0.86);

  // نقاط توزيع قبل الوصول للمربعات السفلية
  const bL = P(0.4, 0.86);
  const bM = P(0.5, 0.82);
  const bR = P(0.6, 0.86);

  // مراكز المربعات الجديدة (مكانها في DOM)
  const sL = P(0.35, 0.93);
  const sM = P(0.5, 0.93);
  const sR = P(0.65, 0.93);

  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full"
      viewBox={`0 0 ${W} ${H}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="none"
    >
      <defs>
        <filter id="lineGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* ====== Base lines (static) ====== */}
      <path
        d={`M${0.06 * W} ${center.y} H${0.94 * W}`}
        stroke={STROKE}
        strokeWidth={strokeWidth}
      />

      {/* short connectors near icons */}
      <path
        d={`M${TL_START_X} ${TL.y} H${TL.x}`}
        stroke={STROKE}
        strokeWidth={strokeWidth}
      />
      <path
        d={`M${BL_START_X} ${BL.y} H${BL.x}`}
        stroke={STROKE}
        strokeWidth={strokeWidth}
      />
      <path
        d={`M${TR.x} ${TR.y} H${TR_END_X}`}
        stroke={STROKE}
        strokeWidth={strokeWidth}
      />
      <path
        d={`M${BR.x} ${BR.y} H${BR_END_X}`}
        stroke={STROKE}
        strokeWidth={strokeWidth}
      />

      {/* diagonals to join points */}
      <path
        d={`M${leftJoinTop.x} ${leftJoinTop.y} L${TL.x} ${TL.y}`}
        stroke={STROKE}
        strokeWidth={strokeWidth}
      />
      <path
        d={`M${leftJoinBottom.x} ${leftJoinBottom.y} L${BL.x} ${BL.y}`}
        stroke={STROKE}
        strokeWidth={strokeWidth}
      />
      <path
        d={`M${rightJoinTop.x} ${rightJoinTop.y} L${TR.x} ${TR.y}`}
        stroke={STROKE}
        strokeWidth={strokeWidth}
      />
      <path
        d={`M${rightJoinBottom.x} ${rightJoinBottom.y} L${BR.x} ${BR.y}`}
        stroke={STROKE}
        strokeWidth={strokeWidth}
      />

      {/* ✅ امتداد سفلي (center -> bottomHub -> (bL,bM,bR) -> (sL,sM,sR)) */}
      <path
        d={`M${center.x} ${center.y} L${bottomHub.x} ${bottomHub.y}`}
        stroke={STROKE}
        strokeWidth={strokeWidth}
      />

      <path
        d={`M${bottomHub.x} ${bottomHub.y} L${bL.x} ${bL.y}`}
        stroke={STROKE}
        strokeWidth={strokeWidth}
      />
      <path
        d={`M${bottomHub.x} ${bottomHub.y} L${bM.x} ${bM.y}`}
        stroke={STROKE}
        strokeWidth={strokeWidth}
      />
      <path
        d={`M${bottomHub.x} ${bottomHub.y} L${bR.x} ${bR.y}`}
        stroke={STROKE}
        strokeWidth={strokeWidth}
      />

      <path
        d={`M${bL.x} ${bL.y} L${sL.x} ${sL.y}`}
        stroke={STROKE}
        strokeWidth={strokeWidth}
      />
      {/* <path d={`M${bM.x} ${bM.y} L${sM.x} ${sM.y}`} stroke={STROKE} strokeWidth={strokeWidth} /> */}
      <path
        d={`M${bR.x} ${bR.y} L${sR.x} ${sR.y}`}
        stroke={STROKE}
        strokeWidth={strokeWidth}
      />

      {/* ====== Dots (static) ====== */}
      <circle cx={TL.x} cy={TL.y} r="4" fill={DOT} />
      <circle cx={BL.x} cy={BL.y} r="4" fill={DOT} />
      <circle cx={TR.x} cy={TR.y} r="4" fill={DOT} />
      <circle cx={BR.x} cy={BR.y} r="4" fill={DOT} />

      {/* ✅ dots للامتداد السفلي */}
      <circle cx={bottomHub.x} cy={bottomHub.y} r="4" fill={DOT} />
      <circle cx={bL.x} cy={bL.y} r="4" fill={DOT} />
      <circle cx={bR.x} cy={bR.y} r="4" fill={DOT} />

      {/* ====== Wave overlay (animated) ====== */}
      <g filter="url(#lineGlow)">
        {/* center -> joins */}
        <path
          pathLength="100"
          className="wave-path"
          style={{ "--delay": "0.06s" }}
          d={`M${center.x} ${center.y} H${leftJoinTop.x}`}
          stroke="#A78BFA"
          strokeWidth="3.2"
          strokeLinecap="round"
        />
        <path
          pathLength="100"
          className="wave-path"
          style={{ "--delay": "0.12s" }}
          d={`M${center.x} ${center.y} H${leftJoinBottom.x}`}
          stroke="#A78BFA"
          strokeWidth="3.2"
          strokeLinecap="round"
        />
        <path
          pathLength="100"
          className="wave-path"
          style={{ "--delay": "0.06s" }}
          d={`M${center.x} ${center.y} H${rightJoinTop.x}`}
          stroke="#A78BFA"
          strokeWidth="3.2"
          strokeLinecap="round"
        />
        <path
          pathLength="100"
          className="wave-path"
          style={{ "--delay": "0.12s" }}
          d={`M${center.x} ${center.y} H${rightJoinBottom.x}`}
          stroke="#A78BFA"
          strokeWidth="3.2"
          strokeLinecap="round"
        />

        {/* joins -> dots */}
        <path
          pathLength="100"
          className="wave-path"
          style={{ "--delay": "0.26s" }}
          d={`M${leftJoinTop.x} ${leftJoinTop.y} L${TL.x} ${TL.y}`}
          stroke="#A78BFA"
          strokeWidth="3.2"
          strokeLinecap="round"
        />
        <path
          pathLength="100"
          className="wave-path"
          style={{ "--delay": "0.34s" }}
          d={`M${leftJoinBottom.x} ${leftJoinBottom.y} L${BL.x} ${BL.y}`}
          stroke="#A78BFA"
          strokeWidth="3.2"
          strokeLinecap="round"
        />
        <path
          pathLength="100"
          className="wave-path"
          style={{ "--delay": "0.26s" }}
          d={`M${rightJoinTop.x} ${rightJoinTop.y} L${TR.x} ${TR.y}`}
          stroke="#A78BFA"
          strokeWidth="3.2"
          strokeLinecap="round"
        />
        <path
          pathLength="100"
          className="wave-path"
          style={{ "--delay": "0.34s" }}
          d={`M${rightJoinBottom.x} ${rightJoinBottom.y} L${BR.x} ${BR.y}`}
          stroke="#A78BFA"
          strokeWidth="3.2"
          strokeLinecap="round"
        />

        {/* dots -> squares (short) */}
        <path
          pathLength="100"
          className="wave-path"
          style={{ "--delay": "0.54s" }}
          d={`M${TL.x} ${TL.y} H${TL_START_X}`}
          stroke="#A78BFA"
          strokeWidth="3.2"
          strokeLinecap="round"
        />
        <path
          pathLength="100"
          className="wave-path"
          style={{ "--delay": "0.62s" }}
          d={`M${BL.x} ${BL.y} H${BL_START_X}`}
          stroke="#A78BFA"
          strokeWidth="3.2"
          strokeLinecap="round"
        />
        <path
          pathLength="100"
          className="wave-path"
          style={{ "--delay": "0.54s" }}
          d={`M${TR.x} ${TR.y} H${TR_END_X}`}
          stroke="#A78BFA"
          strokeWidth="3.2"
          strokeLinecap="round"
        />
        <path
          pathLength="100"
          className="wave-path"
          style={{ "--delay": "0.62s" }}
          d={`M${BR.x} ${BR.y} H${BR_END_X}`}
          stroke="#A78BFA"
          strokeWidth="3.2"
          strokeLinecap="round"
        />

        {/* ✅ موجة الامتداد السفلي */}
        <path
          pathLength="100"
          className="wave-path"
          style={{ "--delay": "0.42s" }}
          d={`M${center.x} ${center.y} L${bottomHub.x} ${bottomHub.y}`}
          stroke="#A78BFA"
          strokeWidth="3.2"
          strokeLinecap="round"
        />

        <path
          pathLength="100"
          className="wave-path"
          style={{ "--delay": "0.62s" }}
          d={`M${bottomHub.x} ${bottomHub.y} L${bL.x} ${bL.y}`}
          stroke="#A78BFA"
          strokeWidth="3.2"
          strokeLinecap="round"
        />
        <path
          pathLength="100"
          className="wave-path"
          style={{ "--delay": "0.66s" }}
          d={`M${bottomHub.x} ${bottomHub.y} L${bM.x} ${bM.y}`}
          stroke="#A78BFA"
          strokeWidth="3.2"
          strokeLinecap="round"
        />
        <path
          pathLength="100"
          className="wave-path"
          style={{ "--delay": "0.70s" }}
          d={`M${bottomHub.x} ${bottomHub.y} L${bR.x} ${bR.y}`}
          stroke="#A78BFA"
          strokeWidth="3.2"
          strokeLinecap="round"
        />

        <path
          pathLength="100"
          className="wave-path"
          style={{ "--delay": "0.86s" }}
          d={`M${bL.x} ${bL.y} L${sL.x} ${sL.y}`}
          stroke="#A78BFA"
          strokeWidth="3.2"
          strokeLinecap="round"
        />
        {/* <path pathLength="100" className="wave-path" style={{ "--delay": "0.90s" }} d={`M${bM.x} ${bM.y} L${sM.x} ${sM.y}`} stroke="#A78BFA" strokeWidth="3.2" strokeLinecap="round" /> */}
        <path
          pathLength="100"
          className="wave-path"
          style={{ "--delay": "0.94s" }}
          d={`M${bR.x} ${bR.y} L${sR.x} ${sR.y}`}
          stroke="#A78BFA"
          strokeWidth="3.2"
          strokeLinecap="round"
        />

        {/* dot flashes */}
        <circle
          className="dot-hit"
          style={{ "--delay": "0.48s" }}
          cx={TL.x}
          cy={TL.y}
          r="6"
          fill="#A78BFA"
        />
        <circle
          className="dot-hit"
          style={{ "--delay": "0.56s" }}
          cx={BL.x}
          cy={BL.y}
          r="6"
          fill="#A78BFA"
        />
        <circle
          className="dot-hit"
          style={{ "--delay": "0.48s" }}
          cx={TR.x}
          cy={TR.y}
          r="6"
          fill="#A78BFA"
        />
        <circle
          className="dot-hit"
          style={{ "--delay": "0.56s" }}
          cx={BR.x}
          cy={BR.y}
          r="6"
          fill="#A78BFA"
        />

        {/* bottom flashes */}
        <circle
          className="dot-hit"
          style={{ "--delay": "0.74s" }}
          cx={bottomHub.x}
          cy={bottomHub.y}
          r="6"
          fill="#A78BFA"
        />
        <circle
          className="dot-hit"
          style={{ "--delay": "0.88s" }}
          cx={bL.x}
          cy={bL.y}
          r="6"
          fill="#A78BFA"
        />
        <circle
          className="dot-hit"
          style={{ "--delay": "0.92s" }}
          cx={bM.x}
          cy={bM.y}
          r="6"
          fill="#A78BFA"
        />
        <circle
          className="dot-hit"
          style={{ "--delay": "0.96s" }}
          cx={bR.x}
          cy={bR.y}
          r="6"
          fill="#A78BFA"
        />
      </g>
    </svg>
  );
}

function CenterLogoCard() {
  return (
    <div
      className={[
        "relative grid place-items-center",
        "h-[170px] w-[170px]",
        "rounded-[32px]",
        "center-beat",
      ].join(" ")}
    >
      <span className="ripple" />
      <span className="ripple r2" />
      <span className="ripple r3" />

      <img
        src="/logo.png" // ✅ اسم ملف اللوجو داخل public
        alt="logo"
        className="h-auto w-[200px] object-contain drop-shadow-[0_18px_30px_rgba(0,0,0,0.18)]"
        draggable="false"
      />
    </div>
  );
}

function YellowIdeaIcon() {
  return (
    <div
      className={[
        "grid place-items-center",
        "h-[74px] w-[74px]",
        "rounded-2xl",
        "bg-gradient-to-b from-yellow-100 to-yellow-400",
        "shadow-[0_12px_30px_rgba(0,0,0,0.35)]",
        "ring-1 ring-black/5",
      ].join(" ")}
    >
      <img
        src="/icon/freelancer.png" // ✅ غيّر الاسم لملفك
        alt="icon"
        className="h-12 w-12 object-contain"
        draggable="false"
      />
    </div>
  );
}

function BluePeopleIcon() {
  return (
    <div
      className={[
        "grid place-items-center",
        "h-[88px] w-[88px]",
        "rounded-2xl",
        "bg-gradient-to-b from-sky-300 to-sky-500",
        "shadow-[0_12px_30px_rgba(0,0,0,0.35)]",
        "ring-1 ring-black/5",
      ].join(" ")}
    >
      <img
        src="/icon/tasktime.png" // ✅ غيّر الاسم لملفك
        alt="icon"
        className="h-18 w-18 object-contain"
        draggable="false"
      />
    </div>
  );
}

function RedShieldIcon() {
  return (
    <div
      className={[
        "grid place-items-center",
        "h-[92px] w-[92px]",
        "rounded-2xl",
        "bg-gradient-to-b from-orange-400 to-red-500",
        "shadow-[0_12px_30px_rgba(0,0,0,0.35)]",
        "ring-1 ring-black/5",
      ].join(" ")}
    >
      <img
        src="/icon/client.png" // ✅ غيّر الاسم لملفك
        alt="icon"
        className="h-24 w-24 object-contain"
        draggable="false"
      />
    </div>
  );
}

function ChatCard() {
  return (
    <div
      className={[
        "grid place-items-center",
        "h-[88px] w-[88px]",
        "rounded-2xl",
        "bg-white",
        "shadow-[0_12px_30px_rgba(0,0,0,0.35)]",
        "ring-1 ring-black/5",
      ].join(" ")}
    >
      <img
        src="/icon/project.png" // ✅ غيّر الاسم لملفك
        alt="icon"
        className="h-18 w-18 object-contain"
        draggable="false"
      />
    </div>
  );
}

function WhitePlusCard({ size = 78, src = "/icon/task.png", alt = "icon" }) {
  return (
    <div
      className={[
        "grid place-items-center",
        "rounded-2xl bg-white",
        "shadow-[0_12px_30px_rgba(0,0,0,0.35)] ring-1 ring-black/5",
      ].join(" ")}
      style={{ width: size, height: size }}
    >
      <img
        src={src}
        alt={alt}
        className="h-12 w-12 object-contain"
        draggable="false"
      />
    </div>
  );
}

function AvatarCard({ src, size = 112 }) {
  return (
    <div
      className="overflow-hidden rounded-2xl bg-white shadow-[0_12px_30px_rgba(0,0,0,0.35)] ring-1 ring-black/5"
      style={{ width: size, height: size }}
    >
      <img
        src={src}
        alt="avatar"
        className="h-full w-full object-cover"
        loading="lazy"
      />
    </div>
  );
}
function BatmanFrame({
  className = "",
  strokeWidth = 3,
  stroke = "rgba(17,24,39,0.9)",
}) {
  return (
    <svg
      className={`pointer-events-none absolute ${className}`}
      viewBox="0 0 1000 520"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="none"
    >
      <path
        d="
          M 60 210
          L 120 130
          L 270 170
          L 250 90
          L 300 90
          L 420 170
          L 460 100
          L 500 140
          L 540 100
          L 580 170
          L 710 90
          L 760 90
          L 740 170
          L 880 130
          L 940 210
          L 820 280
          L 620 360
          L 680 410
          L 500 505
          L 320 410
          L 380 360
          L 170 270
          Z
        "
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinejoin="miter" // ✅ زوايا حادة
        strokeMiterlimit="18" // ✅ يزيد حدّة الزاوية
        strokeLinecap="butt"
      />
    </svg>
  );
}

function HeroSearch({
  to = "/projectsPage",              // عدّلها لو عندك Route مختلف
  buttonText = "Explore Talents",
}) {
  const navigate = useNavigate();

  const inputRef = useRef(null);
  const anchorRef = useRef(null);
  const menuRef = useRef(null);

  const [term, setTerm] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0, width: 0 });

  const [cats, setCats] = useState([]);
  const [subcats, setSubcats] = useState([]);
  const [loading, setLoading] = useState(true);

  // ---- helpers: normalize api objects (عشان لو أسماء الحقول تختلف)
  const norm = (x) => ({
    id: x?.id ?? x?.categoryId ?? x?.subCategoryId ?? x?._id,
    name: x?.name ?? x?.categoryName ?? x?.subCategoryName ?? x?.title ?? "",
  });

  // ---- load categories + subCategories once
  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoading(true);

        const catsRaw = await fetchCategories();
        const catsNorm = (catsRaw || []).map(norm).filter((c) => c.id && c.name);

        // تحميل subCategories لكل Category
        const subsAll = [];
        await Promise.all(
          catsNorm.map(async (c) => {
            try {
              const subsRaw = await fetchSubCategoriesByCategoryId(c.id);
              (subsRaw || []).forEach((s) => {
                const sn = norm(s);
                if (sn.id && sn.name) subsAll.push({ ...sn, categoryId: c.id });
              });
            } catch {
              // ignore per-category errors
            }
          })
        );

        if (!alive) return;
        setCats(catsNorm);
        setSubcats(subsAll);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  // ---- menu position (fixed) under input
  const updateMenuPos = () => {
    const el = anchorRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setMenuPos({
      left: r.left,
      top: r.bottom + 10,
      width: r.width,
    });
  };

  useEffect(() => {
    if (!open) return;

    updateMenuPos();
    const onResize = () => updateMenuPos();
    const onScroll = () => updateMenuPos();

    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onScroll, true);

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [open]);

  // ---- close when clicking outside
  useEffect(() => {
    const onPointerDown = (e) => {
      const t = e.target;
      if (menuRef.current?.contains(t)) return;
      if (anchorRef.current?.contains(t)) return;
      setOpen(false);
      setActive(-1);
    };
    window.addEventListener("pointerdown", onPointerDown);
    return () => window.removeEventListener("pointerdown", onPointerDown);
  }, []);

  // ---- suggestions (cats + subcats)
  const suggestions = useMemo(() => {
    const q = term.trim().toLowerCase();
    const limit = 10;

    const catItems = cats.map((c) => ({
      type: "cat",
      id: c.id,
      label: c.name,
    }));

    const subItems = subcats.map((s) => ({
      type: "subcat",
      id: s.id,
      label: s.name,
      categoryId: s.categoryId,
    }));

    const all = [...catItems, ...subItems];

    if (!q) return all.slice(0, limit);

    return all
      .filter((it) => it.label.toLowerCase().includes(q))
      .slice(0, limit);
  }, [term, cats, subcats]);

  const closeList = () => {
    setOpen(false);
    setActive(-1);
  };

  const goTo = (url) => {
    closeList();
    navigate(url);
  };

  const goBySuggestion = (s) => {
    if (!s) return;
    if (s.type === "cat") {
      goTo(`${to}?cat=${encodeURIComponent(s.id)}&page=1`);
      return;
    }
    if (s.type === "subcat") {
      goTo(
        `${to}?cat=${encodeURIComponent(s.categoryId)}&subcat=${encodeURIComponent(s.id)}&page=1`
      );
      return;
    }
  };

  // نفس منطق ProjectsPage: إذا كتب اسم يطابق Category/SubCategory بالضبط -> يروح لهم
  const goByText = (raw) => {
    const text = (raw ?? "").trim();
    if (!text) {
      goTo(`${to}?page=1`);
      return;
    }

    const q = text.toLowerCase();

    const exactSub = subcats.find((s) => (s.name || "").toLowerCase() === q);
    if (exactSub) {
      goTo(
        `${to}?cat=${encodeURIComponent(exactSub.categoryId)}&subcat=${encodeURIComponent(exactSub.id)}&page=1`
      );
      return;
    }

    const exactCat = cats.find((c) => (c.name || "").toLowerCase() === q);
    if (exactCat) {
      goTo(`${to}?cat=${encodeURIComponent(exactCat.id)}&page=1`);
      return;
    }

    // fallback: نص عام
    goTo(`${to}?q=${encodeURIComponent(text)}&page=1`);
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (active >= 0 && suggestions[active]) {
      goBySuggestion(suggestions[active]);
    } else {
      goByText(term);
    }
  };

  const onKeyDown = (e) => {
    if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      setOpen(true);
      updateMenuPos();
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = Math.min((active < 0 ? -1 : active) + 1, suggestions.length - 1);
      setActive(next);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const prev = Math.max(active - 1, 0);
      setActive(prev);
    } else if (e.key === "Escape") {
      e.preventDefault();
      closeList();
    }
  };

  return (
    <div className="mt-0 flex flex-col items-center gap-4">
      {/* Search */}
      <form className="w-full max-w-md" onSubmit={onSubmit}>
        <label htmlFor="hero-search" className="sr-only">
          Search
        </label>

        <div ref={anchorRef} className="rounded-full bg-gradient-to-r from-violet-200/70 via-orange-200/60 to-sky-200/70 p-[1px]">
          <div className="relative rounded-full bg-white/70 backdrop-blur-md ring-1 ring-black/10 shadow-[0_18px_45px_rgba(17,24,39,0.08)]">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M21 21l-4.3-4.3m1.3-5.2a7 7 0 1 1-14 0a7 7 0 0 1 14 0Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>

            <input
              ref={inputRef}
              id="hero-search"
              type="text"
              value={term}
              onChange={(e) => {
                setTerm(e.target.value);
                setOpen(true);
                setActive(-1);
              }}
              onFocus={() => {
                setOpen(true);
                updateMenuPos();
              }}
              onKeyDown={onKeyDown}
              placeholder="Search anything..."
              className="w-full rounded-full bg-transparent py-3 pl-11 pr-4 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition focus:ring-2 focus:ring-violet-300/60"
              autoComplete="off"
            />
          </div>
        </div>

        {/* dropdown */}
        {open && (loading || suggestions.length > 0) && (
          <div
            ref={menuRef}
            className="fixed z-[99999] overflow-hidden rounded-2xl bg-white/90 backdrop-blur-md ring-1 ring-black/10 shadow-[0_24px_60px_rgba(0,0,0,0.14)]"
            style={{ top: menuPos.top, left: menuPos.left, width: menuPos.width }}
          >
            {loading ? (
              <div className="px-4 py-3 text-sm text-gray-500">Loading…</div>
            ) : (
              <ul className="max-h-[320px] overflow-auto py-2">
                {suggestions.map((s, i) => (
                  <li key={`${s.type}-${s.id}-${i}`}>
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()} // يمنع فقدان الفوكس
                      onMouseEnter={() => setActive(i)}
                      onClick={() => goBySuggestion(s)}
                      className={[
                        "w-full px-4 py-2.5 text-left text-sm",
                        "flex items-center justify-between gap-3",
                        i === active ? "bg-orange-50" : "hover:bg-orange-50/70",
                      ].join(" ")}
                    >
                      <span className="text-gray-800">{s.label}</span>
                      <span
                        className={[
                          "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold",
                          s.type === "cat"
                            ? "bg-violet-100 text-violet-700"
                            : "bg-orange-100 text-orange-700",
                        ].join(" ")}
                      >
                        {s.type === "cat" ? "Category" : "Sub"}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </form>

      {/* Button (نفس ستايل زرّك) */}
      <button
        className={[
          "rounded-full px-8 py-3",
          "text-sm font-semibold text-white",
          "bg-gradient-to-b from-orange-400 to-red-500",
          "shadow-[0_14px_30px_rgba(249,115,22,0.35)]",
          "ring-1 ring-black/10",
          "transition hover:brightness-95 active:scale-[0.99]",
        ].join(" ")}
        type="button"
        onClick={() => goByText(term)}
      >
        {buttonText}
      </button>
    </div>
  );
}


export default function Hero() {
  const leftAvatar = "https://i.pravatar.cc/300?img=12";
  const rightAvatar = "https://i.pravatar.cc/200?img=32";

  return (
    <section className="relative isolate overflow-hidden bg-white h-screen">
      <HoverCardsBackground className="min-h-screen">
        <div className="pt-14 sm:pt-20">
          {/* ✅ Background soft glows (yellow + orange) */}
          <div className="pointer-events-none absolute -top-28 left-[-80px] h-[360px] w-[360px] rounded-full bg-yellow-300/25 blur-3xl" />
          <div className="pointer-events-none absolute -top-28 right-[-90px] h-[380px] w-[380px] rounded-full bg-orange-400/20 blur-3xl" />
          {/* Glow خفيف تحت عشان الامتداد السفلي */}
          {/* <div className="pointer-events-none absolute bottom-[-120px] left-[10%] h-[320px] w-[320px] rounded-full bg-yellow-300/10 blur-3xl" />
          <div className="pointer-events-none absolute bottom-[-140px] right-[8%] h-[340px] w-[340px] rounded-full bg-orange-400/10 blur-3xl" /> */}

          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="relative">
              {/* ✅ Batman frame حول المحتوى */}
              <BatmanFrame
                className="
        left-1/2 top-[42%]
        -translate-x-1/2 -translate-y-1/2
        w-[1600px] h-[780px]
        opacity-80
        z-[5]
        
      "
                strokeWidth={0.03}
              />
              {/* ✅ illustration أكبر من الأسفل */}
              <div
                className="relative mx-auto w-full max-w-[1088px] aspect-[1365/420]"
                style={{ "--dur": "5.8s" }}
              >
                <NetworkLines />

                {/* Left avatar */}
                <div className="absolute left-[0%] top-[58.5%] -translate-x-1/2 -translate-y-1/2">
                  <div className="hit" style={{ "--delay": "1.05s" }}>
                    <AvatarCard src={leftAvatar} size={112} />
                  </div>
                </div>

                {/* Yellow icon */}
                <div className="absolute left-[22%] top-[27.4%] -translate-x-1/2 -translate-y-1/2">
                  <div className="hit" style={{ "--delay": "0.70s" }}>
                    <YellowIdeaIcon />
                  </div>
                </div>

                {/* Blue icon */}
                <div className="absolute left-[18%] top-[81.1%] -translate-x-1/2 -translate-y-1/2">
                  <div className="hit" style={{ "--delay": "0.78s" }}>
                    <BluePeopleIcon />
                  </div>
                </div>

                {/* Center purple */}
                <div className="absolute left-[49.8%] top-[57.5%] -translate-x-1/2 -translate-y-1/2">
                  <CenterLogoCard />
                </div>

                {/* Orange/Red icon */}
                <div className="absolute left-[78%] top-[34.7%] -translate-x-1/2 -translate-y-1/2">
                  <div className="hit" style={{ "--delay": "0.70s" }}>
                    <RedShieldIcon />
                  </div>
                </div>

                {/* Right avatar */}
                <div className="absolute left-[100%] top-[58.5%] -translate-x-1/2 -translate-y-1/2">
                  <div className="hit" style={{ "--delay": "1.12s" }}>
                    <AvatarCard src={rightAvatar} size={112} />
                  </div>
                </div>

                {/* Right chat card */}
                <div className="absolute left-[82%] top-[83.9%] -translate-x-1/2 -translate-y-1/2">
                  <div className="hit" style={{ "--delay": "0.86s" }}>
                    <ChatCard />
                  </div>
                </div>

                {/* ✅ مربعات جديدة أسفل الشبكة */}
                <div className="absolute left-[34%] top-[99%] -translate-x-1/2 -translate-y-1/2">
                  <div className="hit" style={{ "--delay": "1.45s" }}>
                    <WhitePlusCard src="/icon/safepayment.png" alt="Post task" />
                  </div>
                </div>

                <div className="absolute left-[66%] top-[99%] -translate-x-1/2 -translate-y-1/2">
                  <div className="hit" style={{ "--delay": "1.55s" }}>
                    <WhitePlusCard src="/icon/progress.png" alt="Post task" />
                  </div>
                </div>
              </div>

              {/* Text */}
              <div className="pb-16 sm:pb-20">
                <h1 className="mx-auto max-w-3xl text-center text-[40px] font-extrabold leading-[0.98] tracking-tight text-gray-900 sm:text-5xl lg:text-5xl">
                  All-in-one
                  <br />
                  platform
                </h1>

                <p className="mx-auto mt-6 max-w-md text-center text-sm leading-6 text-gray-500 sm:text-[15px]">
                  Where work finds its perfect home.
                </p>

               <HeroSearch to="/projectsPage" />

              </div>
            </div>
          </div>
        </div>
        {/* <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[90] h-28 bg-gradient-to-b from-transparent via-white/80 to-white" /> */}
      </HoverCardsBackground>
    </section>
  );
}
