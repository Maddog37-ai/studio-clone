/**
 * Verify Admin Sidebar Structure
 * Run this in browser console to verify the new Manager Tools + Admin Tools structure
 */

function verifyAdminSidebar() {
  console.log("🔍 Verifying Admin Sidebar Structure");
  console.log("===================================");
  
  // Check user role
  const userData = localStorage.getItem('user') || localStorage.getItem('userData');
  let userRole = 'unknown';
  
  if (userData) {
    try {
      const user = JSON.parse(userData);
      userRole = user.role;
      console.log("👤 Current user role:", userRole);
    } catch (e) {
      console.log("❌ Error parsing user data");
    }
  }
  
  // Check all sidebar links
  const allLinks = document.querySelectorAll('a[href*="/dashboard"], [data-sidebar] a');
  console.log(`\n📋 Found ${allLinks.length} total sidebar links:`);
  
  allLinks.forEach((link, i) => {
    const text = link.textContent?.trim();
    const href = link.getAttribute('href');
    console.log(`  ${i+1}. "${text}" -> ${href}`);
  });
  
  // Check for section headers
  const sectionHeaders = document.querySelectorAll('span.text-muted-foreground');
  const managerToolsHeader = Array.from(sectionHeaders).find(span => 
    span.textContent?.includes('Manager Tools')
  );
  const adminToolsHeader = Array.from(sectionHeaders).find(span => 
    span.textContent?.includes('Admin Tools')
  );
  
  console.log(`\n🏷️ Section Headers:`);
  console.log(`  Manager Tools header: ${managerToolsHeader ? '✅ Found' : '❌ Missing'}`);
  console.log(`  Admin Tools header: ${adminToolsHeader ? '✅ Found' : '❌ Missing'}`);
  
  // Check specific tools
  const expectedManagerTools = [
    'Lead Management',
    'Performance Analytics', 
    'All Leads History'
  ];
  
  const expectedAdminTools = [
    'Region & Team Management'
  ];
  
  console.log(`\n🔧 Manager Tools Check:`);
  expectedManagerTools.forEach(tool => {
    const found = Array.from(allLinks).some(link => 
      link.textContent?.includes(tool)
    );
    console.log(`  ${tool}: ${found ? '✅ Found' : '❌ Missing'}`);
  });
  
  console.log(`\n⚙️ Admin Tools Check:`);
  expectedAdminTools.forEach(tool => {
    const found = Array.from(allLinks).some(link => 
      link.textContent?.includes(tool) || link.href?.includes('admin-tools')
    );
    console.log(`  ${tool}: ${found ? '✅ Found' : '❌ Missing'}`);
  });
  
  // Summary
  const managerToolsCount = expectedManagerTools.filter(tool => 
    Array.from(allLinks).some(link => link.textContent?.includes(tool))
  ).length;
  
  const adminToolsCount = expectedAdminTools.filter(tool => 
    Array.from(allLinks).some(link => 
      link.textContent?.includes(tool) || link.href?.includes('admin-tools')
    )
  ).length;
  
  console.log(`\n🎯 Summary:`);
  console.log(`  User Role: ${userRole}`);
  console.log(`  Manager Tools Found: ${managerToolsCount}/${expectedManagerTools.length}`);
  console.log(`  Admin Tools Found: ${adminToolsCount}/${expectedAdminTools.length}`);
  
  if (userRole === 'admin') {
    if (managerToolsCount === expectedManagerTools.length && adminToolsCount === expectedAdminTools.length) {
      console.log(`  ✅ Perfect! Admin has both Manager Tools and Admin Tools`);
    } else {
      console.log(`  ⚠️ Some tools are missing. Check your role in Firebase Console.`);
    }
  }
  
  return {
    userRole,
    managerToolsFound: managerToolsCount,
    adminToolsFound: adminToolsCount,
    totalLinks: allLinks.length
  };
}

// Auto-run verification
verifyAdminSidebar();

// Make function available globally
window.verifyAdminSidebar = verifyAdminSidebar;

console.log(`
🎯 EXPECTED ADMIN SIDEBAR STRUCTURE:

📋 Dashboard
➕ Create New Lead

👥 Manager Tools
  📋 Lead Management  
  📊 Performance Analytics
  📜 All Leads History

⚙️ Admin Tools  
  🏢 Region & Team Management

👤 Profile
💬 Team Chat
🌓 Theme Toggle
🔒 Logout

Run verifyAdminSidebar() again to re-check.
`);
