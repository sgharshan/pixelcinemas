# Pixel Cinemas Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an assessment-ready full-stack cinema booking system with secure customer/admin flows, MongoDB persistence, live Socket.IO seat locks, and an approximate view-from-seat preview.

**Architecture:** A React/Vite single-page client communicates with one modular Express server over REST and Socket.IO. The server is authoritative for authentication, pricing, seat availability and booking state; MongoDB persists users, movies, screenings and bookings. Docker Compose runs the client, server and database as separate services.

**Tech Stack:** JavaScript, React, Vite, React Router, Express, Mongoose, Socket.IO, JWT, bcrypt, Zod, Jest/Supertest, Vitest/React Testing Library, Playwright, ESLint, Docker Compose, GitHub Actions.

**Spec:** `docs/superpowers/specs/2026-11-24-pixel-cinemas-design.md`

## Global Constraints

- Use client-side JavaScript with React and server-side JavaScript with Node.js/Express.
- MongoDB is the only persistent database; the client accesses data only through server APIs.
- The browser must never determine final pricing, authentication authority or seat availability.
- Socket.IO must visibly synchronize seat holds/bookings between multiple clients.
- `client`, `server` and `mongo` must run as separate Docker Compose services.
- Movie, Screening and Booking require complete CRUD-capable APIs; destructive UI actions require confirmation.
- Passwords are bcrypt hashes; administrator APIs require an authenticated `admin` role.
- Every behavioural production change follows red-green-refactor and has an automated test.
- UI uses original Pixel Cinemas branding and local/original placeholder assets, not Vue assets or branding.
- Accessibility: keyboard-reachable controls, visible focus, semantic labels, status text in addition to colour, and responsive layouts.
- Evidence files must describe only behaviour that exists and has been freshly verified.

## Planned file structure

```text
pixel-cinemas/
├── client/
│   ├── src/
│   │   ├── api/                  # HTTP client modules
│   │   ├── app/                  # router and providers
│   │   ├── assets/               # original logo/poster placeholders
│   │   ├── components/           # shared presentation components
│   │   ├── features/
│   │   │   ├── auth/
│   │   │   ├── bookings/
│   │   │   ├── movies/
│   │   │   ├── screenings/
│   │   │   ├── seats/
│   │   │   └── admin/
│   │   ├── pages/                # route-level compositions
│   │   ├── styles/               # tokens, base, layout and feature CSS
│   │   └── test/                 # test setup and factories
│   └── e2e/                      # Playwright customer/admin flows
├── server/
│   └── src/
│       ├── config/               # environment and database
│       ├── middleware/           # auth, validation and errors
│       ├── models/               # Mongoose schemas
│       ├── modules/              # auth, movies, screenings, bookings
│       ├── seats/                # layout, pricing, view and hold services
│       ├── sockets/              # Socket.IO registration
│       ├── app.js                # Express composition
│       └── server.js             # HTTP/Socket.IO process entry
├── docs/
│   ├── diagrams/                 # Mermaid architecture/data/sequence diagrams
│   ├── evidence/                 # test plan, UAT and screenshot checklist
│   └── superpowers/              # approved design and implementation plan
├── scripts/                      # database seed command
├── docker-compose.yml
├── package.json                  # npm workspaces and aggregate commands
└── .github/workflows/ci.yml
```

## Review Focus

1. Two customers request the same seat nearly simultaneously: exactly one hold/booking succeeds and the other receives `409 SEAT_UNAVAILABLE`.
2. A hold expires or the socket reconnects: the server releases it and every client refreshes to the authoritative state.
3. A customer tampers with seat type or total price: the server ignores submitted prices and calculates the stored total from the screening.
4. An unauthenticated/customer user calls administrator APIs: the server returns `401`/`403` without leaking protected data.
5. Screening time crosses the cancellation boundary: past/cancelled screenings reject bookings and ineligible bookings cannot be cancelled.

---

### Task 1: Workspace, health endpoint and branded application shell

**Files:**
- Create: `package.json`, `.gitignore`, `.env.example`, `README.md`
- Create: `client/package.json`, `client/vite.config.js`, `client/eslint.config.js`, `client/index.html`
- Create: `client/src/main.jsx`, `client/src/app/App.jsx`, `client/src/styles/tokens.css`, `client/src/styles/base.css`
- Create: `client/src/assets/pixel-cinemas-mark.svg`
- Create: `server/package.json`, `server/src/app.js`, `server/src/server.js`, `server/src/config/env.js`
- Create: `server/tests/health.test.js`, `client/src/app/App.test.jsx`, `client/src/test/setup.js`

**Interfaces:**
- Produces: `createApp(): Express`, `GET /api/health -> { status: "ok" }`, root npm scripts `dev`, `test`, `lint`, `build`.

- [ ] **Step 1: Write failing server and client smoke tests**

  `health.test.js` expects status `200` and body `{ status: 'ok' }`. `App.test.jsx` expects the Pixel Cinemas brand and primary navigation to be accessible by role.

- [ ] **Step 2: Verify red**

  Run: `npm test --workspace server -- health.test.js` and `npm test --workspace client -- App.test.jsx`
  Expected: FAIL because packages and application modules do not exist.

- [ ] **Step 3: Scaffold the smallest working workspace**

  Configure npm workspaces, Vite, React Router-ready shell, Jest/Supertest, Vitest/RTL and ESLint. Implement only the health route and static header shell using the approved black/charcoal/amber tokens.

- [ ] **Step 4: Verify green and build**

  Run: `npm test`, `npm run lint`, `npm run build`
  Expected: both smoke tests pass; lint and production client build exit `0`.

- [ ] **Step 5: Commit checkpoint**

  `git commit -m "chore: scaffold Pixel Cinemas workspace"`

### Task 2: Environment, database lifecycle and reusable API errors

**Files:**
- Create: `server/src/config/database.js`, `server/src/middleware/errorHandler.js`, `server/src/middleware/notFound.js`
- Modify: `server/src/app.js`, `server/src/server.js`
- Create: `server/tests/error-handling.test.js`, `server/tests/helpers/database.js`

**Interfaces:**
- Produces: `connectDatabase(uri): Promise<void>`, `disconnectDatabase(): Promise<void>`, `AppError(code, message, status, details?)`, JSON error envelope `{ error: { code, message, details? } }`.

- [ ] **Step 1: Write failing error-envelope tests**

  Assert unknown routes return `404 NOT_FOUND`; thrown `AppError('INVALID_INPUT', ..., 400)` returns the public envelope; unexpected errors return `500 INTERNAL_ERROR` without a stack.

- [ ] **Step 2: Verify red**

  Run: `npm test --workspace server -- error-handling.test.js`
  Expected: FAIL because error middleware is absent.

- [ ] **Step 3: Implement environment parsing, database lifecycle and errors**

  `env.js` validates `PORT`, `MONGODB_URI`, `JWT_SECRET`, `CLIENT_ORIGIN` and `SEAT_HOLD_SECONDS`; `server.js` owns connection/startup/shutdown while tests import `createApp()` without listening.

- [ ] **Step 4: Verify green**

  Run: `npm test --workspace server -- error-handling.test.js`
  Expected: all error-envelope tests pass.

- [ ] **Step 5: Commit checkpoint**

  `git commit -m "feat: add server configuration and safe errors"`

### Task 3: Authentication and role authorization

**Files:**
- Create: `server/src/models/User.js`
- Create: `server/src/modules/auth/auth.schemas.js`, `auth.service.js`, `auth.controller.js`, `auth.routes.js`
- Create: `server/src/middleware/authenticate.js`, `authorize.js`, `validate.js`
- Modify: `server/src/app.js`
- Create: `server/tests/auth.integration.test.js`, `server/tests/authorization.test.js`
- Create: `client/src/api/http.js`, `client/src/api/auth.js`
- Create: `client/src/features/auth/AuthProvider.jsx`, `LoginForm.jsx`, `RegisterForm.jsx`, `ProtectedRoute.jsx`
- Create: `client/src/pages/LoginPage.jsx`, `RegisterPage.jsx`
- Create: `client/src/features/auth/LoginForm.test.jsx`, `RegisterForm.test.jsx`

**Interfaces:**
- Produces: `POST /api/auth/register`, `POST /api/auth/login`, `GET/PATCH /api/auth/me`; `authenticate`, `authorize('admin')`; `useAuth()` returning `{ user, token, login, register, logout }`.

- [ ] **Step 1: Write failing authentication API tests**

  Assert email normalisation and password hashing, duplicate email `409 EMAIL_EXISTS`, invalid credentials `401 INVALID_CREDENTIALS`, authenticated profile response excludes `passwordHash`, customer on an admin probe gets `403 FORBIDDEN`, missing token gets `401 UNAUTHENTICATED`.

- [ ] **Step 2: Verify red**

  Run: `npm test --workspace server -- auth.integration.test.js authorization.test.js`
  Expected: FAIL because user/auth modules do not exist.

- [ ] **Step 3: Implement minimal server authentication**

  Use Zod validation, bcrypt hashes, signed JWTs and role middleware. Seeded administrator creation belongs in the later seed script, never in public registration.

- [ ] **Step 4: Verify server green**

  Run: `npm test --workspace server -- auth.integration.test.js authorization.test.js`
  Expected: all auth and role tests pass.

- [ ] **Step 5: Write failing React auth tests**

  Assert labelled validation, successful submit calls the API, error envelope is announced, and protected routes redirect guests to `/login`.

- [ ] **Step 6: Verify client red, implement auth UI, then verify green**

  Run before/after: `npm test --workspace client -- LoginForm.test.jsx RegisterForm.test.jsx`
  Expected: initial missing-component failures, then all tests pass.

- [ ] **Step 7: Commit checkpoint**

  `git commit -m "feat: add secure customer and admin authentication"`

### Task 4: Movie catalogue and administrator movie CRUD

**Files:**
- Create: `server/src/models/Movie.js`
- Create: `server/src/modules/movies/movie.schemas.js`, `movie.service.js`, `movie.controller.js`, `movie.routes.js`
- Modify: `server/src/app.js`
- Create: `server/tests/movies.integration.test.js`
- Create: `client/src/api/movies.js`
- Create: `client/src/features/movies/MovieCard.jsx`, `MovieGrid.jsx`, `MovieFilters.jsx`, `MovieForm.jsx`
- Create: `client/src/pages/HomePage.jsx`, `MoviesPage.jsx`, `MovieDetailsPage.jsx`
- Create: `client/src/features/movies/MovieGrid.test.jsx`, `MovieForm.test.jsx`
- Modify: `client/src/app/App.jsx`

**Interfaces:**
- Produces: `GET /api/movies`, `GET /api/movies/:id`; admin `POST`, `PATCH`, `DELETE /api/movies`; filters `status`, `genre`, `q`; movie presentation components.

- [ ] **Step 1: Write failing movie API tests**

  Assert public listing/search/status filtering, valid detail, invalid ID `400`, missing movie `404`, admin create/update/archive, customer mutation `403`, and unsafe/unknown fields rejected.

- [ ] **Step 2: Verify red, implement API, verify green**

  Run before/after: `npm test --workspace server -- movies.integration.test.js`
  Expected: missing-route failures, then all CRUD/filter tests pass.

- [ ] **Step 3: Write failing catalogue/admin form tests**

  Assert loading/empty/error states, semantic movie cards, filter updates, age-rating text, and labelled validation for title/duration/release date.

- [ ] **Step 4: Verify red, implement UI, verify green**

  Run before/after: `npm test --workspace client -- MovieGrid.test.jsx MovieForm.test.jsx`
  Expected: missing-component failures, then all catalogue/form tests pass.

- [ ] **Step 5: Commit checkpoint**

  `git commit -m "feat: add movie catalogue and admin CRUD"`

### Task 5: Screening CRUD, schedules and quick booking

**Files:**
- Create: `server/src/models/Screening.js`
- Create: `server/src/modules/screenings/screening.schemas.js`, `screening.service.js`, `screening.controller.js`, `screening.routes.js`
- Modify: `server/src/app.js`
- Create: `server/tests/screenings.integration.test.js`
- Create: `client/src/api/screenings.js`
- Create: `client/src/features/screenings/QuickBook.jsx`, `ScreeningPicker.jsx`, `ScreeningForm.jsx`
- Create: `client/src/pages/ScreeningsPage.jsx`
- Create: `client/src/features/screenings/QuickBook.test.jsx`, `ScreeningForm.test.jsx`

**Interfaces:**
- Produces: `GET /api/screenings?movieId&date&status`, `GET /api/screenings/:id`; admin CRUD; `generateSeatLayout(config)` consumed by Task 6.

- [ ] **Step 1: Write failing screening API tests**

  Assert populated movie summary, movie/date filters, rejected past start, valid price map, generated unique seat IDs, admin CRUD, customer `403`, and cancelled screening excluded from bookable results.

- [ ] **Step 2: Verify red, implement API, verify green**

  Run before/after: `npm test --workspace server -- screenings.integration.test.js`
  Expected: missing-route failures, then all screening tests pass.

- [ ] **Step 3: Write failing quick-book/form tests**

  Assert dependent movie/date/time options, disabled search until complete, route to selected screening, and accessible form validation.

- [ ] **Step 4: Verify red, implement UI, verify green**

  Run before/after: `npm test --workspace client -- QuickBook.test.jsx ScreeningForm.test.jsx`
  Expected: missing-component failures, then all tests pass.

- [ ] **Step 5: Commit checkpoint**

  `git commit -m "feat: add screening schedules and quick booking"`

### Task 6: Seat layout, pricing and view-from-seat domain

**Files:**
- Create: `server/src/seats/layout.js`, `pricing.js`, `view.js`
- Create: `server/tests/seats/layout.test.js`, `pricing.test.js`, `view.test.js`
- Create: `client/src/features/seats/SeatMap.jsx`, `SeatLegend.jsx`, `SeatSummary.jsx`, `SeatViewPreview.jsx`
- Create: `client/src/features/seats/SeatMap.test.jsx`, `SeatViewPreview.test.jsx`
- Create: `client/src/styles/seats.css`

**Interfaces:**
- Produces: `generateSeatLayout({ rows, seatsPerRow, accessibleSeats, premiumRows })`; `calculatePrice(seats, priceMap)`; `calculateSeatView(seat, layout) -> { distanceMetres, angleDegrees, offsetMetres, qualityLabel, transform }`; seat UI components independent of sockets.

- [ ] **Step 1: Write failing pure-domain tests**

  Assert stable IDs (`A-1`), accessible metadata, no duplicates, mixed-type price total, unknown type rejection, centre seat angle/offset `0`, farther rows have greater distance, left/right angles have opposite signs, and CSS transforms stay within documented bounds.

- [ ] **Step 2: Verify red, implement pure functions, verify green**

  Run before/after: `npm test --workspace server -- seats`
  Expected: missing-module failures, then all layout/pricing/view tests pass.

- [ ] **Step 3: Write failing seat component tests**

  Assert every seat has row/number/type/state in its accessible name, occupied/held seats are disabled, keyboard selection works, selected summary updates, status is conveyed by text/icon, and preview renders approximate metrics.

- [ ] **Step 4: Verify red, implement components, verify green**

  Run before/after: `npm test --workspace client -- SeatMap.test.jsx SeatViewPreview.test.jsx`
  Expected: missing-component failures, then all seat tests pass.

- [ ] **Step 5: Commit checkpoint**

  `git commit -m "feat: add seat map pricing and view preview"`

### Task 7: Real-time seat-hold service and Socket.IO protocol

**Files:**
- Create: `server/src/seats/SeatHoldService.js`
- Create: `server/src/sockets/registerSeatHandlers.js`, `server/src/sockets/events.js`
- Modify: `server/src/server.js`
- Create: `server/tests/seats/SeatHoldService.test.js`, `server/tests/sockets/seat-holds.test.js`
- Create: `client/src/features/seats/useSeatSocket.js`
- Create: `client/src/features/seats/useSeatSocket.test.jsx`

**Interfaces:**
- Produces: `SeatHoldService.hold/release/releaseOwner/expire/getActive`; Socket.IO events `screening:join`, `seat:hold`, `seat:held`, `seat:release`, `seat:released`, `seat:booked`, `seat:state` with acknowledgement `{ ok, data? | error? }`; `useSeatSocket(screeningId)`.

- [ ] **Step 1: Write failing hold-service tests**

  Assert one owner can renew its hold, another owner is rejected, multiple-seat hold is all-or-nothing, expiry releases seats, and `releaseOwner` only releases that owner's holds.

- [ ] **Step 2: Verify red, implement service, verify green**

  Run before/after: `npm test --workspace server -- SeatHoldService.test.js`
  Expected: missing-class failure, then all deterministic fake-clock tests pass.

- [ ] **Step 3: Write failing two-client socket tests**

  Join two clients to one screening; assert A's hold broadcasts to B, B's duplicate hold is rejected, timeout broadcasts release, disconnect cleanup releases, and another screening receives no event.

- [ ] **Step 4: Verify red, implement handlers, verify green**

  Run before/after: `npm test --workspace server -- seat-holds.test.js`
  Expected: missing-handler failures, then all socket integration tests pass.

- [ ] **Step 5: Write failing hook tests, implement and verify**

  Assert connection state, authoritative state replacement after reconnect, held/booked event reduction and cleanup on unmount.
  Run: `npm test --workspace client -- useSeatSocket.test.jsx`

- [ ] **Step 6: Commit checkpoint**

  `git commit -m "feat: synchronize expiring seat holds"`

### Task 8: Atomic booking creation, history and cancellation

**Files:**
- Create: `server/src/models/Booking.js`
- Create: `server/src/modules/bookings/booking.schemas.js`, `booking.service.js`, `booking.controller.js`, `booking.routes.js`, `bookingReference.js`
- Modify: `server/src/app.js`, `server/src/sockets/registerSeatHandlers.js`
- Create: `server/tests/bookings.integration.test.js`, `server/tests/bookings.concurrency.test.js`, `server/tests/bookingReference.test.js`
- Create: `client/src/api/bookings.js`
- Create: `client/src/features/bookings/CheckoutSummary.jsx`, `BookingCard.jsx`, `Ticket.jsx`
- Create: `client/src/pages/CheckoutPage.jsx`, `ConfirmationPage.jsx`, `MyBookingsPage.jsx`
- Create: `client/src/features/bookings/CheckoutSummary.test.jsx`, `BookingCard.test.jsx`

**Interfaces:**
- Produces: customer `POST /api/bookings`, `GET /api/bookings/me`, `GET /api/bookings/:id`, `PATCH /api/bookings/:id/cancel`; admin listing/update/delete-capable routes; `createBooking({ userId, screeningId, seatIds, holdOwnerId })`; `generateBookingReference()`.

- [ ] **Step 1: Write failing booking domain/API tests**

  Assert server-calculated pricing ignores submitted totals, only the authenticated hold owner can book, duplicate/occupied seat returns `409`, cancelled/past screening rejects, unique reference is stored, another user cannot read a booking, eligible cancellation releases seats, and ineligible cancellation returns `409`.

- [ ] **Step 2: Verify red, implement booking transaction, verify green**

  Run before/after: `npm test --workspace server -- bookingReference.test.js bookings.integration.test.js`
  Expected: missing-module failures, then all booking tests pass.

- [ ] **Step 3: Prove concurrency behaviour**

  Run: `npm test --workspace server -- bookings.concurrency.test.js`
  Expected: two simultaneous attempts produce one `201` and one `409`; exactly one confirmed booking exists.

- [ ] **Step 4: Write failing checkout/history tests**

  Assert itemised server quote, no card-data fields, disabled confirmation after hold expiry, ticket reference/seat/time, accessible cancellation confirmation, and empty/history states.

- [ ] **Step 5: Verify red, implement UI, verify green**

  Run before/after: `npm test --workspace client -- CheckoutSummary.test.jsx BookingCard.test.jsx`
  Expected: missing-component failures, then all tests pass.

- [ ] **Step 6: Commit checkpoint**

  `git commit -m "feat: add atomic bookings and customer history"`

### Task 9: Complete responsive customer booking flow

**Files:**
- Create: `client/src/pages/SeatSelectionPage.jsx`, `NotFoundPage.jsx`, `ErrorPage.jsx`
- Create: `client/src/components/SiteHeader.jsx`, `Hero.jsx`, `QuickBookBar.jsx`, `LoadingState.jsx`, `ErrorState.jsx`, `ConfirmDialog.jsx`
- Modify: `client/src/app/App.jsx`, `client/src/styles/base.css`, `client/src/styles/seats.css`
- Create: `client/src/pages/SeatSelectionPage.test.jsx`, `client/src/app/routes.test.jsx`

**Interfaces:**
- Consumes: auth, movies, screenings, seat socket, view preview and bookings from Tasks 3-8.
- Produces: navigable routes `/`, `/movies`, `/movies/:id`, `/screenings/:id/seats`, `/checkout`, `/confirmation/:id`, `/bookings`, `/login`, `/register`, `*`.

- [ ] **Step 1: Write failing route and flow integration tests**

  Assert direct URL rendering, protected checkout/history, movie-to-screening navigation, seat hold selection, preview open/close, hold countdown, conflict message, reconnect refresh, selection persistence through preview, and responsive mobile summary semantics.

- [ ] **Step 2: Verify red**

  Run: `npm test --workspace client -- SeatSelectionPage.test.jsx routes.test.jsx`
  Expected: FAIL because route composition is incomplete.

- [ ] **Step 3: Compose the full customer flow and visual system**

  Implement the approved Pixel Cinemas hierarchy, motion respecting `prefers-reduced-motion`, desktop quick-book strip, high-contrast booking workspace and mobile sticky selection summary.

- [ ] **Step 4: Verify green and accessibility basics**

  Run: `npm test --workspace client`, `npm run lint --workspace client`, `npm run build --workspace client`
  Expected: complete client suite passes; lint/build exit `0` with no warnings treated as errors.

- [ ] **Step 5: Commit checkpoint**

  `git commit -m "feat: complete responsive customer booking journey"`

### Task 10: Administrator dashboard and statistics

**Files:**
- Create: `server/src/modules/admin/admin.controller.js`, `admin.routes.js`, `admin.service.js`
- Modify: `server/src/app.js`
- Create: `server/tests/admin.integration.test.js`
- Create: `client/src/api/admin.js`
- Create: `client/src/features/admin/AdminNav.jsx`, `StatsCards.jsx`, `MovieManager.jsx`, `ScreeningManager.jsx`, `BookingManager.jsx`
- Create: `client/src/pages/AdminDashboardPage.jsx`
- Create: `client/src/features/admin/AdminDashboard.test.jsx`
- Modify: `client/src/app/App.jsx`

**Interfaces:**
- Produces: `GET /api/admin/stats -> { movieCount, upcomingScreenings, confirmedBookings, occupancyRate, revenue }`; protected `/admin` route composing CRUD managers.

- [ ] **Step 1: Write failing administrator API tests**

  Assert customer `403`, empty statistics return zeros, confirmed/cancelled bookings aggregate correctly, and admin booking update/delete rules preserve data consistency.

- [ ] **Step 2: Verify red, implement API, verify green**

  Run before/after: `npm test --workspace server -- admin.integration.test.js`
  Expected: missing-route failures, then all admin tests pass.

- [ ] **Step 3: Write failing dashboard tests**

  Assert role-protected route, statistics labels, movie/screening/booking tabs, create/edit forms, destructive confirmation and actionable API errors.

- [ ] **Step 4: Verify red, implement dashboard, verify green**

  Run before/after: `npm test --workspace client -- AdminDashboard.test.jsx`
  Expected: missing-component failures, then all tests pass.

- [ ] **Step 5: Commit checkpoint**

  `git commit -m "feat: add protected cinema administration"`

### Task 11: Seed data, Docker distribution and CI pipeline

**Files:**
- Create: `scripts/seed.js`
- Create: `client/Dockerfile`, `client/nginx.conf`, `server/Dockerfile`, `docker-compose.yml`, `.dockerignore`
- Create: `.github/workflows/ci.yml`
- Create: `server/tests/seed.test.js`
- Modify: `package.json`, `README.md`, `.env.example`

**Interfaces:**
- Produces: idempotent `npm run seed`; services at client `:5173`/production `:8080`, server `:3000`, mongo internal `:27017`; CI jobs `lint-test-build`.

- [ ] **Step 1: Write failing idempotent seed test**

  Assert two seed runs produce one administrator, stable movie/screening counts, hashed admin password and no duplicate unique keys.

- [ ] **Step 2: Verify red, implement seed, verify green**

  Run before/after: `npm test --workspace server -- seed.test.js`
  Expected: missing-script failure, then idempotency tests pass.

- [ ] **Step 3: Add container and CI configuration**

  Use health checks and `depends_on` conditions; run server as non-root; keep secrets in environment variables; CI starts MongoDB service, runs `npm ci`, `npm run lint`, `npm test`, `npm run build`.

- [ ] **Step 4: Verify distribution**

  Run: `docker compose config`, `docker compose build`, `docker compose up -d`, `docker compose ps`, then request `/api/health` and load the client.
  Expected: valid config; all three services healthy; API returns `{ "status": "ok" }`; client loads.

- [ ] **Step 5: Verify CI-equivalent locally**

  Run: `npm ci`, `npm run lint`, `npm test`, `npm run build`
  Expected: every command exits `0`.

- [ ] **Step 6: Commit checkpoint**

  `git commit -m "ci: add distributed deployment and verification pipeline"`

### Task 12: Playwright system tests and assessment evidence pack

**Files:**
- Create: `client/playwright.config.js`
- Create: `client/e2e/customer-booking.spec.js`, `admin-crud.spec.js`, `live-seat-lock.spec.js`
- Create: `docs/diagrams/component-architecture.md`, `data-model.md`, `booking-sequence.md`
- Create: `docs/evidence/manual-system-test-plan.md`, `uat-protocol.md`, `uat-results-template.md`, `screenshot-checklist.md`, `three-minute-video-script.md`, `report-outline.md`, `ai-declaration-notes.md`
- Modify: `README.md`, `.github/workflows/ci.yml`

**Interfaces:**
- Produces: reproducible end-to-end tests; Mermaid diagrams; evidence templates that reference actual implemented routes, tests and commands.

- [ ] **Step 1: Write failing Playwright flows**

  Customer test: register -> choose movie/screening -> hold seat -> preview -> book -> confirmation/history. Admin test: login -> create/edit/archive movie -> create/cancel screening. Live test: two contexts join one screening; A holds a seat; B observes held state and cannot select it.

- [ ] **Step 2: Verify red for the expected missing/incorrect behaviour**

  Run: `npm run test:e2e --workspace client`
  Expected: each new test fails at its first unimplemented fixture/selector or behaviour, not because of syntax/configuration errors.

- [ ] **Step 3: Add deterministic E2E fixtures/selectors and make flows green**

  Prefer accessible roles/labels; use `data-testid` only where canvas-like seat identity cannot be selected reliably by role/name.

- [ ] **Step 4: Verify Playwright green**

  Run: `npm run test:e2e --workspace client`
  Expected: all customer, admin and two-client live-seat tests pass.

- [ ] **Step 5: Create evidence documents from verified behaviour**

  Diagrams must match current modules and event names. Templates must separate completed evidence from items the student must perform personally: UAT participants/results, narrated video, GitHub/YouTube links and signed AI declaration.

- [ ] **Step 6: Run the final verification gate**

  Run: `npm run lint`, `npm test`, `npm run build`, `npm run test:e2e --workspace client`, `docker compose config`, `docker compose build`
  Expected: every command exits `0`; test output has zero failures; build has no errors; Compose validates/builds all services.

- [ ] **Step 7: Manual visual verification**

  Inspect desktop widths `1440x900` and `1024x768`, mobile `390x844`, keyboard-only navigation, reduced motion, empty/error/loading states, and two-browser live locking. Record only verified screenshots in the evidence checklist.

- [ ] **Step 8: Commit checkpoint**

  `git commit -m "test: add system coverage and assessment evidence pack"`

## Self-review

- **Spec coverage:** Customer/admin journeys, four entities, three CRUD domains, authentication, MongoDB, WebSockets, distributed containers, testing levels, static analysis, CI/CD, diagrams, UAT and submission evidence each map to a task.
- **Boundary coverage:** Pricing/availability remain server-authoritative; Socket.IO rooms are scoped per screening; UI components do not mutate persistence directly.
- **Type/name consistency:** `screeningId`, `seatIds`, `holdOwnerId`, booking status and socket event names are stable across server, client and tests.
- **Review-focus coverage:** concurrency is in Task 8, expiry/reconnect in Tasks 7/9, price tampering in Task 8, authorization in Tasks 3/4/5/10, and time/cancellation rules in Tasks 5/8.
- **Proportion:** Twelve independently testable tasks reflect the breadth of the assessment without decomposing every file into its own task.

## Execution choice

The user requested that the project be planned and built in this workspace. Execute natively in this session with `superpowers:executing-plans`; do not delegate unless the user later explicitly requests subagents. Preserve the red-green evidence for each behavioural task and stop if the approved design must materially change.
