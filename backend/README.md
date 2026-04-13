# Django Backend (MySQL)

This backend is configured with Django + Django REST Framework.

For local development in this workspace, it uses SQLite by default so the app runs immediately. MySQL Workbench setup is still included below if you want to switch the backend to MySQL.
Local development also enables permissive CORS so the Vite frontend can reach the API without port issues.

## 1. Create database in MySQL Workbench

1. Open MySQL Workbench.
2. Open and run [mysql_workbench_setup.sql](mysql_workbench_setup.sql).

That creates:
- Database: `petcare_db`
- User: `petcare_user`
- Password: `petcare_password`

## 2. Configure environment

1. Copy `.env.example` to `.env`.
2. Update credentials if you changed SQL defaults.
3. If you want to use MySQL locally, set `DATABASE_ENGINE=mysql`.

## 3. Install dependencies

```powershell
c:/python313/python.exe -m pip install -r requirements.txt
```

## 4. Run migrations

```powershell
c:/python313/python.exe manage.py makemigrations
c:/python313/python.exe manage.py migrate
```

If you get `Access denied for user 'petcare_user'`:

1. Re-run [mysql_workbench_setup.sql](mysql_workbench_setup.sql) in MySQL Workbench.
2. Confirm `.env` has:
	- `MYSQL_USER=petcare_user`
	- `MYSQL_PASSWORD=petcare_password`
	- `MYSQL_HOST=localhost`
3. Run migrations again.

If you want to keep working immediately without MySQL, leave `DATABASE_ENGINE=sqlite` in `.env`.

## 5. Create admin user (optional)

```powershell
c:/python313/python.exe manage.py createsuperuser
```

## 6. Start backend

```powershell
c:/python313/python.exe manage.py runserver
```

API base URL: `http://127.0.0.1:8000/api/`

## Available endpoints

- `GET /api/health/`
- `POST /api/auth/register/`
- `POST /api/auth/login/`
- `POST /api/auth/logout/`
- `GET /api/auth/me/`
- CRUD `/api/users/`
- CRUD `/api/pets/`
- CRUD `/api/appointments/`
- CRUD `/api/medical-records/`

