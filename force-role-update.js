/**
 * Force Role Update Script for Browser Console
 * Use this to ensure your role is properly set to "admin"
 */

async function forceUpdateRole() {
  console.log("🔧 Force updating user role to admin...");
  
  try {
    // Check if we have access to Firebase
    if (typeof window.firebase === 'undefined') {
      console.log("❌ Firebase not available in global scope");
      console.log("🔧 Try this in the Network tab or Firebase Console instead");
      return;
    }
    
    // Get current user
    const user = window.firebase.auth().currentUser;
    if (!user) {
      console.log("❌ No authenticated user found");
      return;
    }
    
    console.log("👤 Current user UID:", user.uid);
    
    // Update user document in Firestore
    const userDocRef = window.firebase.firestore().collection('users').doc(user.uid);
    
    await userDocRef.update({
      role: 'admin'
    });
    
    console.log("✅ Successfully updated role to admin");
    console.log("🔄 Reloading page to reflect changes...");
    
    setTimeout(() => {
      window.location.reload();
    }, 1000);
    
  } catch (error) {
    console.error("❌ Error updating role:", error);
    console.log("🔧 Manual alternative: Update role in Firebase Console");
  }
}

// Alternative method using fetch if Firebase SDK not available
async function updateRoleViaAPI() {
  console.log("🌐 Attempting role update via API...");
  
  try {
    // Get auth token
    const token = await window.firebase?.auth()?.currentUser?.getIdToken();
    if (!token) {
      console.log("❌ No auth token available");
      return;
    }
    
    // Make API call to update role (if you have a function)
    console.log("🔑 Auth token obtained, attempting update...");
    
    // This would require a custom Cloud Function
    // For now, show manual instructions
    showManualInstructions();
    
  } catch (error) {
    console.error("❌ API update failed:", error);
    showManualInstructions();
  }
}

function showManualInstructions() {
  console.log(`
📋 MANUAL ROLE UPDATE INSTRUCTIONS:

1. Go to Firebase Console: https://console.firebase.google.com
2. Select your LeadFlow project
3. Click "Firestore Database" in left sidebar
4. Find the "users" collection
5. Look for your user document (your UID)
6. Click on your user document
7. Find the "role" field
8. Change the value to: "admin" (with quotes)
9. Click "Update"
10. Return to LeadFlow and refresh the page

Your user should be authenticated with UID visible in the console above.
  `);
}

// Function to check current role status
function checkCurrentRole() {
  console.log("🔍 Checking current role status...");
  
  // Check localStorage
  const userKeys = ['user', 'userData', 'authUser'];
  userKeys.forEach(key => {
    const data = localStorage.getItem(key);
    if (data) {
      try {
        const parsed = JSON.parse(data);
        if (parsed.role) {
          console.log(`📦 ${key} role:`, parsed.role);
        }
      } catch (e) {
        // ignore
      }
    }
  });
  
  // Check if Firebase user is available
  if (window.firebase?.auth()?.currentUser) {
    const user = window.firebase.auth().currentUser;
    console.log("🔥 Firebase user UID:", user.uid);
    console.log("📧 Firebase user email:", user.email);
  }
  
  // Check DOM for role display
  const roleElements = document.querySelectorAll('*');
  const roleDisplay = Array.from(roleElements).find(el => 
    el.textContent?.toLowerCase().includes('admin') ||
    el.textContent?.toLowerCase().includes('manager') ||
    (el.textContent?.toLowerCase().includes('role') && el.textContent?.length < 50)
  );
  
  if (roleDisplay) {
    console.log("👁️ Role displayed on page:", roleDisplay.textContent?.trim());
  }
}

// Auto-run check
checkCurrentRole();

// Make functions available
window.forceUpdateRole = forceUpdateRole;
window.updateRoleViaAPI = updateRoleViaAPI;
window.showManualInstructions = showManualInstructions;
window.checkCurrentRole = checkCurrentRole;

console.log(`
🎯 ROLE UPDATE TOOLS LOADED

Available commands:
- checkCurrentRole() - Check your current role status
- forceUpdateRole() - Try to update role automatically 
- showManualInstructions() - Show manual update steps

If automatic update fails, use manual instructions.
`);
