# Convex + Next.js Playground

This is a small but complete sample that demonstrates a clean pattern for

- Convex data modeling, queries, and mutations
- Client/server validation with helpful error propagation into React Hook Form
- Simple CRUD applications.

I created this small project to use the findings and utilities into bigger projects.

## Quick start

1. Install dependencies and start the dev servers:

```bash
npm install
```

2. Run the dev server (will initialize the Convex project).

```bash
npm run dev
```

3. Open the app: `http://localhost:3000`

## Data model

This project defines one and only one table, called sets, which has 5 fields:

- `name`: mandatory name for the set.
- `mandatoryNumber`: a mandatory number.
- `uniqueNumber`: a mandatory number that must also be unique.
- `optionalNumber`: an optional number, it can also be missing or be blank.
- `optionalPositiveNumber`: same as above, but if present, must be positive.

## Project structure (selected)

- `convex/`
  - [`schema.ts`](convex/schema.ts): Convex data model and the `toDatabase` helper.
  - [`admin/sets.ts`](convex/admin/sets.ts): Public queries/mutations for the Sets resource.
- `app/admin/sets/`
  - [`page.tsx`](app/admin/sets/page.tsx): List all sets.
  - [`new/page.tsx`](app/admin/sets/new/page.tsx): Create a new set.
  - [`[id]/edit/page.tsx`](app/admin/sets/%5Bid%5D/edit/page.tsx): Edit an existing set.
  - [`_lib/form.tsx`](app/admin/sets/_lib/form.tsx): React Hook Form-driven form for create/update sets.
- `lib/`
  - [`rhf.ts`](lib/rhf.ts): React Hook Form utilities, generic for all forms.
  - `validation/`
    - [`sets.ts`](lib/validation/sets.ts): Client and server set validation functions.
    - [`validation.ts`](lib/validation/validation.ts): Validation utilities, generic for all models.

## Problems or surprises

### [`valuesFromFormToApi`](lib/rhf.ts#L36) and [`valuesFromApiToForm`](lib/rhf.ts#L60)

These two functions in [`lib/rhf.ts`](lib/rhf.ts) are quite complicated, specially their
types and all they really do is convert between `null` and `""` for blank
fields.

In React Hook Form, `undefined` and `null` are not valid `defaultValues` or
`values`, and blanks are expressed as `""`. Actually if you set `undefined`
it makes the input uncontrolled.

That last generates a weird bug in that if an optional number has a `value` of
123 and you delete it, once you delete the last digit, if you convert `""` to
`undefined`, it restores the 123.

### [`valuesFromApiToDatabase`](convex/schema.ts#L21)

In [`convex/schema.ts`](convex/schema.ts) there's a function called [`valuesFromApiToDatabase`](convex/schema.ts#L21) and
it exists only because the Convex API ignores `undefined`, so I have to send
blanks as `nulls`, but `db.patch` can't accept `nulls`, only `undefined`.

This means that the life of a blank field is:

1. Starts as `""` in a form.
2. Gets converted to `null` for the sake of the Convex HTTP API
3. Gets converted to `undefined` for the sake of `db.patch` (and `db.insert`
   accepts them).
4. Get delivered as `undefined` to the client when read.

### `SetApi`, `SetFormValues` and `SetValues`

These are three types that represent a set and they are essentially the same.
They exist because `SetApi` uses `null`, for the API, `SetFormValues` uses `""`
for the form, and `SetValues` accepts **all** of them, for validation. They are
in:

- `SetApi`: [`lib/validation/sets.ts`](lib/validation/sets.ts)
- `SetValues`: [`lib/validation/sets.ts`](lib/validation/sets.ts)
- `SetFormValues`: [`app/admin/sets/_lib/form.tsx`](app/admin/sets/_lib/form.tsx) (no need for this to ever be
  seen by the server).
