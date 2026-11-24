# Pixel Cinemas Full-Stack Cinema Booking System - Design Specification

## Intent

Pixel Cinemas is an individual COMP3006 Full-Stack Development project for cinema customers and cinema administrators. It will demonstrate a complete, understandable booking journey while producing strong evidence for the assessment's analysis, design, testing, CI/CD and software criteria.

The distinctive feature is an interactive seat map with temporary live seat locks and a "view from this seat" preview. The preview will approximate screen distance, horizontal viewing angle and centre offset from the selected seat rather than claiming to be a photorealistic simulation.

## Goals

- Deliver a reliable customer journey from registration to booking confirmation.
- Provide administrator CRUD interfaces for movies, screenings and bookings.
- Use Socket.IO for observable communication between multiple browser clients.
- Use MongoDB as the persistent database behind an Express web-service API.
- Run the React client, Node.js server and MongoDB as distributed containers.
- Provide enough automated and manual testing evidence to demonstrate depth and breadth.
- Keep the code small and clear enough for the student to understand, explain and modify.
- Make the seat-selection and seat-preview experience visually distinctive in the three-minute demonstration video.

## Non-goals

- Real card payments or storage of payment information.
- Real cinema inventory, licensed posters, trailers or Vue branding/assets.
- Concessions, loyalty points, reviews, recommendations or gift cards.
- A production-grade photorealistic 3D auditorium.
- Microservices that add deployment complexity without improving assessment evidence.
- Native mobile applications.

## Anti-goals

- A static front-end mock-up with no database, WebSockets or working API.
- More CRUD entities that repeat the same technical idea without adding assessment value.
- Visual polish that displaces testing, documentation, CI/CD or security work.
- Generated code that the student cannot explain in a demonstration or viva-style discussion.

## Assessment constraints

- Front end: dynamic HTML, CSS and JavaScript using React.
- Back end: Node.js and Express using server-side JavaScript.
- Database: MongoDB with Mongoose; no SQL, Firebase, .NET, C#, PHP or other server stack.
- WebSockets: Socket.IO must visibly communicate changes between multiple clients.
- Distribution: client, server and database must run in separate Docker containers.
- Security: registration, login, hashed passwords, authenticated APIs and role checks.
- CRUD: full CRUD for Movie, Screening and Booking; User supports registration, profile read/update and administration-safe account handling.
- Evidence: component architecture, repository history, unit/integration/system/UAT testing, static analysis and CI/CD.
- Submission support: report evidence must reflect the implemented system; the user remains responsible for understanding, checking and declaring AI assistance.

## Approaches considered

### 1. Evidence-first modular monolith - selected

One React client, one Express/Socket.IO server and one MongoDB database. The server is organised into routes, controllers, services, models, middleware and socket modules. This is distributed enough to satisfy the brief while remaining understandable and testable.

### 2. UI-first premium prototype

This would invest more effort in animation and 3D rendering. It would better imitate commercial cinema sites, but it increases the risk of weak API, testing and DevOps evidence. It is rejected because aesthetics are not directly marked.

### 3. Microservices

Authentication, catalogue and booking would be separate Node.js services. This gives richer distributed architecture evidence, but creates additional failure modes, configuration and duplicated test setup. It is rejected as disproportionate for an individual 80-hour project.

## Visual direction

The supplied Vue screenshots are references for hierarchy and interaction, not assets to copy.

- Original Pixel Cinemas identity with a geometric pixel-grid cinema-screen mark.
- Near-black and charcoal catalogue pages with warm amber/copper highlights.
- Condensed uppercase display typography for movie titles and section labels; a highly readable sans-serif for body text and controls.
- Large cinematic hero area followed by a persistent quick-book/search strip on desktop.
- Movie cards use original seeded placeholder artwork or copyright-safe remote URLs supplied in seed data.
- Booking header shows the movie, venue/auditorium, screening time and a visible hold countdown.
- Seat selection uses a light workspace inside the darker booking shell to maximise seat-state legibility.
- Seat types are encoded with colour, shape/icon and text so colour is never the only signal.
- Mobile rearranges the seat categories below the map and uses a sticky selection summary.

### Home page sketch

```text
+------------------------------------------------------------------+
| PIXEL CINEMAS Films  Coming soon  My bookings      Search Account |
+------------------------------------------------------------------+
| [ cinematic hero image ]                                         |
| NOW SHOWING  Movie title (rating)                  [BOOK NOW]      |
+------------------------------------------------------------------+
| QUICK BOOK | Film [v] | Date [v] | Time [v] | [FIND A SCREENING] |
+------------------------------------------------------------------+
| Now showing                                      View all ->      |
| [poster] [poster] [poster] [poster]                                  |
+------------------------------------------------------------------+
```

### Seat-selection sketch

```text
+------------------------------------------------------------------+
| Movie / screen / time                         Hold 04:57  Account  |
+-----------------------------------------------+------------------+
|                   CURVED SCREEN               | Choose seat type |
|                                               | Premium  GBP 16  |
| A       o o o o o o o o                       | Standard GBP 12  |
| B     o o o o o o o o o                       | Saver    GBP 9   |
| C   o o x o o [S] o o o     x = occupied      |                  |
| D     o o o o o o o o       S = selected      | Selected: C6     |
|                                               | [PREVIEW VIEW]   |
| Legend: available / held / occupied / selected| [CONTINUE]       |
+-----------------------------------------------+------------------+
```

### View-from-seat sketch

```text
+------------------------------------------------+
| View from C6                              [x]   |
|      [ perspective cinema screen/image ]       |
|         seat backs / auditorium foreground     |
|                                                |
| Row C, Seat 6       Premium - GBP 16.00        |
| 8.4 m to screen | 12 deg view | 0.6 m off-centre|
| [CHANGE SEAT]                         [BOOK]    |
+------------------------------------------------+
```

## User roles and journeys

### Customer

1. Register or sign in.
2. Browse/search current and upcoming movies.
3. Open a movie and choose an available screening.
4. Inspect live seat availability and seat categories.
5. Select one or more seats; the server creates expiring locks and broadcasts them.
6. Preview the approximate view from a selected seat.
7. Continue to a simulated checkout where the server recalculates the price and revalidates locks.
8. Confirm the booking and receive a booking reference and QR-style ticket graphic.
9. Review or cancel an eligible future booking.

### Administrator

1. Sign in with an administrator account.
2. Create, read, update and archive/delete movies.
3. Create, read, update and cancel screenings.
4. Inspect, update or cancel bookings.
5. Review basic occupancy and revenue summaries calculated from booking data.

## System architecture

```text
Browser A ----\                         /---- MongoDB
               React client <-> Express API
Browser B ----/              <-> Socket.IO

Docker Compose services:
  client (nginx/Vite build) | server (Node.js) | mongo (MongoDB)
```

The React client owns presentation and local form state. The Express server is the authority for authentication, price calculation, availability, seat locking and booking creation. MongoDB stores persistent entities; short-lived seat locks are managed by a server lock service and reconciled with confirmed bookings. Socket.IO rooms are scoped by screening ID so only relevant clients receive seat events.

## Core data model

### User

- `name`, `email`, `passwordHash`, `role`, `createdAt`, `updatedAt`
- Unique normalised email.
- Roles: `customer`, `admin`.

### Movie

- `title`, `synopsis`, `genre[]`, `durationMinutes`, `ageRating`, `posterUrl`, `backdropUrl`, `trailerUrl`, `releaseDate`, `status`
- Status: `coming-soon`, `now-showing`, `archived`.

### Screening

- `movieId`, `auditoriumName`, `startsAt`, `seatLayout`, `prices`, `status`
- Seat layout records stable row/number/type/accessible metadata, not booking state.

### Booking

- `userId`, `screeningId`, `seats[]`, `pricing`, `totalPrice`, `reference`, `status`, timestamps
- Status: `confirmed`, `cancelled`.
- Pricing is a server-generated snapshot for auditability.

## Seat states and WebSocket protocol

The visual states are `available`, `selected-by-me`, `held-by-other`, `occupied` and `accessible`. Accessibility is a seat attribute and can coexist with availability.

Socket events:

- Client emits `screening:join` with a screening ID.
- Client emits `seat:hold` with screening ID and seat IDs.
- Server validates the request, creates a five-minute owner-bound hold and emits `seat:held`.
- Client emits `seat:release`; timeout/disconnect cleanup emits `seat:released`.
- Successful booking emits `seat:booked`.
- Server responses include an acknowledgement object so rejected holds show an actionable message.

Booking creation runs an atomic server-side availability check. The client never decides the final price or whether a seat is bookable.

## View-from-seat calculation

Each auditorium layout has screen width and nominal row spacing. The selected row determines approximate screen distance. Seat column relative to the row centre determines lateral offset and viewing angle. The UI transforms the screen preview using bounded CSS perspective, translation and scale values so extreme seats remain usable.

The preview explicitly labels values as approximate. Its inputs and outputs are deterministic, making them suitable for unit tests.

## Security and validation

- Passwords hashed using bcrypt.
- Short-lived JWT access token stored in application memory and sent in the `Authorization` header.
- Role middleware protects all administrator routes.
- Request schemas validate identifiers, dates, strings and allowed status values.
- Duplicate email prevention and normalisation.
- Server-side price calculation and seat revalidation.
- Rate limiting on authentication routes, controlled CORS, Helmet headers and environment-based secrets.
- Errors return safe public messages without stack traces or password hashes.

## Error and edge-case behaviour

- A seat held by another client cannot be selected; the map updates without a page reload.
- An expired hold returns the customer to seat selection with a clear message.
- Two simultaneous booking attempts result in one success and one conflict response.
- A cancelled or past screening cannot accept new bookings.
- A cancelled booking releases its seats for a future screening only when cancellation policy permits.
- Network/socket loss triggers reconnection and a full authoritative seat-state refresh.
- Empty catalogue, loading, validation, not-found and server-error states are designed explicitly.

## Testing and assessment evidence

- Unit: view calculations, pricing, booking reference generation, hold expiry and validators.
- Integration: registration/login, protected routes, movie/screening CRUD, booking conflict and cancellation.
- WebSocket: join room, hold broadcast, rejected duplicate hold, timeout release and booked broadcast.
- Component: filters, seat state rendering, accessible labels, selection summary and error messages.
- System: register -> browse -> select screening -> hold seat -> preview -> book -> view confirmation.
- Multi-client system demonstration: holding a seat in browser A updates browser B.
- UAT: consent statement, task script, observations and ratings from approximately five participants, with personal data minimised.
- Static analysis: ESLint output captured locally and in CI.
- CI: GitHub Actions installs, lints, tests and builds on every push/pull request.

Evidence will be gathered as features are implemented: diagrams, selected code excerpts, terminal/test output, CI screenshots, UI screenshots and a change log relating UAT findings to modifications.

## Implementation boundaries left to the builder

- Exact component styling values and responsive breakpoints within the approved visual direction.
- Exact seeded movie titles and copyright-safe placeholder imagery.
- Small naming and file-organisation decisions that do not change interfaces or scope.
- Whether the QR-style ticket is generated with a small library or a deterministic CSS/SVG placeholder, provided no external ticket validation is implied.

## Approval checkpoint

Implementation begins only after the user approves this specification. Any later scope addition that affects architecture, entities or the principal booking flow requires a design update before implementation.
