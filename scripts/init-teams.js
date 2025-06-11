#!/usr/bin/env node

// Initialize teams script
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, getDocs } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBc3jmFE6dRXBApmWD9Jg2PO86suqGgaZw",
  authDomain: "leadflow-4lvrr.firebaseapp.com",
  projectId: "leadflow-4lvrr",
  storageBucket: "leadflow-4lvrr.firebasestorage.app",
  messagingSenderId: "13877630896",
  appId: "1:13877630896:web:ab7d2717024960ec36e875",
  measurementId: "G-KDEF2C21SH",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const DEFAULT_TEAMS = [
  {
    id: "empire",
    name: "Empire",
    description: "Elite sales team for enterprise-level opportunities",
    isActive: true,
    settings: {
      autoAssignment: true,
      maxLeadsPerCloser: 12,
      workingHours: {
        start: "07:00",
        end: "22:00",
        timezone: "America/Los_Angeles"
      }
    }
  }
];

async function initializeTeams() {
  console.log("Initializing teams collection...");
  
  try {
    const teamsRef = collection(db, "teams");
    
    // Check if teams already exist
    const existingTeams = await getDocs(teamsRef);
    
    if (existingTeams.size > 0) {
      console.log(`Found ${existingTeams.size} existing teams. Skipping initialization.`);
      console.log("Existing teams:");
      existingTeams.forEach(doc => {
        const data = doc.data();
        console.log(`- ${data.name} (${doc.id}): ${data.description}`);
      });
      return;
    }
    
    // Create default teams
    const promises = DEFAULT_TEAMS.map(async (teamData) => {
      const teamDoc = doc(teamsRef, teamData.id);
      const teamWithTimestamps = {
        ...teamData,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await setDoc(teamDoc, teamWithTimestamps);
      console.log(`Created team: ${teamData.name} (${teamData.id})`);
    });
    
    await Promise.all(promises);
    console.log("Teams initialization completed successfully!");
    
  } catch (error) {
    console.error("Error initializing teams:", error);
    throw error;
  }
}

// Run the initialization
initializeTeams()
  .then(() => {
    console.log("Script completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Script failed:", error);
    process.exit(1);
  });
