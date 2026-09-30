"use client";

import { FormEvent, useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { INTERESTS } from "@/lib/contact";

export function ContactForm({ defaultInterest }: { defaultInterest?: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const initial = INTERESTS.find((item) => item === defaultInterest) ?? "";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const form = Object.fromEntries(new FormData(event.currentTarget));
    try {
      const response = await fetch("/api/contact", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(form) });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(data.error || "Your message could not be sent.");
      setSent(true);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Your message could not be sent.");
    } finally {
      setBusy(false);
    }
  }

  if (sent) {
    return (
      <div className="surface p-7 sm:p-9" role="status">
        <CheckCircle2 className="text-emerald-600" size={42} />
        <h2 className="mt-5 text-3xl font-extrabold tracking-tight text-[#241033]">Message received.</h2>
        <p className="mt-3 leading-7 text-slate-600">Thanks for getting in touch. We reply within one business day, from info@gelifegroup.org.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="surface p-7 sm:p-9">
      <p className="eyebrow text-violet-700">Request a consultation</p>
      <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-[#241033]">Tell us about your priority.</h2>
      <div className="mt-7 grid gap-5 sm:grid-cols-2">
        <label className="field">First name<input name="firstName" autoComplete="given-name" required maxLength={80} /></label>
        <label className="field">Last name<input name="lastName" autoComplete="family-name" required maxLength={80} /></label>
        <label className="field sm:col-span-2">Work email<input type="email" name="email" autoComplete="email" required maxLength={160} /></label>
        <label className="field sm:col-span-2">Organization <span className="font-normal text-slate-500">(optional)</span><input name="organization" autoComplete="organization" maxLength={160} /></label>
        <label className="field sm:col-span-2">Area of interest<select name="interest" required defaultValue={initial}><option value="" disabled>Select a service</option>{INTERESTS.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label className="field sm:col-span-2">What would you like to achieve?<textarea name="message" minLength={15} maxLength={5000} required /></label>
        <label className="absolute -left-[9999px]" aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
        {error ? <p className="rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700 sm:col-span-2" role="alert">{error}</p> : null}
        <p className="text-sm leading-6 text-slate-500 sm:col-span-2">We use your details only to reply to this request. See our <a href="/privacy" className="underline">privacy policy</a>.</p>
        <button type="submit" className="button-primary justify-center sm:col-span-2" disabled={busy}>{busy ? <><Loader2 className="animate-spin" size={18} /> Sending…</> : "Send request"}</button>
      </div>
    </form>
  );
}
