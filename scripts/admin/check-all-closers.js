#!/usr/bin/env node

// Script to check all closers and users in the database
import admin from 'firebase-admin';

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId: 'leadflow-67aca'
  });
}

const db = admin.firestore();

async function checkAllClosers() {
  console.log('=== CHECKING ALL CLOSERS ===\n');

  try {
    // Get all closers
    const closersSnapshot = await db.collection('closers').get();
    console.log(`Total closers in database: ${closersSnapshot.docs.length}\n`);

    const closers = [];
    closersSnapshot.docs.forEach(doc => {
      const data = doc.data();
      closers.push({
        uid: doc.id,
        name: data.name,
        teamId: data.teamId,
        role: data.role,
        status: data.status,
        lineupOrder: data.lineupOrder
      });
    });

    // Sort by name for easier reading
    closers.sort((a, b) => a.name.localeCompare(b.name));

    console.log('All closers:');
    closers.forEach((closer, index) => {
      console.log(`${index + 1}. ${closer.name} (${closer.uid})`);
      console.log(`   Team: ${closer.teamId}`);
      console.log(`   Role: ${closer.role}`);
      console.log(`   Status: ${closer.status}`);
      console.log(`   Lineup Order: ${closer.lineupOrder}`);
      console.log('');
    });

    // Check for specific people mentioned
    const targetNames = ['Andrea Rovayo', 'Sebastian Vizcarrondo', 'Joshua Long'];
    console.log('=== CHECKING FOR SPECIFIC PEOPLE ===\n');
    
    targetNames.forEach(targetName => {
      const found = closers.find(closer => 
        closer.name.toLowerCase().includes(targetName.toLowerCase()) ||
        targetName.toLowerCase().includes(closer.name.toLowerCase())
      );
      
      if (found) {
        console.log(`✅ FOUND: ${targetName} -> ${found.name} (${found.uid})`);
        console.log(`   Team: ${found.teamId}, Role: ${found.role}, Status: ${found.status}`);
      } else {
        console.log(`❌ NOT FOUND in closers: ${targetName}`);
      }
      console.log('');
    });

    // Now check users collection for these people
    console.log('=== CHECKING USERS COLLECTION ===\n');
    const usersSnapshot = await db.collection('users').get();
    console.log(`Total users in database: ${usersSnapshot.docs.length}\n`);

    const users = [];
    usersSnapshot.docs.forEach(doc => {
      const data = doc.data();
      users.push({
        uid: doc.id,
        displayName: data.displayName,
        email: data.email,
        teamId: data.teamId,
        role: data.role
      });
    });

    targetNames.forEach(targetName => {
      const found = users.find(user => 
        (user.displayName && user.displayName.toLowerCase().includes(targetName.toLowerCase())) ||
        (user.email && user.email.toLowerCase().includes(targetName.toLowerCase())) ||
        (targetName.toLowerCase().includes(user.displayName?.toLowerCase() || ''))
      );
      
      if (found) {
        console.log(`✅ FOUND in users: ${targetName} -> ${found.displayName || found.email} (${found.uid})`);
        console.log(`   Team: ${found.teamId}, Role: ${found.role}`);
        
        // Check if this user has a corresponding closer record
        const hasCloserRecord = closers.find(closer => closer.uid === found.uid);
        if (!hasCloserRecord && (found.role === 'closer' || found.role === 'manager')) {
          console.log(`   ⚠️  WARNING: User is a ${found.role} but has NO closer record!`);
        }
      } else {
        console.log(`❌ NOT FOUND in users: ${targetName}`);
      }
      console.log('');
    });

    // Check for users who should be closers but aren't
    console.log('=== CHECKING FOR MISSING CLOSER RECORDS ===\n');
    const usersByRole = {
      closer: users.filter(u => u.role === 'closer'),
      manager: users.filter(u => u.role === 'manager')
    };

    console.log(`Users with role "closer": ${usersByRole.closer.length}`);
    console.log(`Users with role "manager": ${usersByRole.manager.length}`);
    console.log(`Total closer records: ${closers.length}\n`);

    // Find users who should have closer records but don't
    const missingCloserRecords = [];
    [...usersByRole.closer, ...usersByRole.manager].forEach(user => {
      const hasCloserRecord = closers.find(closer => closer.uid === user.uid);
      if (!hasCloserRecord) {
        missingCloserRecords.push(user);
      }
    });

    if (missingCloserRecords.length > 0) {
      console.log(`❌ MISSING CLOSER RECORDS (${missingCloserRecords.length}):`)
      missingCloserRecords.forEach(user => {
        console.log(`   - ${user.displayName || user.email} (${user.uid})`);
        console.log(`     Role: ${user.role}, Team: ${user.teamId}`);
      });
    } else {
      console.log('✅ All closers and managers have closer records');
    }

  } catch (error) {
    console.error('Error checking closers:', error);
  }
}

checkAllClosers().then(() => {
  console.log('\nDone!');
  process.exit(0);
}).catch(console.error);
