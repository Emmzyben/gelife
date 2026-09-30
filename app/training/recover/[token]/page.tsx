import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Password recovery", robots: { index: false } };

export default function RecoverTokenPage() {
  redirect("/training/recover");
}