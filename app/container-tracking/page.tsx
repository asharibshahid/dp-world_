"use client";

import { useState } from "react";
import Image from "next/image";
import MobileHeader from "../../components/MobileHeader";
import SearchInput from "../../components/SearchInput";
import type { ContainerEvent } from "../../lib/loadContainerTracking";

type TrackingResponse = {
  container: string;
  size: string;
  type: string;
  events: ContainerEvent[];
};

type ViewState = "idle" | "loading" | "loaded" | "empty" | "error";

export default function Page() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<ViewState>("idle");
  const [events, setEvents] = useState<ContainerEvent[]>([]);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSearch = async () => {
    const trimmed = query.trim();
    if (!trimmed) {
      return;
    }

    setStatus("loading");
    setEvents([]);
    setErrorMessage("");

    try {
      const response = await fetch(
        `/api/container-tracking?container=${encodeURIComponent(trimmed)}`
      );
      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error || "Failed to load tracking data");
      }
      const payload = (await response.json()) as TrackingResponse;
      if (!payload.events || payload.events.length === 0) {
        setStatus("empty");
        return;
      }
      setEvents(payload.events);
      setStatus("loaded");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unknown error");
      setStatus("error");
    }
  };

  const showAnimation = status === "idle" || status === "loading";

  return (
    <section className="space-y-6 text-white">
      <MobileHeader title="Container Tracking" />

      <div className="rounded-[26px] bg-white p-5 text-slate-900 shadow-[0_18px_40px_rgba(8,6,34,0.25)]">
        <div className="mb-4 space-y-2">
          <h1 className="text-lg font-semibold text-slate-900">
            B/L / Container Tracking
          </h1>
          <SearchInput
            label="B/L / Container Search"
            placeholder="B/L / Container Search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <button
            type="button"
            onClick={handleSearch}
            className="w-full rounded-xl bg-[#241B6A] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1c1554] focus:outline-none focus:ring-2 focus:ring-[#241B6A]/40"
          >
            Search
          </button>
        </div>

        {showAnimation ? (
          <div className="flex justify-center">
            <Image
              src="/containertracking.gif"
              alt="Container tracking animation"
              width={900}
              height={640}
              className="h-auto w-full max-w-full object-contain mix-blend-multiply"
              priority={false}
              unoptimized
            />
          </div>
        ) : null}

        {status === "loading" ? (
          <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-center text-xs text-slate-500">
            Loading tracking events...
          </div>
        ) : null}

        {status === "empty" ? (
          <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-center text-xs text-slate-500">
            No tracking record found.
          </div>
        ) : null}

        {status === "error" ? (
          <div className="mt-4 rounded-2xl border border-dashed border-rose-200 bg-rose-50 p-4 text-center text-xs text-rose-600">
            {errorMessage || "Unable to load tracking data. Please try again."}
          </div>
        ) : null}

        {status === "loaded" ? (
          <div className="mt-4 space-y-3">
            {events.map((step, index) => {
              const statusValue = step.status.toLowerCase();
              const isCompleted = statusValue === "completed";
              return (
                <div
                  key={`${step.activity}-${step.locationVessel}-${index}`}
                  className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
                >
                  <div
                    className={`mt-1 flex h-8 w-8 items-center justify-center rounded-full ${
                      isCompleted
                        ? "bg-emerald-100 text-emerald-600"
                        : "bg-amber-100 text-amber-600"
                    }`}
                  >
                    {isCompleted ? (
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <circle
                          cx="12"
                          cy="12"
                          r="7"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                        <path
                          d="M9.5 12.5L11.25 14.25L14.75 10.75"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    ) : (
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <circle
                          cx="12"
                          cy="12"
                          r="7"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                        <path
                          d="M12 8V12L14.5 13.5"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-slate-900">
                        {step.activity || "Activity"}
                      </p>
                      {step.status ? (
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] ${
                            isCompleted
                              ? "bg-emerald-100 text-emerald-600"
                              : "bg-amber-100 text-amber-600"
                          }`}
                        >
                          {step.status}
                        </span>
                      ) : null}
                    </div>
                    <p className="text-xs text-slate-500">
                      {step.locationVessel || ""}
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-slate-500">
                    {step.activityDate || ""}
                  </span>
                </div>
              );
            })}
          </div>
        ) : null}
      </div>
    </section>
  );
}
