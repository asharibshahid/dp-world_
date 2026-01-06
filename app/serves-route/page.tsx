"use client";

import { useState } from "react";
import Image from "next/image";
import MobileHeader from "../../components/MobileHeader";

const REGIONS = [
  {
    label: "Europe",
    image: "/europe.png",
    className:
      "rounded-2xl bg-[#1f6fff] px-3 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-white shadow-[0_12px_24px_rgba(31,111,255,0.25)]",
  },
  {
    label: "Asia | Middle East | Africa",
    image: "/asia.png",
    className:
      "rounded-2xl bg-[#f28c28] px-3 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-white shadow-[0_12px_24px_rgba(242,140,40,0.25)]",
  },
  {
    label: "Mediterranean",
    image: "/mediterranean.png",
    className:
      "rounded-2xl bg-[#19b36a] px-3 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-white shadow-[0_12px_24px_rgba(25,179,106,0.25)] flex items-center justify-center text-center leading-tight",
  },
  {
    label: "Americas",
    image: "/americas.png",
    className:
      "rounded-2xl bg-[#1f6fff] px-3 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-white shadow-[0_12px_24px_rgba(31,111,255,0.25)]",
  },
];

export default function ServesRoutePage() {
  const [activeRegion, setActiveRegion] = useState<string | null>(null);

  const activeImage = REGIONS.find(
    (region) => region.label === activeRegion
  )?.image;

  return (
    <section className="space-y-6 text-white">
      <MobileHeader title="Serves Route" />

      <div className="rounded-[26px] bg-[#241B6A] p-5 text-white shadow-[0_18px_40px_rgba(8,6,34,0.25)]">
        <div className="mb-4 flex justify-center">
          <div className="w-full rounded-full bg-[#f28c28] px-4 py-2 text-center text-xs font-semibold uppercase tracking-[0.2em] text-white">
            Serves Route
          </div>
        </div>

        <div className="rounded-3xl bg-white/95 p-4 text-slate-900">
          <div className="space-y-3">
            <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Search
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Port 1
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Port 2
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#241B6A] text-white">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 5V19M5 12H19"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <p className="text-sm font-medium text-slate-700">Add Route</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          {REGIONS.map((region) => (
            <button
              key={region.label}
              type="button"
              onClick={() => setActiveRegion(region.label)}
              className={region.className}
            >
              {region.label}
            </button>
          ))}
        </div>

        {activeImage ? (
          <div className="mt-4 flex justify-center">
            <Image
              src={activeImage}
              alt="Region map"
              width={900}
              height={640}
              className="h-auto w-full max-w-full object-contain"
              priority={false}
            />
          </div>
        ) : null}
      </div>
    </section>
  );
}
