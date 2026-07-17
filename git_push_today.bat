@echo off
setlocal enabledelayedexpansion
title Git - Branch, Commit, Merge & Push

cd /d "d:\ALL FILES\MINI PROJECT\INTESHIP\Collegemanagementsystem"

echo ==============================================================
echo   COLLEGE MANAGEMENT SYSTEM - Git Branch + Merge + Push
echo ==============================================================
echo.

:: ── 1. Verify git repo ─────────────────────────────────────────
git rev-parse --is-inside-work-tree >nul 2>&1
if errorlevel 1 (
  echo [ERROR] Not inside a Git repository. Exiting.
  pause & exit /b 1
)

:: ── 2. Show current status ─────────────────────────────────────
echo [1/7] Current branch and status:
git branch --show-current
git status --short
echo.

:: ── 3. Make sure we are on main (or master) ────────────────────
echo [2/7] Switching to main branch...
git checkout main 2>nul || git checkout master 2>nul
if errorlevel 1 (
  echo [ERROR] Could not switch to main/master. Check branch name.
  pause & exit /b 1
)
echo.

:: ── 4. Pull latest main so merge is clean ──────────────────────
echo [3/7] Pulling latest changes from remote main...
git pull origin main 2>nul || git pull origin master 2>nul
echo.

:: ── 5. Create the feature branch ───────────────────────────────
set BRANCH=feature/library-book-return-penalty-fix
echo [4/7] Creating feature branch: %BRANCH%
git checkout -b %BRANCH%
if errorlevel 1 (
  echo [WARN] Branch may already exist. Checking it out...
  git checkout %BRANCH%
)
echo.

:: ── 6. Stage all changes ───────────────────────────────────────
echo [5/7] Staging all changes...
git add -A
echo.

:: Show what is staged
echo   Files staged for commit:
git diff --cached --name-only
echo.

:: ── 7. Commit ──────────────────────────────────────────────────
set MSG=feat(library): fix book-return dropdown titles + add custom penalty amount

echo [6/7] Committing with message:
echo   "%MSG%"
echo.
git commit -m "%MSG%" -m "Changes made today (2026-07-16):" -m "- Fixed 'Process Return' dropdown not showing book names (Supabase FK column/alias naming collision in getIssuedBooks; added books!book join hint + manual books map fallback)" -m "- Added manual penalty override UI: toggle switch, custom amount input, quick-pick buttons (0/100/250/500), and final-penalty summary bar" -m "- Backend returnBook now accepts optional fineAmount in request body to override auto-calculated fine" -m "- Updated libraryService.ts returnBook() signature to pass fineAmount to API" -m "- Fixed empty-string title fallback to show 'Unknown Book' in all dropdown labels" -m "- Created run_servers.bat for one-click frontend+backend startup"

if errorlevel 1 (
  echo [WARN] Nothing new to commit, or commit failed.
) else (
  echo   Commit successful.
)
echo.

:: ── 8. Push feature branch ─────────────────────────────────────
echo [7/7] Pushing feature branch to remote...
git push -u origin %BRANCH%
if errorlevel 1 (
  echo [ERROR] Push of feature branch failed. Check your remote/auth.
  pause & exit /b 1
)
echo.

:: ── 9. Switch back to main and merge ───────────────────────────
echo [8/8] Merging feature branch into main...
git checkout main 2>nul || git checkout master 2>nul
git merge --no-ff %BRANCH% -m "Merge %BRANCH% into main" -m "Library: book-return dropdown fix + custom penalty amount feature"
if errorlevel 1 (
  echo [ERROR] Merge failed. Resolve conflicts manually, then run:
  echo   git add -A ^&^& git commit ^&^& git push origin main
  pause & exit /b 1
)
echo.

:: ── 10. Push main ──────────────────────────────────────────────
echo [9/9] Pushing merged main to remote...
git push origin main 2>nul || git push origin master 2>nul
if errorlevel 1 (
  echo [ERROR] Push of main failed. Check your remote/auth.
  pause & exit /b 1
)

echo.
echo ==============================================================
echo   ALL DONE!
echo   Feature branch : %BRANCH%  (pushed)
echo   main           : merged + pushed
echo ==============================================================
echo.
pause
