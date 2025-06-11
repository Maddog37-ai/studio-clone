#!/usr/bin/env node

// Script to sync all users (closers and managers) to the closers collection
import admin from 'firebase-admin';

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId: 'leadflow-67aca'
  });
}

const db = admin.firestore();

async function syncAllUsersToClosers() {
  console.log('=== SYNCING ALL USERS TO CLOSERS COLLECTION ===\n');

  try {
    // Get all users with role="closer" or role="manager"
    const usersSnapshot = await db.collection('users').get();
    const relevantUsers = [];
    
    usersSnapshot.docs.forEach(doc => {
      const data = doc.data();
      if (data.role === 'closer' || data.role === 'manager') {
        relevantUsers.push({
          uid: doc.id,
          ...data
        });
      }
    });

    console.log(`Found ${relevantUsers.length} users with role "closer" or "manager"`);
    
    if (relevantUsers.length === 0) {
      console.log('No relevant users found');
      return;
    }

    // Get existing closer records
    const closersSnapshot = await db.collection('closers').get();
    const existingCloserIds = new Set();
    let maxLineupOrder = 0;
    
    closersSnapshot.docs.forEach(doc => {
      existingCloserIds.add(doc.id);
      const data = doc.data();
      if (data.lineupOrder && data.lineupOrder > maxLineupOrder) {
        maxLineupOrder = data.lineupOrder;
      }
    });

    console.log(`Found ${existingCloserIds.size} existing closer records`);
    console.log(`Max lineup order: ${maxLineupOrder}`);

    // Find users that need to be added
    const usersToAdd = relevantUsers.filter(user => !existingCloserIds.has(user.uid));
    
    console.log(`\nUsers that need closer records: ${usersToAdd.length}`);
    
    if (usersToAdd.length === 0) {
      console.log('All users already have closer records!');
      return;
    }

    // Add missing users to closers collection
    const batch = db.batch();
    let nextLineupOrder = maxLineupOrder + 1000;
    
    console.log('\nAdding users to closers collection:');
    usersToAdd.forEach(user => {
      console.log(`  - ${user.displayName || user.email} (${user.role})`);
      
      const closerRef = db.collection('closers').doc(user.uid);
      batch.set(closerRef, {
        uid: user.uid,
        name: user.displayName || user.email || 'Unknown User',
        teamId: user.teamId,
        status: 'Off Duty',
        role: user.role,
        avatarUrl: user.avatarUrl || null,
        phone: user.phoneNumber || null,
        lineupOrder: nextLineupOrder,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      
      nextLineupOrder += 1000;
    });

    // Commit the batch
    await batch.commit();
    console.log(`\n✅ Successfully added ${usersToAdd.length} users to closers collection!`);

    // Verify the results
    const newClosersSnapshot = await db.collection('closers').get();
    console.log(`\nTotal closer records after sync: ${newClosersSnapshot.docs.length}`);

    // Show specific people mentioned
    const targetNames = ['Andrea Rovayo', 'Sebastian Vizcarrondo', 'Joshua Long'];
    console.log('\n=== CHECKING FOR SPECIFIC PEOPLE ===');
    
    const allClosers = [];
    newClosersSnapshot.docs.forEach(doc => {
      const data = doc.data();
      allClosers.push({
        uid: doc.id,
        name: data.name,
        role: data.role,
        teamId: data.teamId,
        status: data.status
      });
    });

    targetNames.forEach(targetName => {
      const found = allClosers.find(closer => 
        closer.name.toLowerCase().includes(targetName.toLowerCase()) ||
        targetName.toLowerCase().includes(closer.name.toLowerCase())
      );
      
      if (found) {
        console.log(`✅ ${targetName} -> ${found.name} (${found.role}) - Team: ${found.teamId}`);
      } else {
        console.log(`❌ ${targetName} not found in closers`);
      }
    });

  } catch (error) {
    console.error('Error syncing users to closers:', error);
  }
}

syncAllUsersToClosers().then(() => {
  console.log('\nSync complete!');
  process.exit(0);
}).catch(console.error);
