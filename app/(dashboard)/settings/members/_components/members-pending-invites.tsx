"use client";

import { WorkspaceRoleType } from "@/lib/validations/workspace";
import { Mail, Send, X, Loader2 } from "lucide-react";
import { formatDateShort } from "@/lib/utils";
import { useLanguage } from "@/components/providers/language-provider";

type Invite = {
  id: string;
  email: string;
  role: WorkspaceRoleType;
  expiresAt: Date;
  sender: { name: string | null; image: string | null };
};

interface MembersPendingInvitesProps {
  invites: Invite[];
  isPending: boolean;
  isCancelling: boolean;
  cancellingId?: string;
  onResend: (invite: { email: string; role: WorkspaceRoleType }) => void;
  onCancel: (inviteId: string) => void;
}

export function MembersPendingInvites({
  invites,
  isPending,
  isCancelling,
  cancellingId,
  onResend,
  onCancel,
}: MembersPendingInvitesProps) {
  const { t } = useLanguage();

  if (invites.length === 0) return null;

  return (
    <div className="bg-white dark:bg-[#161b22] rounded-2xl border border-slate-200 dark:border-[#21262d] p-5 sm:p-6">
      <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-4">
        {t("members.pendingInvites")} ({invites.length})
      </h2>
      <div className="divide-y divide-slate-100 dark:divide-[#21262d]/80">
        {invites.map((inv) => (
          <div key={inv.id} className="flex items-center gap-3 py-3">
            <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center shrink-0 text-amber-600 dark:text-amber-400">
              <Mail className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                {inv.email}
              </p>
              <p className="text-[11px] text-zinc-400">
                {t("members.invitedBy")} {inv.sender.name ?? "—"} · {t("members.validUntil")}{" "}
                {formatDateShort(inv.expiresAt)}
              </p>
            </div>
            <span className="text-[10px] px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-bold border border-amber-200 dark:border-amber-800 capitalize">
              {inv.role.toLowerCase()}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => onResend({ email: inv.email, role: inv.role })}
                disabled={isPending}
                title={t("members.resend")}
                className="p-1.5 text-zinc-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-950/40 rounded-xl transition-colors cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
              <button
                onClick={() => onCancel(inv.id)}
                disabled={isPending}
                title={t("members.cancelInvite")}
                className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-colors cursor-pointer"
              >
                {isCancelling && cancellingId === inv.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <X className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
