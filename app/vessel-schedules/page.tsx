"use client";

import { useEffect, useMemo, useState } from "react";
import MobileHeader from "../../components/MobileHeader";
import SearchInput from "../../components/SearchInput";
import VesselCard from "../../components/VesselCard";
import type { VesselRow } from "../../lib/loadVessels";

type VesselMeta = {
  total: number;
  arrivedFromList: string[];
  sailToList: string[];
};

type VesselResponse = {
  data: VesselRow[];
  meta: VesselMeta;
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
        <option value="">All</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
};

export default function VesselSchedulesPage() {
  const [query, setQuery] = useState("");
  const [arrivedFrom, setArrivedFrom] = useState("");
  const [sailTo, setSailTo] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [data, setData] = useState<VesselRow[]>([]);
  const [meta, setMeta] = useState<VesselMeta>({
    total: 0,
    arrivedFromList: [],
    sailToList: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timeout);
  }, [query]);

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (debouncedQuery.trim()) {
      params.set("q", debouncedQuery.trim());
    }
    if (arrivedFrom) {
      params.set("arrivedFrom", arrivedFrom);
    }
    if (sailTo) {
      params.set("sailTo", sailTo);
    }
    if (dateFrom) {
      params.set("dateFrom", dateFrom);
    }
    if (dateTo) {
      params.set("dateTo", dateTo);
    }
    const qs = params.toString();
    return qs ? `?${qs}` : "";
  }, [arrivedFrom, dateFrom, dateTo, debouncedQuery, sailTo]);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const load = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/vessels${queryString}`, {
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error("Failed to load vessels");
        }
        const payload = (await response.json()) as VesselResponse;
        if (isMounted) {
          setData(payload.data);
          setMeta(payload.meta);
        }
      } catch (error) {
        if (isMounted && !(error instanceof DOMException)) {
          setData([]);
          setMeta({
            total: 0,
            arrivedFromList: [],
            sailToList: [],
          });
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

  const clearFilters = () => {
    setQuery("");
    setArrivedFrom("");
    setSailTo("");
    setDateFrom("");
    setDateTo("");
  };

  return (
    <section className="space-y-6 text-white">
      <MobileHeader title="Vessel Schedules" />

      <div className="rounded-[26px] bg-white p-5 text-slate-900 shadow-[0_18px_40px_rgba(8,6,34,0.25)]">
        <div className="mb-4 space-y-2">
          <h1 className="text-lg font-semibold text-slate-900">
            Vessel Schedules
          </h1>
          <p className="text-[11px] text-slate-500">
            Track upcoming arrivals and berth allocations.
          </p>
        </div>

        <div className="space-y-3">
          <SearchInput
            label="Search Vessel Name"
            placeholder="Search Vessel Name"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="text-sm"
          />

          <div className="grid grid-cols-2 gap-2">
            <SelectField
              label="Arrived From"
              value={arrivedFrom}
              options={meta.arrivedFromList}
              onChange={setArrivedFrom}
            />
            <SelectField
              label="Sail To"
              value={sailTo}
              options={meta.sailToList}
              onChange={setSailTo}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <SearchInput
              label="ETA From"
              type="date"
              value={dateFrom}
              onChange={(event) => setDateFrom(event.target.value)}
              className="text-sm"
            />
            <SearchInput
              label="ETA To"
              type="date"
              value={dateTo}
              onChange={(event) => setDateTo(event.target.value)}
              className="text-sm"
            />
          </div>

          <div className="flex items-center justify-between gap-3 text-[11px] text-slate-500">
            <span>
              {isLoading ? "Loading vessels..." : `${meta.total} results`}
            </span>
            <button
              type="button"
              onClick={clearFilters}
              className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 font-semibold uppercase tracking-[0.2em] text-slate-500 transition hover:border-slate-300 hover:bg-slate-100"
            >
              Clear
            </button>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {data.map((vessel, index) => (
            <VesselCard
              key={`${vessel.vesselName}-${vessel.voyageNo}-${index}`}
              vessel={vessel}
            />
          ))}
          {!isLoading && data.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-center text-[11px] text-slate-500">
              No vessel schedules match these filters.
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
