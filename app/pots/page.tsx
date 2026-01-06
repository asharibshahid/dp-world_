"use client";

import { useEffect, useMemo, useState } from "react";
import MobileHeader from "../../components/MobileHeader";
import type { PotRow } from "../../lib/loadPots";

type PotsMeta = {
  total: number;
  berths: string[];
  errors: { file: string; message: string }[];
};

type PotsResponse = {
  data: PotRow[];
  meta: PotsMeta;
};

type SelectFieldProps = {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
};

const SelectField = ({ label, value, options, onChange }: SelectFieldProps) => {
  return (
    <label className="flex w-full flex-col gap-2 text-sm font-medium text-slate-700">
      <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full appearance-none rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 focus:outline-none"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
};

const TERMINALS = ["T1", "T2", "T3", "T4", "T5"];

export default function PotsPage() {
  const [terminal, setTerminal] = useState("T1");
  const [berth, setBerth] = useState("");
  const [data, setData] = useState<PotRow[]>([]);
  const [meta, setMeta] = useState<PotsMeta>({
    total: 0,
    berths: [],
    errors: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    params.set("terminal", terminal);
    if (berth) {
      params.set("berth", berth);
    }
    return `?${params.toString()}`;
  }, [berth, terminal]);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const load = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/pots${queryString}`, {
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error("Failed to load pots data");
        }
        const payload = (await response.json()) as PotsResponse;
        if (isMounted) {
          setData(payload.data);
          setMeta(payload.meta);
        }
      } catch (error) {
        if (isMounted && !(error instanceof DOMException)) {
          setData([]);
          setMeta({ total: 0, berths: [], errors: [] });
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    load();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [queryString]);

  return (
    <section className="space-y-6 text-white">
      <MobileHeader title="Ports Consumption" />

      <div className="rounded-[26px] bg-white p-5 text-slate-900 shadow-[0_18px_40px_rgba(8,6,34,0.25)]">
        <div className="mb-4 space-y-2">
          <h1 className="text-lg font-semibold text-slate-900">
            Ports Consumption
          </h1>
          <p className="text-[11px] text-slate-500">
            View terminal berth consumption details.
          </p>
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <SelectField
              label="Terminal"
              value={terminal}
              options={TERMINALS}
              onChange={(value) => {
                setTerminal(value);
                setBerth("");
              }}
            />
            <SelectField
              label="Berth"
              value={berth}
              options={["All", ...meta.berths]}
              onChange={(value) => setBerth(value === "All" ? "" : value)}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span>
              {isLoading ? "Loading..." : `${meta.total} results`}
            </span>
            <span className="uppercase tracking-[0.2em]">{terminal}</span>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {data.map((row, index) => (
            <article
              key={`${row.vesselName}-${row.berth}-${index}`}
              className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                      Vessel Name
                    </p>
                    <p className="text-sm font-semibold text-slate-900">
                      {row.vesselName || "-"}
                    </p>
                  </div>
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                    {row.berth || "-"}
                  </span>
                </div>
                <div className="grid gap-3 text-xs text-slate-600 sm:grid-cols-2">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                      ETA
                    </p>
                    <p className="text-sm font-semibold text-slate-900">
                      {row.eta || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                      ETD
                    </p>
                    <p className="text-sm font-semibold text-slate-900">
                      {row.etd || "-"}
                    </p>
                  </div>
                </div>
              </div>
            </article>
          ))}
          {!isLoading && data.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-center text-[11px] text-slate-500">
              No ports consumption rows for this terminal.
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
