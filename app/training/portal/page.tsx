"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "@/components/link";
import { ArrowRight, BookOpen, Clock3, TrendingUp } from "lucide-react";
import { PayButton } from "@/components/pay-button";
import { DashboardShell } from "@/components/dashboard-shell";
import { stripeEnabled } from "@/lib/config";
import { authenticatedFetch } from "@/lib/client-auth";
import { backendAssetUrl } from "@/lib/backend-assets";
import { PortalAuthFallback, usePortalAuth } from "@/components/portal-auth";
import type { EnrollmentRecord } from "@/lib/student-data";

const subscribeToPayment = () => () => {};
const getPaymentSnapshot = () => new URLSearchParams(window.location.search).get("payment");
const getPaymentCourseIdSnapshot = () => new URLSearchParams(window.location.search).get("course_id");
const getServerPaymentSnapshot = () => null;

export default function PortalPage() {
  const { user: learner, loading: authLoading, error: authError, retry } = usePortalAuth();
  const [dashboardData, setDashboardData] = useState<{ enrollments: EnrollmentRecord[] }>({ enrollments: [] });
  const [loading, setLoading] = useState(true);
  const [paymentWaitTimedOut, setPaymentWaitTimedOut] = useState(false);
  const payment = useSyncExternalStore(subscribeToPayment, getPaymentSnapshot, getServerPaymentSnapshot);
  const paymentCourseId = useSyncExternalStore(subscribeToPayment, getPaymentCourseIdSnapshot, getServerPaymentSnapshot);

  useEffect(() => {
    if (!learner) return;
    let cancelled = false;
    let pollTimer: ReturnType<typeof setTimeout> | undefined;
    setPaymentWaitTimedOut(false);

    async function refreshDashboard() {
      const response = await authenticatedFetch("/api/student/dashboard", { cache: "no-store" });
      if (!response.ok) throw new Error("Could not refresh the learner dashboard.");
      const data = await response.json() as { enrollments: EnrollmentRecord[] };
      if (!cancelled) setDashboardData(data);
      return data;
    }

    void (async () => {
      let data: { enrollments: EnrollmentRecord[] } | null = null;
      try {
        data = await refreshDashboard();
      } catch {
        if (!cancelled) setDashboardData({ enrollments: [] });
      } finally {
        if (!cancelled) setLoading(false);
      }

      if (payment !== "success" || !paymentCourseId || cancelled) return;

      for (let attempt = 0; attempt < 15; attempt += 1) {
        const confirmed = data?.enrollments.some(
          (record) => String(record.course.id) === paymentCourseId && record.status === "active"
        );
        if (confirmed) return;

        await new Promise<void>((resolve) => {
          pollTimer = setTimeout(resolve, 2000);
        });
        if (cancelled) return;

        try {
          data = await refreshDashboard();
        } catch {
          // Keep checking until the webhook update is visible or the wait expires.
        }
      }

      if (!cancelled) setPaymentWaitTimedOut(true);
    })();

    return () => {
      cancelled = true;
      if (pollTimer) clearTimeout(pollTimer);
    };
  }, [learner, payment, paymentCourseId]);

  if (authError || authLoading || !learner || loading) {
    return <PortalAuthFallback loading={authLoading} error={authError} retry={retry} label="Loading your dashboard…" />;
  }

  const records = [...dashboardData.enrollments].filter((record) => record.status !== "cancelled");
  const sortedRecords = [...records].sort((a, b) => {
    const aTime = new Date(a.created_at ?? 0).getTime();
    const bTime = new Date(b.created_at ?? 0).getTime();
    return bTime - aTime;
  });

  const activeCourses = sortedRecords.filter((r) => r.status === "active");
  const pendingCourses = sortedRecords.filter((r) => r.status !== "active");

  const totalLessons = sortedRecords.reduce((sum, r) => sum + r.course.lessons.length, 0);
  const totalCompleted = sortedRecords.reduce((sum, r) => sum + r.completed, 0);
  const overallPercent = totalLessons > 0 ? Math.round((totalCompleted / totalLessons) * 100) : 0;
  const paymentCourse = sortedRecords.find((record) => String(record.course.id) === paymentCourseId);
  const paymentConfirmed = paymentCourse?.status === "active";

  const online = stripeEnabled();

  return (
    <DashboardShell user={learner}>
      {payment === "cancelled" && (
        <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 font-semibold text-amber-900" role="status">
          Payment was cancelled. You have not been charged; the course will remain pending until payment is complete.
        </div>
      )}
      {payment === "success" && (
        <div
          className={`mb-6 rounded-2xl border p-4 font-semibold ${paymentConfirmed ? "border-emerald-200 bg-emerald-50 text-emerald-900" : "border-amber-200 bg-amber-50 text-amber-900"}`}
          role="status"
        >
          {paymentConfirmed
            ? `${paymentCourse?.course.title ?? "Your course"} is active. Stripe confirmed your payment.`
            : paymentWaitTimedOut
              ? "Payment has not been confirmed yet. Your course remains pending. If you completed payment, contact support before paying again."
              : "Waiting for Stripe to confirm your payment. This dashboard is checking for the webhook update automatically."}
        </div>
      )}

      <div className="mb-7 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-[#e8e1ed] bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-widest text-[#6e6877]">Enrolled</p>
          <p className="mt-1 text-3xl font-extrabold text-[#421181]">{records.length}</p>
          <p className="text-xs text-[#6e6877]">course{records.length !== 1 ? "s" : ""}</p>
        </div>
        <div className="rounded-2xl border border-[#e8e1ed] bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-widest text-[#6e6877]">Active</p>
          <p className="mt-1 text-3xl font-extrabold text-[#421181]">{activeCourses.length}</p>
          <p className="text-xs text-[#6e6877]">in progress</p>
        </div>
        <div className="col-span-2 rounded-2xl border border-[#e8e1ed] bg-white p-5 shadow-sm sm:col-span-1">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-widest text-[#6e6877]">Progress</p>
            <TrendingUp size={16} className="text-violet-400" />
          </div>
          <p className="mt-1 text-3xl font-extrabold text-[#421181]">{overallPercent}%</p>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-violet-100">
            <div className="h-full rounded-full bg-[#421181]" style={{ width: `${overallPercent}%` }} />
          </div>
        </div>
      </div>

      <section>
        <div className="mb-5 flex items-center justify-between">
          <h1 className="text-xl font-extrabold tracking-tight text-[#211a2d]">Continue Learning</h1>
          <Link href="/training/portal/courses" className="text-sm font-bold text-[#421181] hover:underline">
            View all
          </Link>
        </div>

        {sortedRecords.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#d7c9e8] bg-white p-10 text-center">
            <BookOpen className="mx-auto text-violet-200" size={44} />
            <h2 className="mt-4 text-xl font-bold text-[#211a2d]">No courses yet</h2>
            <p className="mt-2 text-[#6e6877]">Choose a course to begin your learning journey.</p>
            <Link href="/training" className="button-primary mt-6 inline-flex">Browse courses</Link>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {sortedRecords.map(({ course, completed, percent, status }) => {
              const isActive = status === "active";

              if (isActive) {
                return (
                  <article
                    key={course.slug}
                    className="overflow-hidden rounded-2xl border border-[#e8e1ed] bg-white shadow-sm transition-shadow hover:shadow-md"
                  >
                    {course.thumbnail_url ? (
                      <img src={backendAssetUrl(course.thumbnail_url)} alt="" className="h-36 w-full object-cover" />
                    ) : (
                      <div className="h-1.5" style={{ background: course.accent || "#421181" }} />
                    )}
                    <div className="p-6">
                      <p className="eyebrow text-violet-700">{course.category}</p>
                      <h2 className="mt-1.5 text-lg font-extrabold tracking-tight text-[#211a2d]">{course.title}</h2>
                      <p className="mt-1 line-clamp-2 text-sm text-[#6e6877]">{course.description}</p>
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
                        {percent ? "Continue course" : "Start course"}
                        <ArrowRight size={16} />
                      </Link>
                    </div>
                  </article>
                );
              }

              return (
                <article key={course.slug} className="overflow-hidden rounded-2xl border border-amber-200 bg-amber-50 shadow-sm">
                  <div className="h-1.5 bg-amber-400" />
                  <div className="p-6">
                    <p className="eyebrow text-amber-700">Awaiting payment</p>
                    <h2 className="mt-1.5 text-lg font-extrabold tracking-tight text-[#211a2d]">{course.title}</h2>
                    <p className="mt-3 flex items-start gap-2 text-sm leading-6 text-amber-900">
                      <Clock3 className="mt-0.5 shrink-0" size={16} />
                      {online ? `Awaiting payment of $${course.price}.` : `Awaiting payment of $${course.price}. GELife Group will contact you.`}
                    </p>
                    {online && <PayButton courseId={Number(course.id)} price={course.price} />}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </DashboardShell>
  );
}