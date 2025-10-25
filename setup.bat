@echo off
setlocal enabledelayedexpansion

:: CyberSage v2.0 - Windows Quick Setup
:: Simplified installer for Python and Node.js environments

color 0A
title CyberSage v2.0 - Windows Installer

echo.
echo ================================================================================
echo.
echo        @@@@@@  @   @ @@@@@ @@@@@ @@@@   @@@@   @@@   @@@@  @@@@@
echo       @       @   @ @   @ @     @   @ @      @   @ @     @    
echo       @       @@@@@ @@@@  @@@@  @@@@   @@@  @@@@@ @  @@ @@@@  
echo       @       @   @ @   @ @     @   @     @ @   @ @   @ @     
echo        @@@@@@  @   @ @@@@@ @@@@@ @   @ @@@@  @   @  @@@@ @@@@@
echo.
echo                          v2.0 Professional Edition
echo                         Windows Quick Installer
echo.
echo ================================================================================
echo.

:: Set paths
set "PROJECT_DIR=%~dp0"
set "BACKEND_DIR=%PROJECT_DIR%backend"
set "FRONTEND_DIR=%PROJECT_DIR%frontend"

echo [*] Installation directory: %PROJECT_DIR%
echo.

:: ============================================================================
:: Check Python
:: ============================================================================

echo [1/5] Checking Python...
where python >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python is not installed!
    echo.
    echo Please install Python 3.9+ from: https://www.python.org/downloads/
    echo Make sure to check "Add Python to PATH" during installation
    echo.
    goto :end
)

for /f "tokens=2" %%i in ('python --version 2^>^&1') do set PYTHON_VERSION=%%i
echo [OK] Python %PYTHON_VERSION% found
echo.

:: ============================================================================
:: Check Node.js
:: ============================================================================

echo [2/5] Checking Node.js...
where node >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not installed!
    echo.
    echo Please install Node.js 18+ from: https://nodejs.org/
    echo.
    goto :end
)

for /f "tokens=*" %%i in ('node --version 2^>^&1') do set NODE_VERSION=%%i
echo [OK] Node.js %NODE_VERSION% found
echo.

:: ============================================================================
:: Setup Python Backend
:: ============================================================================

echo [3/5] Setting up Python backend...
cd /d "%BACKEND_DIR%"

if not exist "venv" (
    echo     Creating virtual environment...
    python -m venv venv
    if errorlevel 1 (
        echo [ERROR] Failed to create virtual environment
        cd /d "%PROJECT_DIR%"
        goto :end
    )
)

echo     Activating virtual environment...
call venv\Scripts\activate.bat

echo     Upgrading pip...
python -m pip install --upgrade pip --quiet

echo     Installing Python dependencies...
echo     (This may take 2-5 minutes)
pip install -r requirements.txt --quiet
if errorlevel 1 (
    echo [ERROR] Failed to install Python dependencies
    echo.
    echo Try running: pip install -r requirements.txt
    call deactivate
    cd /d "%PROJECT_DIR%"
    goto :end
)

:: Create .env if missing
if not exist ".env" (
    (
        echo SECRET_KEY=cybersage_v2_windows_%RANDOM%%RANDOM%
        echo OPENROUTER_API_KEY=
        echo FLASK_ENV=production
        echo FLASK_DEBUG=False
    ) > .env
)

call deactivate
cd /d "%PROJECT_DIR%"

echo [OK] Backend setup complete
echo.

:: ============================================================================
:: Setup React Frontend
:: ============================================================================

echo [4/5] Setting up React frontend...
cd /d "%FRONTEND_DIR%"

echo     Installing Node.js dependencies...
echo     (This may take 2-5 minutes)
call npm install --silent
if errorlevel 1 (
    echo [ERROR] Failed to install Node dependencies
    echo.
    echo Try running: npm install
    cd /d "%PROJECT_DIR%"
    goto :end
)

if not exist ".env" (
    echo REACT_APP_BACKEND_URL=http://localhost:5000 > .env
)

cd /d "%PROJECT_DIR%"

echo [OK] Frontend setup complete
echo.

:: ============================================================================
:: Create Start Scripts
:: ============================================================================

echo [5/5] Creating start scripts...

:: Backend starter
(
    echo @echo off
    echo title CyberSage v2.0 - Backend Server
    echo color 0E
    echo.
    echo [*] Starting backend server...
    echo [*] Backend: http://localhost:5000
    echo [*] Press Ctrl+C to stop
    echo.
    cd /d "%BACKEND_DIR%"
    call venv\Scripts\activate.bat
    python app.py
    pause
) > start-backend.bat

:: Frontend starter
(
    echo @echo off
    echo title CyberSage v2.0 - Frontend Dashboard
    echo color 0B
    echo.
    echo [*] Starting frontend dashboard...
    echo [*] Dashboard: http://localhost:3000
    echo [*] Browser will open automatically...
    echo [*] Press Ctrl+C to stop
    echo.
    cd /d "%FRONTEND_DIR%"
    call npm start
    pause
) > start-frontend.bat

:: Combined starter
(
    echo @echo off
    echo title CyberSage v2.0 - Launcher
    echo color 0A
    echo.
    echo ================================================================================
    echo                    CyberSage v2.0 - Starting Services
    echo ================================================================================
    echo.
    echo [*] Starting backend server...
    start "CyberSage Backend" "%PROJECT_DIR%start-backend.bat"
    timeout /t 5 /nobreak ^>nul
    echo [*] Starting frontend dashboard...
    start "CyberSage Frontend" "%PROJECT_DIR%start-frontend.bat"
    echo.
    echo ================================================================================
    echo [*] CyberSage v2.0 is starting!
    echo.
    echo     Backend:  http://localhost:5000
    echo     Frontend: http://localhost:3000
    echo.
    echo [*] Close this window to stop all services
    echo ================================================================================
    echo.
    timeout /t 10 /nobreak
    start http://localhost:3000
    pause
) > start-all.bat

echo [OK] Start scripts created
echo.

:: ============================================================================
:: Installation Complete
:: ============================================================================

echo.
echo ================================================================================
echo                          INSTALLATION COMPLETE!
echo ================================================================================
echo.
echo    @@@@@ @   @ @@@@@ @@@@@ @@@@  @@@   @@@   @@@@  @@@@@
echo   @      @   @ @     @     @    @   @ @     @     @    
echo    @@@@  @   @ @     @     @@@   @@@   @@@ @  @@@ @@@@  
echo        @ @   @ @     @     @    @   @     @     @ @     
echo    @@@@   @@@   @@@@@ @@@@@ @@@@ @   @ @@@@  @@@@  @@@@@
echo.
echo              v2.0 Professional - Ready to Use!
echo.
echo ================================================================================
echo.
echo Quick Start:
echo   1. Run: start-all.bat
echo   2. Open: http://localhost:3000
echo.
echo Manual Start:
echo   Backend:  start-backend.bat
echo   Frontend: start-frontend.bat
echo.
echo ================================================================================
echo.

:end
echo Press any key to exit...
pause >nul
exit /b 0