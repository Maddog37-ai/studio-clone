#!/usr/bin/env node

import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get current directory in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Firebase Admin
const serviceAccount = JSON.parse(readFileSync(join(__dirname, '../firebase-admin-key.json'), 'utf8'));
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'leadflow-4lvrr'
});

const db = admin.firestore();

async function checkForOrphanedData() {
  console.log('🔍 Checking for orphaned data...\n');

  try {
    // Check closers collection
    console.log('1. Checking closers collection...');
    const closersSnapshot = await db.collection('closers').get();
    const orphanedClosers = [];
    
    closersSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.teamId === 'revolution' || data.teamId === 'takeover-pros') {
        orphanedClosers.push({ id: doc.id, teamId: data.teamId });
      }
    });
    
    if (orphanedClosers.length > 0) {
      console.log(`❌ Found ${orphanedClosers.length} orphaned closers:`);
      orphanedClosers.forEach(closer => {
        console.log(`   - ${closer.id} (team: ${closer.teamId})`);
      });
    } else {
      console.log('✅ No orphaned closers found');
    }

    // Check users collection
    console.log('\n2. Checking users collection...');
    const usersSnapshot = await db.collection('users').get();
    const orphanedUsers = [];
    
    usersSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.teamId === 'revolution' || data.teamId === 'takeover-pros') {
        orphanedUsers.push({ id: doc.id, teamId: data.teamId, email: data.email });
      }
    });
    
    if (orphanedUsers.length > 0) {
      console.log(`❌ Found ${orphanedUsers.length} orphaned users:`);
      orphanedUsers.forEach(user => {
        console.log(`   - ${user.id} (${user.email}) (team: ${user.teamId})`);
      });
    } else {
      console.log('✅ No orphaned users found');
    }

    // Check leads collection
    console.log('\n3. Checking leads collection...');
    const leadsSnapshot = await db.collection('leads').get();
    const orphanedLeads = [];
    
    leadsSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.teamId === 'revolution' || data.teamId === 'takeover-pros') {
        orphanedLeads.push({ id: doc.id, teamId: data.teamId });
      }
    });
    
    if (orphanedLeads.length > 0) {
      console.log(`❌ Found ${orphanedLeads.length} orphaned leads:`);
      orphanedLeads.forEach(lead => {
        console.log(`   - ${lead.id} (team: ${lead.teamId})`);
      });
    } else {
      console.log('✅ No orphaned leads found');
    }

    // Check activities collection
    console.log('\n4. Checking activities collection...');
    const activitiesSnapshot = await db.collection('activities').get();
    const orphanedActivities = [];
    
    activitiesSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.teamId === 'revolution' || data.teamId === 'takeover-pros') {
        orphanedActivities.push({ id: doc.id, teamId: data.teamId });
      }
    });
    
    if (orphanedActivities.length > 0) {
      console.log(`❌ Found ${orphanedActivities.length} orphaned activities:`);
      orphanedActivities.forEach(activity => {
        console.log(`   - ${activity.id} (team: ${activity.teamId})`);
      });
    } else {
      console.log('✅ No orphaned activities found');
    }

    // Summary
    const totalOrphaned = orphanedClosers.length + orphanedUsers.length + orphanedLeads.length + orphanedActivities.length;
    console.log(`\n📊 Summary: Found ${totalOrphaned} total orphaned documents`);
    
    if (totalOrphaned === 0) {
      console.log('🎉 Database is clean! No orphaned data found.');
    }

  } catch (error) {
    console.error('❌ Error checking for orphaned data:', error);
  }
}

checkForOrphanedData()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
