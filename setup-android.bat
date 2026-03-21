@echo off
title MagicSpot - Android Setup
echo =========================================
echo   MagicSpot Android APK Setup Script
echo =========================================
echo.

cd /d "%~dp0"

:: Check if .env.local exists
if not exist ".env.local" (
  echo [ERROR] Missing .env.local file!
  echo Please create a .env.local file with your Supabase credentials:
  echo.
  echo   VITE_SUPABASE_PROJECT_ID=your-project-id
  echo   VITE_SUPABASE_ANON_KEY=your-anon-key
  echo.
  echo See .env.local.example for reference.
  pause
  exit /b 1
)

echo [1/5] Installing Capacitor packages...
call npm install @capacitor/core @capacitor/cli @capacitor/android
if %errorlevel% neq 0 (
  echo [ERROR] Failed to install Capacitor. Make sure Node.js is installed.
  pause
  exit /b 1
)

echo.
echo [2/5] Building web app...
call npm run build
if %errorlevel% neq 0 (
  echo [ERROR] Build failed. Check your .env.local credentials and try again.
  pause
  exit /b 1
)

echo.
echo [3/5] Checking for Android platform...
if not exist "android" (
  echo Adding Android platform...
  call npx cap add android
) else (
  echo Android platform already exists, skipping...
)

echo.
echo [4/5] Syncing web app to Android project...
call npx cap sync android
if %errorlevel% neq 0 (
  echo [ERROR] Sync failed.
  pause
  exit /b 1
)

echo.
echo [5/5] Opening Android Studio...
call npx cap open android

echo.
echo =========================================
echo   Setup Complete!
echo =========================================
echo.
echo In Android Studio:
echo   1. Wait for Gradle to finish syncing
echo   2. Go to: Build ^> Generate Signed Bundle / APK
echo   3. Choose: APK
echo   4. Create or use an existing keystore
echo   5. Select "release" build variant
echo   6. Click Finish - your APK will be in:
echo      android\app\release\app-release.apk
echo.
pause
