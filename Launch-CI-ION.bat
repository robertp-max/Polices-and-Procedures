@echo off
title CI-ION Policy App — Launcher
color 0A

echo.
echo  ╔══════════════════════════════════════════════════════╗
echo  ║         CI-ION Policy App — Care Indeed              ║
echo  ║     Home Health Policies ^& Procedures System         ║
echo  ╚══════════════════════════════════════════════════════╝
echo.

cd /d "C:\AI\Git\training\HomeHealth\Policies_and_Procedures"

:: Check Node.js
where node >nul 2>&1
if %errorlevel% neq 0 (
  echo [ERROR] Node.js not found. Please install from https://nodejs.org
  pause
  exit /b 1
)

:: Check node_modules
if not exist "node_modules\" (
  echo [SETUP] Installing dependencies...
  call npm install
  if %errorlevel% neq 0 (
    echo [ERROR] npm install failed.
    pause
    exit /b 1
  )
)

echo [1/2] Starting API server on port 8787...
start "CI-ION API Server" cmd /k "cd /d C:\AI\Git\training\HomeHealth\Policies_and_Procedures && npm run server"

:: Wait for server to start
timeout /t 3 /nobreak >nul

echo [2/2] Starting Vite dev server on port 5173...
start "CI-ION Dev Server" cmd /k "cd /d C:\AI\Git\training\HomeHealth\Policies_and_Procedures && npm run dev"

:: Wait for Vite to start
timeout /t 4 /nobreak >nul

echo.
echo  Opening CI-ION in your browser...
start "" "http://localhost:5173"

echo.
echo  ┌─────────────────────────────────────────────────────┐
echo  │  App:    http://localhost:5173                       │
echo  │  API:    http://localhost:8787                       │
echo  │  Hubstaff Staging: http://localhost:5173/hubstaff    │
echo  └─────────────────────────────────────────────────────┘
echo.
echo  Both server windows are now running.
echo  Close those windows to stop the app.
echo.
pause
