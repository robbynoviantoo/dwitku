"use client";

import { CreditCard } from "lucide-react";
import Swal from "sweetalert2";

export function ContinuePaymentButton({ snapToken }: { snapToken: string }) {
  const loadMidtransScript = (): Promise<void> =>
    new Promise((resolve) => {
      if ((window as any).snap) {
        resolve();
        return;
      }
      const script = document.createElement("script");
      script.src =
        process.env.NODE_ENV === "production"
          ? "https://app.midtrans.com/snap/snap.js"
          : "https://app.sandbox.midtrans.com/snap/snap.js";
      script.setAttribute(
        "data-client-key",
        process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY ?? ""
      );
      script.onload = () => resolve();
      document.head.appendChild(script);
    });

  const handleContinue = async () => {
    try {
      await loadMidtransScript();

      (window as any).snap.pay(snapToken, {
        onSuccess: async (result: any) => {
          Swal.fire({
            title: "Menyiapkan Akun... ⏳",
            text: "Sedang mensinkronisasi data langgananmu.",
            allowOutsideClick: false,
            didOpen: () => {
              Swal.showLoading();
            },
          });

          await fetch("/api/payment/sync", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orderId: result.order_id }),
          });

          Swal.fire({
            title: "Pembayaran Berhasil! 🎉",
            text: "Langgananmu sudah aktif. Selamat menikmati fitur premium!",
            icon: "success",
            confirmButtonColor: "#16a34a",
            confirmButtonText: "Lanjut",
            customClass: { popup: "!rounded-2xl" },
          }).then(() => window.location.reload());
        },
        onPending: async () => {
          Swal.fire({
            title: "Menunggu Pembayaran",
            text: "Kami akan mengaktifkan akunmu setelah pembayaran dikonfirmasi.",
            icon: "info",
            confirmButtonColor: "#16a34a",
            customClass: { popup: "!rounded-2xl" },
          }).then(() => window.location.reload());
        },
        onError: () => {
          Swal.fire({
            title: "Pembayaran Gagal",
            text: "Silakan coba kembali.",
            icon: "error",
            confirmButtonColor: "#16a34a",
            customClass: { popup: "!rounded-2xl" },
          });
        },
      });
    } catch (e: any) {
      Swal.fire({
        title: "Error",
        text: e.message,
        icon: "error",
        confirmButtonColor: "#16a34a",
        customClass: { popup: "!rounded-2xl" },
      });
    }
  };

  return (
    <button
      onClick={handleContinue}
      className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-600 text-white text-xs font-semibold rounded-lg hover:bg-green-700 transition-colors shadow-sm ml-auto mr-0 md:mr-2 md:mt-0 mt-2 whitespace-nowrap"
      title="Lanjutkan Pembayaran"
    >
      <CreditCard className="w-3.5 h-3.5" />
      Bayar
    </button>
  );
}
