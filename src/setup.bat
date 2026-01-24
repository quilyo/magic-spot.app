@echo off
REM MagicSpot Setup Script for Windows
REM This script sets up the development environment for MagicSpot

echo.
echo ===============================================================
echo   MagicSpot Development Environment Setup
echo ===============================================================
echo.

REM Check Python
echo Checking Python...
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python not found. Please install Python 3.9 or higher.
    exit /b 1
) else (
    for /f "tokens=*" %%i in ('python --version') do set PYTHON_VERSION=%%i
    echo [OK] Found: %PYTHON_VERSION%
)

REM Check Node.js
echo.
echo Checking Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js not found. Please install Node.js 16 or higher.
    exit /b 1
) else (
    for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
    echo [OK] Found: Node.js %NODE_VERSION%
)

REM Setup Backend
echo.
echo ===============================================================
echo Setting up Backend...
echo ===============================================================
cd backend

REM Create virtual environment
if not exist "venv" (
    echo Creating Python virtual environment...
    python -m venv venv
    echo [OK] Virtual environment created
) else (
    echo [OK] Virtual environment already exists
)

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate.bat

REM Install dependencies
echo Installing Python dependencies...
python -m pip install --quiet --upgrade pip
pip install --quiet -r requirements.txt
echo [OK] Python dependencies installed

REM Create .env if it doesn't exist
if not exist ".env" (
    echo Creating .env file...
    copy .env.example .env >nul
    
    REM Generate random secret keys using Python
    for /f "tokens=*" %%i in ('python -c "import secrets; print(secrets.token_urlsafe(32))"') do set SECRET_KEY=%%i
    for /f "tokens=*" %%i in ('python -c "import secrets; print(secrets.token_urlsafe(32))"') do set JWT_SECRET_KEY=%%i
    
    REM Update .env with generated keys
    powershell -Command "(gc .env) -replace 'your-secret-key-here', '%SECRET_KEY%' | Out-File -encoding ASCII .env"
    powershell -Command "(gc .env) -replace 'your-jwt-secret-key-here', '%JWT_SECRET_KEY%' | Out-File -encoding ASCII .env"
    
    echo [OK] .env file created with random secret keys
) else (
    echo [OK] .env file already exists
)

cd ..

REM Setup Frontend
echo.
echo ===============================================================
echo Setting up Frontend...
echo ===============================================================

REM Check if node_modules exists
if not exist "node_modules" (
    echo Installing Node.js dependencies...
    call npm install
    echo [OK] Node.js dependencies installed
) else (
    echo [OK] Node.js dependencies already installed
)

REM Create frontend .env if it doesn't exist
if not exist ".env" (
    echo Creating frontend .env file...
    copy .env.example .env >nul
    echo [OK] Frontend .env file created
) else (
    echo [OK] Frontend .env file already exists
)

REM Summary
echo.
echo ===============================================================
echo   Setup Complete!
echo ===============================================================
echo.

echo Next Steps:
echo.
echo Terminal 1 - Start Backend:
echo   cd backend
echo   venv\Scripts\activate
echo   python app.py
echo.
echo Terminal 2 - Start Frontend:
echo   npm run dev
echo.
echo Terminal 3 - Send Data (optional):
echo   cd backend
echo   venv\Scripts\activate
echo   python send_parking_data.py
echo.
echo Documentation:
echo   - Quick Start: See QUICK_START.md
echo   - Full Guide: See README.md
echo   - Deployment: See DEPLOYMENT_GUIDE.md
echo.
echo Happy coding!
echo.

pause
