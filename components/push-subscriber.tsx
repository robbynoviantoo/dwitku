"use client";

import { useEffect, useState } from "react";
import { Bell, BellOff, Loader2 } from "lucide-react";
import { subscribeToPush } from "@/app/actions/web-push";
import { cn } from "@/lib/utils";

// This key matches the VAPID_PUBLIC_KEY in your .env
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function PushSubscriber({
  collapsed,
  className
}: {
  collapsed?: boolean;
  className?: string;  
}) {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      setIsSupported(true);
      navigator.serviceWorker.ready.then((reg) => {
        reg.pushManager.getSubscription().then((sub) => {
          setIsSubscribed(!!sub);
          setIsLoading(false);
        });
      });
    } else {
      setIsLoading(false);
    }
  }, []);

  const handleSubscribe = async () => {
    if (!isSupported) return alert("Browser tidak mendukung push notification.");

    setIsLoading(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      
      let sub = await reg.pushManager.getSubscription();
      if (!sub) {
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
        });
      }

      // Send to server
      await subscribeToPush(sub.toJSON());
      setIsSubscribed(true);
      alert("Notifikasi berhasil diaktifkan!");
    } catch (e) {
      console.error(e);
      alert("Gagal mengaktifkan notifikasi.");
    } finally {
      setIsLoading(false);
    }
  };

  const Icon = isSubscribed ? Bell : BellOff;

  if (!isSupported) return null;

  return (
    <button
      onClick={isSubscribed ? undefined : handleSubscribe}
      disabled={isLoading || isSubscribed}
      title={isSubscribed ? "Notifikasi Aktif" : "Aktifkan Notifikasi"}
      className={cn(className)}
    >
      {isLoading ? <Loader2 className="w-4 h-4 shrink-0 animate-spin" /> : <Icon className="w-4 h-4 shrink-0" />}
      {!collapsed && <span>{isSubscribed ? "Notifikasi Aktif" : "Aktifkan Notifikasi"}</span>}
    </button>
  );
}
