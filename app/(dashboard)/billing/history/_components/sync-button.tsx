"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";

export function SyncButton({ orderId }: { orderId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSync = async () => {
    setLoading(true);
    try {
      await fetch("/api/payment/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      router.refresh();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleSync}
      disabled={loading}
      title="Periksa Status Pembayaran"
      className="p-1 rounded-md text-zinc-400 hover:text-green-600 hover:bg-green-50 transition-colors disabled:opacity-50"
    >
      <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-green-500" : ""}`} />
    </button>
  );
}
