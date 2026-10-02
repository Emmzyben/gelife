import type { Metadata } from "next";
import Link from "@/components/link";
import { LoginForm } from "@/components/login-form";
import { SiteFooter, SiteHeader } from "@/components/site-shell";

export const metadata: Metadata = {
  title: "Learner Login",
  description: "Sign in to the GELife Learning portal.",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return <><SiteHeader /><main className="bg-[#faf8fd] py-16 sm:py-24"><div className="site-shell grid gap-10 lg:grid-cols-[.85fr_1.15fr] lg:items-center"><div><p className="eyebrow text-violet-700">GELife Learning</p><h1 className="section-title">Continue your professional learning.</h1><p className="mt-5 max-w-lg text-lg leading-8 text-slate-600">Your dashboard keeps your enrolled courses and completed lessons together, so you can leave and return when it suits you.</p><p className="mt-6 text-slate-600">Do not have an account yet? <Link href="/training" className="font-bold text-violet-700 underline">Browse courses and enroll.</Link></p><p className="mt-3 text-slate-600">Forgot your password? <Link href="/training/recover" className="font-bold text-violet-700 underline">Reset your password.</Link></p></div><LoginForm /></div></main><SiteFooter /></>;
}
