// Simple debug test
console.log("🔍 Starting debug test...");

import dotenv from 'dotenv';
console.log("Loading environment variables...");
dotenv.config();

console.log("Checking environment variables:");
console.log("FIREBASE_PROJECT_ID:", process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? "✓ Set" : "✗ Missing");
console.log("FIREBASE_API_KEY:", process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? "✓ Set" : "✗ Missing");

console.log("Attempting to load Firebase...");
try {
  const { initializeApp } = await import('firebase/app');
  console.log("✓ Firebase app imported successfully");
  
  const { getFirestore } = await import('firebase/firestore');
  console.log("✓ Firestore imported successfully");
  
  // Firebase configuration
  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };
  
  console.log("Initializing Firebase app...");
  const app = initializeApp(firebaseConfig);
  console.log("✓ Firebase app initialized");
  
  const db = getFirestore(app);
  console.log("✓ Firestore database connected");
  
  console.log("🎉 Debug test completed successfully!");
  
} catch (error) {
  console.error("💥 Error during test:", error.message);
  console.error("Stack trace:", error.stack);
}
