import React from "react";
import { Users, Briefcase, Handshake, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

// ===== Animations =====
const ease = [0.22, 1, 0.36, 1];

const sectionStagger = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.12, delayChildren: 0.05 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 18, filter: "blur(6px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.7, ease } },
};

const leftIn = {
  hidden: { opacity: 0, x: -26, y: 6, filter: "blur(4px)" },
  show: { opacity: 1, x: 0, y: 0, filter: "blur(0px)", transition: { duration: 0.7, ease } },
};

const rightIn = {
  hidden: { opacity: 0, x: 26, y: 6, filter: "blur(4px)" },
  show: { opacity: 1, x: 0, y: 0, filter: "blur(0px)", transition: { duration: 0.7, ease } },
};

const centerPop = {
  hidden: { opacity: 0, scale: 0.96, filter: "blur(6px)" },
  show: { opacity: 1, scale: 1, filter: "blur(0px)", transition: { duration: 0.85, ease } },
};

// communityImg: صورة الوسط (استبدلها بنفس متغيرك)
export default function CommunitySection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-violet-50 via-white to-orange-50 py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8">
      {/* ✅ Seam fades (top/bottom) متناسقة مع الخلفية الجديدة */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-[5] h-16 bg-gradient-to-b from-white to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[90] h-14 bg-gradient-to-b from-transparent via-white/80 to-white" />

      {/* ✅ Soft glows (نهدي + برتقالي) */}
      <div className="pointer-events-none absolute -top-24 left-[-90px] h-[420px] w-[420px] rounded-full bg-violet-300/18 blur-3xl" />
      <div className="pointer-events-none absolute -top-24 right-[-100px] h-[420px] w-[420px] rounded-full bg-orange-300/18 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-170px] left-[18%] h-[420px] w-[420px] rounded-full bg-indigo-200/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-190px] right-[14%] h-[420px] w-[420px] rounded-full bg-red-200/18 blur-3xl" />

      {/* ✅ Waves background (نهدي + برتقالي بشكل ناعم) */}
      <div className="absolute inset-0 overflow-hidden">
        <svg
          className="absolute inset-0 h-full w-full min-h-full min-w-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="communityGradientDuo" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#EDE9FE" stopOpacity="0.92" />
              <stop offset="45%" stopColor="#FFFFFF" stopOpacity="0.70" />
              <stop offset="100%" stopColor="#FFEDD5" stopOpacity="0.75" />
            </linearGradient>

            <linearGradient id="communityGradientDuo2" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#E0E7FF" stopOpacity="0.70" />
              <stop offset="55%" stopColor="#FFF7ED" stopOpacity="0.60" />
              <stop offset="100%" stopColor="#FFE4E6" stopOpacity="0.55" />
            </linearGradient>
          </defs>

          <path
            fill="url(#communityGradientDuo)"
            d="M0,25 C20,15 35,18 50,16 C65,14 80,12 100,15 L100,70 C85,75 70,78 55,76 C40,74 25,78 10,75 C5,74 0,72 0,70 Z"
          />
          <path
            fill="url(#communityGradientDuo2)"
            fillOpacity="0.55"
            d="M0,35 C15,30 30,33 45,31 C60,29 75,27 100,30 L100,60 C85,63 70,62 55,64 C40,66 25,63 10,65 C5,65.5 0,64 0,63 Z"
          />
          <path
            fill="#EDE9FE"
            fillOpacity="0.35"
            d="M0,45 C20,40 40,43 60,41 C75,39 90,37 100,40 L100,85 C80,88 60,87 40,89 C25,90 10,88 0,85 Z"
          />
          <path
            fill="#FFEDD5"
            fillOpacity="0.24"
            d="M0,55 C25,50 50,53 75,51 C85,50 95,49 100,50 L100,100 L0,100 Z"
          />
        </svg>
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-[420px] items-center justify-center sm:min-h-[520px] md:min-h-[620px]">
          <motion.div
            variants={sectionStagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.28 }}
            className="max-w-5xl text-center space-y-6 sm:space-y-8"
          >
            {/* Title */}
            <div>
              <motion.h1
                variants={fadeUp}
                className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 sm:mb-6 leading-tight tracking-tight"
              >
                Join Our <span className="block text-slate-950">Community</span>
              </motion.h1>

              <motion.p
                variants={fadeUp}
                className="mx-auto max-w-2xl text-base sm:text-sm md:text-lg text-gray-700 leading-relaxed px-4"
              >
                Connect with talented professionals, collaborate on exciting projects, and build lasting relationships
                in our freelance ecosystem.
              </motion.p>
            </div>

            {/* Content */}
            <div className="mt-8 sm:mt-10 md:mt-12">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 max-w-6xl mx-auto items-start lg:items-center">
                {/* Left column (من اليسار) */}
                <motion.div
                  variants={sectionStagger}
                  className="text-center sm:text-left space-y-6 sm:space-y-8 order-1 lg:order-1"
                >
                  <motion.div variants={leftIn}>
                    <FeatureCard
                      tone="violet"
                      Icon={Users}
                      title="Freelancer"
                      desc="Apply to tasks, showcase your skills, and get paid with confidence."
                      align="left"
                    />
                  </motion.div>

                  <motion.div variants={leftIn}>
                    <FeatureCard
                      tone="violet"
                      Icon={Briefcase}
                      title="Client"
                      desc="Post what you need, review proposals, and build your dream team."
                      align="left"
                    />
                  </motion.div>
                </motion.div>

                {/* Center Image (من النص) */}
                <motion.div
                  variants={centerPop}
                  className="lg:col-span-2 flex justify-center order-3 sm:order-2 lg:order-2"
                >
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-0 -z-10 rounded-[36px] bg-white/35 blur-xl" />
                    <div className="pointer-events-none absolute inset-0 -z-10 rounded-[36px] bg-gradient-to-br from-violet-200/25 to-orange-200/25 blur-2xl" />

                    <img
                      src="/community.jpg"
                      alt="Community"
                      className="w-64 sm:w-72 md:w-80 lg:w-96 xl:w-[28rem] h-auto object-contain drop-shadow-[0_24px_50px_rgba(0,0,0,0.10)]"
                      draggable={false}
                    />
                  </div>
                </motion.div>

                {/* Right column (من اليمين) */}
                <motion.div
                  variants={sectionStagger}
                  className="text-center sm:text-left space-y-6 sm:space-y-8 order-2 sm:order-3 lg:order-3"
                >
                  <motion.div variants={rightIn}>
                    <FeatureCard
                      tone="orange"
                      Icon={Handshake}
                      title="Customer Success"
                      desc="Collaborate smoothly, agree on delivery, and win together."
                      align="right"
                    />
                  </motion.div>

                  <motion.div variants={rightIn}>
                    <FeatureCard
                      tone="orange"
                      Icon={ShieldCheck}
                      title="Secure Payments"
                      desc="Escrow-like flow so both client and freelancer are protected."
                      align="right"
                    />
                  </motion.div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Decorative animated dots (نهدي + برتقالي) */}
      <div className="absolute top-10 sm:top-20 right-10 sm:right-20 h-3 w-3 sm:h-4 sm:w-4 rounded-full bg-orange-400 animate-bounce opacity-55" />
      <div className="absolute top-20 sm:top-40 right-16 sm:right-32 h-2 w-2 sm:h-3 sm:w-3 rounded-full bg-violet-500 animate-pulse opacity-25" />
      <div
        className="absolute bottom-16 sm:bottom-32 left-8 sm:left-16 h-4 w-4 sm:h-5 sm:w-5 rounded-full bg-indigo-500 animate-bounce opacity-25"
        style={{ animationDelay: "1s" }}
      />
      <div
        className="absolute bottom-10 sm:bottom-20 left-16 sm:left-32 h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-orange-500 animate-pulse opacity-25"
        style={{ animationDelay: "2s" }}
      />
    </section>
  );
}

function FeatureCard({ Icon, title, desc, align = "left", tone = "violet" }) {
  const isRight = align === "right";

  const iconWrap =
    tone === "orange"
      ? "bg-gradient-to-b from-orange-400 to-red-500 shadow-[0_14px_30px_rgba(249,115,22,0.22)]"
      : "bg-gradient-to-b from-violet-500 to-indigo-600 shadow-[0_14px_30px_rgba(139,92,246,0.20)]";

  const badgeRing = tone === "orange" ? "ring-orange-500/15" : "ring-violet-500/15";

  return (
    <div
      className={[
        "rounded-3xl bg-white/70 backdrop-blur-md",
        "ring-1 ring-black/5 shadow-[0_18px_45px_rgba(0,0,0,0.08)]",
        "p-5 sm:p-6",
        "transition-transform duration-300 hover:-translate-y-1",
      ].join(" ")}
    >
      <div
        className={[
          "mb-4 flex",
          isRight ? "justify-center sm:justify-end" : "justify-center sm:justify-start",
        ].join(" ")}
      >
        <div
          className={[
            "grid h-12 w-12 place-items-center rounded-2xl",
            iconWrap,
            "ring-1 ring-black/10",
            "relative",
          ].join(" ")}
        >
          <span
            className={[
              "pointer-events-none absolute inset-[-6px] rounded-[22px]",
              "ring-2",
              badgeRing,
            ].join(" ")}
          />
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>

      <h3
        className={[
          "text-sm sm:text-lg font-extrabold text-gray-900 mb-3",
          isRight ? "sm:text-right" : "sm:text-left",
        ].join(" ")}
      >
        {title}
      </h3>

      <p
        className={[
          "text-gray-600 leading-relaxed text-xs sm:text-sm sm:text-base",
          isRight ? "sm:text-right" : "sm:text-left",
        ].join(" ")}
      >
        {desc}
      </p>
    </div>
  );
}
