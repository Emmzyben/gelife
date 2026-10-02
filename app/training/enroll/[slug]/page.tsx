import type { Metadata } from "next";
import Link from "@/components/link";
import { notFound } from "next/navigation";
import { Check, ChevronLeft } from "lucide-react";
import { EnrollmentForm } from "@/components/enrollment-form";
import { CourseMeta, SiteFooter, SiteHeader } from "@/components/site-shell";
import { getPublishedCourse } from "@/lib/course-api";
import { stripeEnabled } from "@/lib/config";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const course = await getPublishedCourse(slug);
  return course ? { title: course.title, description: course.description } : { title: "Course not found" };
}

export default async function EnrollPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const course = await getPublishedCourse(slug);
  if (!course) notFound();
  return (
    <>
      <SiteHeader />
      <main className="bg-[#fbf9fd]">
        <section className="py-14 sm:py-20">
          <div className="site-shell">
            <Link href="/training" className="inline-flex items-center gap-2 font-bold text-[#421181]"><ChevronLeft size={18} /> Back to courses</Link>
            <div className="mt-8 grid gap-9 lg:grid-cols-[.9fr_1.1fr]">
              <div>
                <p className="eyebrow">{course.category} course</p>
                <h1 className="mt-3 text-4xl font-extrabold leading-tight tracking-[-.045em] text-[#241033] sm:text-5xl">{course.title}</h1>
                <p className="mt-5 text-lg leading-8 text-slate-600">{course.description}</p>
                <div className="my-6 border-y border-violet-100 py-5"><CourseMeta duration={`${course.modules.length} lessons`} level={course.level} /></div>
                <div className="flex items-end gap-2"><strong className="text-4xl font-black text-[#421181]">${course.price}</strong><span className="pb-1 text-sm text-slate-500">course fee</span></div>
                <p className="mt-2 text-sm leading-6 text-[#8a431e]">{stripeEnabled() ? "Pay securely by card through Stripe after you enroll. Your course opens as soon as payment goes through." : "After you enroll, GELife Group will contact you with payment details. Your course opens once payment is confirmed."}</p>
                <h2 className="mt-8 text-xl font-extrabold text-[#241033]">What you will be able to do</h2>
                <ul className="mt-4 space-y-3">{course.outcomes.map((outcome) => <li key={outcome} className="flex gap-3 text-slate-700"><Check className="mt-0.5 shrink-0 text-[#f47c35]" size={18} />{outcome}</li>)}</ul>
                <h2 className="mt-8 text-xl font-extrabold text-[#241033]">Course outline</h2>
                <ol className="mt-4 space-y-3">{course.modules.map((module, index) => <li key={module.id} className="flex gap-3 rounded-xl bg-white p-4 shadow-sm"><span className="font-black text-violet-300">{String(index + 1).padStart(2, "0")}</span><strong className="block text-[#241033]">{module.title}</strong></li>)}</ol>
              </div>
              <EnrollmentForm courseId={course.id} courseSlug={course.slug} courseTitle={course.title} signedInLearner={null} onlinePayment={stripeEnabled()} />
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
