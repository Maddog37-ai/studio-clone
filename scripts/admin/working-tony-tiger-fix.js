/**
 * WORKING TONY TIGER FIX FOR BROWSER CONSOLE
 * 
 * STEP-BY-STEP INSTRUCTIONS:
 * 1. Open http://localhost:9002/dashboard in your browser
 * 2. Make sure you're logged in as admin/manager
 * 3. Press F12 → go to Console tab
 * 4. Copy this ENTIRE script below (all of it)
 * 5. Paste it into the console and press Enter
 * 
 * The script will automatically search for and fix Tony Tiger's lead.
 */

(async function fixTonyTigerLead() {
  console.clear();
  console.log(`
🔧 TONY TIGER LEAD STATUS FIX
============================
Looking for Tony Tiger's lead and changing status from "scheduled" to "rescheduled"
This will make the lead show a PURPLE rescheduled icon instead of blue.
`);

  try {
    console.log("⏳ Loading Firebase...");
    
    // Access the app's Firebase instance through the module resolution
    // This works because we're running in the context of the React app
    const firebaseAuth = await import('/src/lib/firebase.ts');
    console.log("✅ Firebase modules loaded");
    
    // Get the database instance
    const { db } = firebaseAuth;
    const { collection, query, where, getDocs, doc, updateDoc, serverTimestamp } = await import('firebase/firestore');
    
    console.log("🔍 Searching for Tony Tiger lead...");
    
    // Search for Tony Tiger as customer
    console.log("  → Checking customerName = 'Tony Tiger'");
    let leadsQuery = query(collection(db, 'leads'), where('customerName', '==', 'Tony Tiger'));
    let snapshot = await getDocs(leadsQuery);
    
    if (snapshot.empty) {
      console.log("  → Checking assignedCloserName = 'Tony Tiger'");
      leadsQuery = query(collection(db, 'leads'), where('assignedCloserName', '==', 'Tony Tiger'));
      snapshot = await getDocs(leadsQuery);
    }
    
    if (snapshot.empty) {
      console.log("❌ No exact matches found. Searching all leads for Tony/Tiger...");
      
      // Get all leads and search manually
      const allLeadsQuery = query(collection(db, 'leads'));
      const allSnapshot = await getDocs(allLeadsQuery);
      
      console.log(`📋 Checking ${allSnapshot.size} total leads...`);
      const matches = [];
      
      allSnapshot.forEach((leadDoc) => {
        const data = leadDoc.data();
        const customer = (data.customerName || '').toLowerCase();
        const assigned = (data.assignedCloserName || '').toLowerCase();
        
        if (customer.includes('tony') || customer.includes('tiger') ||
            assigned.includes('tony') || assigned.includes('tiger')) {
          matches.push({ id: leadDoc.id, data });
        }
      });
      
      if (matches.length === 0) {
        console.log("❌ No leads found containing 'Tony' or 'Tiger'");
        alert("❌ No Tony Tiger leads found in database.");
        return;
      }
      
      console.log(`🎯 Found ${matches.length} potential matches:`);
      matches.forEach(match => {
        console.log(`  - ${match.id}: ${match.data.customerName} (assigned: ${match.data.assignedCloserName}) [${match.data.status}]`);
      });
      
      // Use the matches as our snapshot
      snapshot = { docs: matches.map(m => ({ id: m.id, data: () => m.data })), size: matches.length, empty: false };
    }
    
    console.log(`\n📋 Processing ${snapshot.size} Tony Tiger lead(s):`);
    let updatedCount = 0;
    
    for (const leadDoc of snapshot.docs) {
      const data = leadDoc.data();
      const leadId = leadDoc.id;
      
      console.log(`\n📄 Lead: ${leadId}`);
      console.log(`  👤 Customer: ${data.customerName || 'Unknown'}`);
      console.log(`  🎯 Assigned: ${data.assignedCloserName || 'Unassigned'}`);
      console.log(`  📊 Current Status: ${data.status}`);
      
      if (data.status === 'scheduled') {
        console.log(`  🔄 UPDATING: "scheduled" → "rescheduled"`);
        
        try {
          await updateDoc(doc(db, 'leads', leadId), {
            status: 'rescheduled',
            updatedAt: serverTimestamp(),
            statusChangeReason: 'Fixed icon color - lead was reassigned so should show rescheduled'
          });
          
          console.log(`  ✅ SUCCESS: Updated ${leadId}`);
          updatedCount++;
        } catch (updateError) {
          console.error(`  ❌ FAILED to update ${leadId}:`, updateError);
        }
        
      } else if (data.status === 'rescheduled') {
        console.log(`  ✅ ALREADY CORRECT: Status is already "rescheduled"`);
      } else {
        console.log(`  ℹ️  NO UPDATE NEEDED: Status is "${data.status}"`);
      }
    }
    
    console.log(`\n${'='.repeat(50)}`);
    
    if (updatedCount > 0) {
      console.log(`🎉 SUCCESS! Updated ${updatedCount} lead(s) to "rescheduled"`);
      console.log(`🎨 Tony Tiger's lead will now show a PURPLE rescheduled icon`);
      console.log(`🔄 Refresh the dashboard page to see the changes`);
      
      alert(`🎉 SUCCESS!\n\nUpdated ${updatedCount} Tony Tiger lead(s) from "scheduled" to "rescheduled".\n\nThe lead will now show a PURPLE rescheduled icon instead of blue.\n\n👉 Please refresh the dashboard to see the changes.`);
    } else {
      console.log(`📝 No leads needed updating`);
      alert(`ℹ️ Tony Tiger leads found but no updates were needed.\n\nCheck the console for details.`);
    }
    
  } catch (error) {
    console.error(`❌ Error fixing Tony Tiger lead:`, error);
    alert(`❌ Error: ${error.message}\n\nMake sure you are:\n1. On the dashboard page\n2. Logged in as admin/manager\n3. Page has fully loaded\n\nCheck console for details.`);
  }
})();

console.log("🚀 Tony Tiger fix script is running...");
