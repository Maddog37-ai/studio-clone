import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, getDocs } from 'firebase/firestore';

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBc3jmFE6dRXBApmWD9Jg2PO86suqGgaZw",
  authDomain: "leadflow-4lvrr.firebaseapp.com",
  projectId: "leadflow-4lvrr",
  storageBucket: "leadflow-4lvrr.appspot.com",
  messagingSenderId: "13877630896",
  appId: "1:13877630896:web:ab7d2717024960ec36e875",
  measurementId: "G-KDEF2C21SH",
};

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
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    const teamsRef = collection(db, "teams");
    
    // Check which teams already exist
    const existingTeams = await getDocs(teamsRef);
    const existingTeamIds = new Set(existingTeams.docs.map(doc => doc.id));
    
    console.log(`Found ${existingTeams.size} existing teams: ${Array.from(existingTeamIds).join(', ')}`);
    
    // Create missing teams
    const promises = DEFAULT_TEAMS
      .filter(teamData => !existingTeamIds.has(teamData.id))
      .map(async (teamData) => {
        const teamDoc = doc(teamsRef, teamData.id);
        const teamWithTimestamps = {
          ...teamData,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        await setDoc(teamDoc, teamWithTimestamps);
        console.log(`Created team: ${teamData.name} (${teamData.id})`);
      });
    
    if (promises.length === 0) {
      console.log("All default teams already exist. No action needed.");
    } else {
      await Promise.all(promises);
      console.log(`Created ${promises.length} new teams. Teams initialization completed successfully!`);
    }
    
  } catch (error) {
    console.error("Error initializing teams:", error);
    throw error;
  }
}

// Run the initialization
initializeTeams()
  .then(() => {
    console.log('Team initialization completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Team initialization failed:', error);
    process.exit(1);
  });
