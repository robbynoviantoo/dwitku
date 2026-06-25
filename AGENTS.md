# Repository Guidelines

## Project Overview
- Dwitku is a collaborative finance tracking app built with Next.js App Router, TypeScript, Prisma, Neon Postgres, Auth.js/NextAuth v5, Tailwind CSS v4, Radix UI, TanStack Query/Table, and Zod.
- Treat this repository as an existing product: keep changes focused, minimal, and consistent with current patterns.
- `PLANNING.md` is the product roadmap and feature checklist. Check it when work touches product scope or unfinished phases.

## Common Commands
- `npm run dev` starts the local Next.js development server.
- `npm run build` builds the app for production.
- `npm run lint` runs ESLint.
- `npm run db:generate` regenerates Prisma Client after schema changes.
- `npm run db:migrate` creates/applies local Prisma migrations.
- `npm run db:seed` seeds default data.
- `npm run db:studio` opens Prisma Studio.

## Code Style
- Use TypeScript and React functional components.
- Follow the existing App Router conventions under `app/`.
- Prefer server actions for mutations where the project already uses actions under `app/actions/`.
- Keep client components explicit with `"use client"` only when browser APIs, state, effects, or interactive handlers are needed.
- Use existing shared utilities from `lib/` before adding new helpers.
- Use existing UI primitives/components from `components/` before creating new ones.
- Keep naming descriptive; avoid one-letter variables.
- Avoid adding inline comments unless they clarify non-obvious business logic.

## Styling and UI
- Use Tailwind CSS classes and the project’s existing component patterns.
- Prefer Radix UI primitives for accessible dialogs, dropdowns, popovers, tabs, selects, switches, and related UI.
- Use `lucide-react` for icons.
- Preserve responsive behavior and dark/light theme compatibility when editing UI.

## Data and Validation
- Prisma schema lives in `prisma/schema.prisma`.
- After Prisma schema changes, run `npm run db:generate`; use migrations only when an actual database schema change is intended.
- Validate user input with Zod where forms/actions accept external input.
- Respect workspace membership and roles (`OWNER`, `EDITOR`, `VIEWER`) for authorization-sensitive changes.
- Do not expose secrets from `.env` or hardcode credentials.

## Neon Postgres Notes
- This project uses Neon Serverless Postgres with Prisma.
- For Neon-specific work, consult `.agents/skills/neon-postgres/SKILL.md` and follow the guidance there.
- Be careful with connection strings and pooled vs direct URLs; do not print secrets in logs or responses.

## Testing and Verification
- Prefer targeted validation first, then broader checks when appropriate.
- Run `npm run lint` after code changes when practical.
- Run `npm run build` for changes that affect routing, server/client boundaries, auth, Prisma, or Next.js config.
- Do not fix unrelated lint/build issues unless they block the requested task; report them separately.

## File Organization
- Dashboard routes live under `app/(dashboard)/`.
- Auth routes live under `app/(auth)/`.
- Server actions live under `app/actions/`.
- Reusable components live under `components/`.
- Hooks live under `hooks/`.
- Shared libraries and utilities live under `lib/`.
- Generated files and dependencies should not be edited manually unless explicitly required.

## Agent Behavior
- Before editing, inspect nearby files and follow their style.
- Make the smallest safe change that solves the request.
- Do not create commits or branches unless explicitly asked.
- Do not modify `node_modules/`, `.next/`, generated build artifacts, or lockfiles unless the task requires dependency changes.
- If a task needs credentials, migrations against a real database, or destructive operations, explain the requirement and ask before proceeding.
