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
 * Solusi Masalah Scroll:
 * 1. Mendeteksi scrollable container dari target sentuhan (termasuk list di dalam children yang overflow-y-auto).
 * 2. Hanya aktif saat SEMUA container (lokal dan window) berada tepat di paling atas (scrollTop <= 0).
 * 3. Tidak memblokir native scroll ke atas saat user sedang berada di tengah/bawah list.
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
  const startX = useRef<number | null>(null);
  const pulling = useRef(false);
  const touchTarget = useRef<EventTarget | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Periksa apakah sebuah elemen scrollable
  const isScrollable = (el: Element): boolean => {
    const style = window.getComputedStyle(el);
    const overflowY = style.overflowY;
    return (
      (overflowY === "auto" || overflowY === "scroll") &&
      el.scrollHeight > el.clientHeight
    );
  };

  // Cek apakah target atau container-nya berada di posisi paling atas (scrollTop <= 0)
  const isAtTop = useCallback((target?: EventTarget | null): boolean => {
    if (typeof window === "undefined") return true;

    // 1. Cek window scroll
    const isWindowAtTop = window.scrollY <= 1;
    if (!isWindowAtTop) return false;

    // 2. Cek semua scrollable container dari target sentuhan ke atas
    let currentEl = (target as HTMLElement | null) ?? null;
    while (currentEl && currentEl !== document.body && currentEl !== document.documentElement) {
      if (isScrollable(currentEl)) {
        if (currentEl.scrollTop > 1) {
          return false;
        }
      }
      currentEl = currentEl.parentElement;
    }

    // 3. Cek wrapper dan parent-parentnya
    let wrapperEl = wrapperRef.current?.parentElement ?? null;
    while (wrapperEl && wrapperEl !== document.body && wrapperEl !== document.documentElement) {
      if (isScrollable(wrapperEl)) {
        if (wrapperEl.scrollTop > 1) {
          return false;
        }
      }
      wrapperEl = wrapperEl.parentElement;
    }

    return true;
  }, []);

  // Deteksi jika touch dimulai di dalam fixed-position overlay (modal)
  const isInsideFixedOverlay = useCallback((target: EventTarget | null): boolean => {
    if (!target) return false;
    let el = target as Element | null;
    while (el && el !== document.body) {
      if (window.getComputedStyle(el).position === "fixed") return true;
      el = el.parentElement;
    }
    return false;
  }, []);

  // Cek jika ada modal aktif di DOM
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
      const touch = e as TouchEvent;
      if (isInsideFixedOverlay(touch.target)) return;
      if (refreshing) return;

      touchTarget.current = touch.target;

      // Hanya inisialisasi jika benar-benar di posisi teratas
      if (isAtTop(touch.target)) {
        startY.current = touch.touches[0].clientY;
        startX.current = touch.touches[0].clientX;
        pulling.current = false;
      } else {
        startY.current = null;
        startX.current = null;
        pulling.current = false;
      }
    },
    [refreshing, isAtTop, isInsideFixedOverlay]
  );

  const onTouchMove = useCallback(
    (e: Event) => {
      if (startY.current === null || refreshing) return;

      const touch = e as TouchEvent;
      if (isInsideFixedOverlay(touch.target)) {
        pulling.current = false;
        setPullY(0);
        startY.current = null;
        return;
      }

      // Pastikan target masih di posisi paling atas
      if (!isAtTop(touchTarget.current || touch.target)) {
        startY.current = null;
        setPullY(0);
        pulling.current = false;
        return;
      }

      const currentY = touch.touches[0].clientY;
      const currentX = touch.touches[0].clientX;
      const deltaY = currentY - startY.current;
      const deltaX = Math.abs(currentX - (startX.current ?? currentX));

      // Jika pergerakan lebih dominan horizontal, abaikan pull-to-refresh
      if (deltaX > Math.abs(deltaY) && !pulling.current) {
        startY.current = null;
        setPullY(0);
        return;
      }

      // Jika user menggeser ke atas (scroll down biasa)
      if (deltaY <= 0) {
        setPullY(0);
        pulling.current = false;
        return;
      }

      // User menarik ke bawah dari posisi paling atas
      pulling.current = true;
      const clamped = Math.min(deltaY / RESISTANCE, threshold * 1.6);
      setPullY(clamped);
      setTriggered(clamped >= threshold);

      // Hanya prevent default jika benar-benar sedang pull to refresh
      if (deltaY > 10 && e.cancelable) {
        e.preventDefault();
      }
    },
    [refreshing, isAtTop, threshold, isInsideFixedOverlay]
  );

  const onTouchEnd = useCallback(async () => {
    if (!pulling.current) {
      startY.current = null;
      startX.current = null;
      touchTarget.current = null;
      setPullY(0);
      return;
    }

    pulling.current = false;

    // Batalkan jika ada modal muncul
    if (hasActiveModal()) {
      setTriggered(false);
      setPullY(0);
      startY.current = null;
      startX.current = null;
      touchTarget.current = null;
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
    startX.current = null;
    touchTarget.current = null;
  }, [triggered, refreshing, onRefresh, threshold, hasActiveModal]);

  const onTouchCancel = useCallback(() => {
    pulling.current = false;
    startY.current = null;
    startX.current = null;
    touchTarget.current = null;
    setPullY(0);
    setTriggered(false);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("touchcancel", onTouchCancel, { passive: true });

    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("touchcancel", onTouchCancel);
    };
  }, [onTouchStart, onTouchMove, onTouchEnd, onTouchCancel]);

  const showIndicator = pullY > 8 || refreshing;
  const progress = Math.min(pullY / threshold, 1);

  return (
    <div ref={wrapperRef} className={cn("relative w-full", className)}>
      {/* ── Fixed indicator — renders above navbar & modal ── */}
      <div
        className="md:hidden fixed left-0 right-0 flex justify-center items-center pointer-events-none select-none z-[200]"
        style={{
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
                triggered || refreshing ? "border-green-500" : "border-zinc-200"
              )}
            >
              <RefreshCw
                className={cn(
                  "w-4 h-4 transition-colors",
                  triggered || refreshing ? "text-green-500" : "text-zinc-400",
                  refreshing && "animate-spin"
                )}
                style={{
                  transform: refreshing ? undefined : `rotate(${progress * 360}deg)`,
                }}
              />
            </div>
            <span
              className={cn(
                "text-[10px] font-semibold tracking-tight bg-white/80 backdrop-blur-sm px-2 py-0.5 rounded-full",
                triggered || refreshing ? "text-green-600" : "text-zinc-400"
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
