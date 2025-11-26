#!/bin/bash

echo "Starting dev server..."
npm run dev > /dev/null 2>&1 &
SERVER_PID=$!

sleep 5

echo "Generating cache..."
curl http://localhost:3000/api/cache-popular

echo "Stopping server..."
kill $SERVER_PID

echo "Committing and pushing..."
git add public/popular-cache.json
git commit -m "Update popular cache"
git push

echo "Done!"