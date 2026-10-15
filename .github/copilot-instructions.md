# EventBook — Copilot Instructions

## Project requirements
Build EventBook, a mini event booking application for a technical assessment.

- Frontend: Next.js App Router, TypeScript and Tailwind CSS.
- Backend: separate Express REST API using TypeScript.
- Database: Supabase PostgreSQL accessed only by the backend using Prisma ORM.
- Frontend must not use Supabase queries, Next.js API routes or server actions as the backend.
- Authentication must use our own backend with securely hashed passwords. Do not use Supabase Auth.
- Admin accounts are created only through a seed script.

## Engineering rules
- Follow the existing project structure and established conventions.
- Prefer simple, readable code over abstractions or unnecessary dependencies.
- Validate all external input on the server using Zod.
- Use parameterized database queries through the ORM.
- Keep secrets in environment variables. Never commit `.env` files or expose database credentials.
- Use consistent JSON response and error formats.
- Implement real backend authorization; never rely on frontend role checks for security.
- Prevent duplicate active bookings and overbooking using database constraints and atomic transactions.
- Reject booking or cancellation when the event has already started.
- Store passwords using bcrypt or another appropriate password-hashing algorithm; never store plaintext passwords.
- Protect authentication cookies with HttpOnly, Secure in production, and an appropriate SameSite policy.
- Validate authentication and authorization on every protected backend endpoint.
- Never trust a user ID or role supplied by the client when determining the authenticated user's identity or permissions.
- Use server-side pagination and search.
- Add automated backend tests for critical business rules.
- Provide loading, error, empty and success states in the frontend.
- Do not leave unused files, dead code, placeholder features or commented-out implementations.

## Working method
- Work on one clearly scoped task at a time.
- Inspect relevant existing files before editing.
- Explain the intended changes and dependencies before implementation.
- Run relevant type checks, tests and builds after changes.
- Fix errors before declaring a task complete.
- Do not silently skip requirements or replace real functionality with mock data.
- Ask before making destructive changes or introducing a major dependency.
- Never claim a test, build or deployment succeeded unless it actually did.
- Explain important implementation choices and security implications so the developer can understand and defend the code.