"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "@/components/link";
import { CheckCircle2, Copy, KeyRound, Loader2, Mail } from "lucide-react";
import { authenticatedFetch } from "@/lib/client-auth";

type EnrollmentResult = {
  status: "emailed" | "created" | "pending" | "active";
  email?: string;
  password?: string;
  checkoutUrl?: string;
  courseTitle: string;
  learnerCode?: string;
  accessCode?: string;
};

export function EnrollmentForm({
  courseSlug,
  courseTitle,
  signedInLearner,
  onlinePayment,
}: {
  courseSlug: string;
  courseTitle: string;
  signedInLearner: { fullName: string; email: string } | null;
  onlinePayment: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<EnrollmentResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [learner, setLearner] = useState(signedInLearner);

  useEffect(() => {
    if (signedInLearner) return;
    authenticatedFetch("/api/auth/me", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) return;
        const data = await response.json();
        if (data.user) {
          setLearner({
            fullName: `${data.user.first_name} ${data.user.last_name}`.trim(),
            email: data.user.email,
          });
        }
      })
      .catch(() => undefined);
  }, [signedInLearner]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const payload = learner
      ? { courseSlug, courseTitle }
      : {
          courseSlug,
          courseTitle,
          fullName: String(form.get("fullName") ?? ""),
          email: String(form.get("email") ?? ""),
          organization: String(form.get("organization") ?? ""),
        };

    try {
      const response = await authenticatedFetch("/api/enroll", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json() as EnrollmentResult & { error?: string };
      if (!response.ok) throw new Error(data.error || "Enrollment could not be completed.");
      if (data.checkoutUrl) {
        window.location.assign(data.checkoutUrl);
        return;
      }
      setResult(data);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Enrollment could not be completed.");
    }
    setBusy(false);
  }

  async function copyCredentials() {
    if (!result?.learnerCode || !result.accessCode) return;
    await navigator.clipboard.writeText(`GELife Learner ID: ${result.learnerCode}\nAccess code: ${result.accessCode}`);
    setCopied(true);
  }

  const paymentLine = onlinePayment
    ? "Sign in to pay securely by card. The course opens as soon as payment goes through."
    : "The course opens in your dashboard as soon as GELife Group confirms your payment. We will contact you with payment details.";

  if (result?.status === "active" || result?.status === "pending") {
    return (
      <div className="surface p-7 sm:p-9" role="status">
        <CheckCircle2 className="text-emerald-600" size={42} />
        <h2 className="mt-5 text-3xl font-extrabold tracking-tight text-[#241033]">{result.status === "active" ? "You already have this course." : "Course added to your dashboard."}</h2>
        <p className="mt-3 leading-7 text-slate-600">{result.status === "active" ? `${result.courseTitle} is open in your learner dashboard.` : `${result.courseTitle} is waiting for payment. The course opens as soon as GELife Group confirms your payment. We will contact you with payment details.`}</p>
        <Link href="/training/portal" className="button-primary mt-6"><KeyRound size={18} /> Open my learning dashboard</Link>
      </div>
    );
  }

  if (result?.status === "emailed") {
    return (
      <div className="surface p-7 sm:p-9" role="status">
        <Mail className="text-violet-700" size={42} />
        <h2 className="mt-5 text-3xl font-extrabold tracking-tight text-[#241033]">Check your email.</h2>
        <p className="mt-3 leading-7 text-slate-600">We sent your learner ID and access code to the address you entered. It can take a few minutes, and it may land in your spam folder.</p>
        <p className="mt-3 leading-7 text-slate-600">{paymentLine}</p>
        <Link href="/training/login" className="button-primary mt-6"><KeyRound size={18} /> Go to learner login</Link>
      </div>
    );
  }

  if (result?.email && result.password) {
    return (
      <div className="surface p-7 sm:p-9" role="status">
        <CheckCircle2 className="text-emerald-600" size={42} />
        <h2 className="mt-5 text-3xl font-extrabold tracking-tight text-[#241033]">Your learner account is ready.</h2>
        <p className="mt-3 leading-7 text-slate-600">Save these details now. The password is not shown again. If you lose it, contact info@gelifegroup.org to have it reset.</p>
        <dl className="mt-6 grid gap-3 rounded-2xl bg-violet-50 p-5">
          <div><dt className="text-xs font-bold uppercase tracking-[.14em] text-violet-600">Course</dt><dd className="mt-1 font-bold text-violet-950">{result.courseTitle}</dd></div>
          <div><dt className="text-xs font-bold uppercase tracking-[.14em] text-violet-600">Email</dt><dd className="mt-1 font-mono text-lg font-bold text-violet-950">{result.email}</dd></div>
          <div><dt className="text-xs font-bold uppercase tracking-[.14em] text-violet-600">Password</dt><dd className="mt-1 font-mono text-lg font-bold text-violet-950">{result.password}</dd></div>
        </dl>
        <p className="mt-4 text-sm leading-6 text-slate-600">{paymentLine}</p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <button type="button" onClick={async () => {
            await navigator.clipboard.writeText(`GELife Email: ${result.email}\nPassword: ${result.password}`);
            setCopied(true);
          }} className="button-secondary"><Copy size={18} /> {copied ? "Copied" : "Copy login details"}</button>
          <Link href="/training/login" className="button-primary"><KeyRound size={18} /> {onlinePayment ? "Sign in to pay" : "Go to learner login"}</Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="surface p-7 sm:p-9">
      <p className="eyebrow">{learner ? "Add to my learning" : "Create learner access"}</p>
      <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-[#241033]">Enroll in {courseTitle}</h2>
      <p className="mt-3 leading-7 text-slate-600">{learner ? "Add this course to your existing learner dashboard." : "Complete the form to create your learner ID and access code."} {onlinePayment ? "You pay by card before the course opens." : "The course opens once GELife Group confirms your payment."}</p>
      <div className="mt-7 grid gap-5">
        {learner ? (
          <div className="rounded-2xl bg-violet-50 p-5"><p className="text-xs font-bold uppercase tracking-[.14em] text-violet-600">Signed-in learner</p><p className="mt-2 font-bold text-violet-950">{learner.fullName}</p><p className="text-sm text-slate-600">{learner.email}</p></div>
        ) : (
          <>
            <label className="field">Full name<input name="fullName" autoComplete="name" required minLength={3} /></label>
            <label className="field">Email address<input type="email" name="email" autoComplete="email" required /></label>
            <label className="field">Organization <span className="font-normal text-slate-500">(optional)</span><input name="organization" autoComplete="organization" /></label>
          </>
        )}
        <label className="flex items-start gap-3 text-sm leading-6 text-slate-600"><input type="checkbox" required className="mt-1 h-4 w-4 accent-[#421181]" /><span>I agree to the <a href="/terms" target="_blank" className="font-semibold text-violet-700 underline">terms and refund policy</a> and to GELife Group contacting me about this enrollment, as described in the <a href="/privacy" target="_blank" className="font-semibold text-violet-700 underline">privacy policy</a>.</span></label>
        {error ? <p className="rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700" role="alert">{error}</p> : null}
        <button type="submit" className="button-primary justify-center" disabled={busy}>{busy ? <><Loader2 className="animate-spin" size={18} /> Completing enrollment…</> : learner ? (onlinePayment ? "Continue to payment" : "Add course to my dashboard") : "Enroll and create my login"}</button>
      </div>
    </form>
  );
}
