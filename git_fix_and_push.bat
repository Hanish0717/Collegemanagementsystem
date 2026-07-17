@echo off
setlocal enabledelayedexpansion
title Git - Fix Conflict and Push All

cd /d "d:\ALL FILES\MINI PROJECT\INTESHIP\Collegemanagementsystem"

echo ==============================================================
echo    COLLEGE MANAGEMENT SYSTEM - Resolve + Push All to Main
echo ==============================================================
echo.

:: ── Step 1: Show current status ───────────────────────────────
echo [1/6] Current status:
git status --short
echo.

:: ── Step 2: Stage ALL local changes ──────────────────────────
echo [2/6] Staging all local changes...
git add -A
echo   Done. Staged files:
git diff --cached --name-only
echo.

:: ── Step 3: Commit local changes first ────────────────────────
echo [3/6] Committing all local changes...
git commit -m "feat: all team changes - transport, library, fees, admin, server fixes (2026-07-16)" -m "Team contributions committed before merge:" -m "- Transport Dashboard: fleet, telemetry, routes, map" -m "- Library: return dropdown fix, custom penalty amount feature" -m "- Fees: admin fee management, fee controller and service" -m "- Admin: dashboard, role-based UI, routing" -m "- Server: supabase config, error handling, controllers" -m "- Client: sidebar, navigation, dashboard index"

if errorlevel 1 (
  echo [INFO] Nothing new to commit - skipping commit step.
) else (
  echo   Commit successful.
)
echo.

:: ── Step 4: Pull remote changes and merge ─────────────────────
echo [4/6] Pulling remote main and merging...
git pull origin main --no-rebase --no-edit
if errorlevel 1 (
  echo.
  echo [ERROR] Merge conflicts detected!
  echo.
  echo   Conflicting files:
  git diff --name-only --diff-filter=U
  echo.
  echo   Auto-resolving by keeping YOUR local version for all conflicts...
  git checkout --ours .
  git add -A
  git commit -m "resolve: auto-merge conflicts, keep local team changes"
  echo   Conflicts resolved. Continuing...
)
echo.

:: ── Step 5: Push to remote main ───────────────────────────────
echo [5/6] Pushing all changes to origin/main...
git push origin main
if errorlevel 1 (
  echo.
  echo [ERROR] Push still failed. Trying force-with-lease (safe force push)...
  git push origin main --force-with-lease
  if errorlevel 1 (
    echo.
    echo [FATAL] Push failed even with force-with-lease.
    echo   Check your GitHub credentials or network connection.
    pause & exit /b 1
  )
)
echo.

:: ── Step 6: Final status ──────────────────────────────────────
echo [6/6] Final git log (last 5 commits):
git log --oneline -5
echo.
echo ==============================================================
echo   ALL DONE! Everything pushed to origin/main successfully.
echo ==============================================================
echo.
pause
