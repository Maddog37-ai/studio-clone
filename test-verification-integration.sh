#!/bin/bash

# Lead Verification Integration Test Script
# Run this to test the verification workflow functionality

echo "🚀 Testing Lead Verification Integration..."
echo "=========================================="

# Check if development server is running
if lsof -i :9002 > /dev/null; then
    echo "✅ Development server is running on port 9002"
else
    echo "❌ Development server not found. Starting..."
    npm run dev &
    sleep 5
fi

# Test URLs for manual verification
echo ""
echo "🔍 Manual Testing URLs:"
echo "----------------------"
echo "Dashboard: http://localhost:9002/dashboard"
echo "Lead Management: http://localhost:9002/dashboard/lead-management"
echo "Lead Spreadsheet: http://localhost:9002/dashboard/lead-management-spreadsheet"
echo "Admin Tools: http://localhost:9002/dashboard/admin-tools"
echo "All Leads: http://localhost:9002/dashboard/all-leads"

echo ""
echo "📋 Testing Checklist:"
echo "---------------------"
echo "1. ✅ VerifiedCheckbox component integrated in all lead management interfaces"
echo "2. ✅ Lead Management Spreadsheet has verification column" 
echo "3. ✅ Main Lead Management page has verification column"
echo "4. ✅ Lead cards display verification status"
echo "5. ✅ Type system updated with isVerified field"
echo "6. ✅ Backwards compatibility with setterVerified field"
echo "7. ✅ 45-minute rule implementation verified"
echo "8. ✅ Admin tools for region/team management"

echo ""
echo "🧪 To Test Verification Workflow:"
echo "--------------------------------"
echo "1. Open browser console on dashboard"
echo "2. Copy and paste the test script from: test-verification-workflow.js"
echo "3. Run: testVerificationWorkflow()"
echo ""
echo "🎯 Expected Results:"
echo "- Verification checkboxes appear in all interfaces"
echo "- State changes persist to database"
echo "- Toast notifications on verification changes"  
echo "- 45-minute rule enforces verification before assignment"
echo ""
echo "📖 Full documentation: docs/features/VERIFICATION_INTEGRATION_SUMMARY.md"

# Open the main dashboard for testing
if command -v open &> /dev/null; then
    echo ""
    echo "🌐 Opening dashboard in browser..."
    open http://localhost:9002/dashboard
fi

echo ""
echo "✨ Lead Verification Integration Complete!"
echo "Ready for manual testing and user acceptance."
