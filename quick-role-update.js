// Quick role update script for Ryan Madden
// Run this in the browser console ONLY on the /update-admin-role page

async function updateRyanRole() {
  try {
    console.log("🔄 Updating Ryan's role to admin...");
    
    // Find and click the update button on the page
    const updateButton = document.querySelector('button[type="button"]');
    if (updateButton && updateButton.textContent?.includes('Update Admin Roles')) {
      console.log("📱 Found update button, clicking it...");
      updateButton.click();
      console.log("✅ Button clicked! Check the page for results.");
    } else {
      console.error("❌ Update button not found. Make sure you're on the /update-admin-role page.");
    }
    
  } catch (error) {
    console.error("❌ Error updating role:", error);
  }
}

// Run the update
updateRyanRole();
