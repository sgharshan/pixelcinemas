# Pixel Cinemas

Pixel Cinemas is a full-stack cinema booking system for COMP3006. It uses React/Vite, Express, MongoDB/Mongoose and Socket.IO, with an original black/amber cinema identity informed by—but not copied from—the supplied Vue screenshots.

## Implemented features

- Customer registration/login, JWT-protected profile and booking routes, bcrypt password hashes and admin role checks
- Searchable movie catalogue, film detail pages, screenings and dependent quick-book controls
- Accessible seat map with standard/premium/recliner/accessibility states and an explicitly approximate view-from-seat preview
- Atomic server-priced bookings, ticket references, history and eligible cancellation
- Real-time, expiring Socket.IO seat holds with conflict acknowledgements, room isolation and disconnect cleanup
- Protected administrator statistics plus movie, screening and booking management
- Responsive design, keyboard/focus semantics, safe structured errors and no payment-card collection
- Jest/Supertest/MongoMemoryServer integration tests, Vitest component tests and Playwright browser flows
- Docker Compose distribution and GitHub Actions lint/test/build/E2E workflow

## Local development

Requirements: Node.js 22+, npm and MongoDB 8 (or Docker Desktop).

```bash
npm ci
copy .env.example .env
npm run seed
npm run dev
```

The client is at `http://127.0.0.1:5173` and API health is at `http://127.0.0.1:3000/api/health`. Set a strong `JWT_SECRET` and `SEED_ADMIN_PASSWORD` in `.env`. The seeded administrator email is `admin@pixelcinemas.local`; the password is whatever you set in `SEED_ADMIN_PASSWORD`.

## Verification

```bash
npm run lint
npm test
npm run build
npm run test:e2e
```

Playwright starts and seeds an isolated in-memory MongoDB instance, then launches both applications. GitHub Actions performs the same browser journeys automatically on pushes and pull requests.

## Docker

```bash
docker compose up --build
```

Open `http://localhost:8080`; the API remains available at port `3000`. MongoDB data is held in the named `pixel-mongo` volume. Environment secrets are injected at runtime and are not built into an image.

## Project evidence

- Architecture, data model and booking sequence: [`docs/diagrams`](docs/diagrams)
- Manual tests, UAT, screenshots, report/video guidance and AI-use notes: [`docs/evidence`](docs/evidence)
- Approved design and implementation plan: [`docs/superpowers`](docs/superpowers)

Limitations to discuss in the report: payments are intentionally simulated (no card data is collected), holds are process-local and should move to Redis for horizontal scaling, and the generated view is a geometric approximation rather than venue photography.
