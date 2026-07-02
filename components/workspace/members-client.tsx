"use client";

import { useState, useRef, useEffect } from "react";
import Swal from "sweetalert2";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  InviteMemberSchema,
  WorkspaceRole,
  WorkspaceRoleType,
} from "@/lib/validations/workspace";
import { sendInvite, cancelInvite, searchUsers } from "@/app/actions/invite";
import {
  removeMember,
  updateMemberRole,
  getWorkspace,
} from "@/app/actions/workspace";
import { Mail, X, UserMinus, Loader2, Send, Shield, Eye, User } from "lucide-react";
import { formatDateShort } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
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

type Invite = {
  id: string;
  email: string;
  role: WorkspaceRoleType;
  expiresAt: Date;
  sender: { name: string | null; image: string | null };
};

type UserSuggestion = {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
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
  OWNER: "bg-green-100 text-green-700",
  EDITOR: "bg-emerald-50 text-emerald-700 border border-emerald-100",
  VIEWER: "bg-zinc-100 text-zinc-600",
};

export function MembersClient({
  workspaceId,
  currentUserId,
}: {
  workspaceId: string;
  currentUserId: string;
}) {
  const queryClient = useQueryClient();
  const { locale, t } = useLanguage();
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();
  const [warning, setWarning] = useState<
    { message: string; link: string } | undefined
  >();
  const [copied, setCopied] = useState(false);

  // User search autocomplete state
  const [emailInput, setEmailInput] = useState("");
  const [suggestions, setSuggestions] = useState<UserSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Query
  const { data: workspace, isLoading } = useQuery({
    queryKey: ["workspace", workspaceId],
    queryFn: () => getWorkspace(workspaceId),
  });

  const isOwner = workspace?.role === WorkspaceRole.OWNER;
  const canInvite = isOwner || workspace?.role === WorkspaceRole.EDITOR;

  const form = useForm<{
    email: string;
    role: WorkspaceRoleType;
  }>({
    resolver: zodResolver(InviteMemberSchema) as any,
    defaultValues: { email: "", role: WorkspaceRole.EDITOR },
  });

  // Handle search with debounce
  const handleEmailInputChange = (value: string) => {
    setEmailInput(value);
    form.setValue("email", value);

    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    if (value.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsSearching(true);
    searchTimeout.current = setTimeout(async () => {
      try {
        const results = await searchUsers(value, workspaceId);
        setSuggestions(results);
        setShowSuggestions(results.length > 0);
      } catch {
        setSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    }, 350);
  };

  const handleSelectSuggestion = (user: UserSuggestion) => {
    setEmailInput(user.email);
    form.setValue("email", user.email);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  // Close suggestions on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Mutations
  const inviteMutation = useMutation({
    mutationFn: (values: z.infer<typeof InviteMemberSchema>) =>
      sendInvite(workspaceId, values),
    onSuccess: (result, variables) => {
      if (result.error) {
        setError(result.error);
      } else if (result.warning && result.inviteLink) {
        setWarning({ message: result.warning, link: result.inviteLink });
        form.reset();
        setEmailInput("");
        queryClient.invalidateQueries({ queryKey: ["workspace", workspaceId] });
      } else {
        setSuccess(`✅ Email undangan berhasil dikirim ke ${variables.email}`);
        form.reset();
        setEmailInput("");
        queryClient.invalidateQueries({ queryKey: ["workspace", workspaceId] });
      }
    },
  });

  const removeMutation = useMutation({
    mutationFn: (memberUserId: string) =>
      removeMember(workspaceId, memberUserId),
    onSuccess: (result) => {
      if (result.error) setError(result.error);
      else {
        setSuccess("Anggota berhasil dikeluarkan");
        queryClient.invalidateQueries({ queryKey: ["workspace", workspaceId] });
      }
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (inviteId: string) => cancelInvite(inviteId),
    onSuccess: (result) => {
      if (result.error) setError(result.error);
      else
        queryClient.invalidateQueries({ queryKey: ["workspace", workspaceId] });
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({
      memberId,
      newRole,
    }: {
      memberId: string;
      newRole: WorkspaceRoleType;
    }) => updateMemberRole(workspaceId, memberId, newRole),
    onSuccess: (result) => {
      if (result.error) setError(result.error);
      else
        queryClient.invalidateQueries({ queryKey: ["workspace", workspaceId] });
    },
  });

  const onInvite = (values: z.infer<typeof InviteMemberSchema>) => {
    setError(undefined);
    setSuccess(undefined);
    setWarning(undefined);
    inviteMutation.mutate(values);
  };

  const handleRemoveMember = async (
    memberUserId: string,
    memberName: string | null,
  ) => {
    const result = await Swal.fire({
      title: "Keluarkan Anggota?",
      html: `Apakah Anda yakin ingin mengeluarkan <b>${memberName ?? "anggota"}</b> dari workspace ini?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, Keluarkan",
      cancelButtonText: "Batal",
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      reverseButtons: true,
      customClass: {
        popup: "!rounded-2xl !font-[Inter,sans-serif]",
        title: "!text-zinc-900 !text-lg !font-bold",
        htmlContainer: "!text-zinc-500 !text-sm",
        confirmButton: "!rounded-xl !text-sm !font-semibold !px-5 !py-2.5",
        cancelButton: "!rounded-xl !text-sm !font-medium !px-5 !py-2.5",
      },
    });

    if (!result.isConfirmed) return;
    removeMutation.mutate(memberUserId);
  };

  const handleCancelInvite = (inviteId: string) => {
    cancelMutation.mutate(inviteId);
  };

  const handleRoleChange = (memberId: string, newRole: WorkspaceRoleType) => {
    if (newRole === WorkspaceRole.OWNER) return;
    updateRoleMutation.mutate({ memberId, newRole });
  };

  if (isLoading && !workspace) {
    return <MembersSkeleton />;
  }

  if (!workspace) return null;

  const isPending =
    inviteMutation.isPending ||
    removeMutation.isPending ||
    cancelMutation.isPending ||
    updateRoleMutation.isPending;

  return (
    <div className="space-y-8">
      {/* Invite form */}
      {canInvite && (
        <div className="bg-white rounded-xl border border-zinc-100 shadow-sm p-6">
          <h2 className="font-semibold text-zinc-900 mb-4 flex items-center gap-2">
            <Mail className="w-4 h-4 text-green-600" />
            {t("members.invite")}
          </h2>

          <form
            onSubmit={form.handleSubmit(onInvite)}
            className="flex flex-col sm:flex-row gap-3"
          >
            {/* Email input with autocomplete */}
            <div className="relative flex-1" ref={suggestionsRef}>
              <input
                value={emailInput}
                onChange={(e) => handleEmailInputChange(e.target.value)}
                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                type="text"
                disabled={isPending}
                placeholder={t("members.searchPlaceholder")}
                autoComplete="off"
                className="w-full px-4 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-zinc-50 focus:bg-white transition-colors"
              />

              {/* Search spinner inside input */}
              {isSearching && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Loader2 className="w-3.5 h-3.5 text-zinc-400 animate-spin" />
                </div>
              )}

              {/* Suggestions dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-zinc-200 rounded-lg shadow-lg z-50 overflow-hidden">
                  <p className="text-xs text-zinc-400 px-3 pt-2 pb-1 font-medium">
                    {t("members.usersOnPlatform")}
                  </p>
                  {suggestions.map((user) => (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => handleSelectSuggestion(user)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-green-50 transition-colors text-left"
                    >
                      {user.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={user.image}
                          alt={user.name ?? ""}
                          className="w-7 h-7 rounded-full object-cover shrink-0"
                        />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                          <User className="w-3.5 h-3.5 text-green-600" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-zinc-900 truncate">
                          {user.name ?? "—"}
                        </p>
                        <p className="text-xs text-zinc-400 truncate">{user.email}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <select
              {...form.register("role")}
              disabled={isPending || !isOwner}
              className="px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-zinc-50 text-zinc-700 transition-colors"
            >
              {isOwner && <option value={WorkspaceRole.EDITOR}>Editor</option>}
              <option value={WorkspaceRole.VIEWER}>Viewer</option>
            </select>
            <button
              type="submit"
              disabled={isPending}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-60"
            >
              {inviteMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              {t("members.inviteBtn")}
            </button>
          </form>

          {form.formState.errors.email && (
            <p className="text-xs text-red-500 mt-2">
              {form.formState.errors.email.message}
            </p>
          )}
          {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
          {success && <p className="text-xs text-green-600 mt-2">{success}</p>}

          {/* Warning: email gagal, link bisa di-copy manual */}
          {warning && (
            <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-xs text-amber-700 font-medium mb-2">
                ⚠️ {warning.message}
              </p>
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
                  {copied ? `✓ ${t("members.copied")}` : t("members.copyLink")}
                </button>
              </div>
              <p className="text-xs text-amber-600 mt-1.5">
                {t("members.shareDesc")}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Members list */}
      <div className="bg-white rounded-xl border border-zinc-100 shadow-sm p-6">
        <h2 className="font-semibold text-zinc-900 mb-4">
          {t("members.membersList")} ({(workspace.members as Member[]).length})
        </h2>
        <div className="divide-y divide-zinc-50">
          {(workspace.members as Member[]).map((member) => (
            <div key={member.id} className="flex items-center gap-3 py-3">
              {member.user.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={member.user.image}
                  alt={member.user.name ?? ""}
                  className="w-9 h-9 rounded-full object-cover"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center text-xs font-bold text-green-600">
                  {(member.user.name ?? "?")[0].toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-zinc-900 truncate">
                  {member.user.name ?? "—"}
                  {member.user.id === currentUserId && (
                    <span className="ml-1.5 text-xs text-zinc-400">({t("members.you")})</span>
                  )}
                </p>
                <p className="text-xs text-zinc-400 truncate">
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
                    handleRoleChange(
                      member.id,
                      e.target.value as WorkspaceRoleType,
                    )
                  }
                  disabled={isPending}
                  className="text-xs border border-zinc-200 rounded-md px-2 py-1 bg-zinc-50 text-zinc-700 focus:outline-none focus:ring-1 focus:ring-green-500"
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
                  title={t("members.removeBtn")}
                  className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                >
                  {removeMutation.isPending &&
                  removeMutation.variables === member.user.id ? (
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

      {/* Pending Invites */}
      {(workspace.invites as Invite[]).length > 0 && (
        <div className="bg-white rounded-xl border border-zinc-100 shadow-sm p-6">
          <h2 className="font-semibold text-zinc-900 mb-4">
            {t("members.pendingInvites")} ({(workspace.invites as Invite[]).length})
          </h2>
          <div className="divide-y divide-zinc-50">
            {(workspace.invites as Invite[]).map((inv) => (
              <div key={inv.id} className="flex items-center gap-3 py-3">
                <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4 text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-900 truncate">
                    {inv.email}
                  </p>
                  <p className="text-xs text-zinc-400">
                    {t("members.invitedBy")} {inv.sender.name ?? "—"} · {t("members.validUntil")}{" "}
                    {formatDateShort(inv.expiresAt)}
                  </p>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-700 font-medium capitalize">
                  {inv.role.toLowerCase()}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onInvite({ email: inv.email, role: inv.role })}
                    disabled={isPending}
                    title={t("members.resend")}
                    className="p-1.5 text-zinc-400 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleCancelInvite(inv.id)}
                    disabled={isPending}
                    title={t("members.cancelInvite")}
                    className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                  >
                    {cancelMutation.isPending &&
                    cancelMutation.variables === inv.id ? (
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
      )}
    </div>
  );
}

function MembersSkeleton() {
  return (
    <div className="space-y-8">
      <div className="bg-white rounded-xl border border-zinc-100 shadow-sm p-6">
        <Skeleton className="h-5 w-40 mb-4" />
        <div className="flex gap-3">
          <Skeleton className="h-10 flex-1 rounded-lg" />
          <Skeleton className="h-10 w-24 rounded-lg" />
          <Skeleton className="h-10 w-24 rounded-lg" />
        </div>
      </div>
      <div className="bg-white rounded-xl border border-zinc-100 shadow-sm p-6">
        <Skeleton className="h-5 w-32 mb-4" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex items-center gap-3 py-3 border-b border-zinc-50 last:border-0"
            >
              <Skeleton className="w-9 h-9 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-4 w-32 mb-1" />
                <Skeleton className="h-3 w-48" />
              </div>
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
