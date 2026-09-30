"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { AdminShell } from "@/components/admin-shell";
import { ActivityLoader } from "@/components/activity-loader";
import { ChevronLeft, Loader2, Plus, Upload, X, FileText, Video, Trash, Pencil } from "lucide-react";
import Link from "next/link";
import { authenticatedFetch } from "@/lib/client-auth";
import { backendAssetUrl } from "@/lib/backend-assets";

export default function CourseManagerPage() {
  const { id } = useParams();
  const [course, setCourse] = useState<any>(null);
  const [modules, setModules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [showForm, setShowForm] = useState(false);
  const [editingModuleId, setEditingModuleId] = useState<number | null>(null);
  const [existingAssets, setExistingAssets] = useState<any[]>([]);
  const [removeAssetIds, setRemoveAssetIds] = useState<number[]>([]);
  const [title, setTitle] = useState("");
  const [contentText, setContentText] = useState("");
  const [assets, setAssets] = useState<FileList | null>(null);
  const [busyModuleId, setBusyModuleId] = useState<number | null>(null);
  const [actionError, setActionError] = useState("");
  
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function loadCourse() {
    setLoading(true);
    try {
      const res = await authenticatedFetch(`/api/admin/courses/get?id=${id}`);
      const data = await res.json();
      if (res.ok) {
        setCourse(data.course);
        setModules(data.modules || []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCourse();
  }, [id]);

  function openAddForm() {
    setEditingModuleId(null);
    setExistingAssets([]);
    setRemoveAssetIds([]);
    setTitle("");
    setContentText("");
    setAssets(null);
    setError("");
    setShowForm(true);
  }

  function openEditForm(module: any) {
    setEditingModuleId(Number(module.id));
    setExistingAssets(module.assets || []);
    setRemoveAssetIds([]);
    setTitle(module.title || "");
    setContentText(module.content_text || "");
    setAssets(null);
    setError("");
    setShowForm(true);
  }

  async function deleteModule(moduleId: number) {
    if (!confirm("Delete this module and its attached content?")) return;
    setBusyModuleId(moduleId);
    setActionError("");
    try {
      const formData = new FormData();
      formData.append("action", "delete");
      formData.append("module_id", String(moduleId));
      const response = await authenticatedFetch("/api/admin/modules/action", { method: "POST", body: formData });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Module could not be deleted.");
      await loadCourse();
    } catch (requestError) {
      setActionError(requestError instanceof Error ? requestError.message : "Module could not be deleted.");
    } finally {
      setBusyModuleId(null);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("course_id", id as string);
      formData.append("title", title);
      formData.append("content_text", contentText);
      const editing = editingModuleId !== null;
      if (editing) {
        formData.append("action", "edit");
        formData.append("module_id", String(editingModuleId));
        for (const assetId of removeAssetIds) formData.append("remove_asset_ids[]", String(assetId));
      }

      if (assets) {
        for (let i = 0; i < assets.length; i++) {
          formData.append("assets[]", assets[i]);
        }
      }

      const res = await authenticatedFetch(editing ? "/api/admin/modules/action" : "/api/admin/modules", {
        method: "POST",
        body: formData,
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create module");
      
      setShowForm(false);
      setEditingModuleId(null);
      setTitle("");
      setContentText("");
      setAssets(null);
      setExistingAssets([]);
      setRemoveAssetIds([]);
      await loadCourse();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <AdminShell>
        <ActivityLoader label="Loading course" />
      </AdminShell>
    );
  }

  if (!course) {
    return (
      <AdminShell>
        <div className="py-20 text-center">Course not found.</div>
      </AdminShell>
    );
  }

  return (
    <AdminShell>
      <div className="mb-6">
        <Link href="/admin/courses" className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-[#6e6877] hover:text-[#421181]">
          <ChevronLeft size={16} /> Back to Courses
        </Link>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex gap-4">
            {course.thumbnail_url && (
              <img src={backendAssetUrl(course.thumbnail_url)} alt="" className="h-20 w-32 rounded-xl object-cover border border-[#e8e1ed] shrink-0" />
            )}
            <div>
              <p className="eyebrow text-violet-700">{course.category}</p>
              <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-[#211a2d]">{course.title}</h1>
              <p className="mt-1 text-sm text-[#6e6877]">{course.is_published ? "Published" : "Draft"} · ${course.price}</p>
            </div>
          </div>
          <button onClick={openAddForm} className="button-primary !min-h-10 !px-4 !py-2 !text-sm shrink-0">
            <Plus size={16} /> Add Module
          </button>
        </div>
      </div>

      {actionError && <p className="mb-5 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700" role="alert">{actionError}</p>}

      <div className="space-y-4">
        {modules.map((mod: any, i: number) => (
          <div key={mod.id} className="overflow-hidden rounded-2xl border border-[#e8e1ed] bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-[#e8e1ed] bg-[#f7f5fb] px-6 py-4">
              <div className="flex items-center gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-200 text-sm font-bold text-violet-900">{i + 1}</div>
                <h3 className="font-extrabold text-[#211a2d]">{mod.title}</h3>
              </div>
              <div className="flex items-center gap-1">
                <button type="button" onClick={() => openEditForm(mod)} className="p-2 text-[#6e6877] hover:bg-violet-50 hover:text-violet-700 rounded-full" aria-label={`Edit ${mod.title}`}>
                  <Pencil size={17} />
                </button>
                <button type="button" onClick={() => deleteModule(Number(mod.id))} disabled={busyModuleId === Number(mod.id)} className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full disabled:opacity-50" aria-label={`Delete ${mod.title}`}>
                  {busyModuleId === Number(mod.id) ? <Loader2 size={17} className="animate-spin" /> : <Trash size={18} />}
                </button>
              </div>
            </div>
            <div className="p-6">
              <p className="mb-4 text-sm text-[#4b4457]">{mod.content_text}</p>
              
              {mod.assets && mod.assets.length > 0 && (
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {mod.assets.map((asset: any) => (
                    <a key={asset.id} href={backendAssetUrl(asset.file_path)} target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-xl border border-[#e8e1ed] p-3 hover:bg-slate-50">
                      {asset.asset_type === 'video' ? <Video className="text-blue-500" size={20} /> : <FileText className="text-red-500" size={20} />}
                      <span className="truncate text-sm font-semibold text-[#4b4457]">
                        {asset.file_path.split('/').pop()}
                      </span>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {modules.length === 0 && (
          <div className="rounded-2xl border border-dashed border-[#d7c9e8] p-10 text-center text-[#6e6877]">
            No modules added yet. Create your first module to get started.
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl md:p-8">
            <button onClick={() => { setShowForm(false); setEditingModuleId(null); }} className="absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
              <X size={20} />
            </button>
            <h2 className="mb-6 text-xl font-extrabold text-[#211a2d]">{editingModuleId === null ? "Add Module" : "Edit Module"}</h2>
            
            {error && <div className="mb-4 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</div>}
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <label className="field">
                Module Title <span className="text-red-500">*</span>
                <input type="text" required value={title} onChange={e => setTitle(e.target.value)} />
              </label>
              
              <label className="field">
                Module Content / Description
                <textarea rows={4} required value={contentText} onChange={e => setContentText(e.target.value)} />
              </label>

              <div className="field">
                <span className="mb-2 block font-bold text-[#514a5b]">Attached Content</span>
                {existingAssets.length > 0 && (
                  <div className="mb-3 space-y-2">
                    {existingAssets.map((asset) => (
                      <label key={asset.id} className="flex items-center gap-3 rounded-lg border border-[#e8e1ed] p-3 text-sm">
                        <input type="checkbox" checked={removeAssetIds.includes(Number(asset.id))} onChange={() => setRemoveAssetIds((current) => current.includes(Number(asset.id)) ? current.filter((id) => id !== Number(asset.id)) : [...current, Number(asset.id)])} />
                        <span className="min-w-0 flex-1 truncate">{backendAssetUrl(asset.file_path).split("/").pop()}</span>
                        <span className="text-xs text-[#6e6877]">Remove</span>
                      </label>
                    ))}
                  </div>
                )}
                <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#d7c9e8] bg-slate-50 p-6 hover:bg-slate-100">
                  <Upload className="mb-2 text-violet-400" size={24} />
                  <span className="text-sm font-semibold text-[#6e6877]">{assets ? `${assets.length} new file(s) selected` : "Add MP4, WebM, MOV, or PDF files"}</span>
                  <input type="file" multiple accept="video/mp4,video/webm,video/quicktime,application/pdf" className="hidden" onChange={e => setAssets(e.target.files)} />
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#e8e1ed]">
                <button type="button" onClick={() => { setShowForm(false); setEditingModuleId(null); }} className="button-secondary">Cancel</button>
                <button type="submit" disabled={busy} className="button-primary min-w-[120px] justify-center">
                  {busy ? <Loader2 className="animate-spin" size={16} /> : editingModuleId === null ? "Save Module" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminShell>
  );
}