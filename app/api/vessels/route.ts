import { NextResponse } from "next/server";
import { loadVessels } from "../../../lib/loadVessels";

export const runtime = "nodejs";

type CacheEntry = {
  data: Awaited<ReturnType<typeof loadVessels>>;
  expiresAt: number;
};

let cache: CacheEntry | null = null;
const TTL_MS = 60_000;

const normalize = (value: string) => value.trim().toLowerCase();

const uniqueList = (values: string[]) =>
  Array.from(
    new Set(values.map((value) => value.trim()).filter((value) => value))
  ).sort((a, b) => a.localeCompare(b));

const parseDateFilter = (value: string | null, isEnd: boolean) => {
  if (!value) {
    return null;
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [y, m, d] = value.split("-").map(Number);
    return isEnd
      ? new Date(y, m - 1, d, 23, 59, 59, 999)
      : new Date(y, m - 1, d, 0, 0, 0, 0);
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const parseEta = (value: string) => {
  if (!value) {
    return null;
  }
  if (/^\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}$/.test(value)) {
    const [datePart, timePart] = value.split(" ");
    const [y, m, d] = datePart.split("-").map(Number);
    const [h, min] = timePart.split(":").map(Number);
    return new Date(y, m - 1, d, h, min, 0, 0);
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

export async function GET(request: Request) {
  const now = Date.now();
  const shouldRefresh =
    !cache || cache.expiresAt <= now || cache.data.rows.length === 0;
  let result = cache?.data ?? { rows: [], errors: [] };

  if (shouldRefresh) {
    result = await loadVessels();
    if (result.rows.length > 0 || result.errors.length === 0) {
      cache = {
        data: result,
        expiresAt: now + TTL_MS,
      };
    } else {
      cache = null;
    }
  }

  const url = new URL(request.url);
  const q = url.searchParams.get("q") ?? "";
  const sailTo = url.searchParams.get("sailTo") ?? "";
  const arrivedFrom = url.searchParams.get("arrivedFrom") ?? "";
  const dateFrom = parseDateFilter(url.searchParams.get("dateFrom"), false);
  const dateTo = parseDateFilter(url.searchParams.get("dateTo"), true);

  const normalizedQuery = normalize(q);
  const normalizedSailTo = normalize(sailTo);
  const normalizedArrivedFrom = normalize(arrivedFrom);

  const filtered = result.rows.filter((row) => {
    if (
      normalizedQuery &&
      !normalize(row.vesselName).includes(normalizedQuery)
    ) {
      return false;
    }
    if (normalizedSailTo && normalize(row.sailTo) !== normalizedSailTo) {
      return false;
    }
    if (
      normalizedArrivedFrom &&
      normalize(row.arrivedFrom) !== normalizedArrivedFrom
    ) {
      return false;
    }

    if (dateFrom || dateTo) {
      const etaDate = parseEta(row.eta);
      if (!etaDate) {
        return false;
      }
      if (dateFrom && etaDate < dateFrom) {
        return false;
      }
      if (dateTo && etaDate > dateTo) {
        return false;
      }
    }

    return true;
  });

  const meta = {
    total: filtered.length,
    arrivedFromList: uniqueList(result.rows.map((row) => row.arrivedFrom)),
    sailToList: uniqueList(result.rows.map((row) => row.sailTo)),
    errors: result.errors,
  };

  return NextResponse.json({ data: filtered, meta });
}
