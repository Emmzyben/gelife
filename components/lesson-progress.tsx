"use client";

import { useState } from "react";
import { CheckCircle2, Circle, Loader2 } from "lucide-react";

type Lesson = {
  id: string;
  title: string;
  summary: string;
  content: string[];
  activity: string;
};

export function LessonProgress({ courseSlug, lesson, durationLabel, initialCompleted }: { courseSlug: string; lesson: Lesson; durationLabel: string; initialCompleted: boolean }) {
  const [completed, setCompleted] = useState(initialCompleted);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function toggle() {
    setBusy(true);
    setError("");
    const next = !completed;
    try {
      const response = await fetch("/api/progress", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ courseSlug, lessonId: lesson.id, completed: next }) });
      if (!response.ok) throw new Error("Progress could not be saved.");
      setCompleted(next);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Progress could not be saved.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <article id={lesson.id} className={`surface scroll-mt-28 p-6 sm:p-8 ${completed ? "border-emerald-200 bg-emerald-50/40" : ""}`}>
      <div className="flex items-start justify-between gap-5">
        <div><p className="eyebrow text-violet-700">{durationLabel}</p><h2 className="mt-2 text-2xl font-extrabold tracking-tight text-[#241033]">{lesson.title}</h2><p className="mt-2 text-slate-600">{lesson.summary}</p></div>
        {completed ? <CheckCircle2 className="shrink-0 text-emerald-600" size={30} /> : <Circle className="shrink-0 text-slate-300" size={30} />}
      </div>
      <div className="prose-course">{lesson.content.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
      <div className="mt-6 rounded-2xl border-l-4 border-amber-500 bg-amber-50 p-5"><p className="eyebrow text-amber-800">Apply it</p><p className="mt-2 leading-7 text-amber-950">{lesson.activity}</p></div>
      <button type="button" onClick={toggle} disabled={busy} className={completed ? "button-secondary mt-6" : "button-primary mt-6"}>{busy ? <Loader2 className="animate-spin" size={18} /> : completed ? <CheckCircle2 size={18} /> : <Circle size={18} />}{completed ? "Completed — mark incomplete" : "Mark lesson complete"}</button>
      {error ? <p className="mt-3 text-sm font-semibold text-red-700" role="alert">{error}</p> : null}
    </article>
  );
}
