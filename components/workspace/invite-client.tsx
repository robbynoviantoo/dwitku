"use client";

import { useState, useTransition } from "react";
import { acceptInvite, declineInvite } from "@/app/actions/invite";
import { useRouter } from "next/navigation";
import { Loader2, Check, X, Building2, User } from "lucide-react";
import { formatDateShort } from "@/lib/utils";

type InvitePreview = {
    id: string;
    status: string;
    role: string;
    expiresAt: Date;
    workspace: { name: string; description: string | null };
    sender: { name: string | null; image: string | null };
    email: string;
};

const ROLE_LABELS: Record<string, string> = {
    OWNER: "Owner",
    EDITOR: "Editor",
    VIEWER: "Viewer",
};

export function InviteClient({
    invite,
    token,
    isLoggedIn,
    currentUserEmail,
}: {
    invite: InvitePreview | null;
    token: string;
    isLoggedIn: boolean;
    currentUserEmail?: string | null;
}) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [result, setResult] = useState<{ type: "success" | "error"; message: string } | null>(null);

    const handleAccept = () => {
        if (!isLoggedIn) {
            router.push(`/login?callbackUrl=/invite/${token}`);
            return;
        }
        startTransition(async () => {
            const res = await acceptInvite(token);
            if (res.error) {
                setResult({ type: "error", message: res.error });
            } else {
                setResult({ type: "success", message: "Berhasil bergabung ke workspace!" });
                setTimeout(() => router.push("/dashboard"), 1500);
            }
        });
    };

    const handleDecline = () => {
        startTransition(async () => {
            await declineInvite(token);
            setResult({ type: "error", message: "Undangan telah ditolak." });
        });
    };

    if (!invite) {
        return (
            <div className="text-center py-16">
                <X className="w-12 h-12 text-red-400 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-zinc-900 mb-2">Link Tidak Valid</h2>
                <p className="text-zinc-500 text-sm">
                    Link undangan ini tidak ditemukan atau sudah tidak aktif.
                </p>
            </div>
        );
    }

    if (invite.status !== "PENDING") {
        const statusMap: Record<string, { label: string; color: string }> = {
            ACCEPTED: { label: "Undangan telah diterima", color: "text-green-600" },
            DECLINED: { label: "Undangan telah ditolak", color: "text-red-500" },
            EXPIRED: { label: "Undangan telah kadaluarsa", color: "text-zinc-500" },
        };
        const s = statusMap[invite.status] ?? { label: "Status tidak diketahui", color: "text-zinc-500" };
        return (
            <div className="text-center py-16">
                <p className={`text-lg font-semibold ${s.color}`}>{s.label}</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-8 text-center">
            {/* Workspace icon */}
            <div className="w-16 h-16 rounded-2xl bg-indigo-100 flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-8 h-8 text-indigo-600" />
            </div>

            <h2 className="text-2xl font-bold text-zinc-900 mb-1">{invite.workspace.name}</h2>
            {invite.workspace.description && (
                <p className="text-sm text-zinc-400 mb-4">{invite.workspace.description}</p>
            )}

            {/* Invite info */}
            <div className="bg-zinc-50 rounded-lg px-4 py-3 mb-6 text-sm text-zinc-600 space-y-1">
                <p>
                    Kamu diundang oleh{" "}
                    <span className="font-medium text-zinc-800">{invite.sender.name ?? "seseorang"}</span>{" "}
                    sebagai{" "}
                    <span className="font-medium text-indigo-600">
                        {ROLE_LABELS[invite.role] ?? invite.role}
                    </span>
                </p>
                <p className="text-xs text-zinc-400">
                    Berlaku hingga {formatDateShort(invite.expiresAt)}
                </p>
                {currentUserEmail && currentUserEmail !== invite.email && (
                    <p className="text-xs text-amber-600 mt-1">
                        ⚠️ Undangan ini ditujukan untuk {invite.email}, bukan {currentUserEmail}.
                    </p>
                )}
            </div>

            {result && (
                <div
                    className={`mb-4 px-4 py-3 rounded-lg text-sm ${result.type === "success"
                            ? "bg-green-50 text-green-700 border border-green-200"
                            : "bg-red-50 text-red-600 border border-red-200"
                        }`}
                >
                    {result.message}
                </div>
            )}

            {!result && (
                <div className="flex gap-3 justify-center">
                    <button
                        onClick={handleDecline}
                        disabled={isPending}
                        className="flex items-center gap-2 px-5 py-2.5 border border-zinc-200 text-zinc-700 hover:bg-zinc-50 text-sm font-medium rounded-lg transition-colors disabled:opacity-60"
                    >
                        <X className="w-4 h-4" />
                        Tolak
                    </button>
                    <button
                        onClick={handleAccept}
                        disabled={isPending}
                        className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-60"
                    >
                        {isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Check className="w-4 h-4" />
                        )}
                        {isLoggedIn ? "Terima Undangan" : "Login & Terima"}
                    </button>
                </div>
            )}
        </div>
    );
}
