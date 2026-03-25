# Group Project Web

Group Project Web is a full-stack collaborative project management app built with React, Vite, Tailwind CSS, Express, Prisma, PostgreSQL, JWT authentication, and local file uploads.

## Stack

- Frontend: React + Vite + Tailwind CSS
- Backend: Node.js + Express
- Database: PostgreSQL via Prisma ORM
- Auth: JWT with email/password
- File storage: local filesystem uploads

## Core Features

- User signup, login, session persistence, and logout
- Group creation and invite-code joining
- Group member roster and owner tracking
- Task creation with description, assignee, due date, and status
- Group progress bars based on completed tasks
- File uploads shared inside each group
- Roadmap milestones for future planning
- Dashboard with groups, recent tasks, and status summaries

## Project Structure

```text
Group_work_web/
  backend/
    prisma/
      schema.prisma
    src/
      config/
      controllers/
      middleware/
      routes/
      utils/
    uploads/
    package.json
  frontend/
    public/
    src/
      api/
      components/
      context/
      hooks/
      layouts/
      pages/
      styles/
    package.json
    vercel.json
  package.json
  README.md
```

## Local Development

### 1. Install dependencies

From the repo root:

```bash
npm install
npm install --prefix backend
npm install --prefix frontend
```

### 2. Create environment files

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

### 3. Configure backend environment variables

`backend/.env`

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/group_project_web?schema=public"
JWT_SECRET="change-me"
PORT=4000
CLIENT_URL="http://localhost:5173"
```

### 4. Configure frontend environment variables

`frontend/.env`

```env
VITE_API_URL="http://localhost:4000/api"
```

### 5. Start PostgreSQL locally

You need a real local PostgreSQL database before Prisma commands will work.

Example database name:

```text
group_project_web
```

### 6. Prepare the Prisma schema

For local development:

```bash
npx prisma db push --schema backend/prisma/schema.prisma
npx prisma generate --schema backend/prisma/schema.prisma
```

This project currently uses `prisma db push` to sync the schema quickly in development and on Render.

### 7. Start the app

Backend:

```bash
npm run dev --prefix backend
```

Frontend:

```bash
npm run dev --prefix frontend
```

Open:

```text
http://localhost:5173
```

## Production Deployment

This repo is set up to deploy with:

- Vercel for the frontend
- Render Web Service for the backend
- Render Postgres for the database

### Current Production URLs

- Frontend: `https://group-work-web-frontend.vercel.app`
- Backend API: `https://group-work-web.onrender.com/api`
- Backend health check: `https://group-work-web.onrender.com/api/health`

### Render Backend Setup

Create a Render Web Service connected to this repo.

Recommended settings:

- Root Directory: `backend`
- Build Command: `npm install && npx prisma generate`
- Start Command: `npm start`

Required backend environment variables on Render:

- `DATABASE_URL`
- `JWT_SECRET`
- `CLIENT_URL`

Notes:

- `npm start` currently runs `prisma db push && node src/server.js`
- This allows Render to create missing tables automatically
- `CLIENT_URL` should be the Vercel frontend base URL, not a subpath

Example:

```env
CLIENT_URL="https://group-work-web-frontend.vercel.app"
```

### Vercel Frontend Setup

Create a Vercel project connected to this repo.

Recommended settings:

- Root Directory: `frontend`
- Framework Preset: `Vite`
- Build Command: `npm run build`
- Output Directory: `dist`

Required frontend environment variable on Vercel:

```env
VITE_API_URL="https://group-work-web.onrender.com/api"
```

`frontend/vercel.json` is included so client-side routes like `/auth` and `/groups/:groupId` resolve correctly.

## API Summary

### Auth

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Groups

- `GET /api/groups`
- `POST /api/groups`
- `POST /api/groups/join`
- `GET /api/groups/:groupId`

### Tasks

- `GET /api/groups/:groupId/tasks`
- `POST /api/groups/:groupId/tasks`
- `PATCH /api/tasks/:taskId`

### Files

- `GET /api/groups/:groupId/files`
- `POST /api/groups/:groupId/files`

### Roadmap

- `GET /api/groups/:groupId/roadmap`
- `POST /api/groups/:groupId/roadmap`

## Common Problems

### `Cannot GET /` on Render

Expected for the backend root URL. Test:

```text
/api/health
```

instead.

### Vercel `404: NOT_FOUND` on `/auth`

This is handled by `frontend/vercel.json`. If it happens again, confirm Vercel deployed the latest commit containing that file.

### Prisma error: `The table public.User does not exist`

The database schema has not been created yet. On this repo, the backend solves that by running:

```bash
prisma db push
```

during `npm start`.

If that error appears in production:

1. Confirm Render deployed the latest commit.
2. Confirm Render Start Command is `npm start`.
3. Check the Render logs for successful Prisma schema sync output.

## File Upload Storage Limitation

The app currently stores files on the backend server filesystem in:

```text
backend/uploads
```

This is acceptable for local development and short-lived demos, but it has an important production limitation on Render:

- without a persistent Render disk, uploaded files can disappear after redeploys or restarts

The rest of the app will still work, but files are not durable unless persistent storage is added.

## Future Upload Migration Note

Save this section for the next session if you want to upgrade file storage later.

### Current state

- uploads are stored locally on Render
- there is no persistent disk attached
- uploaded files may be lost on restart or redeploy

### Recommended future change

Move uploads from local filesystem storage to Cloudflare R2 using the S3-compatible API.

### Why R2

- simpler long-term storage than Render local disk
- better durability for uploaded files
- compatible with the AWS S3 SDK already common in Node apps

### Planned future work

1. Create a Cloudflare R2 bucket
2. Create R2 access credentials
3. Add backend env vars:
   - `S3_BUCKET`
   - `S3_REGION`
   - `S3_ENDPOINT`
   - `S3_ACCESS_KEY_ID`
   - `S3_SECRET_ACCESS_KEY`
4. Replace local `multer.diskStorage(...)` with in-memory upload handling plus S3 upload
5. Store the object URL or object key in the database instead of local `/uploads/...` paths
6. Update the frontend file links to use the stored cloud URL

### Prompt to use next time

Use this exact prompt in a future session:

```text
Help me move file uploads in this Group Project Web app from local Render storage to Cloudflare R2. The current app uses Express, Prisma, PostgreSQL, local uploads in backend/uploads, and is deployed with Vercel + Render.
```

## Notes

- Uploaded files currently use local storage only
- Prisma schema is in `backend/prisma/schema.prisma`
- Frontend API configuration is controlled by `VITE_API_URL`
- Backend CORS is controlled by `CLIENT_URL`
