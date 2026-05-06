# PetCare Tracker

PetCare Tracker is a full-stack pet management app for owners, veterinarians, and administrators. It provides role-based dashboards for managing pets, appointments, and medical records, with a React frontend and a Django REST backend.

## Features

- Role-based access for pet owners, veterinarians, and administrators.
- Landing page with login and signup flows.
- CRUD workflows for pets, appointments, and medical records.
- Veterinarian directory and booking support.
- Token-based authentication backed by the Django API.
- Responsive UI built with Tailwind CSS and shadcn/ui components.

## Tech Stack

- Frontend: Vite, React, TypeScript, Tailwind CSS, shadcn/ui, React Router, TanStack Query.
- Backend: Django, Django REST Framework, SQLite for local development, optional MySQL support.
- Testing: Vitest, Testing Library, Playwright, Django tests.

## Project Structure

- `src/` - React frontend source.
- `src/pages/` - Landing page, auth pages, and role dashboards.
- `src/components/` - Shared layout, forms, and UI primitives.
- `src/lib/` - API and auth helpers.
- `backend/` - Django API, models, serializers, and views.

## Getting Started

### Prerequisites

- Node.js and npm.
- Python 3.13 or a compatible Python 3 environment.

### 1. Install frontend dependencies

```bash
npm install
```

### 2. Install backend dependencies

```bash
cd backend
python -m pip install -r requirements.txt
```

### 3. Configure backend environment

Copy `backend/.env.example` to `backend/.env` and adjust values if needed.

By default the backend uses SQLite so you can run the app immediately. MySQL configuration is included if you want to switch databases later.

### 4. Run database migrations

```bash
cd backend
python manage.py migrate
```

### 5. Start the backend

```bash
cd backend
python manage.py runserver
```

The API runs at `http://127.0.0.1:8000/api/`.

### 6. Start the frontend

```bash
npm run dev
```

The frontend runs at `http://localhost:8080` by default.

## Environment Variables

Frontend:

- `VITE_API_BASE_URL` - Optional API base URL override. Defaults to `http://127.0.0.1:8000/api`.

Backend:

- `DATABASE_ENGINE` - `sqlite` by default, or `mysql` if you want to use MySQL.
- `MYSQL_HOST`, `MYSQL_PORT`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_DATABASE` - Used when MySQL is enabled.

## Available API Endpoints

- `GET /api/health/`
- `POST /api/auth/register/`
- `POST /api/auth/login/`
- `POST /api/auth/logout/`
- `GET /api/auth/me/`
- `GET /api/veterinarians/`
- CRUD `/api/users/`
- CRUD `/api/pets/`
- CRUD `/api/appointments/`
- CRUD `/api/medical-records/`

## Scripts

Frontend:

```bash
npm run dev
npm run build
npm run lint
npm run test
npm run test:watch
```

Backend:

```bash
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

## Testing

- Frontend unit tests live in `src/test/` and run with Vitest.
- The CRUD test suite is documented in `CRUD_TEST_REPORT.md`.
- Backend tests live in `backend/api/tests.py`.

## Notes

- The backend uses SQLite for local development so the app works without extra database setup.
- If you switch to MySQL, run `backend/mysql_workbench_setup.sql` first.
- The app is designed to support owner, vet, and admin workflows from a single codebase.
