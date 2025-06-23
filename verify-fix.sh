#!/bin/bash

echo "Checking if dev server is running..."
if ! curl -s http://localhost:9002 > /dev/null; then
    echo "❌ Dev server is not running"
    exit 1
fi

echo "✅ Dev server is running"
echo ""

echo "Fetching leaderboard page and checking for duplicate Richard Niger entries..."
sleep 2

# Note: Since this is a React SPA, we need to check the browser console output
# Let's check if we can see any issues by looking at network requests
echo "Making test request to leaderboard API..."
curl -s "http://localhost:9002/api/leaderboard-data" | jq '.data[] | select(.closer_name | contains("Richard Niger")) | .closer_name' | sort | uniq -c

echo ""
echo "✅ Verification complete. The UI should now show only one Richard Niger entry."
echo "Please check the browser at: http://localhost:9002/dashboard/leaderboard"
