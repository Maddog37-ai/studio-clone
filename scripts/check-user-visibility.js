// Import Firebase client SDK
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

// Firebase configuration (using the same config as the client app)
const firebaseConfig = {
  apiKey: "AIzaSyBc3jmFE6dRXBApmWD9Jg2PO86suqGgaZw",
  authDomain: "leadflow-4lvrr.firebaseapp.com",
  projectId: "leadflow-4lvrr",
  storageBucket: "leadflow-4lvrr.appspot.com",
  messagingSenderId: "13877630896",
  appId: "1:13877630896:web:ab7d2717024960ec36e875",
  measurementId: "G-KDEF2C21SH",
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

async function checkUserVisibility() {
  try {
    console.log('🔍 Checking visibility for Sebastian, Andrea, and Joshua...\n');
    
    // Names to search for
    const targetNames = [
      'Sebastian Vizcarrondo',
      'Andrea Rovayo', 
      'Joshua Long',
      'Sebastian',
      'Andrea',
      'Joshua'
    ];
    
    // Get all users
    console.log('📋 Fetching all users...');
    const usersSnapshot = await getDocs(collection(db, 'users'));
    const allUsers = [];
    
    usersSnapshot.forEach(doc => {
      const userData = doc.data();
      allUsers.push({
        uid: doc.id,
        ...userData
      });
    });
    
    console.log(`Found ${allUsers.length} total users in database\n`);
    
    // Search for target users
    const foundUsers = allUsers.filter(user => {
      const displayName = user.displayName || '';
      const email = user.email || '';
      
      return targetNames.some(name => 
        displayName.toLowerCase().includes(name.toLowerCase()) ||
        email.toLowerCase().includes(name.toLowerCase())
      );
    });
    
    console.log('🎯 Found matching users:');
    foundUsers.forEach(user => {
      console.log(`  - ${user.displayName || user.email} (${user.uid})`);
      console.log(`    Email: ${user.email}`);
      console.log(`    Role: ${user.role}`);
      console.log(`    Team ID: ${user.teamId}`);
      console.log(`    Status: ${user.status || 'N/A'}`);
      console.log('');
    });
    
    // Get all closers
    console.log('🚪 Fetching all closers...');
    const closersSnapshot = await getDocs(collection(db, 'closers'));
    const allClosers = [];
    
    closersSnapshot.forEach(doc => {
      const closerData = doc.data();
      allClosers.push({
        uid: doc.id,
        ...closerData
      });
    });
    
    console.log(`Found ${allClosers.length} total closers in database\n`);
    
    // Check if target users exist in closers collection
    console.log('🔍 Checking closer records...');
    const foundClosers = allClosers.filter(closer => {
      const name = closer.name || '';
      
      return targetNames.some(targetName => 
        name.toLowerCase().includes(targetName.toLowerCase())
      );
    });
    
    console.log('🎯 Found matching closers:');
    foundClosers.forEach(closer => {
      console.log(`  - ${closer.name} (${closer.uid})`);
      console.log(`    Status: ${closer.status}`);
      console.log(`    Team ID: ${closer.teamId}`);
      console.log(`    Role: ${closer.role || 'N/A'}`);
      console.log(`    Lineup Order: ${closer.lineupOrder || 'N/A'}`);
      console.log('');
    });
    
    // Get all teams
    console.log('🏢 Fetching all teams...');
    const teamsSnapshot = await getDocs(collection(db, 'teams'));
    const allTeams = [];
    
    teamsSnapshot.forEach(doc => {
      const teamData = doc.data();
      allTeams.push({
        id: doc.id,
        ...teamData
      });
    });
    
    console.log('📋 All teams in database:');
    allTeams.forEach(team => {
      console.log(`  - ${team.name} (ID: ${team.id})`);
      console.log(`    Status: ${team.status || 'active'}`);
      console.log('');
    });
    
    // Count users by team
    console.log('👥 Users by team:');
    const usersByTeam = {};
    allUsers.forEach(user => {
      const teamId = user.teamId || 'no-team';
      if (!usersByTeam[teamId]) {
        usersByTeam[teamId] = [];
      }
      usersByTeam[teamId].push(user);
    });
    
    Object.keys(usersByTeam).forEach(teamId => {
      const teamName = allTeams.find(t => t.id === teamId)?.name || teamId;
      console.log(`  ${teamName} (${teamId}): ${usersByTeam[teamId].length} users`);
      usersByTeam[teamId].forEach(user => {
        console.log(`    - ${user.displayName || user.email} (${user.role})`);
      });
      console.log('');
    });
    
    // Count closers by team
    console.log('🚪 Closers by team:');
    const closersByTeam = {};
    allClosers.forEach(closer => {
      const teamId = closer.teamId || 'no-team';
      if (!closersByTeam[teamId]) {
        closersByTeam[teamId] = [];
      }
      closersByTeam[teamId].push(closer);
    });
    
    Object.keys(closersByTeam).forEach(teamId => {
      const teamName = allTeams.find(t => t.id === teamId)?.name || teamId;
      console.log(`  ${teamName} (${teamId}): ${closersByTeam[teamId].length} closers`);
      closersByTeam[teamId].forEach(closer => {
        console.log(`    - ${closer.name} (${closer.status})`);
      });
      console.log('');
    });
    
    // Specifically check Ryan Madden's team
    const ryanUser = allUsers.find(user => 
      user.email?.includes('ryan.madden') || 
      (user.displayName || '').toLowerCase().includes('ryan madden')
    );
    
    if (ryanUser) {
      console.log(`🔑 Ryan Madden's team: ${ryanUser.teamId}`);
      console.log('👀 Users visible to Ryan (same team):');
      const ryanTeamUsers = allUsers.filter(user => user.teamId === ryanUser.teamId);
      ryanTeamUsers.forEach(user => {
        console.log(`  - ${user.displayName || user.email} (${user.role})`);
      });
      console.log('');
      
      console.log('🚪 Closers visible to Ryan (same team):');
      const ryanTeamClosers = allClosers.filter(closer => closer.teamId === ryanUser.teamId);
      ryanTeamClosers.forEach(closer => {
        console.log(`  - ${closer.name} (${closer.status})`);
      });
      console.log('');
    }
    
  } catch (error) {
    console.error('❌ Error checking user visibility:', error);
  }
}

checkUserVisibility();
