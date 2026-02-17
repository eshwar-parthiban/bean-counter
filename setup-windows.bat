@echo off
SETLOCAL EnableDelayedExpansion

echo ==========================================
echo   Bean Counter - Windows 11 Setup Script
echo ==========================================
echo.

:: Check for Node.js
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [!] Node.js not found. Please install Node.js 18+ from https://nodejs.org/
    exit /b 1
)
echo [v] Node.js found.

:: Check for npm
where npm >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [!] npm not found.
    exit /b 1
)
echo [v] npm found.

:: Install dependencies
echo.
echo [*] Installing dependencies...
call npm install
if %ERRORLEVEL% neq 0 (
    echo [!] npm install failed.
    exit /b 1
)

:: Setup environment file
if not exist .env (
    echo [*] Creating .env file...
    echo DATABASE_URL="file:./dev.db" > .env
) else (
    echo [v] .env file already exists.
)

:: Create data directory for CSV uploads
if not exist data\raw (
    echo [*] Creating data/raw directory...
    mkdir data\raw
)

:: Run Prisma migrations/generate
echo.
echo [*] Initialising Database...
npx prisma generate
npx prisma db push

:: Seed database
echo.
echo [*] Seeding database...
npx prisma db seed

echo.
echo ==========================================
echo   Setup Complete!
echo ==========================================
echo.
echo To start the development server, run:
echo   npm run dev
echo.
pause
