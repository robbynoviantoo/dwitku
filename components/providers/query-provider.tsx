"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState, useEffect } from "react";

export const BROADCAST_CHANNEL = "dwitku-sync";

/**
 * Helper untuk mengirim sinyal invalidasi ke tab lain
 */
export const broadcastInvalidate = (queryKey?: any[]) => {
  if (typeof window === "undefined") return;
  const channel = new BroadcastChannel(BROADCAST_CHANNEL);
  channel.postMessage({ type: "QUERY_INVALIDATE", queryKey });
  channel.close();
};

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 menit
            retry: 1,
          },
        },
      }),
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    const channel = new BroadcastChannel(BROADCAST_CHANNEL);

    channel.onmessage = (event) => {
      if (event.data?.type === "QUERY_INVALIDATE") {
        // Invalidate queries in THIS tab when OTHER tabs signal a change
        queryClient.invalidateQueries({
          queryKey: event.data.queryKey,
          // Jangan invalidate yang sedang fetching agar tidak loop (opsional)
          refetchType: "active"
        });
      }
    };

    return () => {
      channel.close();
    };
  }, [queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
