import Link from "@/components/link";
import { ArrowRight, Check } from "lucide-react";
import type { PublicCourse } from "@/lib/course-api";
import { CourseMeta } from "@/components/site-shell";

export function CourseCard({ course }: { course: PublicCourse }) {
  return (
    <article className="course-card">
      <div className="course-card-top" style={{ background: course.accent }} />
      <div className="flex flex-1 flex-col p-6 sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <p className="eyebrow text-violet-700">{course.category}</p>
          <p className="text-xl font-black text-violet-950">${course.price}</p>
        </div>
        <h3 className="mt-4 text-2xl font-extrabold leading-tight tracking-[-.025em] text-[#241033]">{course.title}</h3>
        <p className="mt-3 flex-1 leading-7 text-slate-600">{course.description}</p>
        <div className="my-5 border-y border-slate-100 py-4"><CourseMeta duration={`${course.modules.length} lessons`} level={course.level} /></div>
        <ul className="space-y-2.5 text-sm text-slate-700">
          {course.outcomes.map((outcome) => <li key={outcome} className="flex gap-2"><Check className="mt-0.5 shrink-0 text-amber-600" size={16} /><span>{outcome}</span></li>)}
        </ul>
        <Link href={`/training/enroll/${course.slug}`} className="button-primary mt-6 justify-center">View course & enroll <ArrowRight size={18} /></Link>
      </div>
    </article>
  );
}
