@echo off
setlocal enabledelayedexpansion
title Git - Push ALL Changes to Main

cd /d "d:\ALL FILES\MINI PROJECT\INTESHIP\Collegemanagementsystem"

echo ==============================================================
echo    COLLEGE MANAGEMENT SYSTEM - Push ALL Changes to Main
echo ==============================================================
echo.

:: ── 1. Verify git repo ─────────────────────────────────────────
git rev-parse --is-inside-work-tree >nul 2>&1
if errorlevel 1 (
  echo [ERROR] Not inside a Git repository. Exiting.
  pause & exit /b 1
)

:: ── 2. Show all changed files ──────────────────────────────────
echo [1/5] All pending changes in the repo:
echo.
git status
echo.

:: ── 3. Switch to main ─────────────────────────────────────────
echo [2/5] Switching to main branch...
git checkout main 2>nul || git checkout master 2>nul
if errorlevel 1 (
  echo [ERROR] Could not switch to main/master.
  pause & exit /b 1
)
echo.

:: ── 4. Stage EVERYTHING ───────────────────────────────────────
echo [3/5] Staging ALL changes (every file in repo)...
git add -A
echo.
echo   Staged files:
git diff --cached --name-only
echo.

:: ── 5. Commit ─────────────────────────────────────────────────
echo [4/5] Committing all changes...
git commit -m "feat: push all team changes - transport, library, fees, admin & fixes (2026-07-16)" -m "Includes all changes from the entire team today:" -m "- Transport Dashboard: telemetry, fleet management, route changes, map rendering" -m "- Library: book-return dropdown fix, custom penalty amount feature, FK join fix" -m "- Fees: admin fee management, fee controller updates, fee service" -m "- Admin: admin dashboard pages and role-based UI improvements" -m "- Server: supabase config stability, transport/fee controllers, error handling" -m "- Client: sidebar navigation, role-based routing, dashboard index updates" -m "- Startup: run_servers.bat one-click launcher script added"

if errorlevel 1 (
  echo.
  echo [INFO] Nothing to commit - all changes may already be pushed.
  echo        Repository is clean and up to date.
  echo.
  pause & exit /b 0
)
echo.

:: ── 6. Push to remote main ────────────────────────────────────
echo [5/5] Pushing to remote origin/main...
git push origin main 2>nul
if errorlevel 1 (
  echo.
  echo [RETRY] Trying origin/master...
  git push origin master 2>nul
  if errorlevel 1 (
    echo.
    echo [ERROR] Push failed! Possible reasons:
    echo   1. Remote has newer commits  -  run 'git pull' first
    echo   2. Auth/credentials issue    -  check SSH key or token
    echo   3. No internet connection
    echo.
    echo   Quick fix - run this in a terminal:
    echo     git pull origin main --rebase
    echo     git push origin main
    echo.
    pause & exit /b 1
  )
)

echo.
echo ==============================================================
echo   SUCCESS! All team changes pushed to main on remote.
echo   Branch: main
echo   Remote: origin
echo ==============================================================
echo.
pause
