/**
 * Enhanced Debug and Fix Script for Manager Tools
 * Run this in browser console to diagnose and fix visibility issues
 */

async function comprehensiveDebug() {
  console.log("🔍 COMPREHENSIVE MANAGER TOOLS DEBUG");
  console.log("=====================================");
  
  // Step 1: Check localStorage and user data
  console.log("\n📋 STEP 1: Checking User Authentication Data");
  
  const userKeys = ['user', 'userData', 'authUser', 'firebaseUser'];
  let userData = null;
  
  userKeys.forEach(key => {
    const data = localStorage.getItem(key);
    if (data) {
      try {
        const parsed = JSON.parse(data);
        console.log(`✅ Found ${key}:`, parsed);
        if (parsed.role) userData = parsed;
      } catch (e) {
        console.log(`📦 ${key}:`, data);
      }
    }
  });
  
  // Step 2: Check DOM structure
  console.log("\n📋 STEP 2: Analyzing DOM Structure");
  
  const sidebar = document.querySelector('[data-sidebar]') || 
                  document.querySelector('.sidebar') || 
                  document.querySelector('nav');
  
  console.log("📱 Sidebar container:", sidebar ? "✅ Found" : "❌ Not found");
  
  if (sidebar) {
    console.log("📱 Sidebar HTML:", sidebar.outerHTML.slice(0, 200) + "...");
  }
  
  // Step 3: Check all navigation links
  console.log("\n📋 STEP 3: Checking Navigation Links");
  
  const allLinks = document.querySelectorAll('a[href*="/dashboard"]');
  console.log(`🔗 Found ${allLinks.length} dashboard links:`);
  
  allLinks.forEach((link, i) => {
    const text = link.textContent?.trim();
    const href = link.href;
    const visible = window.getComputedStyle(link).display !== 'none';
    const opacity = window.getComputedStyle(link).opacity;
    console.log(`  ${i+1}. "${text}" -> ${href}`);
    console.log(`      Visible: ${visible}, Opacity: ${opacity}`);
  });
  
  // Step 4: Check for manager tools specifically
  console.log("\n📋 STEP 4: Manager Tools Check");
  
  const expectedTools = [
    { name: 'Lead Management', path: '/dashboard/lead-management' },
    { name: 'Performance Analytics', path: '/dashboard/analytics' },
    { name: 'All Leads History', path: '/dashboard/all-leads' },
    { name: 'Admin Tools', path: '/dashboard/admin-tools' }
  ];
  
  expectedTools.forEach(tool => {
    const found = Array.from(allLinks).find(link => 
      link.href.includes(tool.path) || link.textContent?.includes(tool.name)
    );
    console.log(`🔧 ${tool.name}: ${found ? '✅ Found' : '❌ Missing'}`);
    if (found) {
      const styles = window.getComputedStyle(found);
      console.log(`    Display: ${styles.display}, Visibility: ${styles.visibility}`);
    }
  });
  
  // Step 5: Check React component state
  console.log("\n📋 STEP 5: React Component Analysis");
  
  // Look for user role display
  const roleElements = document.querySelectorAll('*');
  const roleFound = Array.from(roleElements).find(el => 
    el.textContent?.toLowerCase().includes('admin') || 
    el.textContent?.toLowerCase().includes('manager')
  );
  
  if (roleFound) {
    console.log("👤 Role display found:", roleFound.textContent?.trim());
  }
  
  // Step 6: Console error check
  console.log("\n📋 STEP 6: Error Detection");
  
  const errors = document.querySelectorAll('.error, [role="alert"], .text-destructive');
  if (errors.length > 0) {
    console.log(`⚠️ Found ${errors.length} error elements:`);
    errors.forEach(error => console.log(`  Error: ${error.textContent?.trim()}`));
  } else {
    console.log("✅ No visible errors found");
  }
  
  return {
    userDataFound: !!userData,
    userRole: userData?.role,
    sidebarFound: !!sidebar,
    linksCount: allLinks.length,
    managerToolsFound: expectedTools.filter(tool => 
      Array.from(allLinks).some(link => 
        link.href.includes(tool.path) || link.textContent?.includes(tool.name)
      )
    ).length
  };
}

// Quick fix functions
function forceRefreshAuth() {
  console.log("🔄 Forcing authentication refresh...");
  
  // Clear all auth-related storage
  const keys = Object.keys(localStorage);
  keys.forEach(key => {
    if (key.includes('firebase') || key.includes('auth') || key.includes('user')) {
      localStorage.removeItem(key);
      console.log(`🗑️ Cleared: ${key}`);
    }
  });
  
  // Force page reload
  console.log("🔄 Reloading page in 2 seconds...");
  setTimeout(() => window.location.reload(), 2000);
}

function toggleSidebarVisibility() {
  console.log("👁️ Attempting to show hidden sidebar elements...");
  
  const hiddenElements = document.querySelectorAll('*[style*="display: none"], *[style*="visibility: hidden"]');
  console.log(`Found ${hiddenElements.length} hidden elements`);
  
  hiddenElements.forEach((el, i) => {
    if (el.textContent?.includes('Lead Management') || 
        el.textContent?.includes('Admin Tools') ||
        el.textContent?.includes('Performance Analytics')) {
      console.log(`🔧 Showing element ${i+1}: ${el.textContent?.trim()}`);
      el.style.display = 'block';
      el.style.visibility = 'visible';
      el.style.opacity = '1';
    }
  });
}

// Auto-run comprehensive debug
console.log("🚀 Running comprehensive debug...");
comprehensiveDebug().then(result => {
  console.log("\n🎯 SUMMARY:", result);
  
  console.log(`
🛠️ AVAILABLE FIXES:
1. Run: forceRefreshAuth() - Clear cache and reload
2. Run: toggleSidebarVisibility() - Show hidden elements
3. Check Firebase Console for user role
4. Hard refresh browser (Cmd+Shift+R)

Current Status:
- User role: ${result.userRole || 'Unknown'}
- Sidebar found: ${result.sidebarFound ? 'Yes' : 'No'}
- Links found: ${result.linksCount}
- Manager tools: ${result.managerToolsFound}/4
  `);
  
  if (result.managerToolsFound < 4) {
    console.log("⚠️ Manager tools missing! Try forceRefreshAuth() or check Firebase role.");
  }
});

// Make functions globally available
window.comprehensiveDebug = comprehensiveDebug;
window.forceRefreshAuth = forceRefreshAuth;
window.toggleSidebarVisibility = toggleSidebarVisibility;
