/**
 * One-time script to fix teams and users
 * Run this script once to clean up duplicate teams and move all users to Empire
 */

import admin from 'firebase-admin';

// Initialize Firebase Admin (adjust the path to your service account key if needed)
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'leadflow-app', // Replace with your actual project ID
  });
}

const db = admin.firestore();

async function fixTeamsAndUsers() {
  try {
    console.log('🔧 Starting teams and users fix...');

    // Step 1: Get all teams and identify duplicates
    const teamsSnapshot = await db.collection('teams').get();
    const teams = teamsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    console.log(`📊 Found ${teams.length} teams:`, teams.map(t => `${t.name} (${t.id})`));

    // Find duplicate teams by name (case-insensitive)
    const teamsByName = new Map();
    teams.forEach(team => {
      const name = team.name.toLowerCase();
      if (!teamsByName.has(name)) {
        teamsByName.set(name, []);
      }
      teamsByName.get(name).push(team);
    });

    // Step 2: Remove duplicate teams (keep the first one for each name)
    let duplicatesRemoved = 0;
    const batch = db.batch();

    for (const [name, teamList] of teamsByName) {
      if (teamList.length > 1) {
        console.log(`🚨 Found ${teamList.length} teams with name "${name}"`);
        // Keep the first team, delete the rest
        for (let i = 1; i < teamList.length; i++) {
          const duplicateTeam = teamList[i];
          console.log(`🗑️  Marking duplicate team for deletion: ${duplicateTeam.name} (${duplicateTeam.id})`);
          batch.delete(db.collection('teams').doc(duplicateTeam.id));
          duplicatesRemoved++;
        }
      }
    }

    // Commit team deletions first
    if (duplicatesRemoved > 0) {
      await batch.commit();
      console.log(`✅ Removed ${duplicatesRemoved} duplicate teams`);
    } else {
      console.log('✅ No duplicate teams found');
    }

    // Step 3: Ensure Empire team exists
    const empireTeamRef = db.collection('teams').doc('empire');
    const empireTeamDoc = await empireTeamRef.get();
    
    if (!empireTeamDoc.exists) {
      console.log('🏛️  Creating Empire team...');
      await empireTeamRef.set({
        id: 'empire',
        name: 'Empire',
        description: 'Elite sales team for enterprise-level opportunities',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
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

    // Step 4: Move all users to Empire team
    const usersSnapshot = await db.collection('users').get();
    const users = usersSnapshot.docs.map(doc => ({
      uid: doc.id,
      ...doc.data()
    }));

    const userBatch = db.batch();
    let usersMovedToEmpire = 0;

    users.forEach(user => {
      if (user.teamId !== 'empire') {
        console.log(`👤 Moving user ${user.displayName || user.email || user.uid} to Empire team (was on ${user.teamId || 'no team'})`);
        const userRef = db.collection('users').doc(user.uid);
        userBatch.update(userRef, {
          teamId: 'empire',
          updatedAt: new Date()
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
    const closersSnapshot = await db.collection('closers').get();
    const closers = closersSnapshot.docs.map(doc => ({
      uid: doc.id,
      ...doc.data()
    }));

    const closerBatch = db.batch();
    let closersMovedToEmpire = 0;

    closers.forEach(closer => {
      if (closer.teamId !== 'empire') {
        console.log(`🎯 Moving closer ${closer.name || closer.uid} to Empire team (was on ${closer.teamId || 'no team'})`);
        const closerRef = db.collection('closers').doc(closer.uid);
        closerBatch.update(closerRef, {
          teamId: 'empire',
          updatedAt: new Date()
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

    console.log('\n🎉 Fix completed successfully!');
    console.log(`📈 Summary:`);
    console.log(`   - Duplicates removed: ${duplicatesRemoved}`);
    console.log(`   - Users moved to Empire: ${usersMovedToEmpire}`);
    console.log(`   - Closers moved to Empire: ${closersMovedToEmpire}`);

  } catch (error) {
    console.error('❌ Error fixing teams and users:', error);
    process.exit(1);
  }
}

// Run the fix
fixTeamsAndUsers()
  .then(() => {
    console.log('✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
