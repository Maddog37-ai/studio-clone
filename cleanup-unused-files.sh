#!/bin/bash

echo "🧹 Cleaning up unused debug and test files..."

# Debug scripts (root level)
rm -f analytics-performance-test.md
rm -f analytics-preview.html
rm -f app-firebase-init-ra.js
rm -f check-channels.js
rm -f check-ra-in-browser.js
rm -f comprehensive-debug.js
rm -f console-create-ra.js
rm -f console-init-ra.js
rm -f debug-manager-tools.js
rm -f debug-ra-channel.js
rm -f debug-user-role.js
rm -f demo_reschedule_functionality.sh
rm -f direct-role-update.js
rm -f fix-ask-ra-final.js
rm -f fix-manager-tools.sh
rm -f fixed-ra-creator.js
rm -f force-role-update.js
rm -f init-chat-channels.js
rm -f modern-console-init-ra.js
rm -f patch-chatservice-debug.js
rm -f quick-role-update.js
rm -f safari-console-ra.js
rm -f simple-verify-and-refresh.js
rm -f test-admin-tools-enhancements.js
rm -f test-analytics-performance.sh
rm -f test-closer-rotation.sh
rm -f test-empire-initialization.js
rm -f test-verification-integration.sh
rm -f test-verification-workflow.js
rm -f ultimate-ra-fix.js
rm -f ultra-simple-ra.js
rm -f update-role-console.js
rm -f verify-admin-sidebar.js
rm -f verify-analytics-integration.js
rm -f verify-ra-channel.js

# HTML debug pages
rm -f chat-channel-audit.html
rm -f create-ra-channel-simple.html
rm -f final-ra-creator.html
rm -f initialize-chat-channels.html
rm -f ra-channel-initializer.html
rm -f remove-duplicate-teams.html
rm -f remove-empire-region-chat.html
rm -f simple-ra-init.html
rm -f team-cleanup-verification.html
rm -f team-cleanup.html

# Setup/admin scripts
rm -f cleanup-performance.sh
rm -f create-ask-ra-admin.js
rm -f create-ra-channel-cli.js
rm -f create-ra-channel.js
rm -f initialize-empire-console.js
rm -f initialize-empire-region.js
rm -f setup-empire-region.sh
rm -f setup-new-icon.sh
rm -f start-server.sh

# Auth export (contains sensitive data)
rm -f auth_export.json

# Test and coverage directories
rm -rf coverage/
rm -rf test-results/
rm -rf playwright-report/

# Scripts debug directories
rm -rf scripts/admin/
rm -rf scripts/debug/

# Build cache (will be regenerated)
rm -rf .next/
rm -f tsconfig.tsbuildinfo
rm -f .DS_Store

echo "✅ Cleanup complete!"
echo ""
echo "📁 Kept essential files:"
echo "  - src/ (source code)"
echo "  - functions/ (Firebase functions)"
echo "  - public/ (static assets)"
echo "  - docs/ (documentation)"
echo "  - Configuration files (package.json, next.config.ts, etc.)"
echo ""
echo "🔄 You can regenerate deleted build files with:"
echo "  npm install"
echo "  npm run build"
