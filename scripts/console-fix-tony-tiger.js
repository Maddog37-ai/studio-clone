/**
 * Quick Fix for Tony Tiger Lead Status
 * 
 * Run this in the browser console while on the dashboard page:
 * 1. Go to http://localhost:9002/dashboard
 * 2. Open Developer Tools (F12)
 * 3. Go to Console tab
 * 4. Paste this entire script and press Enter
 */

(async function fixTonyTigerLead() {
  try {
    console.log('🔍 Looking for Tony Tiger lead...');
    
    // Import Firebase functions from window object (should be available on dashboard)
    if (typeof window === 'undefined' || !window.firebase) {
      console.error('❌ Firebase not available in window object');
      return;
    }
    
    const { collection, query, where, getDocs, doc, updateDoc, serverTimestamp } = window.firebase.firestore;
    const db = window.db || window.firestore;
    
    if (!db) {
      console.error('❌ Database not available. Make sure you are on the dashboard page.');
      return;
    }
    
    // Search for Tony Tiger as customer
    let q = query(collection(db, 'leads'), where('customerName', '==', 'Tony Tiger'));
    let snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      // Try searching as assigned closer
      console.log('🔍 Searching as assigned closer...');
      q = query(collection(db, 'leads'), where('assignedCloserName', '==', 'Tony Tiger'));
      snapshot = await getDocs(q);
    }
    
    if (snapshot.empty) {
      console.log('❌ No Tony Tiger lead found');
      return;
    }
    
    let updatedCount = 0;
    const batch = [];
    
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      console.log(`📋 Found lead: ${docSnap.id}`);
      console.log(`👤 Customer: ${data.customerName}`);
      console.log(`🎯 Assigned: ${data.assignedCloserName}`);
      console.log(`📊 Status: ${data.status}`);
      
      if (data.status === 'scheduled') {
        console.log('🔄 Will update to rescheduled...');
        batch.push({
          ref: doc(db, 'leads', docSnap.id),
          data: {
            status: 'rescheduled',
            updatedAt: serverTimestamp(),
            statusChangeReason: 'Fixed icon color issue - was reassigned'
          }
        });
        updatedCount++;
      }
    });
    
    if (batch.length > 0) {
      for (const update of batch) {
        await updateDoc(update.ref, update.data);
      }
      
      console.log(`✅ Updated ${updatedCount} lead(s) to rescheduled status`);
      console.log('🎨 Tony Tiger lead will now show purple rescheduled icon');
      console.log('🔄 Refresh the page to see changes');
      
      // Show alert to user
      alert(`✅ Success! Updated ${updatedCount} lead(s). Tony Tiger's lead will now show a purple rescheduled icon. Please refresh the page.`);
    } else {
      console.log('📝 No scheduled leads found to update');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
    alert('❌ Error updating lead. Check console for details.');
  }
})();
