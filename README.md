# MediConnect

Modern healthcare web app for finding doctors, booking appointments, managing health metrics, and purchasing medicines/lab tests.

## Tech Stack

- Vite + React + TypeScript
- React Router
- shadcn-ui + Tailwind CSS
- TanStack Query
- Supabase (auth + data)

## Quick Start

1. Prerequisites: Node.js 18+ and npm
2. Install dependencies:
   ```sh
   npm ci
   ```
3. Start dev server:
   ```sh
   npm run dev
   ```
4. Open http://localhost:8080

## Environment Variables

Create `.env` in the project root (do not commit secrets):

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Scripts

- `npm run dev` – start the dev server
- `npm run build` – production build
- `npm run preview` – preview the production build
- `npm run lint` – run eslint

## Project Structure

- `src/pages` – routed pages (Home, Search, Profile, Dashboards, etc.)
- `src/components` – UI and feature components
- `src/services` – API/email services
- `src/integrations/supabase` – Supabase client and types
- `supabase/` – edge functions and SQL migrations

## Deployment

Any static host that supports SPA routing works (e.g., Netlify, Vercel, Cloudflare Pages). Build and deploy the `dist/` directory.

```
npm run build
```

## Performance Notes

- Route-based code splitting enabled via `React.lazy`
- Vendor chunking and modern build target configured in `vite.config.ts`
- React Query defaults tuned to reduce refetching

## License

MIT
