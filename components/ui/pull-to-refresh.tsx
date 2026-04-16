"use client";

import { usePullToRefresh } from "@/hooks/use-pull-to-refresh";
import { cn } from "@/lib/utils";
import { RefreshCw } from "lucide-react";

interface PullToRefreshProps {
  onRefresh: () => Promise<void> | void;
  children: React.ReactNode;
  className?: string;
  threshold?: number;
}

export function PullToRefresh({
  onRefresh,
  children,
  className,
  threshold = 80,
}: PullToRefreshProps) {
  const { containerRef, pullDistance, refreshing, triggered } = usePullToRefresh({
    onRefresh,
    threshold,
  });

  const progress = Math.min(pullDistance / threshold, 1);
  const showIndicator = pullDistance > 4 || refreshing;

  return (
    <div
      ref={containerRef}
      className={cn("overflow-y-auto overscroll-none h-full", className)}
      style={{ WebkitOverflowScrolling: "touch" } as React.CSSProperties}
    >
      {/* Pull indicator */}
      <div
        className="flex justify-center items-center pointer-events-none select-none overflow-hidden transition-[height] duration-200"
        style={{ height: `${pullDistance}px` }}
        aria-hidden
      >
        {showIndicator && (
          <div
            className={cn(
              "flex flex-col items-center gap-1 transition-opacity duration-200",
              pullDistance > 20 ? "opacity-100" : "opacity-0",
            )}
          >
            {/* Ring progress / spinner */}
            <div
              className={cn(
                "w-9 h-9 rounded-full border-2 flex items-center justify-center transition-all duration-150",
                triggered || refreshing
                  ? "border-indigo-500 bg-indigo-50"
                  : "border-zinc-300 bg-white",
              )}
              style={{
                transform: refreshing ? "none" : `rotate(${progress * 280}deg)`,
              }}
            >
              <RefreshCw
                className={cn(
                  "w-4 h-4 transition-colors",
                  triggered || refreshing ? "text-indigo-500" : "text-zinc-400",
                  refreshing && "animate-spin",
                )}
              />
            </div>
            <span
              className={cn(
                "text-[10px] font-medium transition-colors",
                triggered || refreshing ? "text-indigo-500" : "text-zinc-400",
              )}
            >
              {refreshing
                ? "Memperbarui..."
                : triggered
                  ? "Lepas untuk refresh"
                  : "Tarik untuk refresh"}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div
        style={{
          transform: `translateY(${pullDistance > 0 && !refreshing ? Math.min(pullDistance * 0.3, 20) : 0}px)`,
          transition: pullDistance === 0 ? "transform 0.3s ease" : "none",
        }}
      >
        {children}
      </div>
    </div>
  );
}
