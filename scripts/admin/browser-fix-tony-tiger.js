/**
 * Browser Console Fix for Tony Tiger Lead Status
 * 
 * INSTRUCTIONS:
 * 1. Open the dashboard page: http://localhost:9002/dashboard
 * 2. Make sure you're logged in as an admin/manager
 * 3. Open Developer Tools (F12)
 * 4. Go to Console tab
 * 5. Paste this script and press Enter
 * 
 * This script will find Tony Tiger's lead and update it from "scheduled" to "rescheduled"
 */

(async function fixTonyTigerLead() {
  console.log('🔍 Starting Tony Tiger lead fix...');
  
  try {
    // Check if we have access to Firebase through the window object
    if (typeof window === 'undefined') {
      throw new Error('Script must be run in browser console');
    }
    
    // Try to access Firebase through global variables that should be available on the dashboard
    let db, collection, query, where, getDocs, doc, updateDoc, serverTimestamp;
    
    // Check if Firebase is available through modules or global scope
    if (window.firebase && window.firebase.firestore) {
      console.log('📦 Using window.firebase');
      const firestore = window.firebase.firestore;
      db = window.db || window.firestore;
      collection = firestore.collection;
      query = firestore.query;
      where = firestore.where;
      getDocs = firestore.getDocs;
      doc = firestore.doc;
      updateDoc = firestore.updateDoc;
      serverTimestamp = firestore.serverTimestamp;
    } else {
      // Try to import from the module system
      console.log('📦 Attempting to access Firebase from modules...');
      
      // This is a hack to access the imported Firebase instance
      const firebaseModules = Object.keys(window).filter(key => 
        key.includes('firebase') || key.includes('firestore')
      );
      
      console.log('Available window objects:', firebaseModules);
      
      // Try a different approach - use the React DevTools to access the Firebase instance
      throw new Error('Please ensure you are on the dashboard page with Firebase loaded');
    }
    
    if (!db) {
      throw new Error('Firebase database not accessible. Make sure you are on the dashboard page.');
    }
    
    console.log('✅ Firebase accessible, searching for Tony Tiger lead...');
    
    // Search for Tony Tiger as customer name
    console.log('🔍 Searching for Tony Tiger as customer...');
    let q = query(collection(db, 'leads'), where('customerName', '==', 'Tony Tiger'));
    let snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      // Try searching as assigned closer name
      console.log('🔍 Searching for Tony Tiger as assigned closer...');
      q = query(collection(db, 'leads'), where('assignedCloserName', '==', 'Tony Tiger'));
      snapshot = await getDocs(q);
    }
    
    if (snapshot.empty) {
      // Try searching for partial matches
      console.log('🔍 No exact matches found. Trying partial search...');
      console.log('❌ No Tony Tiger lead found in the database');
      console.log('🔍 Let me search for all leads to see what\'s available...');
      
      // Get all leads to see what's in the database
      const allLeadsQuery = query(collection(db, 'leads'));
      const allSnapshot = await getDocs(allLeadsQuery);
      
      console.log(`📋 Found ${allSnapshot.size} total leads:`);
      let tonyTigerFound = false;
      
      allSnapshot.forEach((leadDoc) => {
        const data = leadDoc.data();
        console.log(`Lead ${leadDoc.id}: ${data.customerName} (assigned to: ${data.assignedCloserName || 'unassigned'}) - Status: ${data.status}`);
        
        // Check if any lead mentions Tony Tiger
        if (data.customerName?.toLowerCase().includes('tony') || 
            data.assignedCloserName?.toLowerCase().includes('tony') ||
            data.customerName?.toLowerCase().includes('tiger') || 
            data.assignedCloserName?.toLowerCase().includes('tiger')) {
          tonyTigerFound = true;
          console.log(`🎯 POTENTIAL MATCH: ${leadDoc.id}`);
        }
      });
      
      if (!tonyTigerFound) {
        console.log('❌ No leads found containing "Tony" or "Tiger"');
        alert('❌ Tony Tiger lead not found. Check console for all available leads.');
      }
      return;
    }
    
    let updatedCount = 0;
    const updates = [];
    
    console.log(`📋 Found ${snapshot.size} lead(s) matching Tony Tiger:`);
    
    snapshot.forEach((leadDoc) => {
      const data = leadDoc.data();
      console.log(`\n📋 Lead ID: ${leadDoc.id}`);
      console.log(`👤 Customer: ${data.customerName}`);
      console.log(`🎯 Assigned to: ${data.assignedCloserName || 'Unassigned'}`);
      console.log(`📊 Current Status: ${data.status}`);
      console.log(`🕒 Created: ${data.createdAt?.toDate?.() || data.createdAt}`);
      console.log(`🕒 Updated: ${data.updatedAt?.toDate?.() || data.updatedAt}`);
      
      if (data.status === 'scheduled') {
        console.log('🔄 ✅ This lead needs to be updated to "rescheduled"');
        updates.push({
          id: leadDoc.id,
          ref: doc(db, 'leads', leadDoc.id),
          currentData: data
        });
        updatedCount++;
      } else if (data.status === 'rescheduled') {
        console.log('✅ This lead is already marked as "rescheduled"');
      } else {
        console.log(`ℹ️ This lead has status "${data.status}" - no update needed`);
      }
    });
    
    if (updates.length > 0) {
      console.log(`\n🔧 Updating ${updates.length} lead(s) to "rescheduled" status...`);
      
      for (const update of updates) {
        console.log(`⚡ Updating lead ${update.id}...`);
        
        await updateDoc(update.ref, {
          status: 'rescheduled',
          updatedAt: serverTimestamp(),
          statusChangeReason: 'Fixed icon color issue - lead was reassigned from Tony Tiger'
        });
        
        console.log(`✅ Updated lead ${update.id} successfully`);
      }
      
      console.log(`\n🎉 SUCCESS! Updated ${updatedCount} lead(s) to "rescheduled" status`);
      console.log('🎨 Tony Tiger\'s lead will now show a PURPLE rescheduled icon instead of blue');
      console.log('🔄 Please refresh the dashboard page to see the changes');
      
      // Show success message to user
      alert(`🎉 SUCCESS!\n\nUpdated ${updatedCount} Tony Tiger lead(s) to "rescheduled" status.\n\nThe lead will now show a PURPLE rescheduled icon instead of blue.\n\nPlease refresh the dashboard to see the changes.`);
      
    } else {
      console.log('\n📝 No scheduled leads found to update');
      alert('ℹ️ No Tony Tiger leads with "scheduled" status found to update.');
    }
    
  } catch (error) {
    console.error('❌ Error fixing Tony Tiger lead:', error);
    console.error('Full error details:', error);
    alert(`❌ Error: ${error.message}\n\nCheck the console for more details.`);
  }
})();

// Add this helper message
console.log(`
🔧 TONY TIGER LEAD FIX SCRIPT LOADED
=====================================

The script above will:
1. Find Tony Tiger's lead in the database
2. Change status from "scheduled" to "rescheduled" 
3. This will make the lead show a PURPLE icon instead of blue

The script has been executed automatically.
Check the output above for results.
`);
