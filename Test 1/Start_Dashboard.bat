@echo off
echo Starting TapPay Social Media Dashboard...
echo Please leave this black window open!

:: Start the Node.js server in a new window so it stays running
start "TapPay Server" cmd /k "node server.js"

:: Wait 3 seconds for the server to spin up
timeout /t 3 > nul

:: Open the user's default web browser to the dashboard
echo Opening dashboard in your browser...
start http://localhost:3000/dashboard.html
