@echo off
title Git Pull Main Branch Helper
echo ======================================================================
echo             COLLEGE MANAGEMENT SYSTEM - GIT PULL MAIN                 
echo ======================================================================
echo.
echo [1/3] Checking if git is installed...
where git >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Git is not installed or not in your PATH.
    echo Please install Git and try again.
    goto end
)
echo Git is installed.
echo.
echo [2/3] Checking git status...
git status
echo.
echo [3/3] Choose an option to handle local changes:
echo 1. Stash local changes, pull main, then re-apply changes (Recommended)
echo 2. Force pull (Discard all local changes in tracked files)
echo 3. Just attempt pulling directly (Standard git pull)
echo 4. Exit
echo.
set /p choice="Enter option (1-4): "

if "%choice%"=="1" (
    echo.
    echo Stashing local changes...
    git stash save "Auto-stash before pulling main"
    echo.
    echo Pulling from main branch...
    git pull origin main
    echo.
    echo Re-applying local changes (popping stash)...
    git stash pop
    goto finish
)
if "%choice%"=="2" (
    echo.
    echo WARNING: This will overwrite local changes in tracked files.
    set /p confirm="Are you sure you want to proceed? (Y/N): "
    if /i "%confirm%"=="y" (
        git fetch origin main
        git reset --hard origin/main
        echo Done resetting to origin/main.
    ) else if /i "%confirm%"=="yes" (
        git fetch origin main
        git reset --hard origin/main
        echo Done resetting to origin/main.
    ) else (
        echo Canceled.
    )
    goto finish
)
if "%choice%"=="3" (
    echo.
    echo Pulling directly...
    git pull origin main
    goto finish
)
if "%choice%"=="4" (
    goto end
)

:finish
if %errorlevel% neq 0 (
    echo.
    echo [WARNING] Command finished with errors/conflicts. Please check the log above.
) else (
    echo.
    echo [SUCCESS] Operation completed successfully!
)

:end
echo.
echo Press any key to exit.
pause >nul
