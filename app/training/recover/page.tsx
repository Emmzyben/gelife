import type { Metadata } from "next";
import Link from "@/components/link";
import { RecoverCodeForm } from "@/components/recover-code-form";
import { SiteFooter, SiteHeader } from "@/components/site-shell";
import { CONTACT_EMAIL, emailEnabled } from "@/lib/config";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Recover learner access", robots: { index: false, follow: false } };

export default function RecoverPage() {
  return <><SiteHeader /><main className="bg-[#faf8fd] py-16 sm:py-24"><div className="site-shell grid gap-10 lg:grid-cols-[.85fr_1.15fr] lg:items-center"><div><p className="eyebrow text-violet-700">GELife Learning</p><h1 className="section-title">Forgot your password?</h1><p className="mt-5 max-w-lg text-lg leading-8 text-slate-600">Verify your email with a code, then choose a new password. Your courses and progress stay unchanged.</p><p className="mt-6 text-slate-600">Remembered it? <Link href="/training/login" className="font-bold text-violet-700 underline">Back to learner login</Link></p></div>
    {emailEnabled() ? <RecoverCodeForm /> : <div className="surface p-7 sm:p-9"><h2 className="text-3xl font-extrabold tracking-tight text-[#241033]">Contact us to reset it</h2><p className="mt-3 leading-7 text-slate-600">Email <a href={`mailto:${CONTACT_EMAIL}?subject=Reset%20my%20learner%20password`} className="font-bold text-violet-700 underline">{CONTACT_EMAIL}</a> from your account address. We’ll help you reset your password.</p></div>}
  </div></main><SiteFooter /></>;
}
