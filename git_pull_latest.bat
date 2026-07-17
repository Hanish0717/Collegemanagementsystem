@echo off
setlocal enabledelayedexpansion
title Git - Pull Latest Project from Remote

cd /d "d:\ALL FILES\MINI PROJECT\INTESHIP\Collegemanagementsystem"

echo ==============================================================
echo    COLLEGE MANAGEMENT SYSTEM - Pull Latest from Remote
echo ==============================================================
echo.

:: ── 1. Verify git repo ────────────────────────────────────────
git rev-parse --is-inside-work-tree >nul 2>&1
if errorlevel 1 (
  echo [ERROR] Not inside a Git repository.
  pause & exit /b 1
)

:: ── 2. Show current state ─────────────────────────────────────
echo [1/5] Current branch:
git branch --show-current
echo.
echo [2/5] Uncommitted local changes:
git status --short
echo.

:: ── 3. Stash any uncommitted changes so pull works cleanly ────
echo [3/5] Stashing any local uncommitted changes...
git stash push -m "auto-stash before pull %date% %time%"
if errorlevel 1 (
  echo   Nothing to stash - workspace is clean.
) else (
  echo   Local changes stashed safely.
)
echo.

:: ── 4. Switch to main and pull ────────────────────────────────
echo [4/5] Switching to main and pulling latest...
git checkout main 2>nul || git checkout master 2>nul

git pull origin main
if errorlevel 1 (
  echo.
  echo [RETRY] Trying origin/master...
  git pull origin master
  if errorlevel 1 (
    echo.
    echo [ERROR] Pull failed. Check your internet connection or credentials.
    echo   Restoring your stashed changes...
    git stash pop
    pause & exit /b 1
  )
)
echo.

:: ── 5. Restore stashed changes on top ─────────────────────────
echo [5/5] Restoring your local stashed changes on top of pull...
git stash pop
if errorlevel 1 (
  echo   No stash to restore (workspace was already clean before pull).
) else (
  echo   Local changes restored successfully.
)
echo.

:: ── Show final log ────────────────────────────────────────────
echo Latest 5 commits after pull:
git log --oneline -5
echo.

echo ==============================================================
echo   PULL COMPLETE! Your project is now fully up to date.
echo ==============================================================
echo.
pause
