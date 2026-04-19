# Organizations

`organizations` is an Expo + React Native app backed by InstantDB. Right now it covers a small shared-state flow:

- sign in with Instant magic-code auth
- create an organization or join one with an invite code
- sync a shared organization color preference in real time

## Run It

1. Copy `.env.example` to `.env`
2. Fill in `EXPO_PUBLIC_INSTANT_APP_ID`
3. Install dependencies with `bun install`
4. Start Expo with `bun run start`

If you plan to use the Instant CLI for schema or permission changes, also set `INSTANT_APP_ADMIN_TOKEN`.

## Useful Commands

```bash
bun run start
bun run ios
bun run android
bun run web
bun run lint
```

## Instant Files

- `lib/db.ts`: Instant client initialization
- `instant.schema.ts`: app schema
- `instant.perms.ts`: permission rules
- `app/index.tsx`: current app flow and UI

## Current Data Model

The app currently uses:

- `$users`
- `organizations`
- `colors`

Users belong to an organization, and each organization has a shared color record that updates the UI for everyone in that organization.

## Migrating an existing Instant app (from “households”)

If this codebase previously used `households`, `householdMembers`, and `householdColors`, push schema renames before relying on the new names (see [Instant CLI — renames](https://instantdb.com/docs/cli.md)). Example (adjust to match your prior names):

```bash
npx instant-cli push schema --rename 'households:organizations householdMembers:organizationMembers householdColors:organizationColors' --yes
```

Then push permissions:

```bash
npx instant-cli push perms --yes
```

## Notes

- This repo uses Expo Router as the app entrypoint.
- This project uses Bun as its package manager and script runner.
- The current experience is centered in `app/index.tsx`; there are not many screens yet.
- Permissions allow signed-in users to create organizations, join by organization code, and read or update colors only for their own organization.
