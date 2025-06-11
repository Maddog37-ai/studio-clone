/**
 * Check the current state of teams and users
 */

import admin from 'firebase-admin';

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'leadflow-app', // Replace with your actual project ID
  });
}

const db = admin.firestore();

async function checkTeamsAndUsersState() {
  try {
    console.log('🔍 Checking current teams and users state...\n');

    // Get all teams
    const teamsSnapshot = await db.collection('teams').get();
    const teams = teamsSnapshot.docs.map(doc => ({
      id: doc.id,
      name: doc.data().name,
      description: doc.data().description,
      isActive: doc.data().isActive
    }));

    console.log('📋 TEAMS:');
    teams.forEach(team => {
      console.log(`   ${team.name} (${team.id}) - Active: ${team.isActive}`);
      if (team.description) {
        console.log(`      Description: ${team.description}`);
      }
    });

    // Check for duplicates
    const teamNames = teams.map(t => t.name.toLowerCase());
    const duplicates = teamNames.filter((name, index) => teamNames.indexOf(name) !== index);
    if (duplicates.length > 0) {
      console.log(`\n⚠️  DUPLICATE TEAM NAMES FOUND: ${[...new Set(duplicates)].join(', ')}`);
    } else {
      console.log(`\n✅ No duplicate team names found`);
    }

    // Get all users
    const usersSnapshot = await db.collection('users').get();
    const users = usersSnapshot.docs.map(doc => ({
      uid: doc.id,
      email: doc.data().email,
      displayName: doc.data().displayName,
      teamId: doc.data().teamId,
      role: doc.data().role
    }));

    console.log(`\n👥 USERS (${users.length} total):`);
    
    // Group users by team
    const usersByTeam = {};
    users.forEach(user => {
      const teamId = user.teamId || 'no-team';
      if (!usersByTeam[teamId]) {
        usersByTeam[teamId] = [];
      }
      usersByTeam[teamId].push(user);
    });

    for (const [teamId, teamUsers] of Object.entries(usersByTeam)) {
      const teamName = teams.find(t => t.id === teamId)?.name || teamId;
      console.log(`\n   Team: ${teamName} (${teamUsers.length} users)`);
      teamUsers.forEach(user => {
        console.log(`      ${user.displayName || user.email} (${user.role})`);
      });
    }

    // Get all closers
    const closersSnapshot = await db.collection('closers').get();
    const closers = closersSnapshot.docs.map(doc => ({
      uid: doc.id,
      name: doc.data().name,
      teamId: doc.data().teamId,
      status: doc.data().status
    }));

    console.log(`\n🎯 CLOSERS (${closers.length} total):`);
    
    // Group closers by team
    const closersByTeam = {};
    closers.forEach(closer => {
      const teamId = closer.teamId || 'no-team';
      if (!closersByTeam[teamId]) {
        closersByTeam[teamId] = [];
      }
      closersByTeam[teamId].push(closer);
    });

    for (const [teamId, teamClosers] of Object.entries(closersByTeam)) {
      const teamName = teams.find(t => t.id === teamId)?.name || teamId;
      console.log(`\n   Team: ${teamName} (${teamClosers.length} closers)`);
      teamClosers.forEach(closer => {
        console.log(`      ${closer.name} - ${closer.status}`);
      });
    }

    console.log('\n✅ State check completed');

  } catch (error) {
    console.error('❌ Error checking state:', error);
    process.exit(1);
  }
}

// Run the check
checkTeamsAndUsersState()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Check failed:', error);
    process.exit(1);
  });
