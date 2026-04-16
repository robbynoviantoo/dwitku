"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";
import { RefreshCw } from "lucide-react";

interface PullToRefreshWrapperProps {
  onRefresh: () => Promise<void> | void;
  children: React.ReactNode;
  className?: string;
  threshold?: number;
}

/**
 * PullToRefreshWrapper
 * Listens to touch events on the nearest scrollable ancestor <main>.
 * Only activates on mobile (touch devices) when scrollTop === 0.
 */
export function PullToRefreshWrapper({
  onRefresh,
  children,
  className,
  threshold = 75,
}: PullToRefreshWrapperProps) {
  const [pullY, setPullY] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [triggered, setTriggered] = useState(false);

  const startY = useRef<number | null>(null);
  const pulling = useRef(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Find the scrollable parent (the <main> element)
  const getScrollEl = useCallback((): Element | null => {
    if (typeof window === "undefined") return null;
    // Walk up the DOM to find element with overflow-y scroll/auto
    let el: Element | null = wrapperRef.current?.parentElement ?? null;
    while (el) {
      const style = window.getComputedStyle(el);
      const overflow = style.overflowY;
      if (overflow === "auto" || overflow === "scroll") return el;
      el = el.parentElement;
    }
    return null;
  }, []);

  const isAtTop = useCallback(() => {
    const el = getScrollEl();
    return !el || el.scrollTop <= 0;
  }, [getScrollEl]);

  const RESISTANCE = 2.8;

  const onTouchStart = useCallback(
    (e: Event) => {
      const touch = e as TouchEvent;
      if (refreshing) return;
      if (isAtTop()) {
        startY.current = touch.touches[0].clientY;
        pulling.current = false;
      }
    },
    [refreshing, isAtTop]
  );

  const onTouchMove = useCallback(
    (e: Event) => {
      const touch = e as TouchEvent;
      if (startY.current === null || refreshing) return;
      if (!isAtTop()) {
        startY.current = null;
        setPullY(0);
        return;
      }
      const delta = touch.touches[0].clientY - startY.current;
      if (delta <= 0) {
        setPullY(0);
        pulling.current = false;
        return;
      }
      pulling.current = true;
      const clamped = Math.min(delta / RESISTANCE, threshold * 1.6);
      setPullY(clamped);
      setTriggered(clamped >= threshold);
    },
    [refreshing, isAtTop, threshold]
  );

  const onTouchEnd = useCallback(async () => {
    if (!pulling.current) return;
    pulling.current = false;
    if (triggered && !refreshing) {
      setTriggered(false);
      setRefreshing(true);
      setPullY(threshold * 0.5); // hold indicator
      try {
        await onRefresh();
      } finally {
        setRefreshing(false);
        setPullY(0);
      }
    } else {
      setTriggered(false);
      setPullY(0);
    }
    startY.current = null;
  }, [triggered, refreshing, onRefresh, threshold]);

  useEffect(() => {
    const el = getScrollEl() as HTMLElement | null;
    if (!el) return;
    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: true });
    el.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
    };
  }, [getScrollEl, onTouchStart, onTouchMove, onTouchEnd]);

  const showIndicator = pullY > 8 || refreshing;
  const progress = Math.min(pullY / threshold, 1);

  return (
    <div ref={wrapperRef} className={cn("relative", className)}>
      {/* Pull indicator — only rendered on mobile via CSS */}
      <div
        className="md:hidden flex justify-center items-end pointer-events-none select-none"
        style={{
          height: `${pullY}px`,
          overflow: "hidden",
          transition: pullY === 0 ? "height 0.3s ease" : "none",
        }}
        aria-hidden
      >
        {showIndicator && (
          <div
            className="mb-2 flex flex-col items-center gap-1"
            style={{ opacity: Math.min(progress * 2, 1) }}
          >
            <div
              className={cn(
                "w-9 h-9 rounded-full border-2 flex items-center justify-center shadow-sm",
                triggered || refreshing
                  ? "border-indigo-500 bg-indigo-50"
                  : "border-zinc-200 bg-white",
              )}
            >
              <RefreshCw
                className={cn(
                  "w-4 h-4 transition-colors",
                  triggered || refreshing ? "text-indigo-500" : "text-zinc-400",
                  refreshing && "animate-spin",
                )}
                style={{
                  transform: refreshing ? undefined : `rotate(${progress * 360}deg)`,
                }}
              />
            </div>
            <span
              className={cn(
                "text-[10px] font-semibold tracking-tight",
                triggered || refreshing ? "text-indigo-500" : "text-zinc-400",
              )}
            >
              {refreshing
                ? "Memperbarui..."
                : triggered
                  ? "✓ Lepas untuk refresh"
                  : "Tarik untuk refresh"}
            </span>
          </div>
        )}
      </div>

      {/* Actual page content */}
      <div
        style={{
          transform:
            pullY > 0 && !refreshing
              ? `translateY(${Math.min(pullY * 0.25, 16)}px)`
              : undefined,
          transition: pullY === 0 ? "transform 0.3s ease" : "none",
        }}
      >
        {children}
      </div>
    </div>
  );
}
