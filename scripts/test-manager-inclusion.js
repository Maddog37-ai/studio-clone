/**
 * Test script to verify manager inclusion in closer rotation
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs, orderBy } from 'firebase/firestore';

// Firebase configuration
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

async function testManagerInclusion() {
  console.log("🔍 Testing Manager Inclusion in Closer Rotation\n");
  
  try {
    // Get all users with manager role
    console.log("📋 Checking managers in users collection:");
    const usersRef = collection(db, "users");
    const managersQuery = query(usersRef, where("role", "==", "manager"));
    const managersSnapshot = await getDocs(managersQuery);
    
    const managers = managersSnapshot.docs.map(doc => ({
      uid: doc.id,
      ...doc.data()
    }));
    
    console.log(`Found ${managers.length} manager(s):`);
    managers.forEach(manager => {
      console.log(`  - ${manager.displayName || manager.email} (${manager.uid})`);
    });
    
    // Get all closers (should include managers)
    console.log("\n🎯 Checking closers collection:");
    const closersRef = collection(db, "closers");
    const closersSnapshot = await getDocs(closersRef);
    
    const closers = closersSnapshot.docs.map(doc => ({
      uid: doc.id,
      ...doc.data()
    }));
    
    console.log(`Found ${closers.length} closer record(s):`);
    closers.forEach(closer => {
      const roleIcon = closer.role === "manager" ? "👑" : "🎯";
      console.log(`  ${roleIcon} ${closer.name} (${closer.role || "closer"}) - ${closer.status}`);
    });
    
    // Check which managers have closer records
    console.log("\n✅ Manager inclusion status:");
    const closerIds = new Set(closers.map(c => c.uid));
    managers.forEach(manager => {
      const hasCloserRecord = closerIds.has(manager.uid);
      const status = hasCloserRecord ? "✓ Included" : "✗ Missing";
      console.log(`  ${status}: ${manager.displayName || manager.email}`);
    });
    
    // Test the rotation algorithm simulation
    console.log("\n🔄 Simulating lead assignment (On Duty closers only):");
    const onDutyClosers = closers.filter(c => c.status === "On Duty");
    
    if (onDutyClosers.length === 0) {
      console.log("  No closers are currently on duty");
    } else {
      // Sort by lineup order (same logic as backend)
      onDutyClosers.sort((a, b) => {
        const orderA = a.lineupOrder || 999;
        const orderB = b.lineupOrder || 999;
        return orderA - orderB;
      });
      
      console.log(`  Found ${onDutyClosers.length} on-duty closer(s) in rotation order:`);
      onDutyClosers.forEach((closer, index) => {
        const roleIcon = closer.role === "manager" ? "👑" : "🎯";
        console.log(`    ${index + 1}. ${roleIcon} ${closer.name} (${closer.role || "closer"})`);
      });
      
      const nextCloser = onDutyClosers[0];
      const roleIcon = nextCloser.role === "manager" ? "👑" : "🎯";
      console.log(`\n  🎪 Next lead would be assigned to: ${roleIcon} ${nextCloser.name} (${nextCloser.role || "closer"})`);
    }
    
  } catch (error) {
    console.error("💥 Test failed:", error.message);
  }
}

// Load environment variables
import 'dotenv/config';

// Run the test
testManagerInclusion().then(() => {
  console.log("\n🎉 Manager inclusion test completed!");
  process.exit(0);
}).catch((error) => {
  console.error("💥 Test execution failed:", error);
  process.exit(1);
});
