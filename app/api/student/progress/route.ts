import { phpApi } from "@/lib/api";
import { bearerHeaders } from "@/lib/server-auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const res = await phpApi("/student/progress", {
    method: "POST",
    body: JSON.stringify(body),
    headers: bearerHeaders(req),
  });
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}