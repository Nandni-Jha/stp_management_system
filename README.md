# STP Management System

STP Management System is a full-stack project with a Laravel backend and a React frontend. It includes modules for users, customers, projects, milestones, assets, assignments, vendors, operators, locations, labor, fuel logs, maintenance records, and dashboard reporting.

## Tech Stack

- Backend: Laravel 8, PHP, MySQL
- Frontend: React, React Router, Axios, Mantine, Tailwind CSS
- Local server: XAMPP

## Project Structure

```text
stp/
  backend/    Laravel API
  frontend/   React application
```

## Requirements

- PHP 7.3 or higher
- Composer
- Node.js and npm
- XAMPP with Apache and MySQL

## Local Setup

### 1. Clone the repository

```powershell
git clone https://github.com/Nandni-Jha/stp_management_system.git
cd stp_management_system
```

### 2. Backend setup

```powershell
cd backend
composer install
copy .env.example .env
php artisan key:generate
```

Update `backend/.env` with your database settings. For the local XAMPP setup used in this project:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3307
DB_DATABASE=stp
DB_USERNAME=root
DB_PASSWORD=
```

Create a MySQL database named `stp`, then run:

```powershell
php artisan migrate
php artisan serve
```

Backend URL:

```text
http://127.0.0.1:8000
```

### 3. Frontend setup

Open a second terminal:

```powershell
cd frontend
npm install
copy .env.example .env
npm start
```

Frontend URL:

```text
http://127.0.0.1:3000
```

## Environment Notes

The frontend reads the API URL from `frontend/.env`:

```env
REACT_APP_API_URL=http://localhost:8000
```

If Laravel config changes do not apply immediately, clear the config cache:

```powershell
cd backend
php artisan config:clear
```

## Useful Commands

Backend:

```powershell
php artisan serve
php artisan migrate
php artisan migrate:status
php artisan config:clear
```

Frontend:

```powershell
npm start
npm run build
npm test
```

## Git Notes

The repository ignores local environment files, dependencies, build output, Laravel cache files, and local backup folders. Do not commit `.env`, `vendor/`, or `node_modules/`.
