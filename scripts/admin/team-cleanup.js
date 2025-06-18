#!/usr/bin/env node

/**
 * Team Cleanup Script
 * This script will:
 * 1. Move all users to the Empire team
 * 2. Remove all teams except Empire, Revolution (Empire), and TakeoverPros (Empire)
 */

import admin from 'firebase-admin';

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'leadflow-4lvrr', // Using the correct project ID from the codebase
  });
}

const db = admin.firestore();

// Teams to keep
const TEAMS_TO_KEEP = ['empire', 'revolution', 'takeover-pros'];

async function moveAllUsersToEmpire() {
  console.log('🚀 Starting team cleanup process...\n');

  try {
    // Step 1: Get all current teams
    console.log('📋 Step 1: Checking current teams...');
    const teamsSnapshot = await db.collection('teams').get();
    const allTeams = teamsSnapshot.docs.map(doc => ({
      id: doc.id,
      name: doc.data().name,
      description: doc.data().description,
      isActive: doc.data().isActive
    }));

    console.log(`Found ${allTeams.length} teams:`);
    allTeams.forEach(team => {
      const status = TEAMS_TO_KEEP.includes(team.id) ? '✅ KEEP' : '🗑️  DELETE';
      console.log(`   ${status} - ${team.name} (${team.id})`);
    });
    console.log('');

    // Step 2: Ensure Empire team exists and is properly configured
    console.log('🏛️  Step 2: Ensuring Empire team exists...');
    const empireTeamRef = db.collection('teams').doc('empire');
    const empireTeamDoc = await empireTeamRef.get();
    
    if (!empireTeamDoc.exists) {
      console.log('Creating Empire team...');
      await empireTeamRef.set({
        id: 'empire',
        name: 'Empire',
        description: 'Elite sales team for enterprise-level opportunities',
        isActive: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        settings: {
          autoAssignment: true,
          maxLeadsPerCloser: 12,
          workingHours: {
            start: '07:00',
            end: '22:00',
            timezone: 'America/Los_Angeles'
          }
        }
      });
      console.log('✅ Empire team created');
    } else {
      console.log('✅ Empire team already exists');
    }

    // Step 3: Ensure Revolution and TakeoverPros teams exist
    console.log('\n🔄 Step 3: Ensuring Revolution and TakeoverPros teams exist...');
    
    const revolutionTeamRef = db.collection('teams').doc('revolution');
    const revolutionTeamDoc = await revolutionTeamRef.get();
    
    if (!revolutionTeamDoc.exists) {
      console.log('Creating Revolution team...');
      await revolutionTeamRef.set({
        id: 'revolution',
        name: 'Revolution (Empire)',
        description: 'Revolution team under Empire division',
        isActive: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        settings: {
          autoAssignment: true,
          maxLeadsPerCloser: 12,
          workingHours: {
            start: '07:00',
            end: '22:00',
            timezone: 'America/Los_Angeles'
          }
        }
      });
      console.log('✅ Revolution team created');
    } else {
      console.log('✅ Revolution team already exists');
    }

    const takeoverProTeamRef = db.collection('teams').doc('takeover-pros');
    const takeoverProTeamDoc = await takeoverProTeamRef.get();
    
    if (!takeoverProTeamDoc.exists) {
      console.log('Creating TakeoverPros team...');
      await takeoverProTeamRef.set({
        id: 'takeover-pros',
        name: 'TakeoverPros (Empire)',
        description: 'TakeoverPros team under Empire division',
        isActive: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        settings: {
          autoAssignment: true,
          maxLeadsPerCloser: 12,
          workingHours: {
            start: '07:00',
            end: '22:00',
            timezone: 'America/Los_Angeles'
          }
        }
      });
      console.log('✅ TakeoverPros team created');
    } else {
      console.log('✅ TakeoverPros team already exists');
    }

    // Step 4: Move all users to Empire team
    console.log('\n👥 Step 4: Moving all users to Empire team...');
    const usersSnapshot = await db.collection('users').get();
    const users = usersSnapshot.docs.map(doc => ({
      uid: doc.id,
      ...doc.data()
    }));

    console.log(`Found ${users.length} users to process`);

    const userBatch = db.batch();
    let usersMovedToEmpire = 0;

    users.forEach(user => {
      if (user.teamId !== 'empire') {
        console.log(`👤 Moving user ${user.displayName || user.email || user.uid} to Empire team (was on ${user.teamId || 'no team'})`);
        const userRef = db.collection('users').doc(user.uid);
        userBatch.update(userRef, {
          teamId: 'empire',
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        usersMovedToEmpire++;
      }
    });

    if (usersMovedToEmpire > 0) {
      await userBatch.commit();
      console.log(`✅ Moved ${usersMovedToEmpire} users to Empire team`);
    } else {
      console.log('✅ All users already on Empire team');
    }

    // Step 5: Move all closers to Empire team
    console.log('\n🎯 Step 5: Moving all closers to Empire team...');
    const closersSnapshot = await db.collection('closers').get();
    const closers = closersSnapshot.docs.map(doc => ({
      uid: doc.id,
      ...doc.data()
    }));

    console.log(`Found ${closers.length} closers to process`);

    const closerBatch = db.batch();
    let closersMovedToEmpire = 0;

    closers.forEach(closer => {
      if (closer.teamId !== 'empire') {
        console.log(`🎯 Moving closer ${closer.name || closer.uid} to Empire team (was on ${closer.teamId || 'no team'})`);
        const closerRef = db.collection('closers').doc(closer.uid);
        closerBatch.update(closerRef, {
          teamId: 'empire',
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        closersMovedToEmpire++;
      }
    });

    if (closersMovedToEmpire > 0) {
      await closerBatch.commit();
      console.log(`✅ Moved ${closersMovedToEmpire} closers to Empire team`);
    } else {
      console.log('✅ All closers already on Empire team');
    }

    // Step 6: Move all leads to Empire team
    console.log('\n📊 Step 6: Moving all leads to Empire team...');
    const leadsSnapshot = await db.collection('leads').get();
    const leads = leadsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    console.log(`Found ${leads.length} leads to process`);

    // Process leads in batches (Firestore has a 500 operation limit per batch)
    const BATCH_SIZE = 400;
    let leadsMovedToEmpire = 0;

    for (let i = 0; i < leads.length; i += BATCH_SIZE) {
      const batch = db.batch();
      const batchLeads = leads.slice(i, i + BATCH_SIZE);
      
      batchLeads.forEach(lead => {
        if (lead.teamId !== 'empire') {
          const leadRef = db.collection('leads').doc(lead.id);
          batch.update(leadRef, {
            teamId: 'empire',
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          });
          leadsMovedToEmpire++;
        }
      });

      if (batchLeads.some(lead => lead.teamId !== 'empire')) {
        await batch.commit();
        console.log(`📄 Processed batch ${Math.floor(i / BATCH_SIZE) + 1}...`);
      }
    }

    console.log(`✅ Moved ${leadsMovedToEmpire} leads to Empire team`);

    // Step 7: Delete unwanted teams
    console.log('\n🗑️  Step 7: Deleting unwanted teams...');
    const teamsToDelete = allTeams.filter(team => !TEAMS_TO_KEEP.includes(team.id));
    
    if (teamsToDelete.length === 0) {
      console.log('✅ No teams to delete');
    } else {
      console.log(`Deleting ${teamsToDelete.length} unwanted teams:`);
      
      const deleteBatch = db.batch();
      teamsToDelete.forEach(team => {
        console.log(`🗑️  Deleting team: ${team.name} (${team.id})`);
        const teamRef = db.collection('teams').doc(team.id);
        deleteBatch.delete(teamRef);
      });
      
      await deleteBatch.commit();
      console.log('✅ All unwanted teams deleted');
    }

    // Step 8: Verify final state
    console.log('\n🔍 Step 8: Verifying final state...');
    const finalTeamsSnapshot = await db.collection('teams').get();
    const remainingTeams = finalTeamsSnapshot.docs.map(doc => ({
      id: doc.id,
      name: doc.data().name
    }));

    console.log('📋 Remaining teams:');
    remainingTeams.forEach(team => {
      console.log(`   ✅ ${team.name} (${team.id})`);
    });

    // Check user distribution
    const finalUsersSnapshot = await db.collection('users').get();
    const usersByTeam = {};
    finalUsersSnapshot.docs.forEach(doc => {
      const teamId = doc.data().teamId || 'no-team';
      usersByTeam[teamId] = (usersByTeam[teamId] || 0) + 1;
    });

    console.log('\n👥 User distribution by team:');
    Object.entries(usersByTeam).forEach(([teamId, count]) => {
      console.log(`   ${teamId}: ${count} users`);
    });

    console.log('\n🎉 Team cleanup completed successfully!');
    console.log('📝 Summary:');
    console.log(`   - ${usersMovedToEmpire} users moved to Empire team`);
    console.log(`   - ${closersMovedToEmpire} closers moved to Empire team`);
    console.log(`   - ${leadsMovedToEmpire} leads moved to Empire team`);
    console.log(`   - ${teamsToDelete.length} unwanted teams deleted`);
    console.log(`   - ${remainingTeams.length} teams remaining: ${remainingTeams.map(t => t.name).join(', ')}`);

  } catch (error) {
    console.error('❌ Team cleanup failed:', error);
    throw error;
  }
}

// Run the cleanup
console.log('🚀 Starting team cleanup script...');
moveAllUsersToEmpire()
  .then(() => {
    console.log('\n✅ Team cleanup script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Team cleanup script failed:', error);
    console.error('Error details:', error.message);
    process.exit(1);
  });
