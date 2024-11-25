#!/bin/bash

# Run this script in the root directory of the Requestify project.
echo "Starting Requestify setup..."

# Navigate to the requestify directory to build the React app
cd requestify || { echo "Error: Could not navigate to the 'requestify' directory."; exit 1; }
npm run build || { echo "Error: npm build failed."; exit 1; }

# Navigate to the backend directory
cd backend || { echo "Error: Could not navigate to the 'backend' directory."; exit 1; }

# Run server.js in the background
echo "Starting server.js..."
node server.js &

# Go back to the requestify directory
cd ..

echo "Requestify setup complete."