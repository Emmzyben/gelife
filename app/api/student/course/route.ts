import { bearerHeaders } from "@/lib/server-auth";
import { phpApi } from "@/lib/api";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const courseId = new URL(req.url).searchParams.get("id") ?? "";
  const res = await phpApi(`/student/course?id=${encodeURIComponent(courseId)}`, {
    headers: bearerHeaders(req),
  });
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}