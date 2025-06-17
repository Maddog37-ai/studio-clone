/**
 * Verify that unwanted teams have been deleted and check for orphaned data
 */

import admin from 'firebase-admin';

// Initialize Firebase Admin with project ID (will work with Firebase CLI auth)
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'leadflow-4lvrr',
  });
}

const db = admin.firestore();

async function verifyTeamDeletion() {
  console.log('🔍 Verifying team deletion and checking for orphaned data...\n');

  try {
    // Check remaining teams
    console.log('📋 Current teams in database:');
    const teamsSnapshot = await db.collection('teams').get();
    const teams = teamsSnapshot.docs.map(doc => ({
      id: doc.id,
      name: doc.data().name,
      isActive: doc.data().isActive
    }));

    teams.forEach(team => {
      console.log(`   ✅ ${team.name} (${team.id}) - Active: ${team.isActive}`);
    });

    // Check for users assigned to deleted teams
    console.log('\n👥 Checking for users assigned to deleted teams...');
    const deletedTeams = ['revolution', 'takeover-pros'];
    
    for (const teamId of deletedTeams) {
      const usersSnapshot = await db.collection('users').where('teamId', '==', teamId).get();
      if (!usersSnapshot.empty) {
        console.log(`⚠️  Found ${usersSnapshot.size} users still assigned to deleted team '${teamId}':`);
        usersSnapshot.docs.forEach(doc => {
          const userData = doc.data();
          console.log(`      - ${userData.displayName || userData.email} (${userData.role})`);
        });
      } else {
        console.log(`   ✅ No users found assigned to '${teamId}'`);
      }
    }

    // Check for closers assigned to deleted teams
    console.log('\n🎯 Checking for closers assigned to deleted teams...');
    for (const teamId of deletedTeams) {
      const closersSnapshot = await db.collection('closers').where('teamId', '==', teamId).get();
      if (!closersSnapshot.empty) {
        console.log(`⚠️  Found ${closersSnapshot.size} closers still assigned to deleted team '${teamId}':`);
        closersSnapshot.docs.forEach(doc => {
          const closerData = doc.data();
          console.log(`      - ${closerData.name} (${closerData.status})`);
        });
      } else {
        console.log(`   ✅ No closers found assigned to '${teamId}'`);
      }
    }

    // Check for leads assigned to deleted teams
    console.log('\n📊 Checking for leads assigned to deleted teams...');
    for (const teamId of deletedTeams) {
      const leadsSnapshot = await db.collection('leads').where('teamId', '==', teamId).get();
      if (!leadsSnapshot.empty) {
        console.log(`⚠️  Found ${leadsSnapshot.size} leads still assigned to deleted team '${teamId}'`);
      } else {
        console.log(`   ✅ No leads found assigned to '${teamId}'`);
      }
    }

    console.log('\n✅ Verification completed!');
    
  } catch (error) {
    console.error('❌ Error during verification:', error.message);
  }
}

verifyTeamDeletion()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('❌ Verification failed:', error);
    process.exit(1);
  });
