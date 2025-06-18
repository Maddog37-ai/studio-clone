#!/bin/bash

# Manager Tools Visibility Fix Script
echo "🔧 Manager Tools Visibility Fix"
echo "==============================="

echo ""
echo "📋 What this script does:"
echo "1. ✅ Enhanced sidebar debugging"
echo "2. ✅ Explicit role checking logic" 
echo "3. ✅ Better error handling"
echo "4. ✅ Force role update tools"

echo ""
echo "🚀 NEXT STEPS FOR YOU:"
echo ""
echo "1. Open your browser and go to: http://localhost:9002/dashboard"
echo ""
echo "2. Open browser console (F12 or Cmd+Option+I)"
echo ""
echo "3. Copy and paste this debug script:"
echo ""
echo "=== COPY FROM HERE ==="
cat << 'EOF'
// Enhanced Debug Script
function quickDebug() {
  console.log("🔍 Quick Manager Tools Debug");
  
  // Check user role
  const userData = localStorage.getItem('user') || localStorage.getItem('userData');
  if (userData) {
    try {
      const user = JSON.parse(userData);
      console.log("👤 User role:", user.role);
      console.log("📧 User email:", user.email);
    } catch (e) {
      console.log("❌ Error parsing user data");
    }
  }
  
  // Check sidebar links
  const managerLinks = document.querySelectorAll('a[href*="lead-management"], a[href*="admin-tools"], a[href*="analytics"], a[href*="all-leads"]');
  console.log(`🔧 Manager tool links found: ${managerLinks.length}`);
  
  managerLinks.forEach((link, i) => {
    console.log(`  ${i+1}. ${link.textContent?.trim()} -> ${link.href}`);
  });
  
  if (managerLinks.length === 0) {
    console.log("❌ No manager tools found! Your role might not be 'admin'");
    console.log("🔧 Go to Firebase Console and update your role to 'admin'");
  } else {
    console.log("✅ Manager tools are present!");
  }
}

quickDebug();
EOF
echo "=== COPY TO HERE ==="
echo ""
echo "4. If manager tools are missing, update your role in Firebase:"
echo "   - Go to: https://console.firebase.google.com"
echo "   - Select your project → Firestore → users collection"
echo "   - Find your user document → Update 'role' field to 'admin'"
echo ""
echo "5. After updating role, refresh the page"
echo ""
echo "✨ The sidebar should now show all manager tools including:"
echo "   - Lead Management"
echo "   - Performance Analytics" 
echo "   - All Leads History"
echo "   - Admin Tools"
echo ""
echo "🎯 If still not working, check the browser console for any errors"
