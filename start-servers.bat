@echo off
setlocal enabledelayedexpansion

echo ========================================
echo   Society Management System
echo   Starting Backend and Frontend Servers
echo ========================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.10+ and add it to your PATH
    pause
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js 18+ and add it to your PATH
    pause
    exit /b 1
)

echo [1/5] Checking Python dependencies...
cd backend
python -c "import django" >nul 2>&1
if errorlevel 1 (
    echo Installing Python dependencies globally...
    pip install -r requirements.txt
    if errorlevel 1 (
        echo ERROR: Failed to install Python dependencies
        cd ..
        pause
        exit /b 1
    )
) else (
    echo Python dependencies are installed.
)
cd ..

echo [2/5] Checking Node.js dependencies...
cd frontend
if not exist "node_modules" (
    echo Installing Node.js dependencies...
    call npm install
    if errorlevel 1 (
        echo ERROR: Failed to install Node.js dependencies
        cd ..
        pause
        exit /b 1
    )
) else (
    echo Node.js dependencies are installed.
)
cd ..

echo [3/5] Checking and freeing ports 8000 and 3000...
REM Use PowerShell to kill processes on ports (more reliable)
for /f "tokens=*" %%a in ('powershell -Command "$p8000 = Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess; if ($p8000) { $p8000 | ForEach-Object { taskkill /PID $_ /F } }"') do echo %%a
for /f "tokens=*" %%a in ('powershell -Command "$p3000 = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess; if ($p3000) { $p3000 | ForEach-Object { taskkill /PID $_ /F } }"') do echo %%a
echo Ports are ready.

echo [4/5] Starting Backend Server (Django) on port 8000...
cd backend
start /B cmd /c "python manage.py runserver > ..\backend.log 2>&1"
cd ..

REM Wait a moment for backend to start
timeout /t 2 /nobreak >nul

echo [5/5] Starting Frontend Server (Next.js) on port 3000...
cd frontend
start /B cmd /c "npm run dev > ..\frontend.log 2>&1"
cd ..

echo.
echo ========================================
echo   Servers are running in the background!
echo ========================================
echo.
echo Backend:  http://localhost:8000
echo Frontend: http://localhost:3000
echo.
echo Server logs are being written to:
echo   - backend.log
echo   - frontend.log
echo.
echo ========================================
echo   TO STOP SERVERS:
echo   Press Ctrl+C or close this window
echo ========================================
echo.

REM Wait loop - Ctrl+C will trigger cleanup
:wait_loop
timeout /t 1 /nobreak >nul 2>&1
if errorlevel 1 goto cleanup
goto wait_loop

:cleanup
echo.
echo Stopping servers...
call :stop_all_servers
exit /b 0

:kill_port_processes
REM Function to kill processes using a specific port
REM Usage: call :kill_port_processes <port_number>
setlocal enabledelayedexpansion
set port=%~1
set found=0

REM Get netstat output and filter for the port - do filtering in separate steps
netstat -aon > "%TEMP%\netstat_%port%.tmp" 2>nul
findstr ":%port%" "%TEMP%\netstat_%port%.tmp" > "%TEMP%\ports1_%port%.tmp"
findstr "LISTENING" "%TEMP%\ports1_%port%.tmp" > "%TEMP%\ports_%port%.tmp"

REM Parse the results
if exist "%TEMP%\ports_%port%.tmp" (
    for /f "tokens=5" %%a in ('type "%TEMP%\ports_%port%.tmp"') do (
        set pid=%%a
        set found=1
        echo   Killing process on port %port% (PID: !pid!)...
        taskkill /PID !pid! /F >nul 2>&1
        if errorlevel 1 (
            echo   Warning: Could not kill process !pid! on port %port%
        ) else (
            echo   Successfully killed process on port %port%
        )
    )
)

del "%TEMP%\netstat_%port%.tmp" >nul 2>&1
del "%TEMP%\ports1_%port%.tmp" >nul 2>&1
del "%TEMP%\ports_%port%.tmp" >nul 2>&1

if !found!==0 (
    echo   Port %port% is free.
)
endlocal
exit /b 0

:stop_all_servers
REM Kill processes by port (most reliable method)
call :kill_port_processes 8000
call :kill_port_processes 3000

echo Servers stopped.
exit /b 0
