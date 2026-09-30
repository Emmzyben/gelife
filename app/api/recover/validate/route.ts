import { phpApi } from "@/lib/api";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const email = url.searchParams.get("email") ?? "";
  const code = url.searchParams.get("code") ?? "";
  const query = new URLSearchParams({ _route: "recover/validate", email, code });
  const res = await phpApi(`/index.php?${query.toString()}`);
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}