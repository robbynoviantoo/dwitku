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

export function PrivacyProvider({ children }: { children: React.ReactNode }) {
  const [showAmount, setShowAmount] = useState(true);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) {
      setShowAmount(JSON.parse(stored));
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
