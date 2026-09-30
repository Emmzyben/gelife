"use client";

import { useState } from "react";
import { CheckCircle2, ChevronDown, Circle, FileText, Loader2, Play, Download } from "lucide-react";
import { authenticatedFetch } from "@/lib/client-auth";
import { backendAssetUrl } from "@/lib/backend-assets";

type Asset = { id: number; asset_type: "video" | "pdf" | "spreadsheet"; file_path: string };
type Module = { id: number; title: string; content_text?: string; assets?: Asset[] };

function videoEmbedUrl(value: string) {
  try {
    const url = new URL(value);
    const host = url.hostname.replace(/^www\./, "");

    if (host === "youtu.be") {
      const id = url.pathname.slice(1).split("/")[0];
      return id ? `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?autoplay=1&rel=0` : null;
    }

    if (host === "youtube.com" || host === "m.youtube.com" || host === "youtube-nocookie.com") {
      const id = url.searchParams.get("v") || url.pathname.match(/^\/(?:embed|shorts|live)\/([^/?]+)/)?.[1];
      return id ? `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?autoplay=1&rel=0` : null;
    }

    if (host === "vimeo.com") {
      const id = url.pathname.match(/^\/(?:video\/)?(\d+)/)?.[1];
      return id ? `https://player.vimeo.com/video/${id}?autoplay=1` : null;
    }
  } catch {
    return null;
  }

  return null;
}

export function ModuleAccordion({
  courseId,
  modules,
  initialCompleted,
}: {
  courseId: string;
  modules: Module[];
  initialCompleted: number[];
}) {
  const [completed, setCompleted] = useState<Set<number>>(new Set(initialCompleted));
  const [busy, setBusy] = useState<number | null>(null);
  const [open, setOpen] = useState<number | null>(modules[0]?.id ?? null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  async function markComplete(moduleId: number) {
    if (completed.has(moduleId)) return;
    setBusy(moduleId);
    try {
      const res = await authenticatedFetch("/api/student/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId, moduleId }),
      });
      if (res.ok) setCompleted((prev) => new Set([...prev, moduleId]));
    } finally {
      setBusy(null);
    }
  }

  if (modules.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-[#d7c9e8] p-6 text-center text-sm text-[#6e6877]">
        No modules available yet.
      </p>
    );
  }

  const completedCount = completed.size;
  const percent = Math.round((completedCount / modules.length) * 100);

  return (
    <>
      <div className="mb-4 flex items-center gap-3 rounded-2xl border border-[#e8e1ed] bg-white px-4 py-3">
        <div className="flex-1">
          <div className="flex justify-between text-xs font-bold text-[#6e6877]">
            <span>{completedCount} of {modules.length} modules completed</span>
            <span>{percent}%</span>
          </div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-violet-100">
            <div className="h-full rounded-full bg-[#421181] transition-all duration-500" style={{ width: `${percent}%` }} />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {modules.map((mod, index) => {
          const isOpen = open === mod.id;
          const isDone = completed.has(mod.id);
          const isBusy = busy === mod.id;

          return (
            <div key={mod.id} className={`overflow-hidden rounded-2xl border transition-colors ${isDone ? "border-emerald-200 bg-emerald-50/60" : "border-[#e8e1ed] bg-white"}`}>
              <button type="button" onClick={() => setOpen(isOpen ? null : mod.id)} className="flex w-full items-center gap-4 p-4 text-left" aria-expanded={isOpen}>
                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-black ${isDone ? "bg-emerald-600 text-white" : "bg-violet-100 text-[#421181]"}`}>
                  {isDone ? <CheckCircle2 size={16} /> : String(index + 1).padStart(2, "0")}
                </span>
                <span className="min-w-0 flex-1 text-sm font-bold text-[#211a2d]">Module {index + 1} — {mod.title}</span>
                <ChevronDown size={18} className={`shrink-0 text-[#6e6877] transition-transform ${isOpen ? "rotate-180" : ""}`} />
              </button>

              {isOpen && (
                <div className="border-t border-[#e8e1ed] px-4 pb-5 pt-4">
                  {mod.content_text && (
                    <p className="mb-4 text-sm leading-7 text-[#4b4457] whitespace-pre-line">{mod.content_text}</p>
                  )}
                  {mod.assets && mod.assets.length > 0 && (
                    <div className="mb-4 flex flex-wrap gap-2">
                      {mod.assets.map((asset) => {
                        if (asset.asset_type === "video") return (
                          <button key={asset.id} type="button" onClick={() => setVideoUrl(backendAssetUrl(asset.file_path))} className="inline-flex items-center gap-1.5 rounded-lg border border-[#d7c9e8] bg-white px-3 py-1.5 text-xs font-bold text-[#421181] hover:bg-violet-50">
                            <Play size={13} /> Watch video
                          </button>
                        );
                        if (asset.asset_type === "pdf") return (
                          <button key={asset.id} type="button" onClick={() => setPdfUrl(backendAssetUrl(asset.file_path))} className="inline-flex items-center gap-1.5 rounded-lg border border-[#d7c9e8] bg-white px-3 py-1.5 text-xs font-bold text-[#421181] hover:bg-violet-50">
                            <FileText size={13} /> View PDF
                          </button>
                        );
                        return (
                          <a key={asset.id} href={backendAssetUrl(asset.file_path)} download className="inline-flex items-center gap-1.5 rounded-lg border border-[#d7c9e8] bg-white px-3 py-1.5 text-xs font-bold text-[#421181] hover:bg-violet-50">
                            <Download size={13} /> Download
                          </a>
                        );
                      })}
                    </div>
                  )}
                  <button type="button" disabled={isDone || isBusy} onClick={() => markComplete(mod.id)} className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-all ${isDone ? "bg-emerald-100 text-emerald-700 cursor-default" : "bg-[#421181] text-white hover:bg-[#35106f]"}`}>
                    {isBusy ? <Loader2 size={15} className="animate-spin" /> : isDone ? <CheckCircle2 size={15} /> : <Circle size={15} />}
                    {isDone ? "Completed" : "Mark as complete"}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {videoUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4" onClick={() => setVideoUrl(null)}>
          <div className="w-full max-w-3xl overflow-hidden rounded-2xl bg-black shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="aspect-video w-full">
              {videoEmbedUrl(videoUrl) ? (
                <iframe
                  src={videoEmbedUrl(videoUrl) ?? undefined}
                  title="Course video"
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              ) : (
                <video src={videoUrl} controls autoPlay playsInline className="h-full w-full" />
              )}
            </div>
            <button onClick={() => setVideoUrl(null)} className="w-full py-3 text-sm font-bold text-white/70 hover:text-white">Close</button>
          </div>
        </div>
      )}

      {pdfUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4" onClick={() => setPdfUrl(null)}>
          <div className="flex h-[85vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-[#e8e1ed] p-4">
              <p className="font-bold text-[#211a2d]">PDF Viewer</p>
              <button onClick={() => setPdfUrl(null)} className="text-sm font-bold text-[#6e6877] hover:text-[#211a2d]">Close</button>
            </div>
            <iframe src={pdfUrl} className="flex-1 w-full" title="PDF Viewer" />
          </div>
        </div>
      )}
    </>
  );
}