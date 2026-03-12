import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/** Menggabungkan class Tailwind dengan benar (menghindari konflik) */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/** Format angka ke format mata uang IDR */
export function formatCurrency(
    amount: number | string,
    currency: string = "IDR"
): string {
    const num = typeof amount === "string" ? parseFloat(amount) : amount;
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(num);
}

/** Format tanggal ke format Indonesia */
export function formatDate(date: Date | string): string {
    const d = typeof date === "string" ? new Date(date) : date;
    return new Intl.DateTimeFormat("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
    }).format(d);
}

/** Format tanggal pendek */
export function formatDateShort(date: Date | string): string {
    const d = typeof date === "string" ? new Date(date) : date;
    return new Intl.DateTimeFormat("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
    }).format(d);
}

/** Generate warna acak untuk kategori baru */
export function randomColor(): string {
    const colors = [
        "#6366f1", // indigo
        "#8b5cf6", // violet
        "#ec4899", // pink
        "#ef4444", // red
        "#f97316", // orange
        "#eab308", // yellow
        "#22c55e", // green
        "#14b8a6", // teal
        "#3b82f6", // blue
        "#06b6d4", // cyan
    ];
    return colors[Math.floor(Math.random() * colors.length)];
}

/** Ambil inisial nama untuk avatar */
export function getInitials(name: string | null | undefined): string {
    if (!name) return "?";
    return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
}
