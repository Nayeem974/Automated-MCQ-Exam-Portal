# Automated MCQ Exam Portal

A working role-based (Admin / Teacher / Student) web exam system: teachers
build question banks and exams, students take randomized timed exams, and
the system auto-evaluates and produces results, rankings, and analytics.

- **Frontend:** React + TypeScript + Tailwind CSS (Vite)
- **Backend:** NestJS (REST API), modular monolith
- **Database:** PostgreSQL via **Supabase**, accessed with Prisma ORM

This README covers Supabase setup, environment configuration, running both
apps locally on Windows/VS Code, seeding demo data, and testing the full
Admin → Teacher → Student flow end to end.

---

## 1. Set up Supabase

1. Go to [supabase.com](https://supabase.com) → **New project**. Pick any
   name/region and set a database password (save it — you'll need it below).
2. Once the project is ready: **Project Settings → Database → Connection
   string → URI tab**.
3. Supabase gives you two useful connection strings:
   - **Transaction pooler** (port `6543`) — used for normal app traffic.
   - **Session/Direct connection** (port `5432`) — required for running
     Prisma migrations (the pooler can't run them).
4. Copy both into `backend/.env` as `DATABASE_URL` and `DIRECT_URL` (see
   step 2 below). Replace `[YOUR-PASSWORD]` with your actual DB password.

You do **not** need a local Postgres install — everything runs against
Supabase.

## 2. Backend setup

```bash
cd backend
copy .env.example .env      REM (Windows) — or `cp .env.example .env` on macOS/Linux
```

Edit `backend/.env`:

```env
DATABASE_URL="postgresql://postgres.xxxx:[YOUR-PASSWORD]@aws-0-xx-xxxx-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.xxxx:[YOUR-PASSWORD]@aws-0-xx-xxxx-1.pooler.supabase.com:5432/postgres"
JWT_SECRET="<generate one — see comment in .env.example>"
JWT_EXPIRES_IN="1d"
PORT=3000
FRONTEND_ORIGIN="http://localhost:5173"
```

Then:

```bash
npm install
npx prisma migrate dev --name init    REM creates all tables in Supabase
npm run prisma:seed                   REM loads demo data (see below)
npm run start:dev
```

The API runs at `http://localhost:3000/api`.

## 3. Frontend setup

In a second terminal:

```bash
cd frontend
copy .env.example .env      REM optional — defaults work for local dev
npm install
npm run dev
```

The app runs at `http://localhost:5173` and proxies `/api` to the backend
(configured in `vite.config.ts`) — no CORS setup needed for local dev.

## 4. Seed data & dev login credentials

`npm run prisma:seed` (run from `backend/`) creates:

| Role | Email | Password |
|---|---|---|
| Admin | `admin@example.com` | `Password123!` |
| Teacher | `teacher@example.com` | `Password123!` |
| Teacher | `teacher2@example.com` | `Password123!` |
| Student | `student1@example.com` … `student5@example.com` | `Password123!` |

It also creates 2 courses, a 10-question bank for CSE101, and one
**published** exam ("CSE101 Midterm", 5 of 10 questions per attempt, 15
minutes, answer review enabled) that students can take immediately.

**These are development-only credentials — never reuse this password or
seed this script against a production database.**

## 5. Testing the complete flow

1. **Admin** (`admin@example.com`) — log in, go to Dashboard to see live
   platform stats, then Users/Courses/Exams/Audit Logs to see everything
   across the platform.
2. **Teacher** (`teacher@example.com`) — log in, open *Courses* to see
   CSE101, open its *Question bank* to add/edit/delete questions, go to
   *Exams* to see the seeded published exam, or *+ New exam* to build one
   from scratch (pick a course, select a question pool, configure rules,
   save as draft, then Publish).
3. **Student** (`student1@example.com`) — log in, see "CSE101 Midterm"
   under *Available exams*, read the instructions, start it. The timer,
   question navigation, and autosave are all live against the backend.
   Submit (or let the timer expire) to see the automatically-graded result,
   then check *Result history*.
4. Back as **Teacher** — open the exam's *Analytics* to see class average,
   pass rate, per-question performance, and the ranked leaderboard update
   with that attempt.

## 6. Running tests

```bash
cd backend
npm test
```

Covers the negative-marking/pass-fail calculation, the exactly-one-
correct-option rule, exam rule validation (pool size, schedule), and
auth (registration role-lock, login, disabled-account rejection).

## Repo layout

```
mcq-exam-portal/
├── backend/                 NestJS API
│   ├── prisma/
│   │   ├── schema.prisma    All 11 entities from the pipeline doc
│   │   └── seed.ts          Dev seed data (see section 4)
│   └── src/
│       ├── auth/            login/register (student-only)/JWT/role guard/me
│       ├── users/            admin: full user CRUD + role assignment
│       ├── courses/          course CRUD (teacher-owned)
│       ├── questions/        question bank CRUD, search/filter, validation
│       ├── exams/             exam CRUD, validation, publish/close
│       ├── attempts/         exam engine: randomization, resume, timer, autosave
│       ├── evaluation/       auto-grading, negative marking, pass/fail
│       ├── results/           student results + reveal-answers config
│       ├── analytics/       class stats, question performance, admin summary
│       ├── audit-log/        lightweight action logging + admin viewer
│       └── common/           roles enum, RolesGuard, JwtAuthGuard
└── frontend/            React + Vite + Tailwind SPA
    └── src/
        ├── features/auth      Login / Register (student-only)
        ├── features/admin     Dashboard, Users, Courses, Exams, Audit logs
        ├── features/teacher   Dashboard, Courses, Question bank, Exam
        │                      creation/list, Analytics
        ├── features/student   Dashboard, Exam instructions, Exam-taking
        │                      UI, Result detail/history
        ├── lib/api.ts         fetch wrapper + JWT handling
        └── routes/            session-verified, role-protected routing
```

## Known limitations

This is a Software Development Lab project scoped deliberately to stay
understandable — a few things are intentionally simple rather than
production-hardened:

- **Anti-cheating**: this is not a lockdown browser. It prevents backend-
  level tampering (server-authoritative timer, ownership checks, frozen
  per-attempt question/option order, option-ID validation) but cannot stop
  someone from using a second device.
- **Editing published exams**: an exam can no longer be edited once it has
  any student attempts, to keep past attempts consistent — this is
  enforced but there's no "duplicate exam" convenience shortcut yet.
- **Rate limiting** is a basic global IP-based limit (30 req/min), not
  per-endpoint tuning.
- **Charts** on the analytics page are simple CSS bar visualizations
  rather than a charting library, to keep the dependency footprint small.
- **Tests** cover the highest-risk logic (grading, validation, auth) but
  are not full end-to-end/integration coverage.
