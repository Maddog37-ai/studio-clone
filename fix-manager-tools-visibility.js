/**
 * Quick fix script for manager tools visibility
 * Run this in browser console if manager tools are not showing
 */

function fixManagerToolsVisibility() {
  console.log("🔧 Attempting to fix manager tools visibility...");
  
  // Check current user data
  console.log("Checking user authentication state...");
  
  // Try to clear any cached auth data and force refresh
  const authKeys = ['user', 'userData', 'firebaseUser', 'authState'];
  authKeys.forEach(key => {
    if (localStorage.getItem(key)) {
      console.log(`Clearing ${key} from localStorage`);
      localStorage.removeItem(key);
    }
  });
  
  // Check if we can trigger a re-render
  if (window.location) {
    console.log("Forcing page reload to refresh auth state...");
    window.location.reload();
  }
}

// Also provide manual checking function
function checkUserRole() {
  // Try to access React dev tools if available
  const reactFiber = document.querySelector('#__next')?._reactInternalFiber || 
                    document.querySelector('#__next')?._reactInternalInstance;
  
  if (reactFiber) {
    console.log("React fiber found - checking for user context");
  }
  
  // Look for any user data in the DOM
  const userElements = document.querySelectorAll('[data-user], [data-role]');
  console.log(`Found ${userElements.length} elements with user data attributes`);
  
  userElements.forEach(el => {
    console.log("User element:", el.dataset);
  });
}

console.log(`
🚨 Manager Tools Visibility Debug

Quick fixes to try:
1. Run: fixManagerToolsVisibility()
2. Check browser console for errors
3. Verify your Firebase user role is "admin"
4. Hard refresh the page (Cmd+Shift+R on Mac)

If still not working:
- Check Firebase Console → Firestore → users collection → your user doc → role field
`);

// Auto-run the checker
checkUserRole();
