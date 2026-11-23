@echo off
rem Profile page: start the local server and open the browser.
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is not installed. Please install Node.js from https://nodejs.org/
  pause
  exit /b 1
)

if "%PORT%"=="" set PORT=3001

echo Starting profile page on http://localhost:%PORT% ...
echo Edit the .txt file and reload the browser to update the page.
echo Close this window or press Ctrl+C to stop.
echo.

rem Open the browser after a short wait so the server is ready.
start "" /b cmd /c "timeout /t 2 /nobreak >nul & start "" http://localhost:%PORT%"

node serve.mjs

echo.
echo Server stopped.
pause
