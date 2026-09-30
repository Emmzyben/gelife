import type { Metadata } from "next";
import Link from "@/components/link";
import { Clock3 } from "lucide-react";
import { SiteFooter, SiteHeader } from "@/components/site-shell";
import { stripeEnabled } from "@/lib/config";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Payment received" };

export default async function CheckoutCompletePage({ searchParams }: { searchParams: Promise<{ session_id?: string }> }) {
  const { session_id: sessionId } = await searchParams;
  if (!sessionId || !stripeEnabled()) redirect("/training/portal");
  return (
    <>
      <SiteHeader />
      <main className="bg-[#faf8fd] py-16 sm:py-24">
        <div className="site-shell max-w-2xl">
          <div className="overflow-hidden rounded-3xl border border-[#e8e1ed] bg-white p-8 shadow-xl sm:p-10" role="status">
            <Clock3 className="text-amber-600" size={44} />
            <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-[#241033]">Confirming your payment.</h1>
            <p className="mt-4 text-lg leading-8 text-slate-600">This usually takes less than a minute. Check your dashboard shortly.</p>
            <Link href="/training/portal" className="button-primary mt-7">Open my dashboard</Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}