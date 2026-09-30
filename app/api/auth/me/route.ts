import { bearerHeaders } from "@/lib/server-auth";
import { phpApi } from "@/lib/api";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const res = await phpApi("/auth/me", { headers: bearerHeaders(req) });
  let data;
  try {
    data = await res.json();
  } catch {
    return NextResponse.json(
      { error: "Authentication service returned an invalid response." },
      { status: 502, headers: { "Cache-Control": "no-store" } }
    );
  }
  return NextResponse.json(data, { status: res.status });
}