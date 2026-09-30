"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authenticatedFetch, clearAccessToken } from "@/lib/client-auth";
import { ActivityLoader } from "@/components/activity-loader";

export type PortalUser = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
};

export function usePortalAuth(requiredRole?: string) {
  const router = useRouter();
  const [user, setUser] = useState<PortalUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    
    authenticatedFetch("/api/auth/me", { cache: "no-store" })
      .then(async (response) => {
        if (response.status === 401 || response.status === 403) {
          clearAccessToken();
          router.replace("/training/login");
          return;
        }
        if (!response.ok) throw new Error("Could not verify your sign-in. Please try again.");
        const data = await response.json();
        if (!data.user) {
          clearAccessToken();
          router.replace("/training/login");
          return;
        }
        if (requiredRole && data.user.role !== requiredRole) {
          router.replace(data.user.role === "admin" ? "/admin" : "/training/portal");
          return;
        }
        if (active) setUser(data.user);
      }).catch(() => {
        if (!active) return;
        setError("Could not verify your sign-in. Check your connection and try again.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [attempt, requiredRole, router]);

  function retry() {
    setError("");
    setLoading(true);
    setAttempt((current) => current + 1);
  }

  return { user, loading, error, retry };
}

export function PortalAuthFallback({
  loading,
  error,
  retry,
  label,
}: {
  loading: boolean;
  error: string;
  retry: () => void;
  label: string;
}) {
  if (!error) {
    return <ActivityLoader label={label} className="site-shell py-20" />;
  }

  return (
    <div className="site-shell max-w-xl py-20 text-center">
      <p className="text-sm font-semibold text-red-700" role="alert">{error}</p>
      <button type="button" onClick={retry} disabled={loading} className="button-primary mt-5">Try again</button>
    </div>
  );
}