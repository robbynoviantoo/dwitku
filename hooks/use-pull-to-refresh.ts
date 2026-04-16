"use client";

import { useState, useRef, useCallback, useEffect } from "react";

interface UsePullToRefreshOptions {
  onRefresh: () => Promise<void> | void;
  threshold?: number;   // pixel to pull before releasing (default: 80)
  resistance?: number;  // drag resistance multiplier (default: 2.5)
}

export function usePullToRefresh({
  onRefresh,
  threshold = 80,
  resistance = 2.5,
}: UsePullToRefreshOptions) {
  const [pullDistance, setPullDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [triggered, setTriggered] = useState(false);

  const startY = useRef<number | null>(null);
  const isDragging = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const canPull = useCallback(() => {
    // Only allow pull when at the very top of the scroll container
    const el = containerRef.current;
    if (!el) return false;
    return el.scrollTop <= 0;
  }, []);

  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      if (!canPull()) return;
      startY.current = e.touches[0].clientY;
      isDragging.current = false;
    },
    [canPull]
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (startY.current === null || refreshing) return;
      const currentY = e.touches[0].clientY;
      const raw = currentY - startY.current;
      if (raw <= 0) {
        setPullDistance(0);
        isDragging.current = false;
        return;
      }
      if (!canPull()) {
        startY.current = null;
        return;
      }
      isDragging.current = true;
      // Apply resistance so the indicator doesn't travel as far as the finger
      const clamped = Math.min(raw / resistance, threshold * 1.5);
      setPullDistance(clamped);
      setTriggered(clamped >= threshold);
      // Prevent native scroll while pulling
      if (raw > 5) e.preventDefault();
    },
    [refreshing, canPull, resistance, threshold]
  );

  const handleTouchEnd = useCallback(async () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    if (triggered && !refreshing) {
      setRefreshing(true);
      setPullDistance(threshold * 0.5); // keep indicator visible while loading
      setTriggered(false);
      try {
        await onRefresh();
      } finally {
        setRefreshing(false);
        setPullDistance(0);
      }
    } else {
      setPullDistance(0);
      setTriggered(false);
    }
    startY.current = null;
  }, [triggered, refreshing, onRefresh, threshold]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener("touchstart", handleTouchStart, { passive: true });
    el.addEventListener("touchmove", handleTouchMove, { passive: false });
    el.addEventListener("touchend", handleTouchEnd, { passive: true });
    return () => {
      el.removeEventListener("touchstart", handleTouchStart);
      el.removeEventListener("touchmove", handleTouchMove);
      el.removeEventListener("touchend", handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return { containerRef, pullDistance, refreshing, triggered };
}
