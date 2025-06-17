// Simple script to update Ryan Madden's role to admin
// Run this in the browser console while logged into the app

async function updateRyanToAdmin() {
  console.log("🔧 Starting role update for Ryan Madden...");
  
  try {
    // Get current user from auth context
    const currentUser = window?.auth?.currentUser;
    if (!currentUser) {
      console.error("❌ No authenticated user found");
      return;
    }
    
    console.log("Current user:", currentUser.uid, currentUser.email);
    
    // Get Firestore instance (should be available globally)
    const db = window?.db || window?.firebase?.firestore();
    if (!db) {
      console.error("❌ Firestore not available");
      return;
    }
    
    // Update user role in users collection
    const userDocRef = db.collection('users').doc(currentUser.uid);
    
    await userDocRef.update({
      role: 'admin',
      updatedAt: new Date()
    });
    
    console.log("✅ Updated user role to admin");
    
    // Also update in closers collection if it exists
    try {
      const closerDocRef = db.collection('closers').doc(currentUser.uid);
      const closerDoc = await closerDocRef.get();
      
      if (closerDoc.exists) {
        await closerDocRef.update({
          role: 'admin',
          updatedAt: new Date()
        });
        console.log("✅ Updated closer role to admin");
      } else {
        console.log("ℹ️ No closer record found to update");
      }
    } catch (closerError) {
      console.log("⚠️ Could not update closer record:", closerError.message);
    }
    
    console.log("🎉 Role update complete! Please refresh the page to see changes.");
    alert("Role updated to admin! Please refresh the page.");
    
  } catch (error) {
    console.error("❌ Error updating role:", error);
    alert("Error updating role: " + error.message);
  }
}

// Run the update
updateRyanToAdmin();
