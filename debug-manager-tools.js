/**
 * Force Role Update Script
 * Use this to immediately check and fix role visibility issues
 */

console.log("🔧 Force Role Update and Debug Script");
console.log("====================================");

// Function to check current authentication state
function checkCurrentAuth() {
  console.log("📋 Checking current authentication state...");
  
  // Check localStorage for any cached data
  const keys = Object.keys(localStorage);
  console.log("🗄️ LocalStorage keys:", keys);
  
  keys.forEach(key => {
    if (key.includes('user') || key.includes('auth') || key.includes('firebase')) {
      try {
        const value = localStorage.getItem(key);
        console.log(`📦 ${key}:`, JSON.parse(value || '{}'));
      } catch (e) {
        console.log(`📦 ${key}:`, localStorage.getItem(key));
      }
    }
  });
  
  // Check if Firebase is available
  if (typeof window.firebase !== 'undefined') {
    console.log("🔥 Firebase available in global scope");
  }
  
  // Check for React DevTools
  if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
    console.log("⚛️ React DevTools available");
  }
}

// Function to force clear all auth cache
function clearAuthCache() {
  console.log("🗑️ Clearing all authentication cache...");
  
  // Clear localStorage
  const authKeys = ['user', 'userData', 'firebaseUser', 'authState', 'firebase:authUser'];
  authKeys.forEach(key => {
    if (localStorage.getItem(key)) {
      localStorage.removeItem(key);
      console.log(`✅ Cleared ${key}`);
    }
  });
  
  // Clear sessionStorage
  authKeys.forEach(key => {
    if (sessionStorage.getItem(key)) {
      sessionStorage.removeItem(key);
      console.log(`✅ Cleared ${key} from session`);
    }
  });
  
  console.log("🔄 Cache cleared. Reloading page...");
  setTimeout(() => window.location.reload(), 1000);
}

// Function to check DOM for sidebar elements
function checkSidebarElements() {
  console.log("🔍 Checking sidebar elements in DOM...");
  
  // Look for sidebar navigation
  const sidebarElements = document.querySelectorAll('nav, [data-sidebar], .sidebar');
  console.log(`📱 Found ${sidebarElements.length} sidebar containers`);
  
  // Look for navigation links
  const navLinks = document.querySelectorAll('a[href*="/dashboard"]');
  console.log(`🔗 Found ${navLinks.length} dashboard links:`);
  
  navLinks.forEach((link, index) => {
    const text = link.textContent?.trim();
    const href = link.getAttribute('href');
    const isVisible = window.getComputedStyle(link).display !== 'none';
    console.log(`  ${index + 1}. "${text}" -> ${href} (${isVisible ? 'Visible' : 'Hidden'})`);
  });
  
  // Look for specific manager tools
  const managerTools = [
    'Lead Management',
    'Performance Analytics', 
    'All Leads History',
    'Admin Tools'
  ];
  
  managerTools.forEach(tool => {
    const element = Array.from(navLinks).find(link => 
      link.textContent?.includes(tool)
    );
    console.log(`🔧 ${tool}: ${element ? '✅ Found' : '❌ Missing'}`);
  });
}

// Main debug function
function debugManagerTools() {
  console.log("🚀 Starting manager tools debug...");
  checkCurrentAuth();
  checkSidebarElements();
  
  console.log(`
📋 Next Steps:
1. If manager tools are missing, run: clearAuthCache()
2. Check browser console for any errors
3. Verify your role in Firebase Console:
   - Go to Firebase Console → Firestore
   - Find 'users' collection → your user document  
   - Ensure 'role' field is set to 'admin'
4. If still not working, hard refresh (Cmd+Shift+R)
  `);
}

// Auto-run debug
debugManagerTools();

// Make functions available globally
window.debugManagerTools = debugManagerTools;
window.clearAuthCache = clearAuthCache;
window.checkSidebarElements = checkSidebarElements;
