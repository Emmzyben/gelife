"use client";

import { useState } from "react";
import { CreditCard, Loader2 } from "lucide-react";
import { authenticatedFetch } from "@/lib/client-auth";

export function PayButton({ courseId, price }: { courseId: number; price: number }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function pay() {
    setBusy(true);
    setError("");
    try {
      const response = await authenticatedFetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ courseId }),
      });
      const data = (await response.json()) as { checkoutUrl?: string; error?: string };
      if (!response.ok || !data.checkoutUrl) throw new Error(data.error || "Payment could not be started.");
      window.location.assign(data.checkoutUrl);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Payment could not be started.");
      setBusy(false);
    }
  }

  return (
    <div className="mt-6">
      <button type="button" onClick={pay} disabled={busy} className="button-primary">{busy ? <Loader2 className="animate-spin" size={18} /> : <CreditCard size={18} />} Pay ${price} and start</button>
      {error ? <p className="mt-3 text-sm font-semibold text-red-700" role="alert">{error}</p> : null}
    </div>
  );
}
