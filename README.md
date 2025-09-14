# Logistics Web (Next.js)

A Next.js port of the Flutter Logistics app, reusing the same Supabase backend, with UI borrowed from the Flutter homepage across flows.

## Setup

1. Copy `.env.example` to `.env.local` and fill:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

2. Install deps and run:

```bash
# PowerShell
npm install
npm run dev
```

The app lives in `web-next/` and mirrors key flows:
- `/` role selector (Admin / Client/Driver / Other Admin)
- `/auth/login`, `/auth/register`
- `/client` dashboard, `/client/new`, `/client/orders`
- `/driver` dashboard
- `/admin` dashboard (requires role in JWT)

RLS/Policies: We rely on existing policies in `supabase/migrations/`.

## Notes
- Auth role routing mirrors Flutter `AuthService.getUserRoleFromJWT`.
- Queries use the same tables: `users`, `consignments`.
- Add more pages for chat, fuel cards, etc., following the same pattern.
