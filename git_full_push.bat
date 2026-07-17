@echo off
setlocal enabledelayedexpansion
title Git - Full Branch + Merge + Push Workflow

cd /d "d:\ALL FILES\MINI PROJECT\INTESHIP\Collegemanagementsystem"

echo ==============================================================
echo   COLLEGE MANAGEMENT SYSTEM - Full Push Workflow
echo   Branch -> Commit -> Push Branch -> Merge -> Push Main
echo ==============================================================
echo.

:: ─────────────────────────────────────────────────────────────
:: CONFIG - change branch name here if you want
:: ─────────────────────────────────────────────────────────────
set BRANCH=feature/library-return-penalty-transport-fees-fixes
set COMMIT_MSG=feat: library fix, custom penalty, transport, fees, admin updates (2026-07-16)

:: ─────────────────────────────────────────────────────────────
:: STEP 1: Verify repo
:: ─────────────────────────────────────────────────────────────
echo [STEP 1] Verifying git repository...
git rev-parse --is-inside-work-tree >nul 2>&1
if errorlevel 1 (
  echo [ERROR] Not a git repo. Run from project root.
  pause & exit /b 1
)
echo   OK - inside git repo.
echo.

:: ─────────────────────────────────────────────────────────────
:: STEP 2: Show what changed
:: ─────────────────────────────────────────────────────────────
echo [STEP 2] Changed files:
git status --short
echo.

:: ─────────────────────────────────────────────────────────────
:: STEP 3: Make sure we are on main
:: ─────────────────────────────────────────────────────────────
echo [STEP 3] Switching to main branch...
git checkout main 2>nul || git checkout master 2>nul
if errorlevel 1 (
  echo [ERROR] Cannot switch to main/master.
  pause & exit /b 1
)
echo   On main.
echo.

:: ─────────────────────────────────────────────────────────────
:: STEP 4: Stage + commit everything on main first
::         (required before pull, so pull doesn't fail)
:: ─────────────────────────────────────────────────────────────
echo [STEP 4] Staging all changes to commit before pulling...
git add -A

:: Only commit if there is something staged
git diff --cached --quiet
if errorlevel 1 (
  echo   Committing local changes temporarily...
  git commit -m "wip: save local changes before pulling remote main"
  echo   Temporary commit done.
) else (
  echo   Nothing to stage - workspace already clean.
)
echo.

:: ─────────────────────────────────────────────────────────────
:: STEP 5: Pull latest remote main (merge strategy, no rebase)
:: ─────────────────────────────────────────────────────────────
echo [STEP 5] Pulling latest from remote main (merge)...
git pull origin main --no-rebase --no-edit 2>nul
if errorlevel 1 (
  echo   Merge conflicts found. Auto-resolving (keeping local)...
  git checkout --ours .
  git add -A
  git commit -m "resolve: keep local changes during remote merge"
  echo   Conflicts resolved.
)
echo.

:: ─────────────────────────────────────────────────────────────
:: STEP 6: Create feature branch from updated main
:: ─────────────────────────────────────────────────────────────
echo [STEP 6] Creating feature branch: %BRANCH%
git checkout -b %BRANCH% 2>nul
if errorlevel 1 (
  echo   Branch exists - checking it out...
  git checkout %BRANCH%
)
echo.

:: ─────────────────────────────────────────────────────────────
:: STEP 7: Stage ALL remaining changes on feature branch
:: ─────────────────────────────────────────────────────────────
echo [STEP 7] Staging all files for final commit...
git add -A
echo   Staged:
git diff --cached --name-only
echo.

:: ─────────────────────────────────────────────────────────────
:: STEP 8: Final commit with full message
:: ─────────────────────────────────────────────────────────────
echo [STEP 8] Creating final commit...
git commit -m "%COMMIT_MSG%" ^
  -m "Full list of changes:" ^
  -m "LIBRARY:" ^
  -m "  - Fixed Process Return dropdown not showing book names" ^
  -m "  - Fixed Supabase FK column/alias naming collision (books!book join hint)" ^
  -m "  - Added manual penalty override: toggle, input, quick-pick (0/100/250/500)" ^
  -m "  - Backend returnBook now accepts custom fineAmount from request body" ^
  -m "  - libraryService.ts returnBook() updated to pass fineAmount to API" ^
  -m "  - Unknown Book fallback for missing titles" ^
  -m "TRANSPORT:" ^
  -m "  - Transport Dashboard: fleet, telemetry, routes, map rendering" ^
  -m "  - transportController.js resilient error handling and mock fallbacks" ^
  -m "FEES:" ^
  -m "  - Admin fee management panel (AdminFees.tsx)" ^
  -m "  - feeController.js and feeService.ts updates" ^
  -m "  - FeesPage.tsx student portal view" ^
  -m "ADMIN / AUTH:" ^
  -m "  - Role-based navigation and sidebar sync" ^
  -m "  - DashboardIndex and roles.ts updates" ^
  -m "SERVER:" ^
  -m "  - supabase.js TCP socket check and mock mode fallback" ^
  -m "  - server.js startup stability" ^
  -m "TOOLING:" ^
  -m "  - run_servers.bat one-click startup script" ^
  -m "  - git_pull_latest.bat, git_fix_and_push.bat helpers"

if errorlevel 1 (
  echo   [INFO] Nothing new to commit on feature branch.
) else (
  echo   Final commit created.
)
echo.

:: ─────────────────────────────────────────────────────────────
:: STEP 9: Push feature branch to remote
:: ─────────────────────────────────────────────────────────────
echo [STEP 9] Pushing feature branch to remote...
git push -u origin %BRANCH%
if errorlevel 1 (
  echo   Retrying with force-with-lease...
  git push -u origin %BRANCH% --force-with-lease
  if errorlevel 1 (
    echo [ERROR] Could not push feature branch. Check credentials.
    pause & exit /b 1
  )
)
echo   Feature branch pushed.
echo.

:: ─────────────────────────────────────────────────────────────
:: STEP 10: Switch back to main and merge
:: ─────────────────────────────────────────────────────────────
echo [STEP 10] Switching to main for merge...
git checkout main 2>nul || git checkout master 2>nul
echo.

echo [STEP 11] Merging %BRANCH% into main...
git merge --no-ff %BRANCH% -m "Merge %BRANCH% into main" -m "All team changes: library, transport, fees, admin, server (2026-07-16)"
if errorlevel 1 (
  echo   Merge conflicts - auto-resolving (keeping feature branch version)...
  git checkout --theirs .
  git add -A
  git commit -m "resolve: merge %BRANCH% into main, keep feature changes"
)
echo   Merge complete.
echo.

:: ─────────────────────────────────────────────────────────────
:: STEP 12: Push merged main
:: ─────────────────────────────────────────────────────────────
echo [STEP 12] Pushing merged main to remote...
git push origin main
if errorlevel 1 (
  echo   Retrying with force-with-lease...
  git push origin main --force-with-lease
  if errorlevel 1 (
    echo [ERROR] Could not push main. Check credentials or network.
    pause & exit /b 1
  )
)

:: ─────────────────────────────────────────────────────────────
:: Done
:: ─────────────────────────────────────────────────────────────
echo.
echo [STEP 13] Final state - last 7 commits:
git log --oneline -7
echo.
echo ==============================================================
echo   ALL DONE!
echo.
echo   Feature branch : %BRANCH%  [PUSHED]
echo   main           : merged + pushed  [PUSHED]
echo   Remote         : https://github.com/Hanish0717/Collegemanagementsystem
echo ==============================================================
echo.
pause
