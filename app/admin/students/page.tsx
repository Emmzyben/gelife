"use client";

import { useState, useEffect, useMemo } from "react";
import { AdminShell } from "@/components/admin-shell";
import { ActivityLoader } from "@/components/activity-loader";
import { Loader2, Search, Eye, Edit, Trash, X, BookOpen, Plus } from "lucide-react";
import { authenticatedFetch } from "@/lib/client-auth";

function when(value: string | null) {
  if (!value) return "—";
  const date = new Date(value.includes("T") ? value : `${value.replace(" ", "T")}Z`);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function StudentsPage() {
  const [data, setData] = useState<any>({ students: [], is_super_admin: false });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [viewStudent, setViewStudent] = useState<any>(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [assignableCourses, setAssignableCourses] = useState<any[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [assignBusy, setAssignBusy] = useState(false);
  const [assignError, setAssignError] = useState("");
  const [assignMessage, setAssignMessage] = useState("");
  
  const [editStudent, setEditStudent] = useState<any>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editVerified, setEditVerified] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newVerified, setNewVerified] = useState(false);
  const [addError, setAddError] = useState("");
  
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function loadStudents() {
    setLoading(true);
    try {
      const res = await authenticatedFetch("/api/admin/students");
      const d = await res.json();
      if (res.ok) setData(d);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadStudents(); }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return data.students;
    const q = search.toLowerCase();
    return data.students.filter((s: any) =>
      (s.name || "").toLowerCase().includes(q) ||
      (s.email || "").toLowerCase().includes(q)
    );
  }, [data.students, search]);

  async function handleView(student: any) {
    setViewLoading(true);
    setAssignError("");
    setAssignMessage("");
    setViewStudent({ ...student, courses: null });
    try {
      const fd = new FormData();
      fd.append("action", "view");
      fd.append("student_id", student.id);
      const [res, coursesRes] = await Promise.all([
        authenticatedFetch("/api/admin/students", { method: "POST", body: fd }),
        authenticatedFetch("/api/admin/courses/get"),
      ]);
      const [d, coursesData] = await Promise.all([res.json(), coursesRes.json()]);
      if (!res.ok) throw new Error(d.error || "Could not load student details.");
      setViewStudent(d);
      setAssignableCourses(coursesData.courses || []);
      setSelectedCourseId("");
    } finally {
      setViewLoading(false);
    }
  }

  async function handleAssignCourse(e: React.FormEvent) {
    e.preventDefault();
    if (!viewStudent || !selectedCourseId) return;
    setAssignBusy(true);
    setAssignError("");
    setAssignMessage("");
    try {
      const formData = new FormData();
      formData.append("action", "assign_course");
      formData.append("student_id", String(viewStudent.id));
      formData.append("course_id", selectedCourseId);
      const response = await authenticatedFetch("/api/admin/students", { method: "POST", body: formData });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Course could not be assigned.");
      await handleView(viewStudent);
      setAssignMessage("Course access assigned.");
    } catch (requestError) {
      setAssignError(requestError instanceof Error ? requestError.message : "Course could not be assigned.");
    } finally {
      setAssignBusy(false);
    }
  }

  function handleEditOpen(student: any) {
    setEditStudent(student);
    setEditName(student.name);
    setEditEmail(student.email);
    setEditPassword("");
    setEditVerified(!!student.is_verified);
    setError("");
  }

  async function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("action", "edit");
      fd.append("student_id", editStudent.id);
      fd.append("name", editName);
      fd.append("email", editEmail);
      fd.append("is_verified", editVerified ? "1" : "0");
      if (editPassword) fd.append("password", editPassword);
      const res = await authenticatedFetch("/api/admin/students", { method: "POST", body: fd });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Failed to save");
      setEditStudent(null);
      await loadStudents();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error saving");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(student: any) {
    if (!confirm(`Delete ${student.name}? This will remove all their enrollments.`)) return;
    const fd = new FormData();
    fd.append("action", "delete");
    fd.append("student_id", student.id);
    await authenticatedFetch("/api/admin/students", { method: "POST", body: fd });
    await loadStudents();
  }

  async function handleAddStudent(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setAddError("");
    try {
      const formData = new FormData();
      formData.append("action", "create");
      formData.append("name", newName);
      formData.append("email", newEmail);
      formData.append("password", newPassword);
      formData.append("is_verified", newVerified ? "1" : "0");
      const res = await authenticatedFetch("/api/admin/students", { method: "POST", body: formData });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Could not create student.");
      setShowAddForm(false);
      setNewName("");
      setNewEmail("");
      setNewPassword("");
      setNewVerified(false);
      await loadStudents();
    } catch (requestError) {
      setAddError(requestError instanceof Error ? requestError.message : "Could not create student.");
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <AdminShell><ActivityLoader label="Loading students" /></AdminShell>;

  return (
    <AdminShell>
      <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow text-violet-700">Students</p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-[#211a2d]">All Learners</h1>
          <p className="mt-1 text-sm text-[#6e6877]">{data.students.length} total students</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <button type="button" onClick={() => { setAddError(""); setShowAddForm(true); }} className="button-primary !min-h-10 !px-4 !py-2 !text-sm">
            <Plus size={16} /> Add student
          </button>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8a7d9a]" />
            <input
              type="text" placeholder="Search by name or email…"
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full rounded-xl border border-[#d7c9e8] bg-white py-2 pl-9 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-violet-500 sm:w-64"
            />
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[#e8e1ed] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead>
              <tr className="border-b border-[#e8e1ed] bg-[#f7f5fb]">
                <th className="px-5 py-3.5 font-bold text-[#6e6877]">Student</th>
                <th className="px-5 py-3.5 font-bold text-[#6e6877]">Enrollments</th>
                <th className="px-5 py-3.5 font-bold text-[#6e6877]">Status</th>
                <th className="px-5 py-3.5 font-bold text-[#6e6877]">Joined</th>
                <th className="px-5 py-3.5 font-bold text-[#6e6877]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((student: any) => (
                <tr key={student.id} className="border-b border-[#e8e1ed] last:border-0 hover:bg-[#faf8fd]">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=4318FF&color=fff&size=36`}
                        alt="" className="h-9 w-9 rounded-full shrink-0"
                      />
                      <div>
                        <strong className="block font-bold text-[#211a2d]">{student.name}</strong>
                        <a href={`mailto:${student.email}`} className="text-xs text-[#421181] hover:underline">{student.email}</a>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="rounded-full bg-violet-100 px-2.5 py-1 text-xs font-bold text-violet-800">
                      {student.enrollment_count} Course{student.enrollment_count !== 1 ? "s" : ""}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    {student.is_verified
                      ? <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-800">Verified</span>
                      : <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-800">Pending</span>
                    }
                  </td>
                  <td className="px-5 py-4 text-xs text-[#6e6877] whitespace-nowrap">{when(student.created_at)}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleView(student)} className="flex h-8 items-center gap-1 rounded-lg border border-[#d7c9e8] px-2 text-xs font-bold text-[#514a5b] hover:bg-[#f7f1fd]">
                        <Eye size={13} /> View
                      </button>
                      <button onClick={() => handleEditOpen(student)} className="flex h-8 items-center gap-1 rounded-lg border border-[#d7c9e8] px-2 text-xs font-bold text-[#514a5b] hover:bg-[#f7f1fd]">
                        <Edit size={13} /> Edit
                      </button>
                      {data.is_super_admin && (
                        <button onClick={() => handleDelete(student)} className="flex h-8 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-700 px-2 hover:bg-red-100">
                          <Trash size={13} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="px-5 py-10 text-center text-[#6e6877]">No students found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Modal */}
      {viewStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <button onClick={() => setViewStudent(null)} className="absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:bg-slate-100"><X size={20} /></button>
            <div className="mb-4 flex items-center gap-3">
              <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(viewStudent.name)}&background=4318FF&color=fff&size=48`} alt="" className="h-12 w-12 rounded-full" />
              <div>
                <h2 className="text-xl font-extrabold text-[#211a2d]">{viewStudent.name}</h2>
                <a href={`mailto:${viewStudent.email}`} className="text-sm text-[#421181] hover:underline">{viewStudent.email}</a>
              </div>
            </div>
            <div className="mb-4 flex gap-2">
              {viewStudent.is_verified
                ? <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-800">Verified</span>
                : <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-800">Pending verification</span>
              }
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">Joined {when(viewStudent.created_at)}</span>
            </div>
            <form onSubmit={handleAssignCourse} className="mb-5 rounded-xl border border-[#e8e1ed] bg-[#faf8fd] p-4">
              <label className="field">
                Assign a course
                <select value={selectedCourseId} onChange={e => setSelectedCourseId(e.target.value)} required disabled={assignBusy}>
                  <option value="">Choose a course</option>
                  {assignableCourses
                    .filter((course) => !(viewStudent.courses || []).some((enrollment: any) => Number(enrollment.id) === Number(course.id)))
                    .map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}
                </select>
              </label>
              {assignError && <p className="mt-2 text-sm font-semibold text-red-700" role="alert">{assignError}</p>}
              {assignMessage && <p className="mt-2 text-sm font-semibold text-emerald-700" role="status">{assignMessage}</p>}
              <button type="submit" disabled={assignBusy || !selectedCourseId} className="button-primary mt-3 w-full justify-center">
                {assignBusy ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />}
                Assign course
              </button>
            </form>
            <h3 className="mb-3 flex items-center gap-2 font-bold text-[#211a2d]"><BookOpen size={16} /> Enrolled Courses</h3>
            {viewLoading ? (
              <ActivityLoader label="Loading student courses" size={24} className="py-4" />
            ) : viewStudent.courses?.length ? (
              <ul className="space-y-2">
                {viewStudent.courses.map((c: any, i: number) => (
                  <li key={i} className="flex items-center justify-between rounded-xl border border-[#e8e1ed] px-4 py-2 text-sm">
                    <span className="font-semibold text-[#211a2d]">{c.title}</span>
                    <span className="text-xs text-[#6e6877]">{when(c.created_at)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-[#6e6877]">No paid course enrollments.</p>
            )}
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <button onClick={() => setEditStudent(null)} className="absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:bg-slate-100"><X size={20} /></button>
            <h2 className="mb-5 text-xl font-extrabold text-[#211a2d]">Edit Account</h2>
            {error && <div className="mb-4 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</div>}
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <label className="field">Full Name <span className="text-red-500">*</span><input required value={editName} onChange={e => setEditName(e.target.value)} /></label>
              <label className="field">Email Address <span className="text-red-500">*</span><input type="email" required value={editEmail} onChange={e => setEditEmail(e.target.value)} /></label>
              <label className="field">New Password <span className="text-xs font-normal text-[#6e6877]">(leave blank to keep current)</span><input type="password" value={editPassword} onChange={e => setEditPassword(e.target.value)} minLength={6} /></label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={editVerified} onChange={e => setEditVerified(e.target.checked)} className="h-5 w-5" />
                <span className="font-bold text-[#211a2d]">Verified account</span>
              </label>
              <div className="flex justify-end gap-3 border-t border-[#e8e1ed] pt-4">
                <button type="button" onClick={() => setEditStudent(null)} className="button-secondary">Cancel</button>
                <button type="submit" disabled={busy} className="button-primary min-w-[100px] justify-center">{busy ? <Loader2 className="animate-spin" size={16} /> : "Save"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <button type="button" onClick={() => setShowAddForm(false)} className="absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:bg-slate-100" aria-label="Close add student dialog"><X size={20} /></button>
            <h2 className="mb-5 text-xl font-extrabold text-[#211a2d]">Add Student</h2>
            {addError && <div className="mb-4 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700" role="alert">{addError}</div>}
            <form onSubmit={handleAddStudent} className="space-y-4">
              <label className="field">Full name<input required value={newName} onChange={e => setNewName(e.target.value)} autoComplete="name" /></label>
              <label className="field">Email address<input type="email" required value={newEmail} onChange={e => setNewEmail(e.target.value)} autoComplete="email" /></label>
              <label className="field">Temporary password<input type="password" required minLength={6} value={newPassword} onChange={e => setNewPassword(e.target.value)} autoComplete="new-password" /></label>
              <label className="flex items-center gap-3 cursor-pointer"><input type="checkbox" checked={newVerified} onChange={e => setNewVerified(e.target.checked)} className="h-5 w-5" /><span className="font-bold text-[#211a2d]">Verified account</span></label>
              <div className="flex justify-end gap-3 border-t border-[#e8e1ed] pt-4">
                <button type="button" onClick={() => setShowAddForm(false)} className="button-secondary">Cancel</button>
                <button type="submit" disabled={busy} className="button-primary min-w-[120px] justify-center">{busy ? <Loader2 className="animate-spin" size={16} /> : "Create student"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminShell>
  );
}