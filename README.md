# EventBook

EventBook is a small event booking application with a Next.js frontend and a
separate Express API. Visitors can browse events, registered users can book
events and manage their bookings, and administrators can manage events and
view the users booked for an event.

## Contents

- [Project overview](#project-overview)
- [Live links](#live-links)
- [Assessment accounts](#assessment-accounts)
- [Tech stack and why](#tech-stack-and-why)
- [Run locally](#run-locally)
- [Seed and test commands](#seed-and-test-commands)
- [Data model](#data-model)
- [API endpoints](#api-endpoints)
- [Decisions and trade-offs](#decisions-and-trade-offs)
- [AI usage](#ai-usage)
- [Known issues and next steps](#known-issues-and-next-steps)

## Project overview

The repository contains two applications:

- `frontend/`: the EventBook web interface.
- `backend/`: the Express REST API and database layer.


## Live links

- Frontend: [https://eventbook-zeta.vercel.app/](https://eventbook-zeta.vercel.app/)
- Backend: [https://eventbook-sb.onrender.com](https://eventbook-sb.onrender.com/api/health)

## Test accounts

| Role         | Login email              | Password                  |
| ------------ | ------------------------ | ------------------------- |
| Admin        | `admin.seed@example.com` | `EventBook-Dev-Only-123!` |
| Regular user | `user.seed@example.com`  | `EventBook-Dev-Only-123!` |

The seed script stores password hashes using bcrypt. It does not store these
passwords as plaintext in the database.

## Tech stack and why

### Frontend

- **Next.js**: provides the page structure and
  client-side interactive screens.
- **React and TypeScript**: provides typed components and stateful UI
  behavior.
- **Tailwind CSS**: provides utility classes for consistent, responsive styling.
- **Axios**: provides a configured API client for communicating with the backend
- **react-hot-toast**: displays success and error notifications for actions
  such as login, booking, cancellation, and event management.

### Backend

- **Express**: handles HTTP requests and provides the REST API, routing, and middleware.
- **TypeScript**: keeps handlers, middleware, and application configuration
  typed.
- **Zod**: validates incoming request data, including registration, login, booking, and event requests.
- **Helmet, CORS, and cookie-parser**: provide common HTTP security headers,
  cross-origin cookie support, and request cookie parsing.
- **bcrypt**: hashes passwords before they are stored.
- **jsonwebtoken**: signs and verifies JWTs used for authentication.

### Database and ORM

- **PostgreSQL**: stores application data, including users, events, and bookings, with support for relational constraints.
- **Prisma**: provides a type-safe database client, schema-based data modeling, and database migrations.

## Run locally

### Prerequisites

- Node.js with npm.
- A running PostgreSQL database.
- Git, if cloning the repository.

### 1. Clone the repository

```bash
git clone https://github.com/jatisusan/eventbook.git
cd eventbook
```

### 2. Install dependencies

Install each application separately:

```bash
cd backend
npm install

cd ../frontend
npm install
```

### 3. Configure environment variables

Create `backend/.env` from `backend/.env.example`:

```bash
cd backend
copy .env.example .env
```

On macOS or Linux, use:

```bash
cp .env.example .env
```

Configure the following variables in backend/.env, using your own database connection details and a strong, randomly generated JWT secret:

```dotenv
PORT=
CORS_ORIGIN=
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE"
JWT_SECRET=
```

The backend defaults to port 4000 if PORT is not set. The configured CORS origin should match the frontend's local address.

Create frontend/.env.local with the backend API URL:

```dotenv
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

Adjust the port if your backend is configured to use a different one.

### 4. Apply migrations and generate Prisma Client

Run these commands from `backend/`:

```bash
npm run prisma:generate
npx prisma migrate deploy
```

The Prisma configuration reads `DATABASE_URL`, uses
`prisma/schema.prisma`, and stores migrations under
`backend/prisma/migrations`.

### 5. Seed the database

Run from `backend/`:

```bash
npm run prisma:seed
```

The seed resets the users, events, and bookings tables, creates the two
assessment accounts, creates six sample events, and creates one confirmed
booking.

### 6. Start the applications

Use two terminals.

Terminal 1, from `backend/`:

```bash
npm run dev
```

Terminal 2, from `frontend/`:

```bash
npm run dev
```

The frontend is should be available at
[http://localhost:3000](http://localhost:3000). The backend API base URL is [http://localhost:5000/api](http://localhost:5000/api) and the health endpoint is
[http://localhost:5000/api/health](http://localhost:5000/api/health), assuming the backend is configured to use port 5000.

## Seed and test commands

### Backend commands

Run these from `backend/`:

| Command                   | Purpose                                                     |
| ------------------------- | ----------------------------------------------------------- |
| `npm run dev`             | Start the API with `tsx watch`.                             |
| `npm run build`           | Compile the backend TypeScript using `tsconfig.build.json`. |
| `npm start`               | Start the compiled backend from `dist/server.js`.           |
| `npm run typecheck`       | Check TypeScript types without generating output files.     |
| `npm run prisma:generate` | Generate Prisma Client.                                     |
| `npm run prisma:seed`     | Run the configured `tsx prisma/seed.ts` seed script.        |
| `npm test`                | Run the Vitest test suite once.                             |

The backend currently has two automated tests in one test file: one checks the health endpoint, and the other verifies that invalid registration input is rejected.

### Frontend commands

Run these from `frontend/`:

| Command         | Purpose                               |
| --------------- | ------------------------------------- |
| `npm run dev`   | Start the Next.js development server. |
| `npm run build` | Create a production build.            |
| `npm start`     | Start the built Next.js application.  |
| `npm run lint`  | Run ESLint.                           |

## Data model

The Prisma schema contains three models and two enums.

### `User`

Represents an account that can log in and make bookings.

- `id`: UUID primary key.
- `name`, `email`: user details; `email` is unique.
- `passwordHash`: bcrypt password hash.
- `role`: `USER` or `ADMIN`, defaulting to `USER`.
- `createdAt` and `updatedAt`: timestamps.
- `bookings`: one user can have many bookings.

### `Event`

Represents an event that can be booked.

- `id`: UUID primary key.
- `title`, `description`, and `venue`: event information.
- `startsAt`: event start date and time.
- `totalSeats`: maximum capacity.
- `createdAt` and `updatedAt`: timestamps.
- `bookings`: one event can have many bookings.

There is an index on `startsAt` because event lists are ordered by event start
time.

### `Booking`

Connects a user to an event.

- `id`: UUID primary key.
- `userId` and `eventId`: foreign keys.
- `status`: `CONFIRMED` or `CANCELLED`, defaulting to `CONFIRMED`.
- `createdAt`: booking creation time.
- `cancelledAt`: optional cancellation time.

Bookings have many-to-one relations to both `User` and `Event`. Both foreign
keys use `ON DELETE RESTRICT`, so an event or user with related bookings cannot
be removed accidentally. A partial unique index allows only one `CONFIRMED`
booking for the same user and event while still allowing a cancelled booking
to remain in the history.

## API endpoints

The API is mounted under `/api`.

### Health

| Method | Path          | Purpose                        | Access |
| ------ | ------------- | ------------------------------ | ------ |
| `GET`  | `/api/health` | Check that the API is running. | Public |

### Authentication

| Method | Path                 | Purpose                                      | Access        |
| ------ | -------------------- | -------------------------------------------- | ------------- |
| `POST` | `/api/auth/register` | Create a regular user account.               | Public        |
| `POST` | `/api/auth/login`    | Validate credentials and set the JWT cookie. | Public        |
| `GET`  | `/api/auth/me`       | Return the currently authenticated user.     | Authenticated |
| `POST` | `/api/auth/logout`   | Clear the authentication cookie.             | Public        |

### Events

| Method   | Path                       | Purpose                                                                                                                     | Access              |
| -------- | -------------------------- | --------------------------------------------------------------------------------------------------------------------------- | ------------------- |
| `GET`    | `/api/events`              | List events with optional `page`, `limit`, and `search` query parameters. Also returns `seatsLeft` and pagination metadata. | Public              |
| `GET`    | `/api/events/:id`          | Return one event and its details.                                                                                           | Public              |
| `GET`    | `/api/events/:id/bookings` | List the users booked for an event.                                                                                         | Authenticated admin |
| `POST`   | `/api/events`              | Create an event.                                                                                                            | Authenticated admin |
| `PATCH`  | `/api/events/:id`          | Update an event.                                                                                                            | Authenticated admin |
| `DELETE` | `/api/events/:id`          | Delete an event.                                                                                                            | Authenticated admin |

The event list defaults to page `1` and limit `3`.

### Bookings

| Method  | Path                       | Purpose                                            | Access              |
| ------- | -------------------------- | -------------------------------------------------- | ------------------- |
| `GET`   | `/api/bookings`            | List bookings belonging to the authenticated user. | Authenticated       |
| `POST`  | `/api/bookings`            | Create a booking for an event.                     | Authenticated       |
| `PATCH` | `/api/bookings/:id/cancel` | Cancel the authenticated user's booking.           | Authenticated owner |

## Decisions and trade-offs

### Seat availability and capacity

The event list calculates `seatsLeft` as `totalSeats` minus the number of
`CONFIRMED` bookings. Cancelled bookings do not consume capacity. This keeps
availability derived from booking data instead of storing a second mutable
counter.

### Booking creation and concurrency

Booking creation runs inside a Prisma transaction. It locks the event row,
checks that the event exists and has not started, checks for an existing active
booking, counts confirmed bookings, and then creates the booking. The database
partial unique index is an additional protection against duplicate active
bookings for the same user and event.

The current capacity check and row lock protect the booking path against the
known concurrent booking case.

### Cancellation

Users can cancel only their own confirmed booking, and only before the event
starts. Cancellation updates the booking to `CANCELLED` and records
`cancelledAt`, so booking history is retained rather than deleted.

### Validation and errors

Zod validates request bodies for registration, login, booking creation, and
event creation or updates. Validation failures use a `400` response with
`success: false`, a message, and field-level errors. Authentication failures
use `401`, authorization failures use `403`, and route or database failures
are passed to the shared Express error handler.

The event pagination and search query values are read directly in the event
handler. A future improvement would be to validate query parameters with the
same structured approach used for request bodies.

### Authentication and authorization

Passwords are hashed with bcrypt. Login creates a JWT containing the user ID
and role, stored in an HTTP-only cookie.

The frontend hides or redirects protected screens based on `useAuth()`, but
the backend middleware is the security boundary. Admin event operations also
require the `ADMIN` role on the backend.

### Event deletion

Admin deletion uses the existing database relation restrictions. An event with
bookings cannot be deleted; the backend returns a conflict instead of
removing booking history.

## AI usage

GitHub Copilot was used as a development assistant throughout the project.
It helped inspect the repository and implement or review focused changes
across the EventBook frontend and backend, including booking screens, forms ui, pagination, and search.

All AI-assisted changes were reviewed by me and I remain responsible for reviewing the generated changes, understanding the implementation, running the checks, and verifying the
application behavior.

## Known issues and next steps

### Confirmed limitations

- The frontend could benefit from further UI and user-experience refinements.
- The frontend has no automated test script in `package.json`.
- The backend tests currently cover the health endpoint and invalid
  registration input, but do not cover all booking, authorization, pagination,
  or event-management paths.
- Event query parameters are not validated with a Zod query schema.

### Suggested next steps

- Improve the frontend UI with better styling, layout, and user experience.
- Add frontend and backend tests for all major workflows, including booking, cancellation, and event management.
