import type { MetadataRoute } from "next";
import { getPublishedCourses } from "@/lib/course-api";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.NODE_ENV === "production" ? "https://gelife.netlify.app" : "http://localhost:3000");

const publicRoutes = [
  "",
  "/about",
  "/services",
  "/training",
  "/contact",
  "/profile",
  "/privacy",
  "/terms",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = publicRoutes.map((route) => ({
    url: `${siteUrl}${route}`,
    changeFrequency: route === "/training" ? "daily" : "monthly",
    priority: route === "" ? 1 : route === "/training" ? 0.9 : 0.6,
  }));

  let courses: Awaited<ReturnType<typeof getPublishedCourses>> = [];
  try {
    courses = await getPublishedCourses();
  } catch {
    // Keep the public-page sitemap available if the course API is temporarily offline.
  }

  return [
    ...staticRoutes,
    ...courses.map((course) => ({
      url: `${siteUrl}/training/enroll/${encodeURIComponent(course.slug)}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}