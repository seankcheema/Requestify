::Run in root directory using ./start.bat to run the files necessary for Requestify
@echo off
:: Navigate to the requestify directory to start the react app 
cd requestify
start "" cmd /k "npm start"

:: Navigate to backend to run main.py
cd backend
start "" cmd /k "python main.py"

:: Run server.js
start "" cmd /k "node server.js"

:: Go back to requestify directory
cd ..
