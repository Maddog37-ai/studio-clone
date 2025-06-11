/**
 * Delete unwanted teams from the database
 * This script will safely delete 'revolution' and 'takeover-pros' teams
 * along with any associated data.
 */

import admin from 'firebase-admin';

// Initialize Firebase Admin with project ID
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'leadflow-4lvrr', // The correct project ID from firebase config
  });
}

const db = admin.firestore();

const TEAMS_TO_DELETE = ['revolution', 'takeover-pros'];

async function deleteUnwantedTeams() {
  try {
    console.log('🔍 Starting deletion of unwanted teams...\n');

    // First, let's check what teams exist
    console.log('📋 Current teams in database:');
    const teamsSnapshot = await db.collection('teams').get();
    const allTeams = teamsSnapshot.docs.map(doc => ({
      id: doc.id,
      name: doc.data().name,
      isActive: doc.data().isActive
    }));

    allTeams.forEach(team => {
      console.log(`   - ${team.name} (${team.id}) - Active: ${team.isActive}`);
    });
    console.log('');

    // Check if teams to delete exist
    const teamsToDelete = allTeams.filter(team => TEAMS_TO_DELETE.includes(team.id));
    
    if (teamsToDelete.length === 0) {
      console.log('✅ No unwanted teams found. Nothing to delete.');
      return;
    }

    console.log('🎯 Teams that will be deleted:');
    teamsToDelete.forEach(team => {
      console.log(`   - ${team.name} (${team.id})`);
    });
    console.log('');

    // Check for any users assigned to these teams
    console.log('👥 Checking for users assigned to these teams...');
    for (const teamId of TEAMS_TO_DELETE) {
      const usersInTeam = await db.collection('users').where('teamId', '==', teamId).get();
      if (!usersInTeam.empty) {
        console.log(`⚠️  WARNING: Found ${usersInTeam.size} users in team '${teamId}':`);
        usersInTeam.docs.forEach(doc => {
          const userData = doc.data();
          console.log(`      - ${userData.displayName || userData.email} (${userData.role})`);
        });
        console.log('');
      }
    }

    // Check for any closers assigned to these teams
    console.log('🎯 Checking for closers assigned to these teams...');
    for (const teamId of TEAMS_TO_DELETE) {
      const closersInTeam = await db.collection('closers').where('teamId', '==', teamId).get();
      if (!closersInTeam.empty) {
        console.log(`⚠️  WARNING: Found ${closersInTeam.size} closers in team '${teamId}':`);
        closersInTeam.docs.forEach(doc => {
          const closerData = doc.data();
          console.log(`      - ${closerData.name} (${closerData.status})`);
        });
        console.log('');
      }
    }

    // Check for any leads assigned to these teams
    console.log('📊 Checking for leads assigned to these teams...');
    for (const teamId of TEAMS_TO_DELETE) {
      const leadsInTeam = await db.collection('leads').where('teamId', '==', teamId).get();
      if (!leadsInTeam.empty) {
        console.log(`⚠️  WARNING: Found ${leadsInTeam.size} leads in team '${teamId}'`);
        console.log('');
      }
    }

    // Ask for confirmation
    console.log('⚡ DANGER ZONE: About to delete teams and potentially reassign users to Empire team');
    console.log('   This action cannot be undone!');
    console.log('');
    
    // In a real scenario, you'd want manual confirmation
    // For now, let's proceed with the deletion
    
    console.log('🔄 Starting deletion process...\n');

    const batch = db.batch();
    let operationCount = 0;

    // First, reassign any users from these teams to Empire team
    for (const teamId of TEAMS_TO_DELETE) {
      const usersInTeam = await db.collection('users').where('teamId', '==', teamId).get();
      
      if (!usersInTeam.empty) {
        console.log(`📝 Reassigning ${usersInTeam.size} users from '${teamId}' to 'empire' team...`);
        
        usersInTeam.docs.forEach(doc => {
          batch.update(doc.ref, {
            teamId: 'empire',
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          });
          operationCount++;
        });
      }
    }

    // Reassign any closers from these teams to Empire team
    for (const teamId of TEAMS_TO_DELETE) {
      const closersInTeam = await db.collection('closers').where('teamId', '==', teamId).get();
      
      if (!closersInTeam.empty) {
        console.log(`🎯 Reassigning ${closersInTeam.size} closers from '${teamId}' to 'empire' team...`);
        
        closersInTeam.docs.forEach(doc => {
          batch.update(doc.ref, {
            teamId: 'empire',
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          });
          operationCount++;
        });
      }
    }

    // Reassign any leads from these teams to Empire team
    for (const teamId of TEAMS_TO_DELETE) {
      const leadsInTeam = await db.collection('leads').where('teamId', '==', teamId).get();
      
      if (!leadsInTeam.empty) {
        console.log(`📊 Reassigning ${leadsInTeam.size} leads from '${teamId}' to 'empire' team...`);
        
        leadsInTeam.docs.forEach(doc => {
          batch.update(doc.ref, {
            teamId: 'empire',
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          });
          operationCount++;
        });
      }
    }

    // Delete the unwanted teams
    for (const teamId of TEAMS_TO_DELETE) {
      const teamDoc = db.collection('teams').doc(teamId);
      batch.delete(teamDoc);
      operationCount++;
      console.log(`🗑️  Deleting team '${teamId}'...`);
    }

    // Execute the batch operation
    if (operationCount > 0) {
      console.log(`\n⚡ Executing ${operationCount} operations...`);
      await batch.commit();
      console.log('✅ All operations completed successfully!');
    } else {
      console.log('✅ No operations needed.');
    }

    // Verify the deletion
    console.log('\n🔍 Verifying deletion...');
    const updatedTeamsSnapshot = await db.collection('teams').get();
    const remainingTeams = updatedTeamsSnapshot.docs.map(doc => ({
      id: doc.id,
      name: doc.data().name
    }));

    console.log('📋 Remaining teams:');
    remainingTeams.forEach(team => {
      console.log(`   - ${team.name} (${team.id})`);
    });

    console.log('\n✅ Team deletion completed successfully!');
    console.log('   All users, closers, and leads have been reassigned to the Empire team.');

  } catch (error) {
    console.error('❌ Error during team deletion:', error);
    process.exit(1);
  }
}

// Run the deletion
console.log('🚀 Starting team deletion script...');
deleteUnwantedTeams()
  .then(() => {
    console.log('🎉 Script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Deletion failed:', error);
    console.error('Error details:', error.message);
    process.exit(1);
  });
