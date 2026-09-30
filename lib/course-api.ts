import { phpApi } from "@/lib/api";

export type PublicCourse = {
  id: number;
  slug: string;
  category: string;
  title: string;
  description: string;
  price: number;
  level: string;
  accent: string;
  outcomes: string[];
  thumbnail_url?: string | null;
  modules: { id: number; title: string }[];
};

export async function getPublishedCourses(): Promise<PublicCourse[]> {
  const response = await phpApi("/index.php?_route=courses");
  if (!response.ok) return [];
  const data = await response.json().catch(() => ({}));
  return data.courses || [];
}

export async function getPublishedCourse(slug: string): Promise<PublicCourse | null> {
  const response = await phpApi(`/index.php?_route=courses&slug=${encodeURIComponent(slug)}`);
  if (!response.ok) return null;
  const data = await response.json().catch(() => ({}));
  return data.course || null;
}