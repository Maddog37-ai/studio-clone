// Check existing teams in the database
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

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

async function checkTeams() {
  try {
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    const teamsRef = collection(db, "teams");
    
    const querySnapshot = await getDocs(teamsRef);
    
    console.log(`Found ${querySnapshot.size} teams in the database:`);
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`- ${data.name} (${doc.id}): ${data.description}`);
    });
    
    if (querySnapshot.size === 0) {
      console.log("No teams found. Teams will be auto-initialized when a manager visits the team management section.");
    }
    
  } catch (error) {
    console.error("Error checking teams:", error);
  }
}

checkTeams();
