# Automated MCQ Exam Portal

A full-stack, role-based online examination platform for managing courses, question banks, timed multiple-choice exams, automatic grading, results, and performance analytics.

[![Frontend](https://img.shields.io/badge/Frontend-React%20%2B%20TypeScript-3178C6?logo=react&logoColor=white)](https://react.dev/)
[![Backend](https://img.shields.io/badge/Backend-NestJS-E0234E?logo=nestjs&logoColor=white)](https://nestjs.com/)
[![Database](https://img.shields.io/badge/Database-PostgreSQL-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![ORM](https://img.shields.io/badge/ORM-Prisma-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io/)

## Overview

The Automated MCQ Exam Portal digitizes the examination workflow for educational institutions. It provides separate workspaces for administrators, teachers, and students, with server-side exam timing and automatic evaluation.

### User roles

| Role | Responsibilities |
|---|---|
| **Admin** | Manage users, roles, courses, exams, platform overview, and audit logs |
| **Teacher** | Manage courses, maintain question banks, create and publish exams, and review analytics |
| **Student** | Browse available exams, take timed assessments, submit answers, and review results |

## Features

- Role-based access control for Admin, Teacher, and Student accounts.
- Course management and teacher-owned course workflows.
- Question bank management with validation and search/filter support.
- Exam creation and publishing with configurable question pools and exam rules.
- Timed exam attempts with randomized question/option order, resume support, and answer autosave.
- Automatic evaluation with configurable marking, negative marking, and pass/fail calculation.
- Result history and answer review according to exam settings.
- Analytics for class performance, pass rate, question performance, and leaderboards.
- Audit logging for selected platform actions.

## Technology stack

| Layer | Technologies |
|---|---|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS |
| Backend | NestJS 10, TypeScript, REST API |
| Database | PostgreSQL (Supabase) |
| ORM | Prisma |
| Authentication | JWT, Passport, role guards |
| Testing | Jest, ts-jest |

## Architecture

```text
Automated-MCQ-Exam-Portal/
├── backend/
│   ├── prisma/              # Database schema and development seed
│   └── src/
│       ├── auth/             # Authentication and authorization
│       ├── users/            # User administration
│       ├── courses/          # Course management
│       ├── questions/        # Question bank
│       ├── exams/            # Exam creation and publishing
│       ├── attempts/         # Timed exam attempts
│       ├── evaluation/       # Grading and score calculation
│       ├── results/          # Results and answer review
│       ├── analytics/        # Performance analytics
│       ├── audit-log/        # Audit trail
│       └── common/           # Shared guards and utilities
├── frontend/
│   └── src/
│       ├── features/         # Admin, teacher, and student interfaces
│       ├── lib/              # API and shared client utilities
│       └── routes/           # Route and access control
└── .github/                  # Issue templates and CI workflow
```

## Getting started

### Prerequisites

- Node.js (LTS recommended)
- npm
- A Supabase project with a PostgreSQL database
- Git

### 1. Clone the repository

```bash
git clone https://github.com/Nayeem974/Automated-MCQ-Exam-Portal.git
cd Automated-MCQ-Exam-Portal
```

### 2. Configure the backend environment

Create `backend/.env` by copying the example file.

**Windows PowerShell**
```powershell
Copy-Item backend/.env.example backend/.env
```

**macOS / Linux**
```bash
cp backend/.env.example backend/.env
```

Set the values in `backend/.env` using the connection strings from your Supabase project:

```env
DATABASE_URL="YOUR_SUPABASE_TRANSACTION_POOLER_URL"
DIRECT_URL="YOUR_SUPABASE_DIRECT_DATABASE_URL"
JWT_SECRET="REPLACE_WITH_A_LONG_RANDOM_SECRET"
JWT_EXPIRES_IN="1d"
PORT=3000
FRONTEND_ORIGIN="http://localhost:5173"
```

Use the connection format and port supplied by Supabase for your project. Never commit `.env` files or share database credentials.

### 3. Install and run the backend

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev
npm run start:dev
```

The API is available at `http://localhost:3000/api`.

### 4. Install and run the frontend

Open a second terminal from the repository root:

```bash
cd frontend
npm install
npm run dev
```

The frontend is available at `http://localhost:5173`.

The Vite development proxy is configured in `frontend/vite.config.ts`.

### 5. Optional: load development seed data

```bash
cd backend
npm run prisma:seed
```

The seed script creates sample Admin, Teacher, and Student accounts, courses, questions, and a published exam.

> **Development only:** The seed script uses predictable demo credentials (including the shared password defined in `backend/prisma/seed.ts`). Never run it against production data. Review the seed script before use and change demo passwords in any shared environment.

## Testing

Run backend tests:

```bash
cd backend
npm test
```

Run backend test coverage:

```bash
npm run test:coverage
```

Build the backend:

```bash
cd backend
npm run build
```

Build the frontend:

```bash
cd frontend
npm run build
```

The existing backend tests cover selected high-risk logic, including evaluation, exam validation, and authentication. See `backend/TESTING_REPORT.md` and the testing report PDF for the documented test scope.

## Project Documentation

All supporting project documents are organized under `docs/`.

### Reports
- [Project Report](docs/reports/Automated%20MCQ%20Exam%20Portal%20report.pdf)
- [Testing & QA Report](docs/reports/Automated_MCQ_Exam_Portal_Testing_QA_Report.pdf)

### Diagrams
- [System Modeling](docs/diagrams/Automated%20MCQ%20Portal%20System%20Modeling.png)

### Academic Documents
- [Problem Statement & Topic Selection](docs/academic/problem-statement-topic-selection.png)

## Security notes

- Keep secrets in local environment files and hosting-provider secret stores.
- Use a strong, unique `JWT_SECRET` outside local development.
- Demo credentials and seed data are not suitable for production.
- Do not include passwords, tokens, private student information, or database URLs in GitHub issues.
- Review authorization, CORS, rate limits, database permissions, and deployment settings before public deployment.

## Known limitations

This is an academic software development project and is not presented as a hardened production examination service.

- The application is not a lockdown browser and cannot prevent all forms of external assistance or device switching.
- Server-side controls help protect attempt ownership, timing, and submitted answers, but do not guarantee exam integrity.
- Published exams with existing attempts are restricted from editing to preserve attempt consistency.
- Rate limiting uses a basic global configuration and may need endpoint-specific policies for production.
- Analytics visualizations are intentionally lightweight.
- Current automated tests cover selected high-risk rules; comprehensive end-to-end testing remains future work.

## Contributing

Contributions and suggestions are welcome. Please read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request.

For bugs or feature suggestions, use the GitHub issue templates. Include reproducible details, but never include secrets or private student data.

## License

No license has been specified. Unless a license is added, default copyright rules apply and reuse is not automatically granted.

---

<p align="center">Built as an academic full-stack software development project.</p>
