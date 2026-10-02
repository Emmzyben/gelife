import type { Metadata } from "next";
import Link from "@/components/link";
import { CheckCircle2, XCircle, Clock3 } from "lucide-react";
import { SiteFooter, SiteHeader } from "@/components/site-shell";
import { stripeEnabled } from "@/lib/config";
import { redirect } from "next/navigation";
import { phpApi } from "@/lib/api";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Payment confirmation" };

type SessionData = {
  status: "paid" | "unpaid" | "no_payment_required";
  courseTitle: string;
  amount: number;
  currency: string;
};

async function getSession(sessionId: string): Promise<SessionData | null> {
  try {
    const res = await phpApi(`/stripe/session?session_id=${encodeURIComponent(sessionId)}`);
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

function formatAmount(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount / 100);
}

export default async function CheckoutCompletePage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id: sessionId } = await searchParams;
  if (!sessionId || !stripeEnabled()) redirect("/training/portal");

  const session = await getSession(sessionId);

  // ── Payment succeeded ─────────────────────────────────────────────────
  if (session?.status === "paid") {
    return (
      <>
        <SiteHeader />
        <main className="bg-[#faf8fd] py-16 sm:py-24">
          <div className="site-shell max-w-2xl">
            <div
              className="overflow-hidden rounded-3xl border border-[#e8e1ed] bg-white p-8 shadow-xl sm:p-10"
              role="status"
            >
              {/* Success icon */}
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
                <CheckCircle2 className="text-emerald-500" size={36} />
              </div>

              <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-[#241033]">
                Payment confirmed!
              </h1>
              <p className="mt-3 text-lg leading-8 text-slate-600">
                Your course access is now active. We&apos;ve sent a confirmation to your email.
              </p>

              {/* Course summary card */}
              <div className="mt-7 rounded-2xl border border-[#e8e1ed] bg-[#faf8fd] p-5">
                <p className="text-xs font-semibold uppercase tracking-widest text-[#8b6fa8]">
                  Course enrolled
                </p>
                <p className="mt-1 text-xl font-bold text-[#241033]">
                  {session.courseTitle}
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  Amount paid:{" "}
                  <span className="font-semibold text-[#241033]">
                    {formatAmount(session.amount, session.currency)}
                  </span>
                </p>
              </div>

              <Link href="/training/portal" className="button-primary mt-7 inline-flex">
                Go to my dashboard →
              </Link>
            </div>
          </div>
        </main>
        <SiteFooter />
      </>
    );
  }

  // ── Payment not completed / failed ────────────────────────────────────
  if (session) {
    return (
      <>
        <SiteHeader />
        <main className="bg-[#faf8fd] py-16 sm:py-24">
          <div className="site-shell max-w-2xl">
            <div
              className="overflow-hidden rounded-3xl border border-red-100 bg-white p-8 shadow-xl sm:p-10"
              role="alert"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
                <XCircle className="text-red-500" size={36} />
              </div>
              <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-[#241033]">
                Payment incomplete
              </h1>
              <p className="mt-3 text-lg leading-8 text-slate-600">
                Your payment wasn&apos;t completed. No charge has been made to your card.
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Link href="/training/portal" className="button-primary inline-flex">
                  Try again from dashboard
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center rounded-xl border border-[#e8e1ed] px-6 py-3 text-sm font-semibold text-[#241033] transition hover:bg-[#f0ebf8]"
                >
                  Contact support
                </Link>
              </div>
            </div>
          </div>
        </main>
        <SiteFooter />
      </>
    );
  }

  // ── Fallback — session still processing ───────────────────────────────
  return (
    <>
      <SiteHeader />
      <main className="bg-[#faf8fd] py-16 sm:py-24">
        <div className="site-shell max-w-2xl">
          <div
            className="overflow-hidden rounded-3xl border border-[#e8e1ed] bg-white p-8 shadow-xl sm:p-10"
            role="status"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-50">
              <Clock3 className="text-amber-500" size={36} />
            </div>
            <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-[#241033]">
              Confirming your payment…
            </h1>
            <p className="mt-3 text-lg leading-8 text-slate-600">
              This usually takes less than a minute. Check your dashboard shortly.
            </p>
            <Link href="/training/portal" className="button-primary mt-7 inline-flex">
              Open my dashboard
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}