"use client";

import { WorkspaceRole, WorkspaceRoleType } from "@/lib/validations/workspace";
import { UserMinus, Loader2, Shield, Send, Eye } from "lucide-react";
import { useLanguage } from "@/components/providers/language-provider";

type Member = {
  id: string;
  role: WorkspaceRoleType;
  joinedAt: Date;
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
};

interface MembersListCardProps {
  members: Member[];
  isOwner: boolean;
  currentUserId: string;
  isPending: boolean;
  isRemoving: boolean;
  removingId?: string;
  onRoleChange: (memberId: string, newRole: WorkspaceRoleType) => void;
  onRemoveMember: (memberUserId: string, memberName: string | null) => void;
}

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
  OWNER: "bg-green-50 dark:bg-green-950/60 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800",
  EDITOR: "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800",
  VIEWER: "bg-slate-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700",
};

export function MembersListCard({
  members,
  isOwner,
  currentUserId,
  isPending,
  isRemoving,
  removingId,
  onRoleChange,
  onRemoveMember,
}: MembersListCardProps) {
  const { t } = useLanguage();

  return (
    <div className="bg-white dark:bg-[#161b22] rounded-2xl border border-slate-200 dark:border-[#21262d] p-5 sm:p-6">
      <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-4">
        {t("members.membersList")} ({members.length})
      </h2>

      <div className="divide-y divide-slate-100 dark:divide-[#21262d]/80">
        {members.map((member) => (
          <div key={member.id} className="flex items-center gap-3 py-3">
            {member.user.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={member.user.image}
                alt={member.user.name ?? ""}
                className="w-9 h-9 rounded-xl object-cover shrink-0"
              />
            ) : (
              <div className="w-9 h-9 rounded-xl bg-green-50 dark:bg-green-950/60 flex items-center justify-center text-xs font-black text-green-600 dark:text-green-400 shrink-0">
                {(member.user.name ?? "?")[0].toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                {member.user.name ?? "—"}
                {member.user.id === currentUserId && (
                  <span className="ml-1.5 text-[11px] text-zinc-400 font-semibold">({t("members.you")})</span>
                )}
              </p>
              <p className="text-[11px] text-zinc-400 truncate">
                {member.user.email}
              </p>
            </div>

            {/* Role badge / selector */}
            {isOwner &&
            member.role !== WorkspaceRole.OWNER &&
            member.user.id !== currentUserId ? (
              <select
                value={member.role}
                onChange={(e) =>
                  onRoleChange(member.id, e.target.value as WorkspaceRoleType)
                }
                disabled={isPending}
                className="text-xs border border-slate-200 dark:border-[#21262d] rounded-xl px-2.5 py-1.5 bg-slate-50 dark:bg-zinc-800/60 text-zinc-700 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-green-600"
              >
                <option value={WorkspaceRole.EDITOR}>Editor</option>
                <option value={WorkspaceRole.VIEWER}>Viewer</option>
              </select>
            ) : (
              <span
                className={`inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg font-bold ${ROLE_COLORS[member.role]}`}
              >
                {ROLE_ICONS[member.role]}
                {ROLE_LABELS[member.role]}
              </span>
            )}

            {/* Remove member (OWNER only, not self) */}
            {isOwner && member.user.id !== currentUserId && (
              <button
                onClick={() =>
                  onRemoveMember(member.user.id, member.user.name)
                }
                disabled={isPending}
                title={t("members.removeBtn")}
                className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-colors cursor-pointer"
              >
                {isRemoving && removingId === member.user.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <UserMinus className="w-4 h-4" />
                )}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
