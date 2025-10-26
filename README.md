## Convex + Next.js Playground

This is a small but complete sample that demonstrates a clean pattern for:

- Convex data modeling, queries, and mutations
- Client/server validation with helpful error propagation into React Hook Form
- Next.js App Router admin UI with a consistent layout, sidebar, and theming

Use this repo to learn the patterns or as a starting point for small CRUD apps.

### Tech stack

- Next.js App Router (React 19)
- Convex backend (database + server functions)
- Tailwind CSS v4 + a small UI kit (buttons, inputs, table, dropdowns)
- React Hook Form
- Vitest + Testing Library

---

## Quick start

Prerequisites: Node 18+ and a Convex project (created automatically on first run).

1) Install dependencies and start the dev servers:

```bash
npm install
npm run dev
```

The `dev` script runs Next.js and Convex in parallel. A `predev` hook starts `convex dev --until-success` and opens the Convex dashboard.

2) Open the app: `http://localhost:3000`

3) Environment variable

The Convex client reads `NEXT_PUBLIC_CONVEX_URL`. In dev, `convex dev` writes this value for you. For production, set it manually in your hosting provider.

- Client provider: `lib/ConvexClientProvider.tsx`

```ts
const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
```

---

## Project structure (selected)

- `convex/schema.ts`: Convex data model and indexes, plus a small helper.
- `convex/admin/sets.ts`: Public queries/mutations for the "Sets" resource.
- `app/layout.tsx`: Root providers (Theme + Convex client).
- `app/admin/layout.tsx`: Admin shell (sidebar, header, toasts).
- `app/admin/sets/page.tsx`: List view.
- `app/admin/sets/new/page.tsx`: Create view.
- `app/admin/sets/[id]/edit/page.tsx`: Edit view.
- `app/admin/sets/_lib/form.tsx`: React Hook Form-driven form for create/update.
- `lib/validation/validation.ts`: Primitive validation helpers.
- `lib/validation/sets.ts`: Client-side validation for the Set form.
- `lib/rhf.ts`: Helpers to convert values and map server errors to RHF.
- `lib/ui/*`: Small UI primitives used by the admin area.

---

## Data model

- Table: `sets`
- Schema: `convex/schema.ts`
- Index: `by_uniqueNumber` on `uniqueNumber`

The schema ensures field types at the database layer. A small helper converts `null` values from forms into `undefined` for Convex `patch`/`insert` compatibility:

- Helper: `toDatabase` in `convex/schema.ts`

---

## Validation

- Client validation can be found in `lib/validation/sets.ts` (with primitives in `lib/validation/validation.ts`). This validates inputs early and provides friendly messages.
- Server validation can be found in `convex/admin/sets.ts` inside `serverValidateSet` and the Convex arg validators. This re-validates and also enforces uniqueness at the database level.

Why both? Client validation improves UX; server validation is the source of truth and adds checks that require the DB (like uniqueness via the `by_uniqueNumber` index).

---

## Forms and error handling

- Form: `app/admin/sets/_lib/form.tsx` uses React Hook Form.
- Resolver: Calls `validateSet` to synchronously validate on the client.
- Submit: Converts strings → numbers/nulls via `fromFormValues` from `lib/rhf.ts`, calls a Convex mutation, then maps returned field errors to RHF using `toFieldErrors`.

Helpers:

- `lib/rhf.ts` → `fromFormValues`, `toFormValues`, `toFieldErrors`

---

## Backend API (Convex)

File: `convex/admin/sets.ts`

- `list` (query): returns all `sets` documents
- `get` (query): returns a single set by id (or `null`)
- `create` (mutation): validates, enforces uniqueness, inserts, returns `{ ok, id } | { ok: false, errors }`
- `update` (mutation): validates, uniqueness (excluding self), patches, returns `{ ok, id } | { ok: false, errors }`
- `remove` (mutation): deletes a document

All functions use Convex validators for both `args` and `returns` and follow the new function syntax.

---

## Admin UI flow

- `app/admin/page.tsx` redirects to `/admin/sets`.
- `app/admin/sets/page.tsx` lists sets and provides contextual actions (edit, delete).
- `app/admin/sets/new/page.tsx` renders the form in create mode.
- `app/admin/sets/[id]/edit/page.tsx` renders the form in edit mode, loading initial values via a Convex query.

Layout and chrome:

- Sidebar: `app/admin/_lib/admin-sidebar.tsx`
- Header and dynamic title: `app/admin/_lib/header.tsx`
- Toasts: `lib/ui/admin/sonner.tsx`

Providers:

- Root providers are set in `app/layout.tsx`: `ThemeProvider` from `lib/ThemeProvider.tsx` and `ConvexClientProvider` from `lib/ConvexClientProvider.tsx`.

---

## Scripts

Defined in `package.json`:

- `dev`: run Next.js and Convex together
- `build`: Next.js build
- `start`: Next.js start
- `lint`: Next.js/ESLint
- `test`: Vitest in watch mode
- `test:run`: Vitest once
- `test:coverage`: Vitest with coverage (output in `coverage/`)

---

## Testing

Run tests:

```bash
npm run test
```

Notable tests:

- Convex functions: `convex/admin/sets.test.ts`
- Client validation: `lib/validation/sets.test.ts`
- Validation primitives: `lib/validation/validation.test.ts`
- RHF utilities: `lib/rhf.test.ts`

Coverage reports are written to `coverage/` when running `test:coverage`.

---

## Conventions and patterns

- Use Convex validators for both `args` and `returns` in all queries/mutations.
- Keep client and server validation in sync; client is for UX, server is the authority.
- Convert form values at the boundary (`fromFormValues` on submit, `toFormValues` when loading).
- Convert `null`→`undefined` before `patch`/`insert` (`toDatabase` helper).
- Keep UI elements in `lib/ui/*` small and composable.

---

## Useful links

- Convex docs: https://docs.convex.dev
- Next.js docs: https://nextjs.org/docs
- React Hook Form: https://react-hook-form.com
- Vitest: https://vitest.dev

If you have questions or ideas, open an issue or reach out on the Convex Discord.
