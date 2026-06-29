@echo off
:: Bat Portal Scheduler - Windows Startup Launcher
:: This script launches the Python scheduler silently in the background.
cd /d "C:\Users\lau_w\Downloads\Test 1"
start "" /min "C:\Windows\py.exe" "C:\Users\lau_w\Downloads\Test 1\scheduler.py"
