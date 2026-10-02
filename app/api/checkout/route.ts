import { phpApi } from "@/lib/api";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/checkout
 *
 * Proxies to PHP POST /checkout.
 * Requires: Authorization: Bearer <token> header (forwarded from the client).
 */
export async function POST(req: NextRequest) {
  const body = await req.text();
  const authorization = req.headers.get("Authorization") ?? "";

  const res = await phpApi("/checkout", {
    method: "POST",
    body,
    headers: {
      "Content-Type": "application/json",
      ...(authorization ? { Authorization: authorization } : {}),
    },
  });

  const data = await res.json().catch(() => ({ error: "Invalid response from API" }));
  return NextResponse.json(data, { status: res.status });
}
