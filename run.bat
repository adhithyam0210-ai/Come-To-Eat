@echo off
echo ===================================================
echo     STARTING COME TO EAT FULL-STACK PLATFORM
echo ===================================================
echo.
echo Starting Backend Server on http://localhost:5000 ...
start "Come To Eat Server" cmd /k "cd server && npm start"

echo.
echo Starting Frontend Client on http://localhost:5173 ...
start "Come To Eat Client" cmd /k "cd client && npm run dev"

echo.
echo Both servers started!
echo User Portal:  http://localhost:5173
echo Backend API:  http://localhost:5000/api
echo.
pause
