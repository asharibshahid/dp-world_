import { NextResponse } from "next/server";
import { loadPots, PotsLoadError } from "../../../lib/loadPots";

export const runtime = "nodejs";

type CacheEntry = {
  data: Awaited<ReturnType<typeof loadPots>>;
  expiresAt: number;
};

const TTL_MS = 60_000;
const cache = new Map<string, CacheEntry>();

const normalizeTerminal = (value: string) => value.trim().toUpperCase();

export async function GET(request: Request) {
  const url = new URL(request.url);
  const terminalParam = url.searchParams.get("terminal") ?? "";
  const berth = url.searchParams.get("berth") ?? "";
  const terminal = normalizeTerminal(terminalParam);

  if (!terminal) {
    return NextResponse.json(
      { error: "terminal is required (T1..T5)" },
      { status: 400 }
    );
  }

  if (!/^T[1-5]$/.test(terminal)) {
    return NextResponse.json(
      { error: "terminal must be one of T1, T2, T3, T4, T5" },
      { status: 400 }
    );
  }

  const cached = cache.get(terminal);
  const now = Date.now();
  let result = cached?.data ?? { rows: [], berths: [], errors: [] };

  if (!cached || cached.expiresAt <= now || cached.data.rows.length === 0) {
    try {
      result = await loadPots(terminal);
      if (result.rows.length > 0 || result.errors.length === 0) {
        cache.set(terminal, { data: result, expiresAt: now + TTL_MS });
      } else {
        cache.delete(terminal);
      }
    } catch (error) {
      if (error instanceof PotsLoadError) {
        return NextResponse.json({ error: error.message }, { status: error.status });
      }
      const message = error instanceof Error ? error.message : "Unknown error";
      return NextResponse.json({ error: message }, { status: 500 });
    }
  }

  const normalizedBerth = berth.trim().toLowerCase();
  const data = normalizedBerth
    ? result.rows.filter((row) => row.berth.toLowerCase() === normalizedBerth)
    : result.rows;

  const meta = {
    total: data.length,
    berths: result.berths,
    errors: result.errors,
  };

  return NextResponse.json({ data, meta });
}
