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
 *
 * Fix 1: Indicator rendered as position:fixed at top of viewport (above navbar/modal).
 * Fix 2: Ignore touches that originate inside a position:fixed ancestor (modals, dialogs).
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

  // Find nearest scrollable ancestor
  const getScrollEl = useCallback((): HTMLElement | null => {
    if (typeof window === "undefined") return null;
    let el: Element | null = wrapperRef.current?.parentElement ?? null;
    while (el && el !== document.body) {
      const style = window.getComputedStyle(el);
      const overflow = style.overflowY;
      if (overflow === "auto" || overflow === "scroll") return el as HTMLElement;
      el = el.parentElement;
    }
    return null;
  }, []);

  const isAtTop = useCallback(() => {
    const el = getScrollEl();
    return !el || el.scrollTop <= 0;
  }, [getScrollEl]);

  // ── FIX 2: Detect if touch started inside a fixed-position overlay (modal) ──
  const isInsideFixedOverlay = useCallback((target: EventTarget | null): boolean => {
    if (!target) return false;
    let el = target as Element | null;
    while (el && el !== document.body) {
      if (window.getComputedStyle(el).position === "fixed") return true;
      el = el.parentElement;
    }
    return false;
  }, []);

  // ── FIX 3: Check if ANY modal/overlay is currently VISIBLE in the DOM ──
  // Catches the race condition: touchstart fires before modal renders,
  // but modal has rendered by the time touchend fires.
  // Important: check computed style, not just class — sidebar backdrop is always
  // in DOM with opacity-0 pointer-events-none (invisible/inactive).
  const hasActiveModal = useCallback((): boolean => {
    if (typeof document === "undefined") return false;
    const elements = document.querySelectorAll(".fixed.inset-0");
    for (const el of elements) {
      const style = window.getComputedStyle(el);
      if (style.pointerEvents !== "none" && parseFloat(style.opacity) > 0) {
        return true;
      }
    }
    return false;
  }, []);

  const RESISTANCE = 2.8;

  const onTouchStart = useCallback(
    (e: Event) => {
      // Ignore touches inside modals/fixed overlays
      if (isInsideFixedOverlay(e.target)) return;
      if (refreshing) return;
      const touch = e as TouchEvent;
      if (isAtTop()) {
        startY.current = touch.touches[0].clientY;
        pulling.current = false;
      }
    },
    [refreshing, isAtTop, isInsideFixedOverlay]
  );

  const onTouchMove = useCallback(
    (e: Event) => {
      if (startY.current === null || refreshing) return;

      // Cancel gesture if finger has moved into a fixed overlay (modal appeared)
      if (isInsideFixedOverlay(e.target)) {
        pulling.current = false;
        setPullY(0);
        startY.current = null;
        return;
      }

      if (!isAtTop()) {
        startY.current = null;
        setPullY(0);
        return;
      }
      const touch = e as TouchEvent;
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

    // Cancel if a modal/overlay appeared while the gesture was in progress
    if (hasActiveModal()) {
      setTriggered(false);
      setPullY(0);
      startY.current = null;
      return;
    }

    if (triggered && !refreshing) {
      setTriggered(false);
      setRefreshing(true);
      setPullY(threshold * 0.5);
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

      {/* ── FIX 1: Fixed indicator — renders above navbar & modal ── */}
      <div
        className="md:hidden fixed left-0 right-0 flex justify-center items-center pointer-events-none select-none z-[200]"
        style={{
          // Mobile header is h-14 (56px) + mt-5 (20px) = ~76px.
          // We sit just below it during the pull.
          top: `${56 + Math.min(pullY, threshold)}px`,
          transition: pullY === 0 ? "top 0.3s ease, opacity 0.3s ease" : "none",
          opacity: showIndicator ? Math.min(progress * 2, 1) : 0,
        }}
        aria-hidden
      >
        {showIndicator && (
          <div className="flex flex-col items-center gap-1 drop-shadow-sm">
            <div
              className={cn(
                "w-9 h-9 rounded-full border-2 flex items-center justify-center bg-white shadow-md",
                triggered || refreshing ? "border-green-500" : "border-zinc-200",
              )}
            >
              <RefreshCw
                className={cn(
                  "w-4 h-4 transition-colors",
                  triggered || refreshing ? "text-green-500" : "text-zinc-400",
                  refreshing && "animate-spin",
                )}
                style={{
                  transform: refreshing ? undefined : `rotate(${progress * 360}deg)`,
                }}
              />
            </div>
            <span
              className={cn(
                "text-[10px] font-semibold tracking-tight bg-white/80 backdrop-blur-sm px-2 py-0.5 rounded-full",
                triggered || refreshing ? "text-green-600" : "text-zinc-400",
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

      {/* Actual page content with subtle push-down while pulling */}
      <div
        style={{
          transform:
            pullY > 0 && !refreshing
              ? `translateY(${Math.min(pullY * 0.25, 18)}px)`
              : undefined,
          transition: pullY === 0 ? "transform 0.3s ease" : "none",
        }}
      >
        {children}
      </div>
    </div>
  );
}
