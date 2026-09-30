import { phpApi } from "@/lib/api";
import { bearerHeaders } from "@/lib/server-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const res = await phpApi("/admin/dashboard", {
    headers: bearerHeaders(req),
  });
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}