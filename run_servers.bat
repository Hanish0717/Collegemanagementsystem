@echo off
title College Management System Runner
echo ==========================================================
echo       COLLEGE MANAGEMENT SYSTEM (ERP) RUNNER
echo ==========================================================
echo.
echo [1/2] Starting Backend Express Server in a new window...
start "CMS Backend (Port 5000)" cmd /k "cd /d "%~dp0server" && npm run dev"

echo [2/2] Starting Frontend Vite Client in a new window...
start "CMS Frontend (Port 5173)" cmd /k "cd /d "%~dp0client" && npm run dev"

echo.
echo ==========================================================
echo  Both services have been launched in separate windows!
echo  - Backend API: http://localhost:5000
echo  - Frontend App: http://localhost:5173
echo ==========================================================
echo.
pause
