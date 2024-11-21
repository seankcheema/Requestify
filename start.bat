::Run in root directory using ./start.bat to run the files necessary for Requestify
@echo off
:: Navigate to the requestify directory to start the react app 
cd requestify
call npm run build

:: Navigate to backend
cd backend

:: Run server.js
start "" cmd /k "node server.js"

:: Go back to requestify directory
cd ..
