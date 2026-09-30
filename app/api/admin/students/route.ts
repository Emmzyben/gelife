import { phpApi } from "@/lib/api";
import { bearerHeaders } from "@/lib/server-auth";
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function GET(req: NextRequest) {
  const res = await phpApi("/index.php?_route=admin/students", {
    headers: bearerHeaders(req),
  });
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  
  const res = await phpApi("/index.php?_route=admin/students", {
    method: "POST",
    body: formData,
    headers: bearerHeaders(req),
  });
  
  const data = await res.json().catch(() => ({}));
  revalidatePath("/admin/students");
  return NextResponse.json(data, { status: res.status });
}