import React from "react";
import TestimonialCarousel from "./TestimonialCarousel.jsx";

/**
 * Reusable split auth layout: dark left (marketing) + white right (form).
 * Same structure as Register: card max-w-6xl rounded-[32px] grid md:grid-cols-2.
 */
export default function AuthSplitLayout({
  title,
  subtitle,
  leftHeading = "Manage your projects anywhere",
  leftSubheading = "Join thousands of clients and freelancers. Create your account in seconds and start collaborating.",
  testimonials,
  children,
  footer,
  cardClassName = "",
}) {
  return (
    <div className="min-h-screen bg-neutral-100 flex items-center justify-center p-4 md:p-8 md:pt-28">
      <div
        className={`w-full max-w-6xl overflow-hidden rounded-[32px] shadow-2xl ring-1 ring-black/5 bg-white grid md:grid-cols-2 min-h-[560px] ${cardClassName}`}
      >
        {/* —— Left Marketing Panel (Desktop only) —— */}
        <div className="hidden md:flex flex-col bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-950 relative p-10 lg:p-12 overflow-visible">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(194,65,12,0.15)_0%,transparent_50%)] pointer-events-none" />
          <div className="relative z-10 flex flex-col h-full">
            <div className="flex-1 flex flex-col justify-center mt-8">
              <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight leading-tight">
                {leftHeading}
              </h1>
              <p className="text-neutral-400 text-sm mt-3 max-w-sm">
                {leftSubheading}
              </p>
              <TestimonialCarousel testimonials={testimonials} />
            </div>
          </div>
        </div>

        {/* —— Right Form Panel —— */}
        <div className="flex flex-col justify-center p-6 sm:p-8 md:p-10 lg:p-12">
          <div className="w-full max-w-[420px] mx-auto">
            {title && (
              <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
            )}
            {subtitle && (
              <p className="text-neutral-500 text-sm mt-1">{subtitle}</p>
            )}
            <div className={title || subtitle ? "mt-6" : ""}>{children}</div>
            {footer && <div className="mt-6">{footer}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
