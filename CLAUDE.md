# MoodSort

## Project Overview

AI-powered Spotify playlist organizer that clusters liked songs into mood-based playlists.

## Tech Stack

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- Supabase (Postgres + Auth)
- Spotify Web API
- Claude API (claude-sonnet-4-20250514)
- Trigger.dev (job scheduling)
- Resend (email)

## Key Conventions

- Use App Router, not Pages Router
- All components in src/components
- All API routes in src/app/api
- Use TypeScript strictly — no any types

## Critical — Always Flag

### Secrets & Credential Exposure

- No hardcoded API keys, tokens, secrets, or credentials anywhere in the codebase
- No secrets in comments, console.log, or error messages
- All secrets must come from environment variables
- `.env` must never be committed — verify `.gitignore` covers it
- No Supabase service role key exposed to the client side — only anon key
- No Anthropic API key exposed to the client side — Claude API calls must be server-only
- Spotify client secret must never appear in client-side code

### Authentication & Authorization

- Every API route must verify the user session before doing anything
- Never trust user-supplied IDs — always verify ownership against the authenticated user
- Supabase RLS policies must be present on every table that stores user data
- Never bypass RLS using the service role key unless absolutely necessary — flag if used
- OAuth tokens (Spotify) must be stored securely, never in localStorage or exposed in URLs

### Data Leakage

- API responses must never return data belonging to other users
- Error messages must not expose internal implementation details, stack traces, or DB schema
- No sensitive fields (tokens, hashes, internal IDs) in API responses unless required
- Logging must never include PII, tokens, or sensitive user data

## Security

### Input Validation & Sanitization

- All user inputs must be validated and sanitized before use
- Use Zod (or equivalent) for schema validation on all API route inputs
- Never pass raw user input into database queries — use parameterized queries
- Never pass raw user input into prompts sent to the Claude API (prompt injection risk)
- Any user-supplied content rendered as HTML must be sanitized to prevent XSS
- Validate and sanitize all query parameters and URL path segments

### Prompt Injection

- User-generated content must never be interpolated directly into Claude API prompts
- Wrap or delimit user content clearly in prompts (e.g. using XML tags or clear boundaries)
- System prompts must not be overridable by user input under any circumstances
- Flag any prompt construction that concatenates user data without sanitization

### Rate Limiting

- All public-facing API routes must have rate limiting applied
- Auth endpoints (login, signup, token refresh) must be rate limited aggressively
- Spotify and Claude API calls must be rate limited to avoid quota exhaustion
- Flag any route that makes external API calls without a guard against abuse

### CSRF & Request Validation

- Verify the `Origin` or `Referer` header on sensitive mutation endpoints
- Use proper CSRF protection on any form submissions or state-changing requests
- Ensure Supabase auth cookies are `HttpOnly` and `Secure`

## Data Protection

### Database

- Every table containing user data must have RLS enabled — flag any table without it
- Queries must be scoped to the authenticated user at all times
- No `SELECT *` on tables with sensitive columns — select only what's needed
- Sensitive data at rest (tokens, keys) should be encrypted where possible
- Flag any direct SQL that could be vulnerable to injection

### Spotify Tokens

- Access tokens and refresh tokens must be stored server-side only
- Tokens must be refreshed gracefully before expiry — flag missing refresh logic
- Revoke and delete tokens on user logout or account deletion

### User Data Lifecycle

- Deleting a user account must cascade and remove all associated data
- No orphaned records should remain after a user or resource is deleted

## Code Quality

### General

- No unused variables, imports, functions, or components — remove dead code
- No commented-out code left in — delete it or open a proper TODO
- No `console.log`, `console.error`, or debug statements left in production code
- No `any` type in TypeScript — flag and suggest proper types
- No `@ts-ignore` or `@ts-expect-error` without a clear justification in a comment
- Functions should do one thing — flag large functions that should be split
- Repeated logic should be extracted into a shared utility

### Next.js/React

- Server Components must be used by default — client components only when necessary
- Never fetch data in client components if it can be done server-side
- No sensitive logic or data fetching in client components
- API routes must explicitly declare supported HTTP methods and reject others
- `loading.tsx` and `error.tsx` should exist for routes that fetch data
- Images must use `next/image` — no raw `<img>` tags
- No inline styles unless absolutely necessary — use Tailwind classes

### TypeScript

- No implicit `any` — all function parameters and return types should be typed
- Shared types should live in a central `/types` or `/lib` directory, not duplicated
- Zod schemas should be the source of truth for API input types

### Error Handling

- All async functions must have proper error handling (`try/catch` or `.catch()`)
- Errors from external APIs (Spotify, Claude, Supabase) must be caught and handled gracefully
- User-facing errors should be generic — internal errors must be logged server-side only
- Never let an unhandled promise rejection reach production

### Performance

- No unnecessary re-renders — check `useEffect` dependencies are correct
- No blocking operations on the main thread
- External API calls should be parallelized with `Promise.all` where appropriate
- Flag any N+1 query patterns in database access

## Best Practices Checklist

- [ ] No secrets or credentials in code
- [ ] All API routes authenticate the user first
- [ ] All user inputs validated with Zod
- [ ] No raw user input in Claude prompts
- [ ] Rate limiting on all public routes
- [ ] RLS enabled on all Supabase tables
- [ ] No unused code, imports, or console logs
- [ ] TypeScript types are explicit — no `any`
- [ ] Errors are caught and handled gracefully
- [ ] Spotify tokens handled server-side only
- [ ] No data from other users returned in responses
- [ ] Dead code and stale TODOs cleaned up
