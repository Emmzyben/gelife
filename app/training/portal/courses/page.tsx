"use client";

import { useEffect, useState } from "react";
import Link from "@/components/link";
import { ArrowRight, BookOpen, Clock3 } from "lucide-react";
import { PayButton } from "@/components/pay-button";
import { DashboardShell } from "@/components/dashboard-shell";
import { stripeEnabled } from "@/lib/config";
import { authenticatedFetch } from "@/lib/client-auth";
import { backendAssetUrl } from "@/lib/backend-assets";
import { PortalAuthFallback, usePortalAuth } from "@/components/portal-auth";
import type { EnrollmentRecord } from "@/lib/student-data";

export default function MyCoursesPage() {
  const { user: learner, loading: authLoading, error: authError, retry } = usePortalAuth();
  const [dashboardData, setDashboardData] = useState<{ enrollments: EnrollmentRecord[] }>({ enrollments: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!learner) return;
    authenticatedFetch("/api/student/dashboard", { cache: "no-store" })
      .then((response) => response.ok ? response.json() : { enrollments: [] })
      .then(setDashboardData)
      .catch(() => setDashboardData({ enrollments: [] }))
      .finally(() => setLoading(false));
  }, [learner]);

  if (authError || authLoading || !learner || loading) {
    return <PortalAuthFallback loading={authLoading} error={authError} retry={retry} label="Loading your courses…" />;
  }

  const records = dashboardData.enrollments.filter((record) => record.status !== "cancelled");
  const online = stripeEnabled();

  return (
    <DashboardShell user={learner}>
      <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow text-violet-700">My courses</p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-[#211a2d]">All Enrolled Courses</h1>
          <p className="mt-1 text-sm text-[#6e6877]">{records.length} course{records.length !== 1 ? "s" : ""} total</p>
        </div>
        <Link href="/training" className="button-secondary !min-h-10 !px-4 !py-2 !text-sm shrink-0">Browse more courses</Link>
      </div>

      {records.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#d7c9e8] bg-white p-10 text-center">
          <BookOpen className="mx-auto text-violet-200" size={44} />
          <h2 className="mt-4 text-xl font-bold text-[#211a2d]">No courses yet</h2>
          <p className="mt-2 text-[#6e6877]">Start your learning journey today.</p>
          <Link href="/training" className="button-primary mt-6 inline-flex">Browse courses</Link>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2">
          {records.map(({ course, status, completed, percent }) => (
            <article key={course.slug} className="overflow-hidden rounded-2xl border border-[#e8e1ed] bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
              {course.thumbnail_url ? (
                <img src={backendAssetUrl(course.thumbnail_url)} alt="" className="h-36 w-full object-cover" />
              ) : (
                <div className="h-1.5" style={{ background: status === "active" ? (course.accent || "#421181") : "#f59e0b" }} />
              )}
              <div className="p-6">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="eyebrow text-violet-700">{course.category}</p>
                    <h2 className="mt-1 text-lg font-extrabold tracking-tight text-[#211a2d]">{course.title}</h2>
                  </div>
                  <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${status === "active" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-900"}`}>
                    {status === "active" ? "Active" : "Pending"}
                  </span>
                </div>
                <p className="mt-2 line-clamp-2 text-sm text-[#6e6877]">{course.description}</p>
                {status === "active" ? (
                  <>
                    <div className="mt-4">
                      <div className="flex justify-between text-xs font-bold text-[#6e6877]">
                        <span>{completed} of {course.lessons.length} modules</span>
                        <span>{percent}%</span>
                      </div>
                      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-violet-100">
                        <div className="h-full rounded-full bg-[#421181] transition-all" style={{ width: `${percent}%` }} />
                      </div>
                    </div>
                    <Link href={`/training/portal/course/${course.slug}`} className="button-primary mt-5 w-full !justify-center">
                      {percent ? "Continue" : "Start course"}
                      <ArrowRight size={16} />
                    </Link>
                  </>
                ) : (
                  <>
                    <p className="mt-4 flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-xs font-semibold leading-5 text-amber-900">
                      <Clock3 className="mt-0.5 shrink-0" size={14} />
                      {online ? `Awaiting payment of $${course.price}.` : `Awaiting payment of $${course.price}. GELife Group will contact you.`}
                    </p>
                    {online && <PayButton courseSlug={String(course.slug)} price={course.price} />}
                  </>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}