"use client";

import { useState, useRef, useEffect } from "react";
import Swal from "sweetalert2";
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
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/components/providers/language-provider";

import { MembersHeader } from "@/app/(dashboard)/settings/members/_components/members-header";
import { MembersInviteCard } from "@/app/(dashboard)/settings/members/_components/members-invite-card";
import { MembersListCard } from "@/app/(dashboard)/settings/members/_components/members-list-card";
import { MembersPendingInvites } from "@/app/(dashboard)/settings/members/_components/members-pending-invites";

type UserSuggestion = {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
};

export function MembersClient({
  workspaceId,
  currentUserId,
}: {
  workspaceId: string;
  currentUserId: string;
}) {
  const queryClient = useQueryClient();
  const { t } = useLanguage();
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

  // Query
  const { data: workspace, isLoading } = useQuery({
    queryKey: ["workspace", workspaceId],
    queryFn: () => getWorkspace(workspaceId),
  });

  const isOwner = workspace?.role === WorkspaceRole.OWNER;
  const canInvite = isOwner || workspace?.role === WorkspaceRole.EDITOR;

  // Handle search with debounce
  const handleEmailInputChange = (value: string) => {
    setEmailInput(value);

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
    setSuggestions([]);
    setShowSuggestions(false);
  };

  // Mutations
  const inviteMutation = useMutation({
    mutationFn: (values: z.infer<typeof InviteMemberSchema>) =>
      sendInvite(workspaceId, values),
    onSuccess: (result, variables) => {
      if (result.error) {
        setError(result.error);
      } else if (result.warning && result.inviteLink) {
        setWarning({ message: result.warning, link: result.inviteLink });
        setEmailInput("");
        queryClient.invalidateQueries({ queryKey: ["workspace", workspaceId] });
      } else {
        setSuccess(`✅ Email undangan berhasil dikirim ke ${variables.email}`);
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

  const handleCopyLink = (link: string) => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
    <div className="space-y-6">
      {/* ── 1. Header ── */}
      <MembersHeader />

      {/* ── 2. Invite Card (Owner & Editor) ── */}
      {canInvite && (
        <MembersInviteCard
          isOwner={isOwner}
          isPending={isPending}
          emailInput={emailInput}
          suggestions={suggestions}
          showSuggestions={showSuggestions}
          isSearching={isSearching}
          error={error}
          success={success}
          warning={warning}
          copied={copied}
          onEmailChange={handleEmailInputChange}
          onSelectSuggestion={handleSelectSuggestion}
          setShowSuggestions={setShowSuggestions}
          onCopyLink={handleCopyLink}
          onInvite={onInvite}
        />
      )}

      {/* ── 3. Active Members List ── */}
      <MembersListCard
        members={(workspace.members as any[]) || []}
        isOwner={isOwner}
        currentUserId={currentUserId}
        isPending={isPending}
        isRemoving={removeMutation.isPending}
        removingId={removeMutation.variables}
        onRoleChange={handleRoleChange}
        onRemoveMember={handleRemoveMember}
      />

      {/* ── 4. Pending Invites List ── */}
      <MembersPendingInvites
        invites={(workspace.invites as any[]) || []}
        isPending={isPending}
        isCancelling={cancelMutation.isPending}
        cancellingId={cancelMutation.variables}
        onResend={(inv) => onInvite({ email: inv.email, role: inv.role })}
        onCancel={(id) => cancelMutation.mutate(id)}
      />
    </div>
  );
}

function MembersSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="bg-white dark:bg-[#161b22] rounded-2xl border border-slate-200 dark:border-[#21262d] p-6 space-y-4">
        <Skeleton className="h-5 w-40 mb-2" />
        <div className="flex gap-3">
          <Skeleton className="h-10 flex-1 rounded-xl" />
          <Skeleton className="h-10 w-24 rounded-xl" />
          <Skeleton className="h-10 w-24 rounded-xl" />
        </div>
      </div>
      <div className="bg-white dark:bg-[#161b22] rounded-2xl border border-slate-200 dark:border-[#21262d] p-6 space-y-3">
        <Skeleton className="h-5 w-32 mb-4" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3 py-3 border-b border-slate-100 dark:border-[#21262d] last:border-0">
            <Skeleton className="w-9 h-9 rounded-xl" />
            <div className="flex-1">
              <Skeleton className="h-4 w-32 mb-1" />
              <Skeleton className="h-3 w-48" />
            </div>
            <Skeleton className="h-6 w-20 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}
