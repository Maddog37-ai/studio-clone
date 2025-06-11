/**
 * SIMPLE TONY TIGER FIX - Copy and paste this entire script into the browser console
 * 
 * INSTRUCTIONS:
 * 1. Go to http://localhost:9002/dashboard in your browser
 * 2. Make sure you're logged in as admin/manager  
 * 3. Press F12 to open Developer Tools
 * 4. Click on the "Console" tab
 * 5. Copy this ENTIRE script and paste it into the console
 * 6. Press Enter to run it
 */

// Wait for page to be ready and then run the fix
setTimeout(async () => {
  console.clear();
  console.log(`
🔧 TONY TIGER LEAD FIX TOOL
===========================
Searching for Tony Tiger's lead and updating status from "scheduled" to "rescheduled"
This will make the lead show a PURPLE icon instead of blue.
`);

  try {
    // Try to access Firebase from the React app context
    console.log("🔍 Searching for Firebase modules...");
    
    // Look for Firebase in the window object or try to access it through the module system
    let firebaseApp, db, collection, query, where, getDocs, doc, updateDoc, serverTimestamp;
    
    // Method 1: Try accessing through dynamic import (works in modern browsers)
    try {
      console.log("📦 Attempting to load Firebase modules...");
      
      // This is a browser-specific way to access ES modules
      const firebaseModule = await import('https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js');
      
      // If that doesn't work, try the app's Firebase instance
      if (!firebaseModule) {
        throw new Error("Need to use app's Firebase instance");
      }
      
    } catch (importError) {
      console.log("📦 Trying app's Firebase instance...");
      
      // Try to find Firebase in the global scope
      if (window.firebase) {
        console.log("✅ Found window.firebase");
        // Use the legacy Firebase SDK
        db = window.firebase.firestore();
        // Legacy method calls
        const searchCustomer = async () => {
          const snapshot = await db.collection('leads').where('customerName', '==', 'Tony Tiger').get();
          return snapshot;
        };
        
        const searchAssigned = async () => {
          const snapshot = await db.collection('leads').where('assignedCloserName', '==', 'Tony Tiger').get();
          return snapshot;
        };
        
        const updateLead = async (docId, updateData) => {
          await db.collection('leads').doc(docId).update(updateData);
        };
        
        // Run the search and update
        console.log("🔍 Searching for Tony Tiger as customer...");
        let snapshot = await searchCustomer();
        
        if (snapshot.empty) {
          console.log("🔍 Searching for Tony Tiger as assigned closer...");
          snapshot = await searchAssigned();
        }
        
        if (snapshot.empty) {
          console.log("❌ No Tony Tiger lead found");
          alert("❌ No Tony Tiger lead found in the database.");
          return;
        }
        
        let updatedCount = 0;
        console.log(`📋 Found ${snapshot.size} Tony Tiger lead(s):`);
        
        snapshot.forEach(async (leadDoc) => {
          const data = leadDoc.data();
          console.log(`\n📋 Lead: ${leadDoc.id}`);
          console.log(`👤 Customer: ${data.customerName}`);
          console.log(`🎯 Assigned: ${data.assignedCloserName || 'Unassigned'}`);
          console.log(`📊 Status: ${data.status}`);
          
          if (data.status === 'scheduled') {
            console.log("🔄 Updating to rescheduled...");
            
            await updateLead(leadDoc.id, {
              status: 'rescheduled',
              updatedAt: window.firebase.firestore.FieldValue.serverTimestamp(),
              statusChangeReason: 'Fixed icon color - lead was reassigned'
            });
            
            updatedCount++;
            console.log("✅ Updated successfully!");
          } else if (data.status === 'rescheduled') {
            console.log("✅ Already rescheduled");
          } else {
            console.log(`ℹ️ Status is "${data.status}" - no update needed`);
          }
        });
        
        if (updatedCount > 0) {
          console.log(`\n🎉 SUCCESS! Updated ${updatedCount} lead(s) to rescheduled`);
          console.log("🎨 Tony Tiger's lead will now show PURPLE icon");
          console.log("🔄 Refresh the dashboard to see changes");
          alert(`🎉 SUCCESS!\n\nUpdated ${updatedCount} Tony Tiger lead(s) to "rescheduled".\n\nThe lead will now show a PURPLE icon.\n\nRefresh the page to see changes.`);
        } else {
          console.log("\n📝 No updates needed");
          alert("ℹ️ No Tony Tiger leads needed updating.");
        }
        
        return;
      }
      
      // If no Firebase found, show helpful message
      console.error("❌ Could not access Firebase");
      alert(`❌ Could not access Firebase.

Please make sure:
1. You are on the dashboard page (http://localhost:9002/dashboard)
2. You are logged in as an admin or manager
3. The page has fully loaded

If you continue to have issues, you can manually update the lead in the Firebase console.`);
    }
    
  } catch (error) {
    console.error("❌ Error:", error);
    alert(`❌ Error: ${error.message}\n\nCheck the console for more details.`);
  }
}, 2000); // Wait 2 seconds for page to load

console.log("⏳ Tony Tiger fix script loaded. Starting in 2 seconds...");
