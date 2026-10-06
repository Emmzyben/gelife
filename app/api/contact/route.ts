import { phpApi } from "@/lib/api";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const res = await phpApi("/contact", {
    method: "POST",
    body: await req.text(),
    headers: { "Content-Type": "application/json" },
  });
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
