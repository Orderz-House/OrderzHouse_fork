// Dashboard.jsx
import { Calendar, CheckCircle, XCircle, DollarSign, ChevronDown } from "lucide-react";

// الأرقام في الكروت العلوية
const topStats = [
  {
    id: "orders",
    title: "Total Orders",
    value: "65",
    from: "#FFB457",
    to: "#FF8A4C",
    Icon: Calendar,
  },
  {
    id: "delivered",
    title: "Total Delivered",
    value: "145",
    from: "#028090",
    to: "#028090",
    Icon: CheckCircle,
  },
  {
    id: "canceled",
    title: "Total Canceled",
    value: "15",
    from: "#FF7B8A",
    to: "#FF4C6A",
    Icon: XCircle,
  },
  {
    id: "revenue",
    title: "Total Revenue",
    value: "$4,568",
    from: "#34D399",
    to: "#10B981",
    Icon: DollarSign,
  },
];

// بيانات الـ Overview (المنطقة المموّجة)
const overviewLabels = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const overviewSeries = [
  {
    id: "orders",
    label: "Total Order",
    color: "#FF6B6B",
    data: [30, 55, 45, 70, 60, 85, 55, 75, 70, 90, 80, 95],
  },
  {
    id: "revenue",
    label: "Total Revenue",
    color: "#028090",
    data: [20, 40, 35, 60, 50, 75, 45, 65, 60, 80, 75, 88],
  },
];

// بيانات Total Revenue (خطين 2020 و 2021)
const revenueLabels = overviewLabels;

const revenueSeries = [
  {
    id: "y2020",
    label: "2020",
    color: "#FF6B6B",
    data: [2.5, 3.2, 3.0, 3.8, 3.5, 4.2, 3.9, 4.4, 4.0, 4.6, 4.8, 5.0],
  },
  {
    id: "y2021",
    label: "2021",
    color: "#028090",
    data: [3.0, 3.5, 3.4, 4.1, 4.0, 4.8, 4.6, 5.0, 5.1, 5.4, 5.7, 6.0],
  },
];

// بيانات Chart Order (الأعمدة)
const orderBars = [
  { label: "SAT", value: 40 },
  { label: "SUN", value: 65 },
  { label: "MON", value: 55 },
  { label: "TUE", value: 72 },
  { label: "WED", value: 60 },
  { label: "THU", value: 80 },
  { label: "FRI", value: 50 },
];

// بيانات Earning Categories
const earningCategories = [
  {
    id: "ui",
    title: "UI Design",
    subtitle: "$95 / $1200",
    badge: "$45",
    progress: 70,
    color: "#028090",
  },
  {
    id: "ux",
    title: "UX Design",
    subtitle: "$95 / $1200",
    badge: "$545",
    progress: 55,
    color: "#F97373",
  },
  {
    id: "web",
    title: "Web Developing",
    subtitle: "$95 / $1200",
    badge: "$1,245",
    progress: 80,
    color: "#10B981",
  },
  {
    id: "illus",
    title: "Illustration",
    subtitle: "$95 / $1200",
    badge: "$95",
    progress: 45,
    color: "#FBBF24",
  },
];

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-[#F5F7FB] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
    

        {/* الكروت العلوية (4 كروت) */}
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {topStats.map((item) => (
            <StatCard key={item.id} {...item} />
          ))}
        </section>

        {/* الصف الثاني: Overview + Chart Order */}
        <section className="grid gap-6 xl:grid-cols-[2.2fr,1fr]">
          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-gray-800">Overview</h2>
                <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-gray-500">
                  <LegendItem color="#FF6B6B" label="Total Order" />
                  <LegendItem color="#028090" label="Total Revenue" />
                </div>
              </div>
              <button className="flex items-center gap-1 rounded-full border border-gray-200 px-3 py-1 text-xs text-gray-500 shadow-sm">
                Month
                <ChevronDown className="h-3 w-3" />
              </button>
            </div>

            <AreaChart labels={overviewLabels} series={overviewSeries} />
          </div>

          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-800">Chart Order</h2>
              <span className="text-xs text-gray-400">This week</span>
            </div>
            <OrderBarChart data={orderBars} />
          </div>
        </section>

        {/* الصف الثالث: Total Revenue + Earning Categories */}
        <section className="grid gap-6 xl:grid-cols-[2.2fr,1fr]">
          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-gray-800">
                  Total Revenue
                </h2>
                <p className="mt-1 text-xs text-gray-400">Compared to last year</p>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                <LegendItem color="#028090" label="2021" />
                <LegendItem color="#FF6B6B" label="2020" />
              </div>
            </div>
            <LineChart
              labels={revenueLabels}
              series={revenueSeries}
              highlightIndex={5}
            />
          </div>

          <EarningCategoriesCard />
        </section>
      </div>
    </div>
  );
}

/* ====================== components ====================== */

// كارت من الكروت الأربعة في الأعلى
function StatCard({ title, value, from, to, Icon }) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl p-4 text-white shadow-sm"
      style={{
        background: `linear-gradient(135deg, ${from}, ${to})`,
      }}
    >
      <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/10" />
      <div className="pointer-events-none absolute -left-12 bottom-[-40px] h-32 w-32 rounded-full bg-black/5" />
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-2xl font-semibold leading-tight">{value}</p>
          <p className="mt-1 text-sm text-white/80">{title}</p>
        </div>
        <div className="grid h-11 w-11 place-items-center rounded-xl bg-white/15">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

// نقطة صغيرة + عنوان (للّيجند)
function LegendItem({ color, label }) {
  return (
    <div className="flex items-center gap-1.5">
      <span
        className="h-2 w-2 rounded-full"
        style={{ backgroundColor: color }}
      />
      <span>{label}</span>
    </div>
  );
}

// الرسم المموّج (Overview)
function AreaChart({ labels, series }) {
  const width = 100;
  const height = 40;
  const allValues = series.flatMap((s) => s.data);
  const maxValue = allValues.length ? Math.max(...allValues) : 0;
  const safeMax = maxValue || 1;
  const stepX = labels.length > 1 ? width / (labels.length - 1) : width;

  const buildAreaPath = (data) => {
    if (!data.length) return "";
    let d = "";
    data.forEach((value, index) => {
      const x = index * stepX;
      const y = height - (value / safeMax) * (height - 4) - 2;
      if (index === 0) d += `M ${x},${y}`;
      else d += ` L ${x},${y}`;
    });
    d += ` L ${width},${height} L 0,${height} Z`;
    return d;
  };

  return (
    <div className="w-full">
      <div className="h-48 w-full">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="h-full w-full overflow-visible"
        >
          <defs>
            {series.map((s) => (
              <linearGradient
                key={s.id}
                id={`area-gradient-${s.id}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor={s.color} stopOpacity="0.35" />
                <stop offset="100%" stopColor={s.color} stopOpacity="0" />
              </linearGradient>
            ))}
          </defs>

          {/* خطوط الشبكة الأفقية */}
          {Array.from({ length: 5 }).map((_, idx) => {
            const y = (height / 4) * idx;
            return (
              <line
                key={idx}
                x1="0"
                x2={width}
                y1={y}
                y2={y}
                stroke="#E5E7EB"
                strokeWidth="0.3"
              />
            );
          })}

          {series.map((s, idx) => (
            <path
              key={s.id}
              d={buildAreaPath(s.data)}
              fill={`url(#area-gradient-${s.id})`}
              stroke={s.color}
              strokeWidth="0.8"
              strokeLinecap="round"
              opacity={idx === 0 ? 0.95 : 1}
            />
          ))}
        </svg>
      </div>
      <div className="mt-2 flex items-center justify-between text-[10px] font-medium text-gray-400">
        {labels.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>
    </div>
  );
}

// الرسم الخطي (Total Revenue)
function LineChart({ labels, series, highlightIndex = 5 }) {
  const width = 100;
  const height = 40;
  const allValues = series.flatMap((s) => s.data);
  const maxValue = allValues.length ? Math.max(...allValues) : 0;
  const safeMax = maxValue || 1;
  const stepX = labels.length > 1 ? width / (labels.length - 1) : width;

  const buildLine = (data) => {
    if (!data.length) return "";
    let d = "";
    data.forEach((value, index) => {
      const x = index * stepX;
      const y = height - (value / safeMax) * (height - 4) - 2;
      if (index === 0) d += `M ${x},${y}`;
      else d += ` L ${x},${y}`;
    });
    return d;
  };

  const highlightSeries = series[1] || series[0];
  const highlightValue =
    highlightSeries && highlightSeries.data[highlightIndex] != null
      ? highlightSeries.data[highlightIndex]
      : null;

  const hx = highlightValue != null ? highlightIndex * stepX : null;
  const hy =
    highlightValue != null
      ? height - (highlightValue / safeMax) * (height - 4) - 2
      : null;

  return (
    <div className="w-full">
      <div className="h-48 w-full">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="h-full w-full overflow-visible"
        >
          {/* خطوط الشبكة */}
          {Array.from({ length: 5 }).map((_, idx) => {
            const y = (height / 4) * idx;
            return (
              <line
                key={idx}
                x1="0"
                x2={width}
                y1={y}
                y2={y}
                stroke="#E5E7EB"
                strokeWidth="0.3"
              />
            );
          })}

          {series.map((s) => (
            <path
              key={s.id}
              d={buildLine(s.data)}
              fill="none"
              stroke={s.color}
              strokeWidth="1.2"
              strokeLinecap="round"
            />
          ))}

          {hx != null && hy != null && (
            <>
              <line
                x1={hx}
                x2={hx}
                y1={hy}
                y2={height}
                stroke="#9CA3AF"
                strokeWidth="0.5"
                strokeDasharray="2 2"
              />
              <circle cx={hx} cy={hy} r="1.7" fill={highlightSeries.color} />
              <g transform={`translate(${hx},${hy - 9})`}>
                <rect
                  x="-9"
                  y="-5"
                  width="20"
                  height="10"
                  rx="2"
                  fill="#111827"
                />
                <text
                  x="1"
                  y="0"
                  textAnchor="middle"
                  fontSize="3"
                  fill="#FFFFFF"
                >
                  {`$${highlightValue.toFixed(1)}k`}
                </text>
              </g>
            </>
          )}
        </svg>
      </div>
      <div className="mt-2 flex items-center justify-between text-[10px] font-medium text-gray-400">
        {labels.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>
    </div>
  );
}

// الأعمدة (Chart Order)
function OrderBarChart({ data }) {
  const max = data.length ? Math.max(...data.map((d) => d.value)) : 0;
  const safeMax = max || 1;

  return (
    <div className="w-full">
      <div className="flex h-44 items-end justify-between gap-3">
        {data.map((item) => {
          const percentage = (item.value / safeMax) * 100;
          return (
            <div
              key={item.label}
              className="flex flex-1 flex-col items-center gap-2"
            >
              <div className="relative flex h-full w-6 items-end rounded-xl bg-[#FEE2E2]">
                <div
                  className="w-full rounded-xl bg-[#F97373]"
                  style={{ height: `${percentage}%` }}
                />
              </div>
              <span className="text-[10px] font-medium text-gray-400">
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// كارت Earning Categories
function EarningCategoriesCard() {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-800">
          Earning Categories
        </h2>
        <span className="text-xs text-gray-400">This month</span>
      </div>
      <div className="space-y-4">
        {earningCategories.map((cat) => (
          <div
            key={cat.id}
            className="flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3">
              <span
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: cat.color }}
              />
              <div>
                <p className="text-sm font-medium text-gray-800">
                  {cat.title}
                </p>
                <p className="text-[11px] text-gray-400">{cat.subtitle}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden w-20 overflow-hidden rounded-full bg-gray-100 sm:block">
                <div
                  className="h-1.5 rounded-full"
                  style={{
                    width: `${cat.progress}%`,
                    backgroundColor: cat.color,
                  }}
                />
              </div>
              <span className="rounded-full bg-[#ECFDF3] px-3 py-1 text-xs font-semibold text-[#16A34A]">
                {cat.badge}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
