#!/usr/bin/env node

// This script will directly remove the Ron Mcdonald lead assignment
// Run this from the studio directory: node scripts/cleanup-ron-mcdonald.js

import admin from 'firebase-admin';

// Firebase configuration (same as frontend)
const firebaseConfig = {
  type: "service_account",
  project_id: "leadflow-4lvrr",
  // For admin SDK, we'll use application default credentials
};

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId: 'leadflow-4lvrr'
  });
}

const db = admin.firestore();

async function cleanupRonMcdonald() {
  try {
    console.log('🔍 Searching for Ron Mcdonald lead...');
    console.log('📊 Checking database connection...');
    
    // Test database connection first
    const testQuery = await db.collection('leads').limit(1).get();
    console.log(`✅ Database connected. Found ${testQuery.size} test lead(s)`);
    
    // Find the Ron Mcdonald lead
    const leadsSnapshot = await db.collection('leads')
      .where('customerName', '==', 'Ron Mcdonald')
      .get();
    
    console.log(`📋 Found ${leadsSnapshot.size} leads matching "Ron Mcdonald"`);
    
    if (leadsSnapshot.empty) {
      console.log('❌ No Ron Mcdonald lead found');
      
      // Also search for variations
      const variations = ['Ron McDonald', 'ron mcdonald', 'ron Mcdonald'];
      for (const variation of variations) {
        console.log(`🔍 Trying variation: "${variation}"`);
        const varSnapshot = await db.collection('leads')
          .where('customerName', '==', variation)
          .get();
        console.log(`   Found ${varSnapshot.size} leads for "${variation}"`);
      }
      return;
    }
    
    const leadDoc = leadsSnapshot.docs[0];
    const leadData = leadDoc.data();
    
    console.log('✅ Found Ron Mcdonald lead:');
    console.log(`   ID: ${leadDoc.id}`);
    console.log(`   Status: ${leadData.status}`);
    console.log(`   Assigned to: ${leadData.assignedCloserName || 'None'} (${leadData.assignedCloserId || 'None'})`);
    console.log(`   Created: ${leadData.createdAt ? leadData.createdAt.toDate() : 'Unknown'}`);
    
    // Delete the lead completely
    console.log('🗑️  Deleting lead...');
    await leadDoc.ref.delete();
    
    console.log('✅ Successfully deleted Ron Mcdonald lead!');
    console.log('   Ryan Madden should now appear only in the Closer Lineup');
    
  } catch (error) {
    console.error('❌ Error details:', error);
    console.error('❌ Error message:', error.message);
    console.error('❌ Error stack:', error.stack);
  }
}

// Run the cleanup
cleanupRonMcdonald()
  .then(() => {
    console.log('🎉 Cleanup complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  });
