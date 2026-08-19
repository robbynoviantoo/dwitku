"use client";

import { useRef, useEffect } from "react";
import { Mail, Send, Loader2, User } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  InviteMemberSchema,
  WorkspaceRole,
  WorkspaceRoleType,
} from "@/lib/validations/workspace";
import { useLanguage } from "@/components/providers/language-provider";

type UserSuggestion = {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
};

interface MembersInviteCardProps {
  isOwner: boolean;
  isPending: boolean;
  emailInput: string;
  suggestions: UserSuggestion[];
  showSuggestions: boolean;
  isSearching: boolean;
  error?: string;
  success?: string;
  warning?: { message: string; link: string };
  copied: boolean;
  onEmailChange: (value: string) => void;
  onSelectSuggestion: (user: UserSuggestion) => void;
  setShowSuggestions: (show: boolean) => void;
  onCopyLink: (link: string) => void;
  onInvite: (values: z.infer<typeof InviteMemberSchema>) => void;
}

export function MembersInviteCard({
  isOwner,
  isPending,
  emailInput,
  suggestions,
  showSuggestions,
  isSearching,
  error,
  success,
  warning,
  copied,
  onEmailChange,
  onSelectSuggestion,
  setShowSuggestions,
  onCopyLink,
  onInvite,
}: MembersInviteCardProps) {
  const { t } = useLanguage();
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const form = useForm<{
    email: string;
    role: WorkspaceRoleType;
  }>({
    resolver: zodResolver(InviteMemberSchema) as any,
    defaultValues: { email: "", role: WorkspaceRole.EDITOR },
  });

  // Sync internal form when emailInput changes from parent
  useEffect(() => {
    form.setValue("email", emailInput);
  }, [emailInput, form]);

  return (
    <div className="bg-white dark:bg-[#161b22] rounded-2xl border border-slate-200 dark:border-[#21262d] p-5 sm:p-6">
      <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-4 flex items-center gap-2">
        <Mail className="w-4 h-4 text-green-600 dark:text-green-400" />
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
            onChange={(e) => onEmailChange(e.target.value)}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            type="text"
            disabled={isPending}
            placeholder={t("members.searchPlaceholder")}
            autoComplete="off"
            className="w-full px-3.5 py-2 border border-slate-200 dark:border-[#21262d] rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-green-600 bg-slate-50 dark:bg-zinc-800/60 text-zinc-800 dark:text-zinc-100 transition-colors"
          />

          {/* Search spinner inside input */}
          {isSearching && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Loader2 className="w-3.5 h-3.5 text-zinc-400 animate-spin" />
            </div>
          )}

          {/* Suggestions dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-white dark:bg-[#161b22] border border-slate-200 dark:border-[#21262d] rounded-xl shadow-xl z-50 overflow-hidden">
              <p className="text-[10px] text-zinc-400 px-3 pt-2 pb-1 font-bold uppercase tracking-wider">
                {t("members.usersOnPlatform")}
              </p>
              {suggestions.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => onSelectSuggestion(user)}
                  className="w-full flex items-center gap-3 px-3 py-2 hover:bg-slate-50 dark:hover:bg-zinc-800/40 transition-colors text-left cursor-pointer"
                >
                  {user.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={user.image}
                      alt={user.name ?? ""}
                      className="w-7 h-7 rounded-full object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-green-50 dark:bg-green-950/60 flex items-center justify-center shrink-0">
                      <User className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                      {user.name ?? "—"}
                    </p>
                    <p className="text-[11px] text-zinc-400 truncate">{user.email}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <select
          {...form.register("role")}
          disabled={isPending || !isOwner}
          className="px-3.5 py-2 border border-slate-200 dark:border-[#21262d] rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-green-600 bg-slate-50 dark:bg-zinc-800/60 text-zinc-800 dark:text-zinc-100 transition-colors"
        >
          {isOwner && <option value={WorkspaceRole.EDITOR}>Editor</option>}
          <option value={WorkspaceRole.VIEWER}>Viewer</option>
        </select>
        <button
          type="submit"
          disabled={isPending}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer disabled:opacity-60 shrink-0"
        >
          {isPending ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Send className="w-3.5 h-3.5" />
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

      {/* Warning link copy */}
      {warning && (
        <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl">
          <p className="text-xs text-amber-700 dark:text-amber-300 font-bold mb-2">
            ⚠️ {warning.message}
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-xs bg-white dark:bg-zinc-900 border border-amber-200 dark:border-amber-800 rounded-lg p-1.5 text-zinc-700 dark:text-zinc-300 truncate">
              {warning.link}
            </code>
            <button
              type="button"
              onClick={() => onCopyLink(warning.link)}
              className="text-xs px-2.5 py-1.5 bg-amber-100 dark:bg-amber-900/60 hover:bg-amber-200 text-amber-800 dark:text-amber-200 rounded-lg font-bold whitespace-nowrap transition-colors cursor-pointer"
            >
              {copied ? `✓ ${t("members.copied")}` : t("members.copyLink")}
            </button>
          </div>
          <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1.5">
            {t("members.shareDesc")}
          </p>
        </div>
      )}
    </div>
  );
}
