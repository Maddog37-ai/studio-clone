/**
 * Script to sync managers to closers collection
 * Run this to ensure all managers are included in the closer rotation system
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs, doc, setDoc, writeBatch, serverTimestamp } from 'firebase/firestore';

// Firebase configuration - replace with your config
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function getManagersToAddCount() {
  try {
    // Get all users with role="manager"
    const usersRef = collection(db, "users");
    const managersQuery = query(usersRef, where("role", "==", "manager"));
    const managersSnapshot = await getDocs(managersQuery);
    
    const managers = managersSnapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() }));

    // Get all existing closer records
    const closersRef = collection(db, "closers");
    const closersSnapshot = await getDocs(closersRef);
    const existingCloserIds = new Set(closersSnapshot.docs.map(doc => doc.id));

    // Filter managers that don't have closer records
    const managersToAdd = managers.filter(manager => !existingCloserIds.has(manager.uid));

    return {
      count: managersToAdd.length,
      managers: managersToAdd
    };
  } catch (error) {
    console.error(`Failed to check managers to add: ${error.message}`);
    return { count: 0, managers: [] };
  }
}

async function syncManagersToClosers() {
  console.log("Starting sync of managers to closers collection...");
  
  const result = {
    managersFound: 0,
    managersAlreadyInClosers: 0,
    managersAdded: 0,
    errors: []
  };

  try {
    // Get all users with role="manager"
    const usersRef = collection(db, "users");
    const managersQuery = query(usersRef, where("role", "==", "manager"));
    const managersSnapshot = await getDocs(managersQuery);
    
    result.managersFound = managersSnapshot.docs.length;
    console.log(`Found ${result.managersFound} manager(s)`);

    if (result.managersFound === 0) {
      console.log("No managers found to sync");
      return result;
    }

    // Get all existing closer records
    const closersRef = collection(db, "closers");
    const closersSnapshot = await getDocs(closersRef);
    const existingCloserIds = new Set(closersSnapshot.docs.map(doc => doc.id));

    // Prepare batch operations
    const batch = writeBatch(db);
    let batchCount = 0;
    const maxBatchSize = 500; // Firestore batch limit

    for (const managerDoc of managersSnapshot.docs) {
      const manager = { uid: managerDoc.id, ...managerDoc.data() };
      
      if (existingCloserIds.has(manager.uid)) {
        result.managersAlreadyInClosers++;
        console.log(`Manager ${manager.displayName || manager.email} already exists in closers collection`);
        continue;
      }

      // Create closer record for manager
      const closerDocRef = doc(db, "closers", manager.uid);
      batch.set(closerDocRef, {
        uid: manager.uid,
        name: manager.displayName || manager.email || "Unknown Manager",
        teamId: manager.teamId,
        status: "Off Duty", // Default status for newly added managers
        role: "manager", // Keep role as manager
        avatarUrl: manager.avatarUrl || null,
        phone: null, // Can be updated later if needed
        lineupOrder: new Date().getTime() + Math.random(), // Unique lineup order
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      result.managersAdded++;
      batchCount++;
      
      console.log(`Prepared to add manager ${manager.displayName || manager.email} to closers collection`);

      // Execute batch if we reach the limit
      if (batchCount >= maxBatchSize) {
        await batch.commit();
        console.log(`Committed batch of ${batchCount} operations`);
        batchCount = 0;
      }
    }

    // Execute remaining operations in batch
    if (batchCount > 0) {
      await batch.commit();
      console.log(`Committed final batch of ${batchCount} operations`);
    }

    console.log(`Sync completed successfully:
      - Managers found: ${result.managersFound}
      - Managers already in closers: ${result.managersAlreadyInClosers}
      - Managers added: ${result.managersAdded}`);

  } catch (error) {
    const errorMessage = `Failed to sync managers to closers: ${error.message}`;
    console.error(errorMessage);
    result.errors.push(errorMessage);
  }

  return result;
}

async function main() {
  console.log("🔄 Starting manager sync process...");
  
  try {
    // First, check how many managers can be added
    console.log("📊 Checking current state...");
    const { count, managers } = await getManagersToAddCount();
    
    if (count === 0) {
      console.log("✅ All managers are already in the closers collection!");
      return;
    }
    
    console.log(`📋 Found ${count} manager(s) that need to be added to the closer rotation:`);
    managers.forEach(manager => {
      console.log(`  - ${manager.displayName || manager.email} (${manager.uid})`);
    });
    
    // Sync managers to closers
    console.log("\n🚀 Syncing managers to closers collection...");
    const result = await syncManagersToClosers();
    
    console.log("\n📈 Sync Results:");
    console.log(`  - Managers found: ${result.managersFound}`);
    console.log(`  - Managers already in closers: ${result.managersAlreadyInClosers}`);
    console.log(`  - Managers added: ${result.managersAdded}`);
    
    if (result.errors.length > 0) {
      console.log("❌ Errors encountered:");
      result.errors.forEach(error => console.log(`  - ${error}`));
    } else {
      console.log("✅ Sync completed successfully!");
    }
    
  } catch (error) {
    console.error("💥 Script failed:", error.message);
    process.exit(1);
  }
}

// Load environment variables
import 'dotenv/config';

// Run the script
main().then(() => {
  console.log("🎉 Manager sync script completed!");
  process.exit(0);
}).catch((error) => {
  console.error("💥 Script execution failed:", error);
  process.exit(1);
});
