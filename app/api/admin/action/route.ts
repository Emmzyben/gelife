import { phpApi } from "@/lib/api";
import { bearerHeaders } from "@/lib/server-auth";
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  
  const res = await phpApi("/admin/action", {
    method: "POST",
    body: formData,
    headers: bearerHeaders(req),
  });
  
  const data = await res.json().catch(() => ({}));
  
  // Refresh the UI pages
  revalidatePath("/admin");
  revalidatePath("/admin/students");
  revalidatePath("/admin/consultations");
  return NextResponse.json(data, { status: res.status });
}