@echo off
REM Windows batch script to run Event Reminder integration tests
REM Usage: run_tests.bat [options]

python run_tests.py %*
if %ERRORLEVEL% neq 0 (
    echo.
    echo Tests failed with exit code %ERRORLEVEL%
    exit /b %ERRORLEVEL%
)