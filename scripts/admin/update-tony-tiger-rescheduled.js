#!/usr/bin/env node

/**
 * Script to find and update Tony Tiger's lead from "scheduled" to "rescheduled"
 * This will make his lead show the purple rescheduled icon instead of blue scheduled icon
 */

import admin from 'firebase-admin';

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      projectId: 'leadflow-dashboard',
    });
  } catch (error) {
    console.log('Failed to initialize with application default, trying with project ID only...');
    admin.initializeApp({
      projectId: 'leadflow-dashboard',
    });
  }
}

const db = admin.firestore();

async function updateTonyTigerLead() {
  try {
    console.log('🔍 Searching for Tony Tiger\'s lead...');
    
    // Search for leads with Tony Tiger as customer name or assigned closer
    const leadsSnapshot = await db.collection('leads')
      .where('customerName', '==', 'Tony Tiger')
      .get();
    
    if (leadsSnapshot.empty) {
      // Try searching in assignedCloserName
      const leadsSnapshot2 = await db.collection('leads')
        .where('assignedCloserName', '==', 'Tony Tiger')
        .get();
      
      if (leadsSnapshot2.empty) {
        console.log('❌ No leads found for Tony Tiger');
        return;
      } else {
        await processLeads(leadsSnapshot2);
      }
    } else {
      await processLeads(leadsSnapshot);
    }
    
  } catch (error) {
    console.error('❌ Error updating Tony Tiger\'s lead:', error);
  }
}

async function processLeads(snapshot) {
  console.log(`📋 Found ${snapshot.size} lead(s) for Tony Tiger`);
  
  const batch = db.batch();
  let updatedCount = 0;
  
  snapshot.forEach((doc) => {
    const leadData = doc.data();
    
    console.log(`\n📄 Lead ID: ${doc.id}`);
    console.log(`👤 Customer: ${leadData.customerName}`);
    console.log(`🎯 Assigned to: ${leadData.assignedCloserName}`);
    console.log(`📊 Current Status: ${leadData.status}`);
    
    // Update leads that are currently "scheduled" to "rescheduled"
    if (leadData.status === 'scheduled') {
      console.log('🔄 Updating status from "scheduled" to "rescheduled"...');
      
      batch.update(doc.ref, {
        status: 'rescheduled',
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        statusChangeReason: 'Lead was reassigned - should show as rescheduled',
        statusChangedBy: 'system-script'
      });
      
      updatedCount++;
    } else {
      console.log(`ℹ️  Status is "${leadData.status}" - no update needed`);
    }
  });
  
  if (updatedCount > 0) {
    await batch.commit();
    console.log(`\n✅ Successfully updated ${updatedCount} lead(s) to "rescheduled" status`);
    console.log('🎨 Tony Tiger\'s lead will now show a purple rescheduled icon');
  } else {
    console.log('\n📝 No updates needed - no leads with "scheduled" status found');
  }
}

// Run the script
updateTonyTigerLead()
  .then(() => {
    console.log('\n🎉 Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Script failed:', error);
    process.exit(1);
  });
