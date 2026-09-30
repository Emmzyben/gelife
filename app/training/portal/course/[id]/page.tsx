"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import Link from "@/components/link";
import { DashboardShell } from "@/components/dashboard-shell";
import { ModuleAccordion } from "@/components/module-accordion";
import { authenticatedFetch } from "@/lib/client-auth";
import { backendAssetUrl } from "@/lib/backend-assets";
import { PortalAuthFallback, usePortalAuth } from "@/components/portal-auth";
import type { StudentCourseData, StudentModule } from "@/lib/student-data";

export default function CourseViewerPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user: learner, loading: authLoading, error: authError, retry } = usePortalAuth();
  const [data, setData] = useState<StudentCourseData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!learner) return;
    authenticatedFetch(`/api/student/course?id=${encodeURIComponent(id)}`, { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("Course unavailable");
        setData(await response.json());
      })
      .catch(() => router.replace("/training/portal"))
      .finally(() => setLoading(false));
  }, [id, learner, router]);

  if (authError || authLoading || !learner || loading) {
    return <PortalAuthFallback loading={authLoading} error={authError} retry={retry} label="Loading your course…" />;
  }

  const course = data?.course;
  const modules: StudentModule[] = data?.modules || [];
  const completedIds = data?.completed_module_ids || [];
  const percent: number = data?.percent || 0;

  if (!course) return null;

  return (
    <DashboardShell user={learner}>
      <Link href="/training/portal" className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-[#421181] hover:underline">
        <ChevronLeft size={16} />
        Back to dashboard
      </Link>

      <div className="grid gap-6 lg:grid-cols-[1fr_240px]">
        <div>
          {course.thumbnail_url && (
            <div className="mb-6 overflow-hidden rounded-2xl border border-[#e8e1ed]">
              <img src={backendAssetUrl(course.thumbnail_url)} alt={course.title} className="w-full max-h-64 object-cover" />
            </div>
          )}
          <h1 className="text-2xl font-extrabold tracking-tight text-[#211a2d]">{course.title}</h1>
          {course.description && <p className="mt-2 text-[#6e6877] leading-7">{course.description}</p>}
          <div className="mt-6">
            <h2 className="mb-3 text-base font-extrabold text-[#211a2d]">Course modules</h2>
            <ModuleAccordion courseId={id} modules={modules} initialCompleted={completedIds} />
          </div>
        </div>

        <aside className="h-fit rounded-2xl border border-[#e8e1ed] bg-white p-5 shadow-sm lg:sticky lg:top-24">
          <p className="eyebrow text-violet-700">Your progress</p>
          <div className="mt-3 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-[#6e6877]">Modules</span>
              <span className="font-extrabold text-[#211a2d]">{modules.length}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-[#6e6877]">Completed</span>
              <span className="font-extrabold text-[#211a2d]">{completedIds.length}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-[#6e6877]">Progress</span>
              <span className="font-extrabold text-[#421181]">{percent}%</span>
            </div>
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-violet-100">
            <div className="h-full rounded-full bg-[#421181] transition-all" style={{ width: `${percent}%` }} />
          </div>
          {percent === 100 && (
            <div className="mt-4 rounded-xl bg-emerald-50 p-3 text-center">
              <p className="text-sm font-bold text-emerald-700">Course complete!</p>
            </div>
          )}
          <div className="mt-4 border-t border-[#e8e1ed] pt-4 text-xs text-[#6e6877]">
            <p className="font-semibold">Price</p>
            <p className="mt-0.5 font-extrabold text-[#211a2d]">{course.price > 0 ? `$${Number(course.price).toFixed(2)}` : "Free"}</p>
          </div>
        </aside>
      </div>
    </DashboardShell>
  );
}