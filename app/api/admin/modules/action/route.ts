import { phpApi } from "@/lib/api";
import { bearerHeaders } from "@/lib/server-auth";
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const res = await phpApi("/index.php?_route=admin/modules/action", {
    method: "POST",
    body: formData,
    headers: bearerHeaders(req),
  });
  const data = await res.json().catch(() => ({ error: "Module action returned an invalid response." }));
  revalidatePath("/admin/courses");
  return NextResponse.json(data, { status: res.status });
}