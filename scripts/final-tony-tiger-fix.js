/**
 * FINAL WORKING BROWSER CONSOLE SCRIPT FOR TONY TIGER FIX
 * 
 * COPY THIS ENTIRE SCRIPT AND PASTE IT INTO THE BROWSER CONSOLE
 * 
 * INSTRUCTIONS:
 * 1. Make sure you're on: http://localhost:9002/dashboard
 * 2. Make sure you're logged in as admin/manager
 * 3. Press F12 → Console tab
 * 4. Copy this ENTIRE script (scroll down to see all of it)
 * 5. Paste and press Enter
 */

console.log("🔧 TONY TIGER LEAD FIX SCRIPT STARTING...");

// Simple approach that should work in most browsers
async function fixTonyTiger() {
  try {
    console.log("🔍 Attempting to access Firebase from the page context...");
    
    // Method 1: Try to find Firebase in the global window object
    if (window.firebase && window.firebase.firestore) {
      console.log("✅ Found Firebase v8 SDK");
      const db = window.firebase.firestore();
      
      console.log("🔍 Searching for Tony Tiger leads...");
      
      // Search for customer named Tony Tiger
      let snapshot = await db.collection('leads').where('customerName', '==', 'Tony Tiger').get();
      
      if (snapshot.empty) {
        // Search for assigned closer named Tony Tiger
        snapshot = await db.collection('leads').where('assignedCloserName', '==', 'Tony Tiger').get();
      }
      
      if (snapshot.empty) {
        console.log("❌ No Tony Tiger leads found");
        alert("❌ No Tony Tiger leads found in the database.");
        return;
      }
      
      console.log(`📋 Found ${snapshot.size} Tony Tiger lead(s)`);
      let updatedCount = 0;
      
      const batch = db.batch();
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        console.log(`\n📄 Lead: ${doc.id}`);
        console.log(`  Customer: ${data.customerName}`);
        console.log(`  Assigned: ${data.assignedCloserName}`);
        console.log(`  Status: ${data.status}`);
        
        if (data.status === 'scheduled') {
          console.log(`  🔄 Updating to rescheduled...`);
          batch.update(doc.ref, {
            status: 'rescheduled',
            updatedAt: window.firebase.firestore.FieldValue.serverTimestamp(),
            statusChangeReason: 'Fixed icon color - lead was reassigned'
          });
          updatedCount++;
        }
      });
      
      if (updatedCount > 0) {
        await batch.commit();
        console.log(`🎉 SUCCESS! Updated ${updatedCount} lead(s)`);
        alert(`🎉 SUCCESS!\n\nUpdated ${updatedCount} Tony Tiger lead(s) to "rescheduled".\n\nThe lead will now show a PURPLE icon.\n\nRefresh the page to see changes.`);
      } else {
        console.log("📝 No updates needed");
        alert("ℹ️ Tony Tiger leads found but no updates needed.");
      }
      
      return;
    }
    
    // Method 2: Try to access modern Firebase from modules
    console.log("🔍 Trying to access modern Firebase modules...");
    
    // This might work if the page uses ES modules
    const firebaseApp = await eval('import("/src/lib/firebase.ts")');
    if (firebaseApp && firebaseApp.db) {
      console.log("✅ Found modern Firebase modules");
      
      const { collection, query, where, getDocs, doc, updateDoc, serverTimestamp } = await eval('import("firebase/firestore")');
      const db = firebaseApp.db;
      
      console.log("🔍 Searching for Tony Tiger leads...");
      
      let q = query(collection(db, 'leads'), where('customerName', '==', 'Tony Tiger'));
      let snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        q = query(collection(db, 'leads'), where('assignedCloserName', '==', 'Tony Tiger'));
        snapshot = await getDocs(q);
      }
      
      if (snapshot.empty) {
        console.log("❌ No Tony Tiger leads found");
        alert("❌ No Tony Tiger leads found in the database.");
        return;
      }
      
      console.log(`📋 Found ${snapshot.size} Tony Tiger lead(s)`);
      let updatedCount = 0;
      
      for (const leadDoc of snapshot.docs) {
        const data = leadDoc.data();
        console.log(`\n📄 Lead: ${leadDoc.id}`);
        console.log(`  Customer: ${data.customerName}`);
        console.log(`  Assigned: ${data.assignedCloserName}`);
        console.log(`  Status: ${data.status}`);
        
        if (data.status === 'scheduled') {
          console.log(`  🔄 Updating to rescheduled...`);
          await updateDoc(doc(db, 'leads', leadDoc.id), {
            status: 'rescheduled',
            updatedAt: serverTimestamp(),
            statusChangeReason: 'Fixed icon color - lead was reassigned'
          });
          updatedCount++;
        }
      }
      
      if (updatedCount > 0) {
        console.log(`🎉 SUCCESS! Updated ${updatedCount} lead(s)`);
        alert(`🎉 SUCCESS!\n\nUpdated ${updatedCount} Tony Tiger lead(s) to "rescheduled".\n\nThe lead will now show a PURPLE icon.\n\nRefresh the page to see changes.`);
      } else {
        console.log("📝 No updates needed");
        alert("ℹ️ Tony Tiger leads found but no updates needed.");
      }
      
      return;
    }
    
    // If all methods fail
    throw new Error("Could not access Firebase from this page");
    
  } catch (error) {
    console.error("❌ Error:", error);
    alert(`❌ Could not access Firebase: ${error.message}\n\nPlease:\n1. Make sure you're on the dashboard page\n2. You're logged in as admin/manager\n3. The page has fully loaded\n\nOr use the Firebase Console method instead.`);
  }
}

// Run the fix
fixTonyTiger();

console.log(`
📋 TONY TIGER FIX INSTRUCTIONS
==============================

If the script above didn't work, try these alternatives:

1. FIREBASE CONSOLE METHOD:
   - Go to https://console.firebase.google.com/
   - Select project: leadflow-4lvrr
   - Go to Firestore Database → leads collection
   - Find Tony Tiger's lead
   - Change 'status' from 'scheduled' to 'rescheduled'

2. MANUAL ADMIN STEPS:
   - Check the file: MANUAL_TONY_TIGER_FIX.md
   - Follow the step-by-step instructions

3. VERIFY THE FIX:
   - Refresh the dashboard page
   - Look for Tony Tiger's lead (assigned to Jonathan Shahar)
   - It should now show a PURPLE rescheduled icon instead of blue
`);
