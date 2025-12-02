import { useEffect, useState, useRef } from "react";

export default function LiveActivity() {
  const primary = "rgb(2, 128, 144)";
  const primaryDark = "rgb(0, 90, 100)";
  const primaryLight = "rgb(0, 170, 180)";

  // === INITIAL VALUES (AS YOU REQUESTED) ===
  const [total, setTotal] = useState(() => 3070);             // يبدأ من 3000
  const [processing, setProcessing] = useState(() => 391);    // يبدأ من 391
  const [clients, setClients] = useState(() => 1563);         // يبدأ من 1563
  const [freelancers, setFreelancers] = useState(() => 682);  // يبدأ من 682

  // Interactivity / hover / pause
  const [isPaused, setIsPaused] = useState(false);
  const [hoveredTotal, setHoveredTotal] = useState(false);
  const [hoveredProcessing, setHoveredProcessing] = useState(false);
  const [hoveredClients, setHoveredClients] = useState(false);
  const [hoveredFreelancers, setHoveredFreelancers] = useState(false);

  // micro animation triggers
  const [pulseTotal, setPulseTotal] = useState(false);
  const [pulseProcessing, setPulseProcessing] = useState(false);
  const [pulseClients, setPulseClients] = useState(false);
  const [pulseFreelancers, setPulseFreelancers] = useState(false);

  // timer refs
  const totalTimerRef = useRef(null);
  const procTimerRef = useRef(null);
  const clientTimerRef = useRef(null);
  const freeTimerRef = useRef(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      clearTimeout(totalTimerRef.current);
      clearTimeout(procTimerRef.current);
      clearTimeout(clientTimerRef.current);
      clearTimeout(freeTimerRef.current);
    };
  }, []);

  // ====== RANDOM TICKS FOR VISUAL REALISM ======
  function scheduleTotalTick(speedFactor = 1) {
    clearTimeout(totalTimerRef.current);
    const delay = Math.max(400, Math.floor((2000 + Math.random() * 2000) * speedFactor));
    totalTimerRef.current = setTimeout(() => {
      if (!mounted.current || isPaused) return scheduleTotalTick(speedFactor);
      setTotal((t) => {
        const inc = Math.floor(Math.random() * 3) + 1; // random small increase
        setPulseTotal(true);
        setTimeout(() => setPulseTotal(false), 260);
        return t + inc;
      });
      scheduleTotalTick(speedFactor);
    }, delay);
  }

  function scheduleProcTick(speedFactor = 1) {
    clearTimeout(procTimerRef.current);
    const delay = Math.max(300, Math.floor((1800 + Math.random() * 3200) * speedFactor));
    procTimerRef.current = setTimeout(() => {
      if (!mounted.current || isPaused) return scheduleProcTick(speedFactor);
      setProcessing((p) => {
        const delta = Math.floor(Math.random() * 7) - 3; // -3..+3
        const upper = Math.max(3, Math.round(total * 0.01));
        const next = Math.max(0, Math.min(upper, p + delta));
        setPulseProcessing(true);
        setTimeout(() => setPulseProcessing(false), 260);
        return next;
      });
      scheduleProcTick(speedFactor);
    }, delay);
  }

  // === CLIENTS: Increase +1 every 2 hours ===
  useEffect(() => {
    const clientsInterval = setInterval(() => {
      setClients((c) => c + 1);
    }, 2 * 60 * 60 * 1000);

    return () => clearInterval(clientsInterval);
  }, []);

  // === FREELANCERS: +1 every 3 hours, -1 every 24 hours ===
  useEffect(() => {
    const freelancersInc = setInterval(() => {
      setFreelancers((f) => f + 1);
    }, 3 * 60 * 60 * 1000);

    const freelancersDec = setInterval(() => {
      setFreelancers((f) => Math.max(0, f - 1));
    }, 24 * 60 * 60 * 1000);

    return () => {
      clearInterval(freelancersInc);
      clearInterval(freelancersDec);
    };
  }, []);

  
// === TOTAL PROJECTS INCREASE EVERY 5 MINUTES ===
useEffect(() => {
  const inc5min = setInterval(() => {
    setTotal((t) => t + 1);
  }, 5 * 60 * 1000); // 5 minutes

  return () => clearInterval(inc5min);
}, []);


  // Restart system on pause or hover
  useEffect(() => {
    const totalSpeed = hoveredTotal ? 0.45 : 1;
    const procSpeed = hoveredProcessing ? 0.45 : 1;

    if (isPaused) {
      clearTimeout(totalTimerRef.current);
      clearTimeout(procTimerRef.current);
      return;
    }

    scheduleTotalTick(totalSpeed);
    scheduleProcTick(procSpeed);

    return () => {
      clearTimeout(totalTimerRef.current);
      clearTimeout(procTimerRef.current);
    };
  }, [isPaused, hoveredTotal, hoveredProcessing, total]);

  const fmt = (n) => n.toLocaleString();

  return (
    <section className="py-6 sm:py-8 ">
      <div className="max-w-7xl mx-auto">
        <div
          className="rounded-2xl flex flex-row sm:flex-col items-stretch gap-4 sm:gap-6 justify-between"
          
        >

          <div className="flex gap-4 justify-center sm:justify-end ">
            {/* ==== TOTAL PROJECTS ==== */}
            <div
              onMouseEnter={() => setHoveredTotal(true)}
              onMouseLeave={() => setHoveredTotal(false)}
              onClick={() => setIsPaused((s) => !s)}
              className={`rounded-xl bg-white  p-4 sm:p-5 min-w-[160px] text-center transition-transform duration-200 ${
                pulseTotal ? "scale-[1.02]" : ""
              }`}
              
            >
              <div className="text-sm text-slate-500">Total projects</div>
              <div className="mt-2 text-2xl sm:text-3xl font-extrabold" style={{ color: primary }}>
                {fmt(total)}
              </div>
            </div>

            {/* ==== PROCESSING ==== */}
            <div
              onMouseEnter={() => setHoveredProcessing(true)}
              onMouseLeave={() => setHoveredProcessing(false)}
              onClick={() => setIsPaused((s) => !s)}
              className={`rounded-xl bg-white ring-1 ring-black/5 p-4 sm:p-5 min-w-[160px] text-center transition-transform duration-200 ${
                pulseProcessing ? "scale-[1.02]" : ""
              }`}
              style={{ boxShadow: `0 1px 6px rgba(2,128,144,0.04)` }}
            >
              <div className="flex items-center justify-center gap-2">
                <div className="text-sm text-slate-500">Projects in Progress</div>
                <div className="text-xs text-slate-400">
                  ({Math.round((processing / Math.max(total, 1)) * 100)}%)
                </div>
              </div>
              <div className="mt-2 text-2xl sm:text-3xl font-extrabold" style={{ color: primaryDark }}>
                {fmt(processing)}
              </div>
            </div>

            {/* ==== CLIENTS ==== */}
            <div
              onMouseEnter={() => setHoveredClients(true)}
              onMouseLeave={() => setHoveredClients(false)}
              onClick={() => setIsPaused((s) => !s)}
              className={`rounded-xl bg-white ring-1 ring-black/5 p-4 sm:p-5 min-w-[160px] text-center transition-transform duration-200 ${
                pulseClients ? "scale-[1.02]" : ""
              }`}
              style={{ boxShadow: `0 1px 6px rgba(2,128,144,0.05)` }}
            >
              <div className="text-sm text-slate-500">Total clients</div>
              <div className="mt-2 text-2xl sm:text-3xl font-extrabold" style={{ color: primary }}>
                {fmt(clients)}
              </div>
            </div>

            {/* ==== FREELANCERS ==== */}
            <div
              onMouseEnter={() => setHoveredFreelancers(true)}
              onMouseLeave={() => setHoveredFreelancers(false)}
              onClick={() => setIsPaused((s) => !s)}
              className={`rounded-xl bg-white ring-1 ring-black/5 p-4 sm:p-5 min-w-[160px] text-center transition-transform duration-200 ${
                pulseFreelancers ? "scale-[1.02]" : ""
              }`}
              style={{ boxShadow: `0 1px 6px rgba(2,128,144,0.04)` }}
            >
              <div className="text-sm text-slate-500">Total freelancers</div>
              <div className="mt-2 text-2xl sm:text-3xl font-extrabold" style={{ color: primaryDark }}>
                {fmt(freelancers)}
              </div>
            </div>

            <div className="text-xs text-slate-500 text-center select-none">
              {isPaused ? (
                <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600">Paused</span>
              ) : (
                <span className="px-3 py-1 rounded-full" style={{ background: primary, color: "#fff" }}>
                  Live
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
