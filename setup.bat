@echo off
setlocal enabledelayedexpansion

:: CyberSage v2.0 - Windows Automated Installer
:: Professional Security Scanner Setup for Windows 10/11

color 0A
mode con: cols=100 lines=40

echo ================================================================================
echo.
echo        @@@@@@  @   @ @@@@@ @@@@@ @@@@   @@@@   @@@   @@@@  @@@@@
echo       @       @   @ @   @ @     @   @ @      @   @ @     @    
echo       @       @@@@@ @@@@  @@@@  @@@@   @@@  @@@@@ @  @@ @@@@  
echo       @       @   @ @   @ @     @   @     @ @   @ @   @ @     
echo        @@@@@@  @   @ @@@@@ @@@@@ @   @ @@@@  @   @  @@@@ @@@@@
echo.
echo                          v2.0 Professional Edition
echo                         Windows Automated Installer
echo.
echo ================================================================================
echo.

:: Check for Administrator privileges
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo [ERROR] This script requires Administrator privileges!
    echo.
    echo Please right-click this file and select "Run as Administrator"
    echo.
    pause
    exit /b 1
)

echo [*] Running with Administrator privileges
echo.

:: Set paths
set "PROJECT_DIR=%~dp0"
set "BACKEND_DIR=%PROJECT_DIR%backend"
set "FRONTEND_DIR=%PROJECT_DIR%frontend"
set "TOOLS_DIR=%PROJECT_DIR%tools"
set "LOG_FILE=%PROJECT_DIR%installation.log"

echo [*] Installation directory: %PROJECT_DIR%
echo [*] Log file: %LOG_FILE%
echo.

:: Start logging
echo CyberSage v2.0 Installation Log > "%LOG_FILE%"
echo Started: %date% %time% >> "%LOG_FILE%"
echo. >> "%LOG_FILE%"

:: ============================================================================
:: STEP 1: Check System Requirements
:: ============================================================================

echo ================================================================================
echo STEP 1: Checking System Requirements
echo ================================================================================
echo.

:: Check Windows version
for /f "tokens=4-5 delims=. " %%i in ('ver') do set VERSION=%%i.%%j
echo [*] Windows Version: %VERSION% >> "%LOG_FILE%"

if "%VERSION%" LSS "10.0" (
    echo [WARNING] Windows 10 or higher is recommended
    echo [WARNING] You are running an older version. Continue at your own risk.
    echo.
    timeout /t 3 >nul
)

echo [OK] Windows version check passed
echo.

:: ============================================================================
:: STEP 2: Install Chocolatey (Package Manager)
:: ============================================================================

echo ================================================================================
echo STEP 2: Installing Chocolatey Package Manager
echo ================================================================================
echo.

where choco >nul 2>&1
if %errorLevel% neq 0 (
    echo [*] Chocolatey not found. Installing...
    echo [*] Installing Chocolatey... >> "%LOG_FILE%"
    
    powershell -NoProfile -ExecutionPolicy Bypass -Command "Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))" >> "%LOG_FILE%" 2>&1
    
    if !errorLevel! neq 0 (
        echo [ERROR] Failed to install Chocolatey
        echo [ERROR] Chocolatey installation failed >> "%LOG_FILE%"
        goto :error
    )
    
    :: Refresh environment variables
    call refreshenv >nul 2>&1
    
    echo [OK] Chocolatey installed successfully
) else (
    echo [OK] Chocolatey is already installed
)
echo.

:: ============================================================================
:: STEP 3: Install Python 3.11
:: ============================================================================

echo ================================================================================
echo STEP 3: Installing Python 3.11
echo ================================================================================
echo.

where python >nul 2>&1
if %errorLevel% neq 0 (
    echo [*] Python not found. Installing Python 3.11...
    echo [*] Installing Python 3.11... >> "%LOG_FILE%"
    
    choco install python311 -y --force >> "%LOG_FILE%" 2>&1
    
    if !errorLevel! neq 0 (
        echo [ERROR] Failed to install Python
        echo [ERROR] Python installation failed >> "%LOG_FILE%"
        goto :error
    )
    
    :: Refresh PATH
    call refreshenv >nul 2>&1
    
    echo [OK] Python installed successfully
) else (
    for /f "tokens=2" %%i in ('python --version 2^>^&1') do set PYTHON_VERSION=%%i
    echo [OK] Python !PYTHON_VERSION! is already installed
)

:: Verify Python installation
python --version >> "%LOG_FILE%" 2>&1
if %errorLevel% neq 0 (
    echo [ERROR] Python verification failed
    goto :error
)

echo.

:: ============================================================================
:: STEP 4: Install Node.js and npm
:: ============================================================================

echo ================================================================================
echo STEP 4: Installing Node.js 18 LTS
echo ================================================================================
echo.

where node >nul 2>&1
if %errorLevel% neq 0 (
    echo [*] Node.js not found. Installing Node.js 18 LTS...
    echo [*] Installing Node.js... >> "%LOG_FILE%"
    
    choco install nodejs-lts -y --force >> "%LOG_FILE%" 2>&1
    
    if !errorLevel! neq 0 (
        echo [ERROR] Failed to install Node.js
        echo [ERROR] Node.js installation failed >> "%LOG_FILE%"
        goto :error
    )
    
    :: Refresh PATH
    call refreshenv >nul 2>&1
    
    echo [OK] Node.js installed successfully
) else (
    for /f "tokens=*" %%i in ('node --version 2^>^&1') do set NODE_VERSION=%%i
    echo [OK] Node.js !NODE_VERSION! is already installed
)

:: Verify Node.js installation
node --version >> "%LOG_FILE%" 2>&1
npm --version >> "%LOG_FILE%" 2>&1

echo.

:: ============================================================================
:: STEP 5: Install Git
:: ============================================================================

echo ================================================================================
echo STEP 5: Installing Git
echo ================================================================================
echo.

where git >nul 2>&1
if %errorLevel% neq 0 (
    echo [*] Git not found. Installing Git...
    echo [*] Installing Git... >> "%LOG_FILE%"
    
    choco install git -y --force >> "%LOG_FILE%" 2>&1
    
    if !errorLevel! neq 0 (
        echo [ERROR] Failed to install Git
        echo [ERROR] Git installation failed >> "%LOG_FILE%"
        goto :error
    )
    
    call refreshenv >nul 2>&1
    
    echo [OK] Git installed successfully
) else (
    echo [OK] Git is already installed
)

echo.

:: ============================================================================
:: STEP 6: Setup Python Backend
:: ============================================================================

echo ================================================================================
echo STEP 6: Setting up Python Backend
echo ================================================================================
echo.

cd /d "%BACKEND_DIR%"

echo [*] Creating Python virtual environment...
echo [*] Creating virtual environment... >> "%LOG_FILE%"

python -m venv venv >> "%LOG_FILE%" 2>&1

if !errorLevel! neq 0 (
    echo [ERROR] Failed to create virtual environment
    echo [ERROR] Virtual environment creation failed >> "%LOG_FILE%"
    goto :error
)

echo [OK] Virtual environment created
echo.

echo [*] Activating virtual environment...
call venv\Scripts\activate.bat

echo [*] Upgrading pip...
python -m pip install --upgrade pip >> "%LOG_FILE%" 2>&1

echo [*] Installing Python dependencies...
echo [*] This may take 5-10 minutes...
echo [*] Installing Python packages... >> "%LOG_FILE%"

pip install -r requirements.txt >> "%LOG_FILE%" 2>&1

if !errorLevel! neq 0 (
    echo [ERROR] Failed to install Python dependencies
    echo [ERROR] Python dependencies installation failed >> "%LOG_FILE%"
    goto :error
)

echo [OK] Python dependencies installed
echo.

:: Create .env file if it doesn't exist
if not exist ".env" (
    echo [*] Creating .env configuration file...
    (
        echo SECRET_KEY=cybersage_v2_windows_%RANDOM%%RANDOM%
        echo OPENROUTER_API_KEY=
        echo FLASK_ENV=production
        echo FLASK_DEBUG=False
        echo DATABASE_PATH=cybersage_v2.db
    ) > .env
    echo [OK] .env file created
)

:: Initialize database
echo [*] Initializing database...
python -c "from core.database import Database; db = Database(); print('[Database] Initialized successfully')" >> "%LOG_FILE%" 2>&1

call deactivate

cd /d "%PROJECT_DIR%"

echo.

:: ============================================================================
:: STEP 7: Setup React Frontend
:: ============================================================================

echo ================================================================================
echo STEP 7: Setting up React Frontend
echo ================================================================================
echo.

cd /d "%FRONTEND_DIR%"

echo [*] Installing Node.js dependencies...
echo [*] This may take 5-10 minutes...
echo [*] Installing npm packages... >> "%LOG_FILE%"

call npm install >> "%LOG_FILE%" 2>&1

if !errorLevel! neq 0 (
    echo [ERROR] Failed to install Node.js dependencies
    echo [ERROR] npm install failed >> "%LOG_FILE%"
    goto :error
)

echo [OK] Node.js dependencies installed
echo.

:: Create frontend .env
if not exist ".env" (
    echo [*] Creating frontend .env file...
    echo REACT_APP_BACKEND_URL=http://localhost:5000 > .env
    echo [OK] Frontend .env file created
)

cd /d "%PROJECT_DIR%"

echo.

:: ============================================================================
:: STEP 8: Create Startup Scripts
:: ============================================================================

echo ================================================================================
echo STEP 8: Creating Startup Scripts
echo ================================================================================
echo.

:: Create start-backend.bat
echo [*] Creating start-backend.bat...
(
    echo @echo off
    echo title CyberSage v2.0 - Backend Server
    echo color 0E
    echo.
    echo ================================================================================
    echo                    CyberSage v2.0 - Backend Server
    echo ================================================================================
    echo.
    echo [*] Starting backend server...
    echo [*] Backend URL: http://localhost:5000
    echo [*] API Health: http://localhost:5000/api/health
    echo.
    echo Press Ctrl+C to stop the server
    echo.
    echo ================================================================================
    echo.
    cd /d "%BACKEND_DIR%"
    call venv\Scripts\activate.bat
    python app.py
    pause
) > start-backend.bat

echo [OK] start-backend.bat created
echo.

:: Create start-frontend.bat
echo [*] Creating start-frontend.bat...
(
    echo @echo off
    echo title CyberSage v2.0 - Frontend Dashboard
    echo color 0B
    echo.
    echo ================================================================================
    echo                   CyberSage v2.0 - Frontend Dashboard
    echo ================================================================================
    echo.
    echo [*] Starting frontend development server...
    echo [*] Dashboard URL: http://localhost:3000
    echo [*] Browser will open automatically...
    echo.
    echo Press Ctrl+C to stop the server
    echo.
    echo ================================================================================
    echo.
    cd /d "%FRONTEND_DIR%"
    call npm start
    pause
) > start-frontend.bat

echo [OK] start-frontend.bat created
echo.

:: Create start-all.bat
echo [*] Creating start-all.bat...
(
    echo @echo off
    echo title CyberSage v2.0 - Starting All Services
    echo color 0A
    echo.
    echo ================================================================================
    echo                    CyberSage v2.0 - Starting All Services
    echo ================================================================================
    echo.
    echo [*] Starting backend server in new window...
    start "" "%PROJECT_DIR%start-backend.bat"
    timeout /t 5 /nobreak ^>nul
    echo.
    echo [*] Starting frontend dashboard in new window...
    start "" "%PROJECT_DIR%start-frontend.bat"
    echo.
    echo ================================================================================
    echo [*] CyberSage v2.0 is starting up!
    echo.
    echo Backend:  http://localhost:5000
    echo Frontend: http://localhost:3000
    echo.
    echo [*] Browser will open automatically...
    echo [*] Close this window to stop all services
    echo ================================================================================
    echo.
    timeout /t 10 /nobreak
    start http://localhost:3000
    pause
) > start-all.bat

echo [OK] start-all.bat created
echo.

:: Create desktop shortcuts
echo [*] Creating desktop shortcuts...

:: Get Desktop path
for /f "tokens=3*" %%a in ('reg query "HKEY_CURRENT_USER\Software\Microsoft\Windows\CurrentVersion\Explorer\User Shell Folders" /v Desktop 2^>nul') do set DESKTOP=%%b
for /f "tokens=*" %%a in ('echo %DESKTOP%') do set DESKTOP=%%a

:: Create shortcut using PowerShell
powershell -Command "$WS = New-Object -ComObject WScript.Shell; $SC = $WS.CreateShortcut('%DESKTOP%\CyberSage v2.0.lnk'); $SC.TargetPath = '%PROJECT_DIR%start-all.bat'; $SC.WorkingDirectory = '%PROJECT_DIR%'; $SC.Description = 'CyberSage v2.0 - Professional Security Scanner'; $SC.Save()" >> "%LOG_FILE%" 2>&1

echo [OK] Desktop shortcut created
echo.

:: ============================================================================
:: STEP 9: Configure Windows Firewall
:: ============================================================================

echo ================================================================================
echo STEP 9: Configuring Windows Firewall
echo ================================================================================
echo.

echo [*] Adding firewall rules for ports 3000 and 5000...
netsh advfirewall firewall add rule name="CyberSage Backend (Port 5000)" dir=in action=allow protocol=TCP localport=5000 >> "%LOG_FILE%" 2>&1
netsh advfirewall firewall add rule name="CyberSage Frontend (Port 3000)" dir=in action=allow protocol=TCP localport=3000 >> "%LOG_FILE%" 2>&1

echo [OK] Firewall rules configured
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
echo Installation Summary:
echo   [OK] Python 3.11 installed
echo   [OK] Node.js 18 installed
echo   [OK] Backend dependencies installed
echo   [OK] Frontend dependencies installed
echo   [OK] Database initialized
echo   [OK] Startup scripts created
echo   [OK] Desktop shortcut created
echo.
echo ================================================================================
echo.
echo Quick Start:
echo   1. Double-click "CyberSage v2.0" icon on your Desktop
echo   2. Or run: start-all.bat
echo   3. Open: http://localhost:3000
echo.
echo Manual Start:
echo   Backend:  start-backend.bat
echo   Frontend: start-frontend.bat
echo.
echo Logs: %LOG_FILE%
echo.
echo ================================================================================
echo.
echo [*] Installation completed at %date% %time% >> "%LOG_FILE%"
echo.
echo Press any key to exit...
pause >nul

exit /b 0

:error
echo.
echo ================================================================================
echo                              INSTALLATION FAILED
echo ================================================================================
echo.
echo [ERROR] Installation encountered errors. Please check:
echo   1. Internet connection is active
echo   2. Antivirus is not blocking the installation
echo   3. You have Administrator privileges
echo   4. Log file: %LOG_FILE%
echo.
echo [*] Installation failed at %date% %time% >> "%LOG_FILE%"
echo.
echo For support, visit: https://github.com/AsHfIEXE/CyberSage-2.0/issues
echo.
pause
exit /b 1