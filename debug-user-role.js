/**
 * Debug script to check user role and sidebar visibility
 * Run this in the browser console on the LeadFlow dashboard
 */

function debugUserRole() {
  console.log("🔍 Debugging User Role and Sidebar Visibility...");
  console.log("================================================");
  
  // Check if user data is available in localStorage or context
  const userData = localStorage.getItem('user') || localStorage.getItem('userData');
  if (userData) {
    try {
      const user = JSON.parse(userData);
      console.log("👤 User from localStorage:", user);
      console.log("🎭 Current Role:", user.role);
    } catch (e) {
      console.log("❌ Error parsing user data from localStorage");
    }
  }
  
  // Check React state if available
  if (window.React) {
    console.log("⚛️ React context available for debugging");
  }
  
  // Check DOM elements
  const sidebarItems = document.querySelectorAll('[data-sidebar] a, .sidebar a');
  console.log(`📋 Found ${sidebarItems.length} sidebar links:`);
  
  sidebarItems.forEach((item, index) => {
    const text = item.textContent?.trim();
    const href = item.getAttribute('href');
    console.log(`  ${index + 1}. "${text}" -> ${href}`);
  });
  
  // Check specifically for manager tools
  const managerTools = Array.from(sidebarItems).filter(item => 
    item.textContent?.includes('Lead Management') ||
    item.textContent?.includes('Performance Analytics') ||
    item.textContent?.includes('All Leads History') ||
    item.textContent?.includes('Admin Tools')
  );
  
  console.log(`🔧 Manager/Admin tools found: ${managerTools.length}`);
  managerTools.forEach(tool => {
    console.log(`  ✓ ${tool.textContent?.trim()} -> ${tool.getAttribute('href')}`);
  });
  
  // Check if sidebar component is rendering
  const sidebar = document.querySelector('[data-sidebar], .sidebar, nav');
  console.log("📱 Sidebar element:", sidebar ? "Found" : "Not found");
  
  // Check for any error messages
  const errors = document.querySelectorAll('.error, [role="alert"], .text-destructive');
  if (errors.length > 0) {
    console.log(`⚠️ Found ${errors.length} error elements on page`);
    errors.forEach(error => console.log(`  Error: ${error.textContent?.trim()}`));
  }
  
  return {
    userDataAvailable: !!userData,
    sidebarLinksCount: sidebarItems.length,
    managerToolsCount: managerTools.length,
    sidebarElement: !!sidebar,
    errorsFound: errors.length
  };
}

// Run the debug function
const debugResult = debugUserRole();
console.log("🎯 Debug Summary:", debugResult);

// Instructions
console.log(`
🛠️ Troubleshooting Steps:
1. Check if you see manager tools in the list above
2. Verify your role is "admin" in the user data
3. If tools are missing, there might be a conditional rendering issue
4. If role is not "admin", you may need to update it in Firebase

To update role in Firebase console:
1. Go to Firestore Database
2. Find the 'users' collection
3. Find your user document
4. Update the 'role' field to 'admin'
`);
