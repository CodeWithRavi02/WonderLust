# Orbit LMS

Orbit is a responsive learning-platform starter built with React, Vite, Tailwind CSS, Express, and MongoDB/Mongoose. It includes a course discovery experience, course detail pages, an interactive student dashboard, JWT-backed registration/login, and a REST API foundation.

## Run locally

Requirements: Node.js 20.19+ and MongoDB 7+.

1. Install packages: `npm install`
2. Copy `.env.example` to `.env`.
3. Set `MONGODB_URI` and replace `JWT_SECRET` with a random value of at least 32 characters. For example, generate one with `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`.
4. Start MongoDB.
5. In one terminal run `npm run api`; in another run `npm run dev`.
6. (Optional) Set `SEED_INSTRUCTOR_EMAIL` and `SEED_INSTRUCTOR_PASSWORD` in `.env`, then run `npm run seed` to create the sample course catalog.

The Vite server runs at `http://localhost:5173` and proxies `/api` requests to Express at `http://localhost:4000`. To run the production build, use `npm run build` followed by `npm start`; Express serves the generated client from `dist/`.

The discovery page remains usable without MongoDB and clearly identifies the sample catalog when the API is unavailable. Authentication and data-backed endpoints intentionally return `503` until MongoDB and a valid JWT secret are configured.

## Product surfaces

- Discover: curated course catalog, text search, category filters, sort, wishlist, and newsletter interaction.
- Course detail: instructor, outcomes, curriculum preview, and enrollment request.
- Student learning space: enrolled classes, progress overview, saved classes, and a sample learning streak.
- Authentication: student/instructor registration, bcrypt password hashing, signed JWTs in HttpOnly/SameSite cookies, and role metadata. New instructor accounts are pending approval.
- Accessibility and UI: responsive layouts, keyboard-visible focus, labeled controls, reduced-motion support, image descriptions, and light/dark theme preference.

The UI uses curated Unsplash photography as temporary remote artwork; generated AI assets are not included. Payment, email verification/delivery, password recovery, Google OAuth, Cloudinary uploads, live classes, and AI services are not configured. Paid enrollment is explicitly rejected until a verified payment integration is added; no mock charge or payment success is returned.

## Architecture

```text
src/
  App.jsx                 React routes and product surfaces
  data/courses.js         Local sample catalog
  main.jsx                React and router bootstrap
  styles.css              Design system, Tailwind layers, responsive styles
server/
  middleware/             JWT authorization, database readiness, API errors
  models/                 Mongoose schemas for LMS domains
  routes/                 Auth, course catalog, enrollment endpoints
  seed.js                 Opt-in catalog seeding
tests/
  server.test.js          Node's built-in HTTP/API smoke tests
app.js                    Express API, production static hosting, startup
```

## REST API

All responses use JSON. Errors have the shape `{ "message": "..." }`. Protected endpoints accept the HttpOnly `orbit_session` cookie; server-to-server callers may also use `Authorization: Bearer <token>`.

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| GET | `/api/health` | Public | API and MongoDB readiness |
| POST | `/api/auth/register` | Public, rate-limited | Create a student or pending instructor account |
| POST | `/api/auth/login` | Public, rate-limited | Verify credentials and set a JWT session cookie |
| POST | `/api/auth/logout` | Public | Clear the session cookie |
| GET | `/api/auth/me` | Authenticated | Read the current user |
| GET | `/api/courses` | Public | Search/filter published courses; supports `page`, `limit`, `category`, `level`, and `search` |
| GET | `/api/courses/categories` | Public | List active categories |
| GET | `/api/courses/:slug` | Public | Course details, curriculum metadata, and recent reviews |
| GET | `/api/enrollments` | Authenticated | List the current user's enrollments |
| POST | `/api/enrollments` | Authenticated | Enroll in a free published course; paid courses return `402` until payments are configured |

Course, lesson, category, enrollment, payment, review, quiz, certificate, assignment, notification, and user schemas are provided. The current API is an intentionally small product foundation, not a claim that every requested enterprise workflow has been implemented. Admin moderation, instructor course authoring/approval APIs, assignment submissions, messaging, checkout/webhooks, verification and reset email delivery, OAuth, and the AI/live-class integrations still need product-specific implementation and credentials.

## Checks

- `npm test` runs the API smoke tests with Node's built-in test runner.
- `npm run build` creates the production React bundle.
