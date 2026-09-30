import type { Metadata } from "next";
import { Mail, MapPin, Phone } from "lucide-react";
import { ContactForm } from "@/components/contact-form";
import { PageHero, SiteFooter, SiteHeader } from "@/components/site-shell";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Contact", description: "Contact GELife Group about training, energy technical services, or business advisory." };

export default async function ContactPage({ searchParams }: { searchParams: Promise<{ interest?: string | string[] }> }) {
  const { interest: rawInterest } = await searchParams;
  const interest = Array.isArray(rawInterest) ? rawInterest[0] : rawInterest;
  return <><SiteHeader /><main><PageHero eyebrow="Contact" title="Let’s talk about what you need to achieve."><p>Contact GELife Group about self-paced or customized training, energy technical support, business advisory, or a partnership opportunity.</p></PageHero><section className="section"><div className="site-shell grid gap-8 lg:grid-cols-[.85fr_1.15fr]"><div className="surface bg-violet-50 p-7 sm:p-9"><p className="eyebrow text-violet-700">Connect with us</p><h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[#241033]">Houston-based. Globally connected.</h2><p className="mt-4 leading-7 text-slate-600">We typically respond within one business day.</p><div className="mt-7 space-y-4"><a href="tel:+12815085225" className="flex gap-4 rounded-2xl bg-white p-4 shadow-sm"><Phone className="text-violet-700" /><span><small className="block text-xs font-bold uppercase tracking-wider text-slate-500">Call</small><strong>+1 281 508 5225</strong></span></a><a href="mailto:info@gelifegroup.org" className="flex gap-4 rounded-2xl bg-white p-4 shadow-sm"><Mail className="text-violet-700" /><span><small className="block text-xs font-bold uppercase tracking-wider text-slate-500">Email</small><strong>info@gelifegroup.org</strong></span></a><div className="flex gap-4 rounded-2xl bg-white p-4 shadow-sm"><MapPin className="shrink-0 text-violet-700" /><span><small className="block text-xs font-bold uppercase tracking-wider text-slate-500">Office</small><strong>14511 Old Katy Road<br />Houston, TX 77079</strong></span></div></div></div><ContactForm defaultInterest={interest} /></div></section></main><SiteFooter /></>;
}
