import Image from "next/image";
import Link from "@/components/link";
import { BookOpen } from "lucide-react";
import { navigation } from "@/components/navigation";

export { SiteHeader } from "@/components/site-header";

export function SiteFooter() {
  return (
    <footer className="bg-[#160a2a] text-white">
      <div className="site-shell grid gap-10 py-14 md:grid-cols-[1.6fr_.7fr_1fr]">
        <div>
          <Image src="/images/logo.png" alt="GELife Group" width={110} height={87} className="mb-4 h-[70px] w-auto rounded-xl bg-white p-1.5" />
          <p className="max-w-md text-[#afa4bd]">Professional training, energy technical services, and business advisory for organizations ready to move forward.</p>
        </div>
        <div className="flex flex-col gap-2.5">
          <h2 className="mb-1 text-xs font-bold uppercase tracking-[.14em] text-[#ffae7a]">Explore</h2>
          {navigation.slice(1).map(([label, href]) => <Link key={href} href={href} className="text-[#c8bfd3] hover:text-white">{label}</Link>)}
          <Link href="/training/login" className="text-[#c8bfd3] hover:text-white">Learner Login</Link>
        </div>
        <div className="flex flex-col gap-3 text-[#c8bfd3]">
          <h2 className="mb-1 text-xs font-bold uppercase tracking-[.14em] text-[#ffae7a]">Contact</h2>
          <a href="tel:+12815085225" className="hover:text-white">+1 281 508 5225</a>
          <a href="mailto:info@gelifegroup.org" className="hover:text-white">info@gelifegroup.org</a>
          <p>14511 Old Katy Road<br />Houston, TX 77079</p>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="site-shell flex flex-col gap-2 py-5 text-sm text-[#92889e] sm:flex-row sm:justify-between">
          <span>© {new Date().getFullYear()} GELife Group LLC.</span>
          <span className="flex flex-wrap gap-x-5 gap-y-1"><Link href="/privacy" className="hover:text-white">Privacy</Link><Link href="/terms" className="hover:text-white">Terms &amp; refunds</Link><span>Houston, Texas · Serving clients globally</span></span>
        </div>
      </div>
    </footer>
  );
}

export function PageHero({ eyebrow, title, children }: { eyebrow: string; title: string; children: React.ReactNode }) {
  return (
    <section className="page-hero">
      <div className="site-shell relative z-10 max-w-4xl text-center">
        <p className="eyebrow !text-[#ffb282]">{eyebrow}</p>
        <h1>{title}</h1>
        <div className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-[#e4dbed]">{children}</div>
      </div>
    </section>
  );
}

export function CourseMeta({ duration, level }: { duration: string; level: string }) {
  return (
    <div className="flex flex-wrap items-center gap-4 text-sm font-semibold text-[#6e6877]">
      <span className="inline-flex items-center gap-1.5"><BookOpen size={16} /> {duration}</span>
      <span className="h-1 w-1 rounded-full bg-slate-300" />
      <span>{level}</span>
    </div>
  );
}
