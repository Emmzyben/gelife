import { phpApi } from "@/lib/api";
import { bearerHeaders } from "@/lib/server-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  const query = new URLSearchParams({ _route: "admin/courses" });
  if (id) query.set("id", id);
  
  const res = await phpApi(`/index.php?${query.toString()}`, {
    headers: bearerHeaders(req),
  });
  
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}