"use client";

import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "@/components/link";
import { BookOpen, LayoutDashboard, MessageSquare, Users, UserCog } from "lucide-react";
import { clearAccessToken } from "@/lib/client-auth";
import { PortalAuthFallback, usePortalAuth } from "@/components/portal-auth";

const navItems = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/students", label: "Students", icon: Users, exact: false },
  { href: "/admin/courses", label: "Courses", icon: BookOpen, exact: false },
  { href: "/admin/consultations", label: "Consultations", icon: MessageSquare, exact: false },
  { href: "/admin/admins", label: "Admins", icon: UserCog, exact: false },
];

export function AdminShell({ children, stats }: { children: React.ReactNode; stats?: { enrollments: number; pending: number; openConsultations: number; students: number } }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, error, retry } = usePortalAuth("admin");

  if (loading || error || user?.role !== "admin") {
    return <PortalAuthFallback loading={loading} error={error} retry={retry} label="Checking admin access" />;
  }

  return (
    <div className="min-h-screen bg-[#f7f5fb]">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-[#e8e1ed] bg-white/95 backdrop-blur-lg">
        <div className="site-shell flex h-[68px] items-center justify-between gap-4">
          <Link href="/" aria-label="GELife Group home" className="shrink-0">
            <Image src="/images/logo.png" alt="GELife Group" width={110} height={87} priority className="h-[52px] w-auto" />
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800 sm:block">Admin</span>
            <button type="button" onClick={() => { clearAccessToken(); router.replace("/training/login"); }} className="rounded-xl border border-[#d7c9e8] px-3 py-2 text-sm font-bold text-[#421181] hover:bg-[#f7f1fd]">Sign out</button>
          </div>
        </div>
      </header>

      <div className="site-shell flex gap-8 py-8 lg:py-10">
        {/* Sidebar */}
        <aside className="hidden w-56 shrink-0 lg:block">
          <div className="mb-5 rounded-2xl bg-gradient-to-br from-[#26104d] to-[#421181] p-5 text-white shadow-lg">
            <p className="text-xs font-bold uppercase tracking-widest text-violet-300">Admin panel</p>
            <p className="mt-1 text-lg font-extrabold">GELife Group</p>
          </div>

          {stats && (
            <div className="mb-5 grid grid-cols-2 gap-2">
              <div className="rounded-xl border border-[#e8e1ed] bg-white p-3 shadow-sm">
                <p className="text-xs text-[#6e6877]">Students</p>
                <p className="text-xl font-extrabold text-[#421181]">{stats.students}</p>
              </div>
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
                <p className="text-xs text-amber-700">Pending</p>
                <p className="text-xl font-extrabold text-amber-700">{stats.pending}</p>
              </div>
            </div>
          )}

          <nav className="space-y-1" aria-label="Admin navigation">
            {navItems.map(({ href, label, icon: Icon, exact }) => {
              const active = exact ? pathname === href : pathname.startsWith(href);
              return (
                <Link key={href} href={href} aria-current={active ? "page" : undefined} style={active ? { color: "#fff" } : undefined} className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-all ${active ? "bg-[#421181] text-white shadow-md" : "text-[#514a5b] hover:bg-[#f0ebf8] hover:text-[#421181]"}`}>
                  <Icon size={17} />
                  {label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Mobile bottom nav */}
        <nav className="fixed bottom-0 left-0 right-0 z-40 flex border-t border-[#e8e1ed] bg-white lg:hidden overflow-x-auto" aria-label="Mobile admin navigation">
          {navItems.map(({ href, label, icon: Icon, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href);
            return (
              <Link key={href} href={href} className={`flex flex-1 flex-col items-center gap-1 py-3 px-2 text-[10px] font-bold transition-colors ${active ? "text-[#421181]" : "text-[#8a7d9a]"}`}>
                <Icon size={19} />
                {label}
              </Link>
            );
          })}
        </nav>

        <main className="min-w-0 flex-1 pb-20 lg:pb-0">{children}</main>
      </div>
    </div>
  );
}