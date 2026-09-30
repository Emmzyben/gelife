"use client";

import { useState, useEffect } from "react";
import { AdminShell } from "@/components/admin-shell";
import { ActivityLoader } from "@/components/activity-loader";
import Link from "next/link";
import { authenticatedFetch } from "@/lib/client-auth";
import {
  Users, BookOpen, GraduationCap, DollarSign,
  Plus, MessageSquare, UserCog, Upload
} from "lucide-react";

function when(v: string | null) {
  if (!v) return "—";
  const d = new Date(v.includes("T") ? v : `${v.replace(" ", "T")}Z`);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function AdminOverview() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [pendingEnrollments, setPendingEnrollments] = useState<any[]>([]);
  const [chartPeriod, setChartPeriod] = useState<"monthly" | "weekly" | "yearly">("monthly");

  useEffect(() => {
    authenticatedFetch("/api/admin/dashboard")
      .then(r => r.json())
      .then(d => {
        setData(d);
        setPendingEnrollments((d.enrollments || []).filter((e: any) => e.enrollment.status === "pending").slice(0, 10));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <AdminShell><ActivityLoader label="Loading admin dashboard" /></AdminShell>;

  const s = data?.stats || {};
  const chart = data?.chart_monthly || { labels: [], students: [], enrollments: [] };
  const topPerformers = data?.top_performers || [];
  const recentStudents = data?.recent_students || [];

  return (
    <AdminShell stats={{ enrollments: s.enrollments || 0, pending: s.pending || 0, openConsultations: (data?.messages || []).filter((m:any) => !m.handled).length, students: s.students || 0 }}>
      <div className="mb-7">
        <p className="eyebrow text-violet-700">Overview</p>
        <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-[#211a2d]">Admin Dashboard</h1>
      </div>

      {/* Stats Grid */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Total Students", value: s.students || 0, sub: `${s.verified_count || 0} verified`, icon: Users, color: "text-blue-600 bg-blue-50" },
          { label: "Active Courses", value: s.courses || 0, sub: "Published & live", icon: BookOpen, color: "text-violet-600 bg-violet-50" },
          { label: "Enrollments", value: s.enrollments || 0, sub: `${s.pending || 0} pending`, icon: GraduationCap, color: "text-emerald-600 bg-emerald-50" },
          { label: "Total Revenue", value: `$${Number(s.revenue || 0).toLocaleString()}`, sub: "Lifetime earnings", icon: DollarSign, color: "text-amber-600 bg-amber-50" },
        ].map(({ label, value, sub, icon: Icon, color }) => (
          <div key={label} className="rounded-2xl border border-[#e8e1ed] bg-white p-5 shadow-sm">
            <div className={`mb-3 inline-flex rounded-xl p-2.5 ${color}`}><Icon size={18} /></div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#6e6877]">{label}</p>
            <p className="mt-1 text-2xl font-extrabold text-[#211a2d]">{value}</p>
            <p className="mt-0.5 text-xs text-[#6e6877]">{sub}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <h3 className="mb-3 text-sm font-bold text-[#211a2d]">Quick Actions</h3>
      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { href: "/admin/courses", label: "Create Course", desc: "Build a new module", icon: Plus, bg: "from-blue-500 to-blue-700" },
          { href: "/admin/students", label: "Manage Students", desc: "View & manage learners", icon: Users, bg: "from-violet-500 to-violet-700" },
          { href: "/admin/consultations", label: "Consultations", desc: "Review new requests", icon: MessageSquare, bg: "from-pink-500 to-pink-700" },
          { href: "/admin/admins", label: "Admin Accounts", desc: "Manage admin users", icon: UserCog, bg: "from-teal-500 to-teal-700" },
        ].map(({ href, label, desc, icon: Icon, bg }) => (
          <Link key={href} href={href} className={`flex items-center gap-3 rounded-2xl bg-gradient-to-br ${bg} p-4 text-white shadow-md hover:opacity-90 transition-opacity`}>
            <div className="rounded-xl bg-white/20 p-2.5"><Icon size={18} /></div>
            <div><p className="font-bold text-sm">{label}</p><p className="text-xs text-white/70">{desc}</p></div>
          </Link>
        ))}
      </div>

      {/* Charts row + Right column */}
      <div className="mb-8 grid gap-6 lg:grid-cols-[1fr_280px]">
        {/* Learning Analytics */}
        <div className="rounded-2xl border border-[#e8e1ed] bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-extrabold text-[#211a2d]">Learning Analytics</h3>
            <div className="flex rounded-xl border border-[#e8e1ed] text-xs font-bold overflow-hidden">
              {(["monthly", "weekly", "yearly"] as const).map(p => (
                <button key={p} onClick={() => setChartPeriod(p)} className={`px-3 py-1.5 capitalize transition-colors ${chartPeriod === p ? "bg-[#421181] text-white" : "text-[#6e6877] hover:bg-slate-50"}`}>{p}</button>
              ))}
            </div>
          </div>
          <div className="flex gap-4 mb-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#6e6877]"><div className="h-2 w-2 rounded-full bg-violet-600" /> New Students</div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#6e6877]"><div className="h-2 w-2 rounded-full bg-emerald-500" /> Enrollments</div>
          </div>
          {chart.labels.length === 0 || (s.students === 0 && s.enrollments === 0) ? (
            <div className="flex h-48 items-center justify-center text-[#6e6877] text-sm">No activity data yet. Chart will populate as students register.</div>
          ) : (
            <SimpleLineChart
              labels={chart.labels}
              datasets={[
                { data: chart.students, color: "#7c3aed" },
                { data: chart.enrollments, color: "#10b981" },
              ]}
            />
          )}
        </div>

        {/* Student Retention Donut */}
        <div className="rounded-2xl border border-[#e8e1ed] bg-white p-6 shadow-sm">
          <h3 className="mb-4 font-extrabold text-[#211a2d]">Student Retention</h3>
          <RetentionDonut retentionPct={s.retention_pct || 0} verificationPct={s.verification_pct || 0} studentsWithPurchase={s.students_with_purchase || 0} total={s.students || 0} verifiedCount={s.verified_count || 0} />
        </div>
      </div>

      {/* Top performers + Recent sign-ups */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-[#e8e1ed] bg-white p-6 shadow-sm">
          <h3 className="mb-4 font-extrabold text-[#211a2d]">Top Students</h3>
          {topPerformers.length === 0 ? (
            <p className="text-sm text-[#6e6877]">No purchases yet.</p>
          ) : (
            <div className="space-y-3">
              {topPerformers.map((s: any, i: number) => (
                <div key={s.id} className="flex items-center gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-violet-100 text-xs font-extrabold text-violet-700">{i + 1}</span>
                  <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(s.name)}&background=4318FF&color=fff&size=32`} alt="" className="h-8 w-8 rounded-full shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold text-sm text-[#211a2d]">{s.name}</p>
                    <p className="truncate text-xs text-[#6e6877]">{s.courses?.split(",")[0]}</p>
                  </div>
                  <span className="shrink-0 text-xs font-bold text-[#421181]">{s.course_count} course{s.course_count !== 1 ? "s" : ""}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-[#e8e1ed] bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-extrabold text-[#211a2d]">Recent Sign-ups</h3>
            <Link href="/admin/students" className="text-xs font-bold text-[#421181] hover:underline">View all</Link>
          </div>
          {recentStudents.length === 0 ? (
            <p className="text-sm text-[#6e6877]">No students yet.</p>
          ) : (
            <div className="space-y-3">
              {recentStudents.map((s: any, i: number) => (
                <div key={i} className="flex items-center gap-3">
                  <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(s.name)}&background=random&size=32`} alt="" className="h-8 w-8 rounded-full shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold text-sm text-[#211a2d]">{s.name}</p>
                    <p className="truncate text-xs text-[#6e6877]">{s.email}</p>
                  </div>
                  <span className="shrink-0 text-xs text-[#6e6877]">{when(s.created_at)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminShell>
  );
}

function RetentionDonut({ retentionPct, verificationPct, studentsWithPurchase, total, verifiedCount }: any) {
  const r = 36;
  const circumference = 2 * Math.PI * r;
  const filled = circumference * (retentionPct / 100);
  return (
    <div className="flex items-start gap-4">
      <div className="flex-1 space-y-3">
        <div className="text-3xl font-extrabold text-[#211a2d]">{retentionPct}%</div>
        <p className="text-xs text-[#6e6877]">of students enrolled</p>
        <div>
          <p className="mb-1.5 text-xs text-[#6e6877]">{studentsWithPurchase} of {total} enrolled</p>
          <div className="h-2 rounded-full bg-[#f0ebf8]"><div className="h-2 rounded-full bg-[#421181]" style={{ width: `${retentionPct}%` }} /></div>
        </div>
        <div>
          <p className="mb-1.5 text-xs text-[#6e6877]">{verificationPct}% verified</p>
          <div className="h-2 rounded-full bg-[#f0ebf8]"><div className="h-2 rounded-full bg-emerald-500" style={{ width: `${verificationPct}%` }} /></div>
        </div>
      </div>
      <svg width="90" height="90" viewBox="0 0 90 90" className="shrink-0">
        <circle cx="45" cy="45" r={r} fill="none" stroke="#f0ebf8" strokeWidth="10" />
        <circle cx="45" cy="45" r={r} fill="none" stroke="#421181" strokeWidth="10"
          strokeDasharray={`${filled} ${circumference}`}
          strokeLinecap="round" transform="rotate(-90 45 45)" />
        <text x="45" y="50" textAnchor="middle" fontSize="15" fontWeight="800" fill="#211a2d">{retentionPct}%</text>
      </svg>
    </div>
  );
}

function SimpleLineChart({ labels, datasets }: { labels: string[]; datasets: { data: number[]; color: string }[] }) {
  const allValues = datasets.flatMap(d => d.data);
  const maxVal = Math.max(...allValues, 1);
  const w = 100 / (labels.length - 1 || 1);
  const h = 160;

  function toPoints(data: number[]) {
    return data.map((v, i) => `${i * w}% ${h - (v / maxVal) * (h - 10)}`).join(", ");
  }

  const tickLabels = labels.filter((_, i) => i === 0 || i === Math.floor(labels.length / 2) || i === labels.length - 1);

  return (
    <div className="relative">
      <svg viewBox={`0 0 100 ${h}`} preserveAspectRatio="none" className="h-48 w-full" style={{ overflow: "visible" }}>
        {datasets.map(({ data, color }, di) => {
          const pts = data.map((v, i) => [i * w, h - (v / maxVal) * (h - 10)] as [number, number]);
          const pathD = pts.map(([x, y], i) => (i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`)).join(" ");
          const areaD = `${pathD} L ${(data.length - 1) * w} ${h} L 0 ${h} Z`;
          return (
            <g key={di}>
              <path d={areaD} fill={color} opacity="0.07" />
              <path d={pathD} fill="none" stroke={color} strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" />
            </g>
          );
        })}
      </svg>
      <div className="mt-1 flex justify-between text-[10px] text-[#6e6877]">
        {tickLabels.map((l, i) => <span key={i}>{l}</span>)}
      </div>
    </div>
  );
}