@echo off
setlocal
cd /d "%~dp0"
title QBT Management System - Windows EXE Build

echo ============================================
echo   QBT Management System - EXE Build
 echo ============================================
 echo.

if not exist package.json (
  echo ERROR: package.json not found.
  pause
  exit /b 1
)

if exist release rmdir /s /q release
if exist dist rmdir /s /q dist

where node >nul 2>&1
if errorlevel 1 (
  echo ERROR: Node.js is not installed.
  pause
  exit /b 1
)

if not exist node_modules (
  echo Installing dependencies...
  call npm install
  if errorlevel 1 goto :fail
) else (
  echo Installing/repairing dependencies...
  call npm install
  if errorlevel 1 goto :fail
)

echo.
echo Building Windows installer...
call npm run build:exe
if errorlevel 1 goto :fail

echo.
echo ============================================
echo   BUILD SUCCESSFUL
echo ============================================
echo Installer:
echo %CD%\release\QBT Management System Setup 0.0.0.exe
pause
exit /b 0

:fail
echo.
echo ERROR: EXE build failed.
pause
exit /b 1
