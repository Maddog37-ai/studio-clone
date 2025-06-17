/**
 * Browser Console Script to Update Tony Tiger's Lead Status
 * 
 * This can be run directly in the browser console while on the dashboard
 * to update Tony Tiger's lead from "scheduled" to "rescheduled"
 * 
 * Instructions:
 * 1. Open the dashboard in your browser (http://localhost:9002)
 * 2. Open browser developer tools (F12)
 * 3. Go to Console tab
 * 4. Copy and paste this entire script
 * 5. Press Enter to run
 */

async function updateTonyTigerLead() {
  try {
    console.log('🔍 Searching for Tony Tiger\'s lead...');
    
    // Import Firebase functions from the global scope
    const { collection, query, where, getDocs, doc, updateDoc, serverTimestamp } = window.firebase.firestore;
    const db = window.db; // assuming db is available globally
    
    if (!db) {
      console.error('❌ Firestore database not available. Make sure you are on the dashboard page.');
      return;
    }
    
    // Search for leads with Tony Tiger as customer name
    const customerQuery = query(
      collection(db, 'leads'),
      where('customerName', '==', 'Tony Tiger')
    );
    
    let leadsSnapshot = await getDocs(customerQuery);
    
    if (leadsSnapshot.empty) {
      // Try searching by assigned closer name
      console.log('🔍 Searching by assigned closer name...');
      const closerQuery = query(
        collection(db, 'leads'),
        where('assignedCloserName', '==', 'Tony Tiger')
      );
      
      leadsSnapshot = await getDocs(closerQuery);
    }
    
    if (leadsSnapshot.empty) {
      console.log('❌ No leads found for Tony Tiger');
      return;
    }
    
    console.log(`📋 Found ${leadsSnapshot.size} lead(s) for Tony Tiger`);
    
    let updatedCount = 0;
    const updates = [];
    
    leadsSnapshot.forEach((docSnapshot) => {
      const leadData = docSnapshot.data();
      
      console.log(`\n📄 Lead ID: ${docSnapshot.id}`);
      console.log(`👤 Customer: ${leadData.customerName}`);
      console.log(`🎯 Assigned to: ${leadData.assignedCloserName}`);
      console.log(`📊 Current Status: ${leadData.status}`);
      
      // Update leads that are currently "scheduled" to "rescheduled"
      if (leadData.status === 'scheduled') {
        console.log('🔄 Updating status from "scheduled" to "rescheduled"...');
        
        const leadRef = doc(db, 'leads', docSnapshot.id);
        updates.push(
          updateDoc(leadRef, {
            status: 'rescheduled',
            updatedAt: serverTimestamp(),
            statusChangeReason: 'Lead was reassigned - should show as rescheduled',
            statusChangedBy: 'manual-update'
          })
        );
        
        updatedCount++;
      } else {
        console.log(`ℹ️  Status is "${leadData.status}" - no update needed`);
      }
    });
    
    if (updates.length > 0) {
      await Promise.all(updates);
      console.log(`\n✅ Successfully updated ${updatedCount} lead(s) to "rescheduled" status`);
      console.log('🎨 Tony Tiger\'s lead will now show a purple rescheduled icon');
      console.log('🔄 Refresh the page to see the changes');
    } else {
      console.log('\n📝 No updates needed - no leads with "scheduled" status found');
    }
    
  } catch (error) {
    console.error('❌ Error updating Tony Tiger\'s lead:', error);
  }
}

// Run the function
updateTonyTigerLead();
