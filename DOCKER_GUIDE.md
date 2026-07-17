# College ERP - Team Docker & Database Guide

This guide explains how to set up, run, and seed the local PostgreSQL database using Docker so all team members can collaborate seamlessly.

---

## Prerequisites
Ensure you have **Docker Desktop** installed and running on your machine:
- [Download Docker Desktop for Windows/macOS/Linux](https://www.docker.com/products/docker-desktop/)

---

## Quick Start (Two Strategies)

You can choose either of the two ways to run the project during development:

### Strategy 1: Run the Database in Docker (Recommended for active coding)
Run only the database and pgAdmin inside Docker, and run the backend/frontend servers locally on your host machine. This gives you the fastest hot-reloading speed.

1. **Start the Database Container:**
   ```bash
   docker compose up db pgadmin -d
   ```

2. **Configure your Backend Environment:**
   Open `server/.env` and update the connection details to point to your local PostgreSQL:
   ```env
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/college_management
   DATABASE_SSL=false
   FORCE_MOCK_MODE=false
   ```

3. **Initialize the Database Schema (First time or when schema changes):**
   Run the schema setup script inside the `server/` directory:
   ```bash
   # Run from the server folder:
   node setup_supabase_db.js
   ```

4. **Seed the Database with Mock Data:**
   Run the SQL-based seeder script inside the `server/` directory:
   ```bash
   # Run from the server folder:
   node src/seeders/seed_supabase.js
   ```

5. **Start your backend and frontend servers locally as usual:**
   - Server: `npm run dev` (inside `server/`)
   - Client: `npm run dev` (inside `client/`)

---

### Strategy 2: Run the Entire Stack in Docker (Zero-install setup)
Run the database, pgAdmin, backend server, and client app all containerized.

1. **Spin up the entire stack:**
   ```bash
   docker compose up --build
   ```

2. **Initialize and Seed the Database inside the running server container:**
   Open a new terminal and run:
   ```bash
   # Setup database tables
   docker compose exec server node setup_supabase_db.js

   # Seed mock data
   docker compose exec server node src/seeders/seed_supabase.js
   ```

---

## URLs & Ports

- **Frontend Client:** [http://localhost:5173](http://localhost:5173)
- **Backend API:** [http://localhost:5000](http://localhost:5000)
- **pgAdmin (DB GUI Viewer):** [http://localhost:5050](http://localhost:5050)
  - **Login Email:** `admin@admin.com`
  - **Login Password:** `admin`

### Connecting pgAdmin to PostgreSQL:
1. Log in to pgAdmin at `http://localhost:5050`.
2. Click **Add New Server**.
3. Under **General**, name the connection (e.g., `Local College ERP`).
4. Under **Connection**, enter:
   - **Host name/address:** `db` (since pgAdmin and DB run in the same docker network)
   - **Port:** `5432`
   - **Maintenance database:** `college_management`
   - **Username:** `postgres`
   - **Password:** `postgres`
5. Click **Save** to view and query your database tables!

---

## Collaborating with Git

- **Schema Updates:** If someone adds a table or modifies columns, update `server/complete_schema.sql` and `server/setup_supabase_db.js` and push it to Git.
- **Pulling changes:** When you pull changes from Git, simply re-run `node setup_supabase_db.js` (or `docker compose exec server node setup_supabase_db.js`) to apply the schema updates instantly without losing your existing docker volumes.
