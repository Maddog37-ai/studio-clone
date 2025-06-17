#!/bin/bash

echo "🧹 Starting LeadFlow performance cleanup..."

# Remove debug files
echo "Removing debug files..."
find . -name "debug-*" -type f -delete 2>/dev/null
find . -name "*-debug.js" -type f -delete 2>/dev/null
find . -name "*-debug.json" -type f -delete 2>/dev/null

# Remove test artifacts
echo "Removing test artifacts..."
rm -f test-*.js test-*.json 2>/dev/null
rm -f *-test.js *-test.json 2>/dev/null

# Remove temporary build files
echo "Removing temporary build files..."
rm -f temp-* tmp-* *.tmp 2>/dev/null

# Remove log files
echo "Removing log files..."
find . -name "*.log" -not -path "./node_modules/*" -delete 2>/dev/null

# Remove backup files
echo "Removing backup files..."
find . -name "*.bak" -not-path "./node_modules/*" -delete 2>/dev/null
find . -name "*~" -not-path "./node_modules/*" -delete 2>/dev/null

# Remove empty directories
echo "Removing empty directories..."
find . -type d -empty -not-path "./node_modules/*" -delete 2>/dev/null

echo "✅ Cleanup completed!"
echo "📊 Performance should be improved now."