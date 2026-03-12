"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { InviteMemberSchema, WorkspaceRole, WorkspaceRoleType } from "@/lib/validations/workspace";
import { sendInvite, cancelInvite } from "@/app/actions/invite";
import { removeMember, updateMemberRole } from "@/app/actions/workspace";
import { Mail, X, UserMinus, Loader2, Send, Shield, Eye } from "lucide-react";
import { formatDateShort } from "@/lib/utils";

type Member = {
    id: string;
    role: WorkspaceRoleType;
    joinedAt: Date;
    user: { id: string; name: string | null; email: string; image: string | null };
};

type Invite = {
    id: string;
    email: string;
    role: WorkspaceRoleType;
    expiresAt: Date;
    sender: { name: string | null; image: string | null };
};

const ROLE_LABELS: Record<WorkspaceRoleType, string> = {
    OWNER: "Owner",
    EDITOR: "Editor",
    VIEWER: "Viewer",
};

const ROLE_ICONS: Record<WorkspaceRoleType, React.ReactNode> = {
    OWNER: <Shield className="w-3 h-3" />,
    EDITOR: <Send className="w-3 h-3" />,
    VIEWER: <Eye className="w-3 h-3" />,
};

const ROLE_COLORS: Record<WorkspaceRoleType, string> = {
    OWNER: "bg-purple-100 text-purple-700",
    EDITOR: "bg-blue-100 text-blue-700",
    VIEWER: "bg-zinc-100 text-zinc-600",
};

export function MembersClient({
    workspaceId,
    currentUserId,
    currentUserRole,
    members,
    invites,
}: {
    workspaceId: string;
    currentUserId: string;
    currentUserRole: WorkspaceRoleType;
    members: Member[];
    invites: Invite[];
}) {
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | undefined>();
    const [success, setSuccess] = useState<string | undefined>();
    const [warning, setWarning] = useState<{ message: string; link: string } | undefined>();
    const [copied, setCopied] = useState(false);

    const isOwner = currentUserRole === WorkspaceRole.OWNER;
    const canInvite = isOwner || currentUserRole === WorkspaceRole.EDITOR;

    const form = useForm<{
        email: string;
        role: WorkspaceRoleType;
    }>({
        resolver: zodResolver(InviteMemberSchema) as any,
        defaultValues: { email: "", role: WorkspaceRole.EDITOR },
    });

    const onInvite = (values: z.infer<typeof InviteMemberSchema>) => {
        setError(undefined);
        setSuccess(undefined);
        setWarning(undefined);
        startTransition(async () => {
            const result = await sendInvite(workspaceId, values);
            if (result.error) {
                setError(result.error);
            } else if (result.warning && result.inviteLink) {
                // Email gagal — tampilkan link yang bisa di-copy
                setWarning({ message: result.warning, link: result.inviteLink });
                form.reset();
            } else {
                setSuccess(`✅ Email undangan berhasil dikirim ke ${values.email}`);
                form.reset();
            }
        });
    };

    const handleRemoveMember = (memberUserId: string, memberName: string | null) => {
        if (!confirm(`Yakin ingin mengeluarkan ${memberName ?? "anggota"} dari workspace?`)) return;
        startTransition(async () => {
            const result = await removeMember(workspaceId, memberUserId);
            if (result.error) setError(result.error);
            else setSuccess("Anggota berhasil dikeluarkan");
        });
    };

    const handleCancelInvite = (inviteId: string) => {
        startTransition(async () => {
            const result = await cancelInvite(inviteId);
            if (result.error) setError(result.error);
        });
    };

    const handleRoleChange = (memberId: string, newRole: WorkspaceRoleType) => {
        if (newRole === WorkspaceRole.OWNER) return;
        startTransition(async () => {
            const result = await updateMemberRole(workspaceId, memberId, newRole);
            if (result.error) setError(result.error);
        });
    };

    return (
        <div className="space-y-8">
            {/* Invite form */}
            {canInvite && (
                <div className="bg-white rounded-xl border border-zinc-100 shadow-sm p-6">
                    <h2 className="font-semibold text-zinc-900 mb-4 flex items-center gap-2">
                        <Mail className="w-4 h-4 text-indigo-500" />
                        Undang Anggota
                    </h2>

                    <form onSubmit={form.handleSubmit(onInvite)} className="flex flex-col sm:flex-row gap-3">
                        <input
                            {...form.register("email")}
                            type="email"
                            disabled={isPending}
                            placeholder="Email anggota baru..."
                            className="flex-1 px-4 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-zinc-50 focus:bg-white transition-colors"
                        />
                        <select
                            {...form.register("role")}
                            disabled={isPending || !isOwner}
                            className="px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-zinc-50 text-zinc-700 transition-colors"
                        >
                            {isOwner && <option value={WorkspaceRole.EDITOR}>Editor</option>}
                            <option value={WorkspaceRole.VIEWER}>Viewer</option>
                        </select>
                        <button
                            type="submit"
                            disabled={isPending}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-60"
                        >
                            {isPending ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Send className="w-4 h-4" />
                            )}
                            Undang
                        </button>
                    </form>

                    {form.formState.errors.email && (
                        <p className="text-xs text-red-500 mt-2">{form.formState.errors.email.message}</p>
                    )}
                    {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
                    {success && <p className="text-xs text-green-600 mt-2">{success}</p>}

                    {/* Warning: email gagal, link bisa di-copy manual */}
                    {warning && (
                        <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                            <p className="text-xs text-amber-700 font-medium mb-2">⚠️ {warning.message}</p>
                            <div className="flex items-center gap-2">
                                <code className="flex-1 text-xs bg-white border border-amber-200 rounded p-1.5 text-zinc-700 truncate">
                                    {warning.link}
                                </code>
                                <button
                                    type="button"
                                    onClick={() => {
                                        navigator.clipboard.writeText(warning.link);
                                        setCopied(true);
                                        setTimeout(() => setCopied(false), 2000);
                                    }}
                                    className="text-xs px-2 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-700 rounded font-medium whitespace-nowrap transition-colors"
                                >
                                    {copied ? "✓ Disalin!" : "Salin Link"}
                                </button>
                            </div>
                            <p className="text-xs text-amber-600 mt-1.5">
                                Bagikan link ini secara manual ke orang yang ingin kamu undang.
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* Members list */}
            <div className="bg-white rounded-xl border border-zinc-100 shadow-sm p-6">
                <h2 className="font-semibold text-zinc-900 mb-4">
                    Anggota ({members.length})
                </h2>
                <div className="divide-y divide-zinc-50">
                    {members.map((member) => (
                        <div key={member.id} className="flex items-center gap-3 py-3">
                            {member.user.image ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={member.user.image}
                                    alt={member.user.name ?? ""}
                                    className="w-9 h-9 rounded-full object-cover"
                                />
                            ) : (
                                <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600">
                                    {(member.user.name ?? "?")[0].toUpperCase()}
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-zinc-900 truncate">
                                    {member.user.name ?? "—"}
                                    {member.user.id === currentUserId && (
                                        <span className="ml-1.5 text-xs text-zinc-400">(Kamu)</span>
                                    )}
                                </p>
                                <p className="text-xs text-zinc-400 truncate">{member.user.email}</p>
                            </div>

                            {/* Role badge / selector */}
                            {isOwner && member.role !== WorkspaceRole.OWNER && member.user.id !== currentUserId ? (
                                <select
                                    value={member.role}
                                    onChange={(e) =>
                                        handleRoleChange(member.id, e.target.value as WorkspaceRoleType)
                                    }
                                    disabled={isPending}
                                    className="text-xs border border-zinc-200 rounded-md px-2 py-1 bg-zinc-50 text-zinc-700 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                                >
                                    <option value={WorkspaceRole.EDITOR}>Editor</option>
                                    <option value={WorkspaceRole.VIEWER}>Viewer</option>
                                </select>
                            ) : (
                                <span
                                    className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium ${ROLE_COLORS[member.role]}`}
                                >
                                    {ROLE_ICONS[member.role]}
                                    {ROLE_LABELS[member.role]}
                                </span>
                            )}

                            {/* Remove member (OWNER only, not self) */}
                            {isOwner && member.user.id !== currentUserId && (
                                <button
                                    onClick={() =>
                                        handleRemoveMember(member.user.id, member.user.name)
                                    }
                                    disabled={isPending}
                                    title="Keluarkan anggota"
                                    className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                                >
                                    <UserMinus className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Pending Invites */}
            {invites.length > 0 && (
                <div className="bg-white rounded-xl border border-zinc-100 shadow-sm p-6">
                    <h2 className="font-semibold text-zinc-900 mb-4">
                        Undangan Pending ({invites.length})
                    </h2>
                    <div className="divide-y divide-zinc-50">
                        {invites.map((inv) => (
                            <div key={inv.id} className="flex items-center gap-3 py-3">
                                <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                                    <Mail className="w-4 h-4 text-amber-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-zinc-900 truncate">{inv.email}</p>
                                    <p className="text-xs text-zinc-400">
                                        Oleh {inv.sender.name ?? "—"} · Berlaku hingga{" "}
                                        {formatDateShort(inv.expiresAt)}
                                    </p>
                                </div>
                                <span className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-700 font-medium capitalize">
                                    {inv.role.toLowerCase()}
                                </span>
                                <button
                                    onClick={() => handleCancelInvite(inv.id)}
                                    disabled={isPending}
                                    title="Batalkan undangan"
                                    className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
