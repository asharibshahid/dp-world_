import { NextResponse } from "next/server";
import { loadContainerTracking } from "../../../lib/loadContainerTracking";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const container = (url.searchParams.get("container") ?? "").trim();

  if (!container) {
    return NextResponse.json(
      { error: "container is required" },
      { status: 400 }
    );
  }

  try {
    const result = await loadContainerTracking(container);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
