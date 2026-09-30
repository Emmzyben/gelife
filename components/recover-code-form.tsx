"use client";

import { FormEvent, useState } from "react";
import Link from "@/components/link";
import { CheckCircle2, KeyRound, Loader2, Mail } from "lucide-react";

type Step = "email" | "code" | "done";

export function RecoverCodeForm() {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function requestCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/recover", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Recovery could not be started.");
      setStep("code");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Recovery could not be started.");
    } finally {
      setBusy(false);
    }
  }

  async function resetPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("The passwords do not match.");
      return;
    }

    setBusy(true);
    try {
      const response = await fetch("/api/recover/confirm", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, code, password }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Password could not be reset.");
      setStep("done");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Password could not be reset.");
    } finally {
      setBusy(false);
    }
  }

  if (step === "done") {
    return (
      <div className="surface p-7 sm:p-9" role="status">
        <CheckCircle2 className="text-emerald-600" size={42} />
        <h2 className="mt-5 text-3xl font-extrabold tracking-tight text-[#241033]">Password reset.</h2>
        <p className="mt-3 leading-7 text-slate-600">Your new password is ready. Sign in with {email} and the password you chose.</p>
        <Link href="/training/login" className="button-primary mt-6"><KeyRound size={18} /> Sign in</Link>
      </div>
    );
  }

  if (step === "code") {
    return (
      <form onSubmit={resetPassword} className="surface p-7 sm:p-9">
        <Mail className="text-violet-700" size={38} />
        <h2 className="mt-5 text-3xl font-extrabold tracking-tight text-[#241033]">Enter your email code</h2>
        <p className="mt-3 leading-7 text-slate-600">If {email} has a learner account, a six-digit code was sent. It expires in 10 minutes.</p>
        <div className="mt-7 grid gap-5">
          <label className="field">Verification code<input value={code} onChange={event => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))} inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" minLength={6} maxLength={6} required /></label>
          <label className="field">New password<input type="password" value={password} onChange={event => setPassword(event.target.value)} autoComplete="new-password" minLength={8} required /></label>
          <label className="field">Confirm new password<input type="password" value={confirmPassword} onChange={event => setConfirmPassword(event.target.value)} autoComplete="new-password" minLength={8} required /></label>
          {error ? <p className="rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700" role="alert">{error}</p> : null}
          <button type="submit" className="button-primary justify-center" disabled={busy}>{busy ? <><Loader2 className="animate-spin" size={18} /> Resetting…</> : "Reset password"}</button>
          <button type="button" onClick={() => { setStep("email"); setCode(""); setError(""); }} className="text-sm font-semibold text-violet-700 underline">Use a different email</button>
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={requestCode} className="surface p-7 sm:p-9">
      <h2 className="text-3xl font-extrabold tracking-tight text-[#241033]">Recover your password</h2>
      <p className="mt-3 leading-7 text-slate-600">Enter the email address on your learner account. We’ll send a code to verify it’s yours.</p>
      <div className="mt-7 grid gap-5">
        <label className="field">Email address<input type="email" name="email" value={email} onChange={event => setEmail(event.target.value)} autoComplete="email" required /></label>
        {error ? <p className="rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700" role="alert">{error}</p> : null}
        <button type="submit" className="button-primary justify-center" disabled={busy}>{busy ? <><Loader2 className="animate-spin" size={18} /> Sending code…</> : "Email me a code"}</button>
      </div>
    </form>
  );
}