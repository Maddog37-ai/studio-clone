#!/usr/bin/env node

/**
 * Tony Tiger Lead Fix - Node.js Script
 * 
 * This script connects to Firestore and updates Tony Tiger's lead
 * from "scheduled" to "rescheduled" status.
 * 
 * Usage: node scripts/node-fix-tony-tiger.js
 */

import admin from 'firebase-admin';
import path from 'path';

// Initialize Firebase Admin with the service account
console.log('🚀 Starting Tony Tiger lead fix script...');

try {
  // Try to use the default app if it exists, otherwise initialize
  let app;
  try {
    app = admin.app();
    console.log('✅ Using existing Firebase admin app');
  } catch (e) {
    // Initialize with default credentials (should work in the functions environment)
    console.log('🔧 Initializing Firebase admin...');
    console.log('   Project ID: leadflow-4lvrr');
    
    // Check if we have credentials
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      console.log('   Using GOOGLE_APPLICATION_CREDENTIALS:', process.env.GOOGLE_APPLICATION_CREDENTIALS);
    } else {
      console.log('   No GOOGLE_APPLICATION_CREDENTIALS found, using default credentials');
    }
    
    app = admin.initializeApp({
      projectId: 'leadflow-4lvrr'
    });
    console.log('✅ Firebase admin initialized');
  }
  
  const db = admin.firestore();
  
  async function fixTonyTigerLead() {
    console.log(`
🔧 TONY TIGER LEAD FIX
=====================
Searching for Tony Tiger's lead and updating status from "scheduled" to "rescheduled"
This will make the lead show a PURPLE icon instead of blue.
`);
    
    try {
      console.log('🔍 Searching for Tony Tiger as customer...');
      
      // Search for Tony Tiger as customer
      let querySnapshot = await db.collection('leads')
        .where('customerName', '==', 'Tony Tiger')
        .get();
      
      if (querySnapshot.empty) {
        console.log('🔍 Searching for Tony Tiger as assigned closer...');
        querySnapshot = await db.collection('leads')
          .where('assignedCloserName', '==', 'Tony Tiger')
          .get();
      }
      
      if (querySnapshot.empty) {
        console.log('🔍 No exact matches. Searching all leads for Tony/Tiger...');
        
        const allLeadsSnapshot = await db.collection('leads').get();
        console.log(`📋 Checking ${allLeadsSnapshot.size} total leads...`);
        
        const matches = [];
        allLeadsSnapshot.forEach(doc => {
          const data = doc.data();
          const customer = (data.customerName || '').toLowerCase();
          const assigned = (data.assignedCloserName || '').toLowerCase();
          
          if (customer.includes('tony') || customer.includes('tiger') ||
              assigned.includes('tony') || assigned.includes('tiger')) {
            matches.push({ doc, data });
          }
        });
        
        if (matches.length === 0) {
          console.log('❌ No leads found containing "Tony" or "Tiger"');
          process.exit(0);
        }
        
        console.log(`🎯 Found ${matches.length} potential matches:`);
        matches.forEach(match => {
          console.log(`  - ${match.doc.id}: ${match.data.customerName} (assigned: ${match.data.assignedCloserName}) [${match.data.status}]`);
        });
        
        // Create a mock querySnapshot
        querySnapshot = {
          docs: matches.map(m => m.doc),
          size: matches.length,
          empty: false
        };
      }
      
      console.log(`\n📋 Processing ${querySnapshot.size} Tony Tiger lead(s):`);
      let updatedCount = 0;
      
      for (const doc of querySnapshot.docs) {
        const data = doc.data();
        
        console.log(`\n📄 Lead: ${doc.id}`);
        console.log(`  👤 Customer: ${data.customerName || 'Unknown'}`);
        console.log(`  🎯 Assigned: ${data.assignedCloserName || 'Unassigned'}`);
        console.log(`  📊 Current Status: ${data.status}`);
        console.log(`  🕒 Created: ${data.createdAt?.toDate?.() || 'Unknown'}`);
        
        if (data.status === 'scheduled') {
          console.log(`  🔄 UPDATING: "scheduled" → "rescheduled"`);
          
          try {
            await doc.ref.update({
              status: 'rescheduled',
              updatedAt: admin.firestore.FieldValue.serverTimestamp(),
              statusChangeReason: 'Fixed icon color - lead was reassigned so should show rescheduled'
            });
            
            console.log(`  ✅ SUCCESS: Updated ${doc.id}`);
            updatedCount++;
          } catch (updateError) {
            console.error(`  ❌ FAILED to update ${doc.id}:`, updateError.message);
          }
          
        } else if (data.status === 'rescheduled') {
          console.log(`  ✅ ALREADY CORRECT: Status is already "rescheduled"`);
        } else {
          console.log(`  ℹ️  NO UPDATE NEEDED: Status is "${data.status}"`);
        }
      }
      
      console.log(`\n${'='.repeat(60)}`);
      
      if (updatedCount > 0) {
        console.log(`🎉 SUCCESS! Updated ${updatedCount} lead(s) to "rescheduled"`);
        console.log(`🎨 Tony Tiger's lead will now show a PURPLE rescheduled icon`);
        console.log(`🔄 Refresh the dashboard page to see the changes`);
      } else {
        console.log(`📝 No leads needed updating`);
      }
      
    } catch (error) {
      console.error('❌ Error fixing Tony Tiger lead:', error.message);
      throw error;
    }
  }
  
  // Run the fix
  fixTonyTigerLead()
    .then(() => {
      console.log('\n✅ Tony Tiger lead fix completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Tony Tiger lead fix failed:', error.message);
      process.exit(1);
    });
  
} catch (initError) {
  console.error('❌ Failed to initialize Firebase:', initError.message);
  console.log('\n💡 Make sure you have Firebase credentials set up:');
  console.log('   - GOOGLE_APPLICATION_CREDENTIALS environment variable');
  console.log('   - Or run: firebase login');
  console.log('   - Or place service account key in the project');
  process.exit(1);
}
