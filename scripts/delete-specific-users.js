#!/usr/bin/env node

// Script to delete specific users: Andrea Rovayo, Sebastian Vizcarrondo, and Joshua Long
import admin from 'firebase-admin';

// Initialize Firebase Admin using service account (you'll need to set this up)
try {
  admin.initializeApp({
    // You would need to add proper credentials here
    // For now, we'll create a web-based approach instead
  });
} catch (error) {
  console.log('Note: This script requires Firebase Admin SDK credentials.');
  console.log('Instead, use the web interface at: http://localhost:9002');
  console.log('Navigate to Team Management and search for these users:');
  console.log('1. Andrea Rovayo');
  console.log('2. Sebastian Vizcarrondo');
  console.log('3. Joshua Long');
  console.log('\nOnce found, use the Delete button next to each user.');
  process.exit(1);
}

const db = admin.firestore();

async function deleteSpecificUsers() {
  console.log('=== DELETING SPECIFIC USERS ===\n');

  // Target users to delete (note the corrected spelling)
  const targetNames = [
    'Andrea Rovayo', 
    'Sebastian Vizcarrondo', // corrected spelling
    'Joshua Long'
  ];

  try {
    // First, let's find these users
    console.log('Searching for target users...\n');
    
    const usersSnapshot = await db.collection('users').get();
    const closersSnapshot = await db.collection('closers').get();
    
    const foundUsers = [];
    
    // Search in users collection
    usersSnapshot.docs.forEach(doc => {
      const data = doc.data();
      const userDisplayName = data.displayName || data.email || '';
      
      targetNames.forEach(targetName => {
        if (userDisplayName.toLowerCase().includes(targetName.toLowerCase()) ||
            targetName.toLowerCase().includes(userDisplayName.toLowerCase())) {
          foundUsers.push({
            collection: 'users',
            uid: doc.id,
            name: userDisplayName,
            email: data.email,
            role: data.role,
            teamId: data.teamId,
            targetName: targetName
          });
        }
      });
    });

    console.log(`Found ${foundUsers.length} users to delete:\n`);
    
    if (foundUsers.length === 0) {
      console.log('❌ No matching users found. They may have already been deleted or have different names.');
      return;
    }

    // Display found users
    foundUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.uid})`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Team: ${user.teamId}`);
      console.log(`   Target: ${user.targetName}`);
      console.log('');
    });

    // Delete users (uncomment when ready)
    /*
    console.log('Proceeding with deletion...\n');
    
    for (const user of foundUsers) {
      console.log(`Deleting ${user.name}...`);
      
      const batch = db.batch();
      
      // Delete from users collection
      const userRef = db.collection('users').doc(user.uid);
      batch.delete(userRef);
      
      // Delete from closers collection if they have a record there
      const closerRef = db.collection('closers').doc(user.uid);
      const closerDoc = await closerRef.get();
      if (closerDoc.exists) {
        console.log(`  - Also deleting closer record for ${user.name}`);
        batch.delete(closerRef);
      }
      
      await batch.commit();
      console.log(`✅ Deleted ${user.name} successfully`);
    }
    
    console.log('\n✅ All specified users have been deleted from the database.');
    console.log('Note: Firebase Authentication accounts are NOT deleted - this requires additional admin privileges.');
    */

  } catch (error) {
    console.error('Error during deletion process:', error);
  }
}

deleteSpecificUsers().then(() => {
  console.log('\nScript completed.');
  process.exit(0);
}).catch(console.error);
