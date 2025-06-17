#!/usr/bin/env node

import admin from 'firebase-admin';

// Initialize Firebase Admin using application default credentials
// This will work if you're logged in with Firebase CLI
admin.initializeApp({
  projectId: 'leadflow-4lvrr'
});

const db = admin.firestore();

async function cleanupOrphanedData() {
  console.log('🔍 Starting cleanup of orphaned data...\n');

  try {
    // 1. Check for closers still assigned to deleted teams
    console.log('1. Checking for closers assigned to deleted teams...');
    const orphanedClosersSnapshot = await db.collection('closers')
      .where('teamId', 'in', ['revolution', 'takeover-pros'])
      .get();

    if (!orphanedClosersSnapshot.empty) {
      console.log(`   Found ${orphanedClosersSnapshot.size} orphaned closers`);
      
      const batch = db.batch();
      orphanedClosersSnapshot.docs.forEach(doc => {
        console.log(`   - Deleting closer: ${doc.data().name} (${doc.id})`);
        batch.delete(doc.ref);
      });
      
      await batch.commit();
      console.log('   ✅ Orphaned closers deleted');
    } else {
      console.log('   ✅ No orphaned closers found');
    }

    // 2. Check for users still assigned to deleted teams
    console.log('\n2. Checking for users assigned to deleted teams...');
    const orphanedUsersSnapshot = await db.collection('users')
      .where('teamId', 'in', ['revolution', 'takeover-pros'])
      .get();

    if (!orphanedUsersSnapshot.empty) {
      console.log(`   Found ${orphanedUsersSnapshot.size} orphaned users`);
      
      const batch2 = db.batch();
      orphanedUsersSnapshot.docs.forEach(doc => {
        const userData = doc.data();
        console.log(`   - Reassigning user: ${userData.displayName || userData.email} (${doc.id}) to Empire team`);
        batch2.update(doc.ref, { teamId: 'empire' });
      });
      
      await batch2.commit();
      console.log('   ✅ Orphaned users reassigned to Empire team');
    } else {
      console.log('   ✅ No orphaned users found');
    }

    // 3. Check for leads still assigned to deleted teams
    console.log('\n3. Checking for leads assigned to deleted teams...');
    const orphanedLeadsSnapshot = await db.collection('leads')
      .where('teamId', 'in', ['revolution', 'takeover-pros'])
      .get();

    if (!orphanedLeadsSnapshot.empty) {
      console.log(`   Found ${orphanedLeadsSnapshot.size} orphaned leads`);
      
      const batch3 = db.batch();
      orphanedLeadsSnapshot.docs.forEach(doc => {
        const leadData = doc.data();
        console.log(`   - Reassigning lead: ${leadData.customerName} (${doc.id}) to Empire team`);
        batch3.update(doc.ref, { 
          teamId: 'empire',
          assignedCloserId: null,
          assignedCloserName: null,
          status: 'waiting_assignment'
        });
      });
      
      await batch3.commit();
      console.log('   ✅ Orphaned leads reassigned to Empire team');
    } else {
      console.log('   ✅ No orphaned leads found');
    }

    // 4. Check for activities related to deleted teams
    console.log('\n4. Checking for activities related to deleted teams...');
    const orphanedActivitiesSnapshot = await db.collection('activities')
      .where('teamId', 'in', ['revolution', 'takeover-pros'])
      .get();

    if (!orphanedActivitiesSnapshot.empty) {
      console.log(`   Found ${orphanedActivitiesSnapshot.size} orphaned activities`);
      
      const batch4 = db.batch();
      orphanedActivitiesSnapshot.docs.forEach(doc => {
        console.log(`   - Deleting activity: ${doc.data().type} (${doc.id})`);
        batch4.delete(doc.ref);
      });
      
      await batch4.commit();
      console.log('   ✅ Orphaned activities deleted');
    } else {
      console.log('   ✅ No orphaned activities found');
    }

    // 5. Check for specific closer ID from error message
    console.log('\n5. Checking for specific closer ID from error...');
    const problemCloserDoc = await db.collection('closers').doc('18PJNXfppcxpS2ZwWCstYK8TEQ2').get();
    
    if (problemCloserDoc.exists) {
      console.log(`   Found problem closer: ${problemCloserDoc.data().name}`);
      await problemCloserDoc.ref.delete();
      console.log('   ✅ Problem closer deleted');
    } else {
      console.log('   ✅ Problem closer does not exist (already cleaned up)');
    }

    // 6. Check for any references to the problem closer in leads
    console.log('\n6. Checking for leads assigned to problem closer...');
    const problemLeadsSnapshot = await db.collection('leads')
      .where('assignedCloserId', '==', '18PJNXfppcxpS2ZwWCstYK8TEQ2')
      .get();

    if (!problemLeadsSnapshot.empty) {
      console.log(`   Found ${problemLeadsSnapshot.size} leads assigned to problem closer`);
      
      const batch5 = db.batch();
      problemLeadsSnapshot.docs.forEach(doc => {
        const leadData = doc.data();
        console.log(`   - Unassigning lead: ${leadData.customerName} (${doc.id})`);
        batch5.update(doc.ref, { 
          assignedCloserId: null,
          assignedCloserName: null,
          status: 'waiting_assignment'
        });
      });
      
      await batch5.commit();
      console.log('   ✅ Problem closer unassigned from leads');
    } else {
      console.log('   ✅ No leads assigned to problem closer');
    }

    console.log('\n🎉 Cleanup completed successfully!');
    console.log('\n📊 Summary:');
    console.log('- Deleted orphaned closers from revolution/takeover-pros teams');
    console.log('- Reassigned orphaned users to Empire team');
    console.log('- Reassigned orphaned leads to Empire team and unassigned them');
    console.log('- Cleaned up orphaned activities');
    console.log('- Handled specific problem closer ID');
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    process.exit(1);
  }
}

// Run the cleanup
cleanupOrphanedData()
  .then(() => {
    console.log('\n✅ Exiting...');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
