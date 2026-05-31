# 🚀 College Management System Startup Guide

Welcome! This guide provides comprehensive, step-by-step instructions to run and verify the **College Management System (ERP)** locally.

Due to a local system permission policy restriction on your machine (where direct execution of `powershell.exe` by external agent environments is restricted with `Access is denied`), you will need to start the project's terminal services directly. This guide will walk you through exactly how to do that!

---

## 📋 Table of Contents
1. [Prerequisites](#-prerequisites)
2. [Starting the Backend Server](#-starting-the-backend-server)
3. [Starting the Frontend Client](#-starting-the-frontend-client)
4. [Default User Credentials](#-default-user-credentials)
5. [Troubleshooting & Verification](#-troubleshooting--verification)

---

## 🛠️ Prerequisites

Before running the application, make sure you have [Node.js](https://nodejs.org/) installed (version 18+ is recommended).

> [!NOTE]
> Environment variables (`.env` files) have already been set up and pre-configured for both the `client` and `server` folders to connect to your live PostgreSQL database on Supabase.

---

## 🔌 Starting the Backend Server

The backend runs on **Express.js** and connects to your live Supabase PostgreSQL database.

1. Open your terminal (Command Prompt, PowerShell, or Git Bash).
2. Navigate to the `server` directory:
   ```cmd
   cd "d:\ALL FILES\MINI PROJECT\INTESHIP\Collegemanagementsystem\server"
   ```
3. Run the development server (configured with `nodemon` for hot-reloading):
   ```bash
   npm run dev
   ```

> [!TIP]
> The server will start on **http://localhost:5000**. You should see the following logs indicating a successful connection:
> `🚀 Server running in development mode on port 5000`
> `✅ LIVE POSTGRESQL / SUPABASE CONNECTION DETECTED. Query builder is online.`

---

## 💻 Starting the Frontend Client

The frontend client is built with **Vite**, **React**, **TypeScript**, and **TanStack Router**.

1. Open a **second** terminal window.
2. Navigate to the `client` directory:
   ```cmd
   cd "d:\ALL FILES\MINI PROJECT\INTESHIP\Collegemanagementsystem\client"
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```

> [!TIP]
   The frontend will start on **http://localhost:5173**. Open this URL in your web browser to access the dashboard!

---

## 🔑 Default User Credentials

Here are the pre-configured default login credentials available in the system for testing the different role-based views.

| Role | Test Email | Password | Access Level / Dashboard Features |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `superadmin@college.com` | `password123` | Full ERP configuration, global settings, role-based controls. |
| **Admin** | `admin@college.com` | `password123` | Student, Faculty, and Course management. |
| **Faculty** | `faculty@college.com` | `password123` | Timetable views, assignments, grades submission. |
| **Student** | `student@college.com` | `password123` | Portal access, fees payment history, attendance, leaves. |
| **Parent** | `parent@college.com` | `password123` | Child tracking, attendance reports, academic reports. |
| **Transport Manager** | `transport@college.com` | `password123` | Transit Fleet allocations, bus telemetry logs, route changes. |
| **Hostel Warden** | `warden@college.com` | `password123` | Room allocations, complaint resolution, visitor logs. |
| **Librarian** | `librarian@college.com` | `password123` | Book catalogs, borrow histories, fine collection dashboard. |
| **Placement Officer** | `placement@college.com` | `password123` | Job boards, student resumes review, drive scheduling. |

---

## 🔍 Troubleshooting & Verification

### 1. Database Connection issues
If you see connection errors on server startup, verify that your internet is active and that your `.env` contains the correct database connection details.

### 2. Node Modules
If you run into missing dependencies errors when running `npm run dev`, simply execute `npm install` in the respective directory first:
```bash
# In server or client directory
npm install
```

### 3. Port Conflicts
If port `5000` or `5173` is already in use, you can free the port by locating the PID in Windows Command Prompt and terminating it:
```cmd
# Find process using port 5000
netstat -ano | findstr :5000

# Terminate process (replace <PID> with the actual process ID found)
taskkill /F /PID <PID>
```
