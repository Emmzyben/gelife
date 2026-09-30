"use client";

import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "@/components/link";
import { BookOpen, LayoutDashboard, LogOut, User } from "lucide-react";
import { clearAccessToken } from "@/lib/client-auth";

const navItems = [
  { href: "/training/portal", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/training/portal/courses", label: "My Courses", icon: BookOpen, exact: false },
  { href: "/training/portal/profile", label: "Profile", icon: User, exact: false },
];

export function DashboardShell({
  children,
  user,
}: {
  children: React.ReactNode;
  user: { fullName?: string; first_name?: string; last_name?: string; email?: string };
}) {
  const pathname = usePathname();
  const router = useRouter();
  const displayName = user?.first_name || user?.fullName?.split(" ")[0] || "Learner";
  const fullName = user?.fullName || `${user?.first_name ?? ""} ${user?.last_name ?? ""}`.trim() || "Learner";

  return (
    <div className="min-h-screen bg-[#f7f5fb]">
      <header className="sticky top-0 z-40 border-b border-[#e8e1ed] bg-white/95 backdrop-blur-lg">
        <div className="site-shell flex h-[68px] items-center justify-between gap-4">
          <Link href="/" aria-label="GELife Group home" className="shrink-0">
            <Image src="/images/logo.png" alt="GELife Group" width={110} height={87} priority className="h-[52px] w-auto" />
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm font-semibold text-[#514a5b] sm:block">{fullName}</span>
            <button type="button" onClick={() => { clearAccessToken(); router.replace("/training/login"); }} className="inline-flex items-center gap-2 rounded-xl border border-[#d7c9e8] px-3 py-2 text-sm font-bold text-[#421181] hover:bg-[#f7f1fd]">
              <LogOut size={16} />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>
      </header>

      <div className="site-shell flex gap-8 py-8 lg:py-10">
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="mb-5 rounded-2xl bg-gradient-to-br from-[#35106f] to-[#5b21b6] p-5 text-white shadow-lg">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-xl font-black">
              {displayName[0]?.toUpperCase()}
            </div>
            <p className="text-sm font-semibold text-violet-200">Welcome back,</p>
            <p className="text-lg font-extrabold">{displayName}</p>
            <p className="mt-0.5 truncate text-xs text-violet-300">{user?.email}</p>
          </div>

          <nav className="space-y-1" aria-label="Learner dashboard navigation">
            {navItems.map(({ href, label, icon: Icon, exact }) => {
              const active = exact ? pathname === href : pathname.startsWith(href);
              return (
                <Link key={href} href={href} aria-current={active ? "page" : undefined} style={active ? { color: "#fff" } : undefined} className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-all ${active ? "bg-[#421181] text-white shadow-md" : "text-[#514a5b] hover:bg-[#f0ebf8] hover:text-[#421181]"}`}>
                  <Icon size={18} />
                  {label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-6 rounded-2xl border border-[#e8e1ed] bg-white p-4">
            <p className="text-sm font-bold text-[#211a2d]">Explore more courses</p>
            <p className="mt-1 text-xs text-[#6e6877]">Grow your skills with our full catalog.</p>
            <Link href="/training" className="button-primary mt-3 !min-h-9 !px-3 !py-1.5 !text-xs">Browse catalog</Link>
          </div>
        </aside>

        <nav className="fixed bottom-0 left-0 right-0 z-40 flex border-t border-[#e8e1ed] bg-white lg:hidden" aria-label="Mobile dashboard navigation">
          {navItems.map(({ href, label, icon: Icon, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href);
            return (
              <Link key={href} href={href} className={`flex flex-1 flex-col items-center gap-1 py-3 text-[10px] font-bold transition-colors ${active ? "text-[#421181]" : "text-[#8a7d9a]"}`}>
                <Icon size={20} />
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