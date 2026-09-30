"use client";

import { useState, useEffect, useMemo } from "react";
import { AdminShell } from "@/components/admin-shell";
import { ActivityLoader } from "@/components/activity-loader";
import { Loader2, Send, X } from "lucide-react";
import { authenticatedFetch } from "@/lib/client-auth";

function when(value: string | null) {
  if (!value) return "—";
  const d = new Date(value.includes("T") ? value : `${value.replace(" ", "T")}Z`);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function ConsultationsPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any>(null);
  const [reply, setReply] = useState("");
  const [replyBusy, setReplyBusy] = useState(false);
  const [replyError, setReplyError] = useState("");
  const [replySent, setReplySent] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await authenticatedFetch("/api/admin/dashboard");
      const d = await res.json();
      setMessages(d.messages || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const newCount = useMemo(() => messages.filter((m: any) => !m.handled).length, [messages]);

  async function markHandled(id: string | number) {
    const fd = new FormData();
    fd.append("action", "handled");
    fd.append("id", String(id));
    await authenticatedFetch("/api/admin/action", { method: "POST", body: fd });
    setMessages(prev => prev.map(m => m.id === id ? { ...m, handled: true, status: "handled" } : m));
    if (selected?.id === id) setSelected((s: any) => ({ ...s, handled: true }));
  }

  async function sendReply(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected || !reply.trim()) return;
    setReplyBusy(true);
    setReplyError("");
    setReplySent(false);
    try {
      const formData = new FormData();
      formData.append("action", "consultation_reply");
      formData.append("id", String(selected.id));
      formData.append("reply", reply.trim());
      const response = await authenticatedFetch("/api/admin/action", { method: "POST", body: formData });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Reply could not be sent.");
      setMessages((current) => current.map((message) => message.id === selected.id
        ? { ...message, handled: true, status: "handled" }
        : message));
      setSelected((current: any) => current?.id === selected.id ? { ...current, handled: true, status: "handled" } : current);
      setReply("");
      setReplySent(true);
    } catch (requestError) {
      setReplyError(requestError instanceof Error ? requestError.message : "Reply could not be sent.");
    } finally {
      setReplyBusy(false);
    }
  }

  if (loading) return <AdminShell><ActivityLoader label="Loading consultations" /></AdminShell>;

  return (
    <AdminShell>
      <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow text-violet-700">Consultations</p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-[#211a2d]">Consultation Requests</h1>
          <p className="mt-1 flex items-center gap-3 text-sm">
            {newCount > 0 && <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-bold text-red-700">{newCount} New</span>}
            <span className="text-[#6e6877]">{messages.length} Total</span>
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[#e8e1ed] bg-white shadow-sm">
        {messages.length === 0 ? (
          <div className="p-12 text-center text-[#6e6877]">No consultation requests yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead>
                <tr className="border-b border-[#e8e1ed] bg-[#f7f5fb]">
                  <th className="px-5 py-3.5 font-bold text-[#6e6877]">Contact</th>
                  <th className="px-5 py-3.5 font-bold text-[#6e6877]">Organization</th>
                  <th className="px-5 py-3.5 font-bold text-[#6e6877]">Interest</th>
                  <th className="px-5 py-3.5 font-bold text-[#6e6877]">Message</th>
                  <th className="px-5 py-3.5 font-bold text-[#6e6877]">Date</th>
                  <th className="px-5 py-3.5 font-bold text-[#6e6877]">Status</th>
                </tr>
              </thead>
              <tbody>
                {messages.map((m: any) => (
                  <tr
                    key={m.id}
                    className={`cursor-pointer border-b border-[#e8e1ed] last:border-0 hover:bg-[#faf8fd] ${!m.handled ? "bg-violet-50/40" : ""}`}
                    onClick={() => { setSelected(m); setReply(""); setReplyError(""); setReplySent(false); }}
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(m.firstName)}&background=random&size=32`} alt="" className="h-8 w-8 rounded-full shrink-0" />
                        <div>
                          <strong className="block font-bold text-[#211a2d]">{m.firstName}</strong>
                          <a href={`mailto:${m.email}`} onClick={e => e.stopPropagation()} className="text-xs text-[#421181] hover:underline">{m.email}</a>
                          {m.phone && <div className="text-xs text-[#6e6877]">{m.phone}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-xs text-[#6e6877]">{m.organization || "—"}</td>
                    <td className="px-5 py-4">
                      {m.interest && <span className="rounded-full bg-violet-100 px-2.5 py-1 text-xs font-bold text-violet-800">{m.interest}</span>}
                    </td>
                    <td className="px-5 py-4 max-w-[220px]">
                      <p className="line-clamp-2 text-xs text-[#6e6877]">{m.message}</p>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-xs text-[#6e6877]">{when(m.createdAt)}</td>
                    <td className="px-5 py-4" onClick={e => e.stopPropagation()}>
                      {m.handled
                        ? <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">Read</span>
                        : (
                          <div className="flex flex-col gap-1.5">
                            <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-bold text-red-700 text-center">New</span>
                            <button onClick={() => markHandled(m.id)} className="rounded-lg border border-[#d7c9e8] px-2 py-1 text-[10px] font-bold text-[#514a5b] hover:bg-[#f7f1fd]">Mark read</button>
                          </div>
                        )
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4">
          <div className="relative max-h-[calc(100vh-2rem)] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="bg-gradient-to-br from-[#26104d] to-[#421181] p-6 text-white">
              <button onClick={() => setSelected(null)} className="absolute right-4 top-4 rounded-full p-2 text-violet-300 hover:bg-white/10"><X size={20} /></button>
              <p className="text-xs font-bold uppercase tracking-widest text-violet-300">Consultation Request</p>
              <h2 className="mt-1 text-xl font-extrabold">{selected.firstName}</h2>
              <a href={`mailto:${selected.email}`} className="text-violet-200 hover:underline text-sm">{selected.email}</a>
            </div>
            <div className="p-6">
              <div className="mb-4 grid grid-cols-2 gap-3 text-sm">
                {selected.phone && <div><p className="text-xs font-bold text-[#6e6877] uppercase">Phone</p><p className="font-semibold text-[#211a2d]">{selected.phone}</p></div>}
                {selected.organization && <div><p className="text-xs font-bold text-[#6e6877] uppercase">Organization</p><p className="font-semibold text-[#211a2d]">{selected.organization}</p></div>}
                {selected.interest && <div><p className="text-xs font-bold text-[#6e6877] uppercase">Interest</p><span className="rounded-full bg-violet-100 px-2 py-0.5 text-xs font-bold text-violet-800">{selected.interest}</span></div>}
                <div><p className="text-xs font-bold text-[#6e6877] uppercase">Date</p><p className="font-semibold text-[#211a2d]">{when(selected.createdAt)}</p></div>
              </div>
              {selected.message && (
                <div className="rounded-xl bg-[#f7f5fb] p-4">
                  <p className="mb-1 text-xs font-bold uppercase text-[#6e6877]">Message</p>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-[#211a2d]">{selected.message}</p>
                </div>
              )}
              <form onSubmit={sendReply} className="mt-5 space-y-3">
                <label className="field">Reply by email<textarea value={reply} onChange={event => setReply(event.target.value)} rows={4} required maxLength={10000} placeholder="Write your reply…" /></label>
                {replyError && <p className="rounded-lg bg-red-50 p-3 text-sm font-semibold text-red-700" role="alert">{replyError}</p>}
                {replySent && <p className="rounded-lg bg-emerald-50 p-3 text-sm font-semibold text-emerald-800" role="status">Reply sent to {selected.email}.</p>}
                <div className="flex flex-wrap gap-3">
                  <button type="submit" disabled={replyBusy || !reply.trim()} className="button-primary !text-sm">
                    {replyBusy ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                    {replyBusy ? "Sending…" : "Send reply"}
                  </button>
                  {!selected.handled && <button type="button" onClick={() => markHandled(selected.id)} className="button-secondary !text-sm">Mark as Read</button>}
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}