"use client";

import { useState, useEffect } from "react";
import { AdminShell } from "@/components/admin-shell";
import { ActivityLoader } from "@/components/activity-loader";
import Link from "next/link";
import { Loader2, Plus, Upload, X } from "lucide-react";
import { authenticatedFetch } from "@/lib/client-auth";
import { backendAssetUrl } from "@/lib/backend-assets";

export default function CoursesPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState<number | null>(null);
  
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState("Course");
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("0");
  const [description, setDescription] = useState("");
  const [level, setLevel] = useState("All levels");
  const [accent, setAccent] = useState("#421181");
  const [outcomes, setOutcomes] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");

  async function loadCourses() {
    setLoading(true);
    try {
      const res = await authenticatedFetch("/api/admin/courses/get");
      const data = await res.json();
      setCourses(Array.isArray(data) ? data : data.courses || []);
    } catch {
      setCourses([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCourses();
  }, []);

  function openEditForm(course: any) {
    setEditingCourseId(Number(course.id));
    setSlug(course.slug || "");
    setCategory(course.category || "Course");
    setTitle(course.title || "");
    setPrice(String(course.price ?? 0));
    setDescription(course.description || "");
    setLevel(course.level || "All levels");
    setAccent(course.accent || "#421181");
    setOutcomes(Array.isArray(course.outcomes) ? course.outcomes.join("\n") : "");
    setIsPublished(Boolean(Number(course.is_published)));
    setThumbnail(null);
    setError("");
    setShowForm(true);
  }

  async function runCourseAction(action: "delete" | "toggle_publish", courseId: number) {
    if (action === "delete" && !confirm("Are you sure you want to delete this course and its enrollments?")) return;
    setActionError("");
    const formData = new FormData();
    formData.append("action", action);
    formData.append("course_id", String(courseId));
    try {
      const response = await authenticatedFetch("/api/admin/courses/action", { method: "POST", body: formData });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Course action failed.");
      await loadCourses();
    } catch (requestError) {
      setActionError(requestError instanceof Error ? requestError.message : "Course action failed.");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("slug", slug);
      formData.append("category", category);
      formData.append("title", title);
      formData.append("price", price);
      formData.append("description", description);
      formData.append("level", level);
      formData.append("accent", accent);
      formData.append("outcomes", outcomes);
      formData.append("is_published", isPublished ? "1" : "0");
      if (thumbnail) formData.append("thumbnail", thumbnail);

      const editing = editingCourseId !== null;
      if (editing) {
        formData.append("action", "edit");
        formData.append("course_id", String(editingCourseId));
      }
      const res = await authenticatedFetch(editing ? "/api/admin/courses/action" : "/api/admin/courses", {
        method: "POST",
        body: formData,
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create course");
      
      setShowForm(false);
      setEditingCourseId(null);
      setSlug("");
      setCategory("Course");
      setTitle("");
      setPrice("0");
      setDescription("");
      setLevel("All levels");
      setAccent("#421181");
      setOutcomes("");
      setIsPublished(false);
      setThumbnail(null);
      await loadCourses();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AdminShell>
      <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow text-violet-700">Courses</p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-[#211a2d]">Course Management</h1>
          <p className="mt-1 text-sm text-[#6e6877]">Manage all courses offered on the platform.</p>
        </div>
        <button onClick={() => { setEditingCourseId(null); setSlug(""); setCategory("Course"); setTitle(""); setPrice("0"); setDescription(""); setLevel("All levels"); setAccent("#421181"); setOutcomes(""); setIsPublished(false); setThumbnail(null); setError(""); setShowForm(true); }} className="button-primary !min-h-10 !px-4 !py-2 !text-sm shrink-0">
          <Plus size={16} /> Add new course
        </button>
      </div>

      {actionError && <p className="mb-5 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700" role="alert">{actionError}</p>}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto">
          <div className="relative max-h-[calc(100vh-2rem)] w-full max-w-2xl overflow-y-auto overscroll-contain rounded-2xl bg-white p-6 shadow-2xl md:p-8">
            <button onClick={() => setShowForm(false)} className="absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
              <X size={20} />
            </button>
            <h2 className="mb-6 text-xl font-extrabold text-[#211a2d]">{editingCourseId === null ? "Create New Course" : "Edit Course"}</h2>
            
            {error && <div className="mb-4 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</div>}
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="field">
                  Course Title <span className="text-red-500">*</span>
                  <input type="text" required maxLength={255} value={title} onChange={e => setTitle(e.target.value)} />
                </label>
                <label className="field">
                  URL Slug <span className="text-xs font-normal text-[#6e6877]">(leave blank to generate)</span>
                  <input type="text" maxLength={191} pattern="[a-z0-9]+(-[a-z0-9]+)*" value={slug} onChange={e => setSlug(e.target.value.toLowerCase())} placeholder="course-url-name" />
                </label>
                <label className="field">
                  Category <span className="text-red-500">*</span>
                  <input type="text" required maxLength={100} value={category} onChange={e => setCategory(e.target.value)} />
                </label>
                <label className="field">
                  Level <span className="text-red-500">*</span>
                  <input type="text" required maxLength={100} value={level} onChange={e => setLevel(e.target.value)} placeholder="Foundation, Intermediate, All levels" />
                </label>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="field">
                  Price (USD) <span className="text-red-500">*</span>
                  <input type="number" step="0.01" min="0" required value={price} onChange={e => setPrice(e.target.value)} />
                </label>
                <label className="flex items-center gap-3 rounded-xl border border-[#e8e1ed] p-4 cursor-pointer hover:bg-slate-50">
                  <input type="checkbox" checked={isPublished} onChange={e => setIsPublished(e.target.checked)} className="h-5 w-5 rounded border-gray-300 text-violet-600 focus:ring-violet-600" />
                  <span className="font-bold text-[#211a2d]">Publish immediately</span>
                </label>
                <label className="field">
                  Accent color
                  <span className="flex min-h-12 items-center gap-3 rounded-xl border border-[#e8e1ed] bg-white px-3">
                    <input type="color" value={accent} onChange={e => setAccent(e.target.value)} className="h-8 w-10 cursor-pointer border-0 bg-transparent p-0" />
                    <span className="font-mono text-sm font-semibold text-[#514a5b]">{accent}</span>
                  </span>
                </label>
              </div>
              
              <label className="field">
                Description <span className="text-red-500">*</span>
                <textarea rows={3} required value={description} onChange={e => setDescription(e.target.value)} />
              </label>

              <label className="field">
                Learning outcomes <span className="text-red-500">*</span>
                <textarea rows={4} required value={outcomes} onChange={e => setOutcomes(e.target.value)} placeholder={"One outcome per line\nExample: Apply core safety principles"} />
              </label>

              <div className="field">
                <span className="mb-2 block font-bold text-[#514a5b]">Thumbnail Image</span>
                <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#d7c9e8] bg-slate-50 p-6 hover:bg-slate-100">
                  <Upload className="mb-2 text-violet-400" size={24} />
                  <span className="text-sm font-semibold text-[#6e6877]">{thumbnail ? thumbnail.name : "Click to select image file"}</span>
                  <input type="file" accept="image/*" className="hidden" onChange={e => setThumbnail(e.target.files?.[0] || null)} />
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#e8e1ed]">
                <button type="button" onClick={() => { setShowForm(false); setEditingCourseId(null); }} className="button-secondary">Cancel</button>
                <button type="submit" disabled={busy} className="button-primary min-w-[120px] justify-center">
                  {busy ? <Loader2 className="animate-spin" size={16} /> : editingCourseId === null ? "Create Course" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <ActivityLoader label="Loading courses" />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course: any) => (
            <article key={course.slug || course.id} className="overflow-hidden rounded-2xl border border-[#e8e1ed] bg-white shadow-sm flex flex-col">
              <div className="h-2" style={{ background: course.accent || "#421181" }} />
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <span className="eyebrow text-violet-700">{course.category || "Course"}</span>
                  
                  <button type="button" onClick={() => runCourseAction("toggle_publish", Number(course.id))} className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${course.is_published ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
                    {course.is_published ? "Published" : "Draft"}
                  </button>
                  
                </div>
                
                {course.thumbnail_url && (
                  <img src={backendAssetUrl(course.thumbnail_url)} alt="" className="w-full h-32 object-cover rounded-xl mb-4 border border-[#e8e1ed]" />
                )}
                
                <h2 className="text-lg font-extrabold tracking-tight text-[#211a2d] leading-snug mb-2">{course.title}</h2>
                <p className="line-clamp-2 text-sm text-[#6e6877] mb-4 flex-1">{course.description}</p>
                
                <div className="border-t border-[#e8e1ed] pt-4 mt-auto">
                  <div className="flex justify-between text-sm">
                    <span className="font-semibold text-[#6e6877]">Price</span>
                    <span className="font-extrabold text-[#211a2d]">{course.price > 0 ? `$${Number(course.price).toFixed(2)}` : "Free"}</span>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <Link href={`/admin/courses/${course.id}`} className="button-secondary w-full justify-center !min-h-9 !text-xs">
                    Manage Modules
                  </Link>
                  <button type="button" onClick={() => openEditForm(course)} className="button-secondary !min-h-9 !px-3 !text-xs">Edit</button>
                  <button type="button" onClick={() => runCourseAction("delete", Number(course.id))} className="flex items-center justify-center rounded-xl border border-red-200 bg-red-50 text-red-700 font-bold text-xs px-3 h-9 hover:bg-red-100">Delete</button>
                </div>
              </div>
            </article>
          ))}
          {courses.length === 0 && <div className="col-span-full rounded-2xl border border-dashed border-[#d7c9e8] p-10 text-center text-[#6e6877]">No courses found.</div>}
        </div>
      )}
    </AdminShell>
  );
}