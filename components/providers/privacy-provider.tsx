"use client";

import { createContext, useContext, useEffect, useState } from "react";

const STORAGE_KEY = "dwitku-show-amount";

interface PrivacyContextValue {
  showAmount: boolean;
  toggleShowAmount: () => void;
}

const PrivacyContext = createContext<PrivacyContextValue>({
  showAmount: true,
  toggleShowAmount: () => {},
});

export function PrivacyProvider({
  children,
  defaultShowAmount = true,
}: {
  children: React.ReactNode;
  defaultShowAmount?: boolean;
}) {
  const [showAmount, setShowAmount] = useState(defaultShowAmount);

  // Load from cookie / localStorage on mount
  useEffect(() => {
    const match = document.cookie.match(/(^| )show_amount=([^;]+)/);
    if (match) {
      const val = match[2] === "1" || match[2] === "true";
      if (val !== showAmount) setShowAmount(val);
    } else {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored !== null) {
        const val = JSON.parse(stored);
        if (val !== showAmount) {
          setShowAmount(val);
          document.cookie = `show_amount=${val ? "1" : "0"}; path=/; max-age=31536000; SameSite=Lax`;
        }
      }
    }
  }, []);

  // Sync across tabs via storage event
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue !== null) {
        setShowAmount(JSON.parse(e.newValue));
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  const toggleShowAmount = () => {
    setShowAmount((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      document.cookie = `show_amount=${next ? "1" : "0"}; path=/; max-age=31536000; SameSite=Lax`;
      return next;
    });
  };

  return (
    <PrivacyContext.Provider value={{ showAmount, toggleShowAmount }}>
      {children}
    </PrivacyContext.Provider>
  );
}

export function usePrivacy() {
  return useContext(PrivacyContext);
}
