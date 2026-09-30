"use client";

import { useState } from "react";
import { Loader2, Save } from "lucide-react";
import { authenticatedFetch } from "@/lib/client-auth";

export function ProfileForm({
  learner,
}: {
  learner: {
    fullName?: string;
    first_name?: string;
    last_name?: string;
    email?: string;
    profile_image?: string;
  };
}) {
  const fullName =
    learner?.fullName ||
    `${learner?.first_name ?? ""} ${learner?.last_name ?? ""}`.trim();

  const [name, setName] = useState(fullName);
  const [email, setEmail] = useState(learner?.email ?? "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password && password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setBusy(true);
    try {
      const body: Record<string, string> = { name, email };
      if (password) body.password = password;

      const res = await authenticatedFetch("/api/auth/update-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed to update profile.");

      setSuccess("Profile updated successfully.");
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  const avatarSrc =
    learner?.profile_image ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName || "L")}&background=421181&color=fff&size=128`;

  return (
    <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
      <div className="rounded-2xl border border-[#e8e1ed] bg-white p-6 shadow-sm text-center">
        <img
          src={avatarSrc}
          alt={fullName || "Profile"}
          className="mx-auto h-24 w-24 rounded-full object-cover ring-4 ring-violet-100"
        />
        <p className="mt-3 font-extrabold text-[#211a2d]">{fullName || "Learner"}</p>
        <p className="mt-0.5 text-xs text-[#6e6877]">{learner?.email}</p>
      </div>

      <form onSubmit={handleSubmit} className="rounded-2xl border border-[#e8e1ed] bg-white p-6 shadow-sm space-y-5">
        {success && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-800" role="status">
            {success}
          </div>
        )}
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700" role="alert">
            {error}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="field">
            Full name <span className="text-red-500">*</span>
            <input
              id="profileName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="name"
            />
          </label>
          <label className="field">
            Email address <span className="text-red-500">*</span>
            <input
              id="profileEmail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="field">
            New password
            <input
              id="profilePassword"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              autoComplete="new-password"
              placeholder="Leave blank to keep current"
            />
          </label>
          <label className="field">
            Confirm password
            <input
              id="profileConfirm"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              minLength={6}
              autoComplete="new-password"
              placeholder="Re-enter new password"
            />
          </label>
        </div>

        <div className="pt-1">
          <button type="submit" disabled={busy} className="button-primary gap-2">
            {busy ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            Save changes
          </button>
        </div>
      </form>
    </div>
  );
}