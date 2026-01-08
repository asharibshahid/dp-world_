"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import MobileHeader from "../../components/MobileHeader";

const COUNTRIES = [
  "UAE",
  "Saudi Arabia",
  "Pakistan",
  "India",
  "Qatar",
  "Oman",
  "Bahrain",
];

const ROUTES = [
  "Europe",
  "Asia | Middle East | Africa",
  "Mediterranean",
  "Americas",
];

const ROUTE_IMAGES: Record<string, string> = {
  Europe: "/europe.png",
  "Asia | Middle East | Africa": "/asia.png",
  Mediterranean: "/mediterranean.png",
  Americas: "/americas.png",
};

export default function ServesRoutePage() {
  const [searchValue, setSearchValue] = useState("");
  const [country1, setCountry1] = useState("");
  const [country2, setCountry2] = useState("");
  const [selectedRoute, setSelectedRoute] = useState("");

  const routeImage = useMemo(() => {
    if (!selectedRoute) {
      return "";
    }
    return ROUTE_IMAGES[selectedRoute] || "";
  }, [selectedRoute]);

  return (
    <section className="space-y-6 text-white">
      <MobileHeader title="Serves Route" />

      

        <div className="rounded-3xl bg-white/95 p-4 text-slate-900">
          <div className="space-y-3">
            <label className="flex w-full flex-col gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                Search
              </span>
              <input
                type="text"
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                placeholder="Search"
                className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none"
              />
            </label>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="flex w-full flex-col gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Country 1
                </span>
                <select
                  value={country1}
                  onChange={(event) => setCountry1(event.target.value)}
                  className="w-full appearance-none rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 focus:outline-none"
                >
                  <option value="">Select Country 1</option>
                  {COUNTRIES.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex w-full flex-col gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Country 2
                </span>
                <select
                  value={country2}
                  onChange={(event) => setCountry2(event.target.value)}
                  className="w-full appearance-none rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 focus:outline-none"
                >
                  <option value="">Select Country 2</option>
                  {COUNTRIES.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="flex w-full flex-col gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                Check Routes
              </span>
              <select
                value={selectedRoute}
                onChange={(event) => setSelectedRoute(event.target.value)}
                className="w-full appearance-none rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 focus:outline-none"
              >
                <option value="">Select Route</option>
                {ROUTES.map((route) => (
                  <option key={route} value={route}>
                    {route}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        {routeImage ? (
          <div className="mt-4 overflow-hidden rounded-3xl bg-white/95 p-3">
            <Image
              src={routeImage}
              alt="Route map"
              width={900}
              height={640}
              className="h-auto w-full max-w-full rounded-2xl object-contain"
              priority={false}
            />
          </div>
        ) : null}
    
    </section>
  );
}


