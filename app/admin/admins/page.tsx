"use client";

import { useState, useEffect } from "react";
import { AdminShell } from "@/components/admin-shell";
import { ActivityLoader } from "@/components/activity-loader";
import { Loader2, Plus, X, UserCog, Trash, Edit } from "lucide-react";
import { authenticatedFetch } from "@/lib/client-auth";

export default function AdminsPage() {
  const [data, setData] = useState<any>({ admins: [], is_super_admin: false, current_id: null, super_admin_id: null });
  const [loading, setLoading] = useState(true);
  
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function loadAdmins() {
    setLoading(true);
    try {
      const res = await authenticatedFetch("/api/admin/admins");
      const d = await res.json();
      if (res.ok) setData(d);
    } catch {
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAdmins();
  }, []);

  function handleEdit(admin: any) {
    setEditId(admin.id);
    setName(admin.name);
    setEmail(admin.email);
    setPassword("");
    setShowForm(true);
    setError("");
  }
  
  function handleAdd() {
    setEditId(null);
    setName("");
    setEmail("");
    setPassword("");
    setShowForm(true);
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");

    try {
      const formData = new FormData();
      if (editId) formData.append("id", editId.toString());
      formData.append("name", name);
      formData.append("email", email);
      if (password) formData.append("password", password);

      const res = await authenticatedFetch("/api/admin/admins", {
        method: "POST",
        body: formData,
      });
      
      const d = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(d.error || "Failed to save admin");
      
      setShowForm(false);
      await loadAdmins();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error saving");
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <AdminShell><ActivityLoader label="Loading admin accounts" /></AdminShell>;

  return (
    <AdminShell>
      <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow text-violet-700">Admins</p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-[#211a2d]">Admin Accounts</h1>
          <p className="mt-1 text-sm text-[#6e6877]">Manage who has access to the admin dashboard.</p>
        </div>
        {data.is_super_admin && (
          <button onClick={handleAdd} className="button-primary !min-h-10 !px-4 !py-2 !text-sm shrink-0">
            <Plus size={16} /> Add sub-admin
          </button>
        )}
      </div>
      
      {!data.is_super_admin && (
        <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 font-semibold text-amber-900">
          Only the Super Admin can create or delete other admin accounts.
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-[#e8e1ed] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead>
              <tr className="border-b border-[#e8e1ed] bg-[#f7f5fb]">
                <th className="px-5 py-3.5 font-bold text-[#6e6877]">Name</th>
                <th className="px-5 py-3.5 font-bold text-[#6e6877]">Role</th>
                <th className="px-5 py-3.5 font-bold text-[#6e6877]">Email</th>
                <th className="px-5 py-3.5 font-bold text-[#6e6877]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.admins.map((admin: any) => (
                <tr key={admin.id} className="border-b border-[#e8e1ed] align-middle last:border-0 hover:bg-[#faf8fd]">
                  <td className="px-5 py-4">
                    <strong className="block font-bold text-[#211a2d]">{admin.name}</strong>
                    {admin.id === data.current_id && <span className="mt-1 inline-block rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">You</span>}
                  </td>
                  <td className="px-5 py-4">
                    {admin.id === data.super_admin_id ? (
                       <span className="rounded-full bg-violet-100 px-2.5 py-1 text-xs font-bold text-violet-800">Super Admin</span>
                    ) : (
                       <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">Sub-admin</span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-[#6e6877]">{admin.email}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      {data.is_super_admin && (
                        <>
                          <button onClick={() => handleEdit(admin)} className="button-secondary !min-h-8 !px-3 !py-1 !text-xs">
                            <Edit size={14} className="mr-1"/> Edit
                          </button>
                          {admin.id !== data.super_admin_id && admin.id !== data.current_id && (
                            <form action="/api/admin/admins" method="post" onSubmit={(e) => !confirm("Delete this admin account?") && e.preventDefault()}>
                              <input type="hidden" name="action" value="delete" />
                              <input type="hidden" name="id" value={admin.id} />
                              <button type="submit" className="flex h-8 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-700 font-bold text-xs px-2 hover:bg-red-100">
                                <Trash size={14} />
                              </button>
                            </form>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl md:p-8">
            <button onClick={() => setShowForm(false)} className="absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
              <X size={20} />
            </button>
            <h2 className="mb-6 flex items-center gap-2 text-xl font-extrabold text-[#211a2d]">
              <UserCog className="text-violet-600" />
              {editId ? "Edit Admin" : "Add Sub-admin"}
            </h2>
            
            {error && <div className="mb-4 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</div>}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <label className="field">
                Name <span className="text-red-500">*</span>
                <input type="text" required value={name} onChange={e => setName(e.target.value)} />
              </label>
              <label className="field">
                Email Address <span className="text-red-500">*</span>
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)} />
              </label>
              <label className="field">
                {editId ? "New Password (leave blank to keep current)" : "Password *"}
                <input type="password" required={!editId} value={password} onChange={e => setPassword(e.target.value)} minLength={6} />
              </label>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#e8e1ed]">
                <button type="button" onClick={() => setShowForm(false)} className="button-secondary">Cancel</button>
                <button type="submit" disabled={busy} className="button-primary min-w-[100px] justify-center">
                  {busy ? <Loader2 className="animate-spin" size={16} /> : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminShell>
  );
}