// Direct Firestore role update
// Run this in browser console on any authenticated page

async function directRoleUpdate() {
  try {
    console.log("🔄 Starting direct role update...");
    
    // Access the global Firebase instance from your app
    if (typeof window !== 'undefined' && window.firebase) {
      const db = window.firebase.firestore();
      const auth = window.firebase.auth();
      
      const user = auth.currentUser;
      if (!user) {
        console.error("❌ No authenticated user found");
        return;
      }
      
      console.log("👤 Current user:", user.email);
      
      // Update user role in Firestore
      await db.collection('users').doc(user.uid).update({
        role: 'admin'
      });
      
      console.log("✅ Role updated to admin in Firestore");
      console.log("🔄 Refreshing page to see changes...");
      
      // Refresh the page
      window.location.reload();
      
    } else {
      console.error("❌ Firebase not found in global scope");
    }
    
  } catch (error) {
    console.error("❌ Error updating role:", error);
  }
}

directRoleUpdate();
