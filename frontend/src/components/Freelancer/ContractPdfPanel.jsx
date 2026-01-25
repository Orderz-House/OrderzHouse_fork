import { useEffect, useMemo, useRef, useState } from "react";

/**
 * ContractPdfPanel
 * - Loads a PDF template (from /public) and draws the user's entered data onto it.
 * - Shows the filled PDF inside a modal and supports printing.
 *
 * Required dependency:
 *   npm i pdf-lib
 *
 * Put your PDF template in /public/contracts/ and pass the URL via templateUrl prop,
 * e.g. "/contracts/freelancer-contract-template.pdf"
 */

const DEFAULT_TEMPLATE_URL = "/contracts/freelancer-contract-template.pdf";

// These rectangles were measured from your provided template PDF (page 1).
// Coordinates are in "top-left origin" PDF points: (x0, y0, x1, y1).
const FIELD_RECTS = {
  duration: { x0: 262.85, y0: 81.93, x1: 471.21, y1: 98.82 },
  party2_name: { x0: 394.27, y0: 133.66, x1: 517.64, y1: 144.49 },
  country: { x0: 237.29, y0: 133.66, x1: 296.21, y1: 144.49 },
  specialty: { x0: 150.14, y0: 133.66, x1: 191.25, y1: 144.49 },
  governorate: { x0: 30.0, y0: 133.66, x1: 104.88, y1: 144.49 },

  area: { x0: 485.62, y0: 146.26, x1: 544.43, y1: 157.09 },
  neighborhood: { x0: 388.03, y0: 146.26, x1: 445.4, y1: 157.09 },
  street: { x0: 282.77, y0: 146.26, x1: 323.88, y1: 157.09 },
  building: { x0: 88.94, y0: 146.26, x1: 174.25, y1: 157.09 },
  apartment: { x0: 29.88, y0: 146.26, x1: 60.7, y1: 157.09 },

  jobTitle: { x0: 209.93, y0: 202.06, x1: 256.91, y1: 212.89 },

  issueDay: { x0: 350.71, y0: 671.34, x1: 413.03, y1: 684.62 },
  endDate: { x0: 126.74, y0: 671.34, x1: 167.7, y1: 684.98 },

  signature_name: { x0: 28.44, y0: 700.62, x1: 163.93, y1: 713.9 },
  signature_nationalId: { x0: 28.44, y0: 715.98, x1: 146.65, y1: 729.26 },
  signature_sign: { x0: 31.44, y0: 731.34, x1: 160.45, y1: 744.62 },
};

function safeStr(v) {
  if (v == null) return "";
  return String(v).trim();
}

function formatDateISO(d) {
  if (!d) return "";
  if (typeof d === "string") return d;
  try {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  } catch {
    return "";
  }
}

function toPdfRect(rect, pageHeight) {
  const height = rect.y1 - rect.y0;
  const x0 = rect.x0;
  const y0 = pageHeight - rect.y1;
  return { x0, y0, w: rect.x1 - rect.x0, h: height };
}

function fitFontSize(font, text, maxWidth, start = 11, min = 8) {
  let size = start;
  while (size >= min) {
    const w = font.widthOfTextAtSize(text, size);
    if (w <= maxWidth) return size;
    size -= 0.5;
  }
  return min;
}

function drawTextInRect(page, font, text, rect, rgbFn, opts = {}) {
  const t = safeStr(text);
  if (!t) return;

  const padX = opts.padX ?? 3;
  const align = opts.align ?? "right"; // "left" | "right" | "center"
  const color = opts.color ?? rgbFn(0.05, 0.1, 0.2);

  const pageHeight = page.getHeight();
  const pr = toPdfRect(rect, pageHeight);
  const maxWidth = Math.max(10, pr.w - padX * 2);

  const fontSize = fitFontSize(font, t, maxWidth, opts.size ?? 11, opts.minSize ?? 8);
  const textWidth = font.widthOfTextAtSize(t, fontSize);

  let x = pr.x0 + padX;
  if (align === "right") x = pr.x0 + pr.w - padX - textWidth;
  if (align === "center") x = pr.x0 + (pr.w - textWidth) / 2;

  const y = pr.y0 + (pr.h - fontSize) / 2 + 1;

  page.drawText(t, { x, y, size: fontSize, font, color });
}

async function buildFilledPdf({ templateUrl, data }) {
  // Dynamic import to avoid Vite resolution issues
  const { PDFDocument, StandardFonts, rgb } = await import("pdf-lib");
  
  const res = await fetch(templateUrl);
  if (!res.ok) throw new Error(`Failed to load PDF template: ${res.status}`);
  const tplBytes = await res.arrayBuffer();

  const pdf = await PDFDocument.load(tplBytes);
  const font = await pdf.embedFont(StandardFonts.Helvetica);

  const page = pdf.getPages()[0];

  drawTextInRect(page, font, data?.duration, FIELD_RECTS.duration, rgb, { size: 10.5, align: "left" });
  drawTextInRect(page, font, data?.fullName, FIELD_RECTS.party2_name, rgb, { size: 10.5, align: "left" });

  drawTextInRect(page, font, data?.country, FIELD_RECTS.country, rgb, { size: 10.5 });
  drawTextInRect(page, font, data?.specialty, FIELD_RECTS.specialty, rgb, { size: 10.5 });
  drawTextInRect(page, font, data?.governorate, FIELD_RECTS.governorate, rgb, { size: 10.5 });

  drawTextInRect(page, font, data?.area, FIELD_RECTS.area, rgb, { size: 10.5 });
  drawTextInRect(page, font, data?.neighborhood, FIELD_RECTS.neighborhood, rgb, { size: 10.5 });
  drawTextInRect(page, font, data?.street, FIELD_RECTS.street, rgb, { size: 10.5 });
  drawTextInRect(page, font, data?.building, FIELD_RECTS.building, rgb, { size: 10.5 });
  drawTextInRect(page, font, data?.apartment, FIELD_RECTS.apartment, rgb, { size: 10.5 });

  drawTextInRect(page, font, data?.jobTitle, FIELD_RECTS.jobTitle, rgb, { size: 10.5 });

  drawTextInRect(page, font, data?.issueDay, FIELD_RECTS.issueDay, rgb, { size: 10 });

  const endDate = formatDateISO(data?.endDate);
  if (endDate) {
    const pageHeight = page.getHeight();
    const r = toPdfRect(FIELD_RECTS.endDate, pageHeight);
    page.drawRectangle({
      x: r.x0,
      y: r.y0,
      width: r.w,
      height: r.h,
      color: rgb(1, 1, 1),
      opacity: 1,
      borderWidth: 0,
    });
    drawTextInRect(page, font, endDate, FIELD_RECTS.endDate, rgb, { size: 10, align: "left" });
  }

  drawTextInRect(page, font, data?.fullName, FIELD_RECTS.signature_name, rgb, { size: 10.5, align: "left" });
  drawTextInRect(page, font, data?.nationalId, FIELD_RECTS.signature_nationalId, rgb, { size: 10.5, align: "left" });

  const signText = safeStr(data?.signatureText) || (data?.fullName ? `${data.fullName} (e-signed)` : "");
  drawTextInRect(page, font, signText, FIELD_RECTS.signature_sign, rgb, { size: 10.5, align: "left" });

  return await pdf.save();
}

export default function ContractPdfPanel({
  open,
  onClose,
  templateUrl = DEFAULT_TEMPLATE_URL,
  data,
  autoPrint = false,
  onPrinted,
}) {
  const iframeRef = useRef(null);
  const [pdfUrl, setPdfUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const payload = useMemo(() => {
    return {
      duration: safeStr(data?.duration),
      fullName: safeStr(data?.fullName),
      nationalId: safeStr(data?.nationalId),
      country: safeStr(data?.country),
      specialty: safeStr(data?.specialty),
      governorate: safeStr(data?.governorate),
      area: safeStr(data?.area),
      neighborhood: safeStr(data?.neighborhood),
      street: safeStr(data?.street),
      building: safeStr(data?.building),
      apartment: safeStr(data?.apartment),
      jobTitle: safeStr(data?.jobTitle),
      issueDay: safeStr(data?.issueDay),
      endDate: data?.endDate,
      signatureText: safeStr(data?.signatureText),
    };
  }, [data]);

  useEffect(() => {
    if (!open) return;

    let alive = true;
    let localUrl = "";

    (async () => {
      try {
        setLoading(true);
        setErr("");

        const bytes = await buildFilledPdf({ templateUrl, data: payload });
        if (!alive) return;

        const blob = new Blob([bytes], { type: "application/pdf" });
        localUrl = URL.createObjectURL(blob);
        setPdfUrl(localUrl);
      } catch (e) {
        if (!alive) return;
        setErr(e?.message || "Failed to generate PDF.");
        setPdfUrl("");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
      if (localUrl) URL.revokeObjectURL(localUrl);
    };
  }, [open, templateUrl, payload]);

  useEffect(() => {
    if (!open || !autoPrint || !pdfUrl) return;

    const t = setTimeout(() => {
      try {
        const win = iframeRef.current?.contentWindow;
        if (win) {
          win.focus();
          win.print();
          onPrinted?.();
        }
      } catch {}
    }, 350);

    return () => clearTimeout(t);
  }, [open, autoPrint, pdfUrl, onPrinted]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[99999] bg-black/40 backdrop-blur-sm flex items-center justify-center p-3">
      <div className="w-full max-w-5xl rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-slate-200">
          <div className="min-w-0">
            <div className="text-sm font-extrabold text-slate-900">Contract PDF Preview</div>
            <div className="text-[11px] text-slate-500 truncate">
              Filled with your entered data (template: {templateUrl})
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                try {
                  const win = iframeRef.current?.contentWindow;
                  if (win) {
                    win.focus();
                    win.print();
                  }
                } catch {}
              }}
              className="h-9 px-3 rounded-2xl border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50"
              disabled={!pdfUrl}
              title={!pdfUrl ? "Generating PDF..." : "Print"}
            >
              Print
            </button>

            <button
              type="button"
              onClick={onClose}
              className="h-9 px-3 rounded-2xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800"
            >
              Close
            </button>
          </div>
        </div>

        <div className="p-3">
          {loading ? (
            <div className="h-[70vh] rounded-2xl border border-dashed border-slate-200 bg-slate-50 grid place-items-center">
              <div className="text-sm font-semibold text-slate-600">Generating PDF...</div>
            </div>
          ) : err ? (
            <div className="h-[70vh] rounded-2xl border border-dashed border-red-200 bg-red-50 grid place-items-center px-6 text-center">
              <div>
                <div className="text-sm font-extrabold text-red-700">Could not generate the PDF</div>
                <div className="mt-1 text-[12px] text-red-700/80">{err}</div>
                <div className="mt-3 text-[12px] text-red-700/70">
                  Make sure the PDF exists at <span className="font-mono">{templateUrl}</span> and that you installed{" "}
                  <span className="font-mono">pdf-lib</span>.
                </div>
              </div>
            </div>
          ) : pdfUrl ? (
            <div className="h-[70vh] rounded-2xl overflow-hidden border border-slate-200 bg-white">
              <iframe ref={iframeRef} title="Contract PDF" src={pdfUrl} className="w-full h-full" />
            </div>
          ) : (
            <div className="h-[70vh] rounded-2xl border border-dashed border-slate-200 bg-slate-50 grid place-items-center">
              <div className="text-sm font-semibold text-slate-600">No PDF to show.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
