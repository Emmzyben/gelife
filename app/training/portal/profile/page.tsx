"use client";

import { PortalAuthFallback, usePortalAuth } from "@/components/portal-auth";
import { DashboardShell } from "@/components/dashboard-shell";
import { ProfileForm } from "@/components/profile-form";

export default function ProfilePage() {
  const { user: learner, loading, error, retry } = usePortalAuth();
  if (error || loading || !learner) return <PortalAuthFallback loading={loading} error={error} retry={retry} label="Loading your profile…" />;

  return (
    <DashboardShell user={learner}>
      <div className="mb-7">
        <p className="eyebrow text-violet-700">Account</p>
        <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-[#211a2d]">My Profile</h1>
        <p className="mt-1 text-sm text-[#6e6877]">Update your name, email address, and password.</p>
      </div>
      <ProfileForm learner={learner} />
    </DashboardShell>
  );
}