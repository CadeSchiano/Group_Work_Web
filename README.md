# Group Project Web

A full-stack collaborative project management app built with React, Vite, Tailwind CSS, Express, Prisma, PostgreSQL, JWT auth, and local file uploads.

## Project Structure

```text
Group_work_web/
  backend/
    prisma/
    src/
  frontend/
    public/
    src/
```

## Setup

### 1. Install dependencies

```bash
npm install
npm install --prefix backend
npm install --prefix frontend
```

### 2. Configure environment variables

Copy the example files and update values:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Required backend variables:

- `DATABASE_URL`
- `JWT_SECRET`
- `PORT`
- `CLIENT_URL`

Required frontend variables:

- `VITE_API_URL`

### 3. Prepare the database

This project is configured for PostgreSQL via Prisma.

```bash
npx prisma migrate dev --schema backend/prisma/schema.prisma
npx prisma generate --schema backend/prisma/schema.prisma
```

### 4. Start development servers

Backend:

```bash
npm run dev --prefix backend
```

Frontend:

```bash
npm run dev --prefix frontend
```

## Features

- Email/password authentication with hashed passwords and JWT sessions
- Group creation and invite-code joining
- Task management with assignment, status tracking, and due dates
- Progress bars based on completed tasks
- Group file uploads with local storage
- Roadmap milestone planning
- Dashboard with recent tasks, progress, and modern card-based UI

## API Summary

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/groups`
- `POST /api/groups`
- `POST /api/groups/join`
- `GET /api/groups/:groupId`
- `POST /api/groups/:groupId/tasks`
- `PATCH /api/tasks/:taskId`
- `POST /api/groups/:groupId/files`
- `POST /api/groups/:groupId/roadmap`

## Notes

- Uploaded files are stored in `backend/uploads`.
- Prisma schema uses PostgreSQL in production and development.
- The frontend expects the backend to be reachable at `VITE_API_URL`.
