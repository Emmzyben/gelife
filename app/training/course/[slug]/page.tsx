import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Course" };
}

// This route is superseded by /training/portal/course/[id] which uses PHP course IDs.
// Redirect legacy slug-based URLs to the portal.
export default async function CoursePage() {
  redirect("/training/portal");
}