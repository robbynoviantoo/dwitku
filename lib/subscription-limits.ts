// ─── Subscription Limits Definition ─────────────────────────────────────────

export type PlanKey = "free" | "basic" | "pro";

export interface PlanLimits {
  maxWorkspaces: number;    // -1 = unlimited
  maxMembers: number;       // -1 = unlimited
  maxTx: number;            // -1 = unlimited
  maxCategories: number;    // custom categories; -1 = unlimited
  canExport: boolean;
  canReport: boolean;
  canBudget: boolean;
  trialDays: number;
  priceMonthly: number;
  name: string;
  displayName: string;
}

export const PLAN_LIMITS: Record<PlanKey, PlanLimits> = {
  free: {
    name: "free",
    displayName: "Gratis",
    maxWorkspaces: 2,
    maxMembers: 5,
    maxTx: 200,
    maxCategories: 1,
    canExport: false,
    canReport: false,
    canBudget: false,
    trialDays: 0,
    priceMonthly: 0,
  },
  basic: {
    name: "basic",
    displayName: "Basic",
    maxWorkspaces: 5,
    maxMembers: -1,
    maxTx: -1,
    maxCategories: -1,
    canExport: true,
    canReport: true,
    canBudget: false,
    trialDays: 7,
    priceMonthly: 25000,
  },
  pro: {
    name: "pro",
    displayName: "Pro",
    maxWorkspaces: -1,
    maxMembers: -1,
    maxTx: -1,
    maxCategories: -1,
    canExport: true,
    canReport: true,
    canBudget: true,
    trialDays: 7,
    priceMonthly: 49000,
  },
};

export function isUnlimited(val: number): boolean {
  return val === -1;
}

export function isWithinLimit(current: number, max: number): boolean {
  if (isUnlimited(max)) return true;
  return current < max;
}

export function getPlanKey(planKey: string | null | undefined): PlanKey {
  if (planKey === "basic" || planKey === "pro") return planKey;
  return "free";
}
