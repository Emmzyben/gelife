"use client";

import { FormEvent, useState } from "react";
import { KeyRound, Loader2 } from "lucide-react";
import { storeAccessToken } from "@/lib/client-auth";

export function LoginForm() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        credentials: "omit",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: String(form.get("email") ?? ""), password: String(form.get("password") ?? "") }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Login was unsuccessful.");
      if (!data.token) throw new Error("Login did not return an access token.");
      storeAccessToken(data.token);
      window.location.assign(data.role === "admin" ? "/admin" : "/training/portal");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Login was unsuccessful.");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="surface p-7 sm:p-9">
      <KeyRound size={38} className="text-violet-700" />
      <h2 className="mt-5 text-4xl font-extrabold tracking-[-.04em] text-[#241033]">Learner login</h2>
      <p className="mt-3 leading-7 text-slate-600">Enter your email and password to access your courses.</p>
      <div className="mt-7 grid gap-5">
        <label className="field">Email<input type="email" name="email" autoComplete="email" placeholder="you@example.com" required /></label>
        <label className="field">Password<input type="password" name="password" autoComplete="current-password" required /></label>
        {error ? <p className="rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700" role="alert">{error}</p> : null}
        <button type="submit" className="button-primary justify-center" disabled={busy}>{busy ? <><Loader2 className="animate-spin" size={18} /> Signing in…</> : "Sign in to my courses"}</button>
      </div>
    </form>
  );
}
