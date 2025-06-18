/**
 * Initialize Empire Region and Teams
 * This script ensures the Empire region exists with its three teams
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

// Firebase config (replace with your actual config)
const firebaseConfig = {
  // Your Firebase config here
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function initializeEmpireRegion() {
  console.log('🏢 Initializing Empire Region and Teams...');
  
  try {
    // 1. Create Empire Region
    const empireRegionRef = doc(db, 'regions', 'empire-region');
    const empireRegionSnap = await getDoc(empireRegionRef);
    
    if (!empireRegionSnap.exists()) {
      await setDoc(empireRegionRef, {
        name: 'Empire',
        description: 'Empire Region - Main operational region',
        isActive: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      console.log('✅ Created Empire Region');
    } else {
      console.log('✅ Empire Region already exists');
    }
    
    // 2. Create Empire Teams
    const teams = [
      {
        id: 'empire-team',
        name: 'Empire',
        description: 'Main Empire team'
      },
      {
        id: 'takeover-pros',
        name: 'TakeoverPros', 
        description: 'TakeoverPros specialist team'
      },
      {
        id: 'revolution',
        name: 'Revolution',
        description: 'Revolution tactical team'
      }
    ];
    
    for (const team of teams) {
      const teamRef = doc(db, 'teams', team.id);
      const teamSnap = await getDoc(teamRef);
      
      if (!teamSnap.exists()) {
        await setDoc(teamRef, {
          name: team.name,
          description: team.description,
          regionId: 'empire-region',
          isActive: true,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          settings: {
            autoAssignment: true,
            maxLeadsPerCloser: 5,
            workingHours: {
              start: '08:00',
              end: '18:00',
              timezone: 'America/New_York'
            }
          }
        });
        console.log(`✅ Created ${team.name} team`);
      } else {
        // Update existing team to ensure it's in Empire region
        await setDoc(teamRef, {
          regionId: 'empire-region',
          isActive: true,
          updatedAt: serverTimestamp()
        }, { merge: true });
        console.log(`✅ Updated ${team.name} team to Empire region`);
      }
    }
    
    console.log('🎉 Empire Region initialization complete!');
    
  } catch (error) {
    console.error('❌ Error initializing Empire Region:', error);
  }
}

// For browser console execution
if (typeof window !== 'undefined') {
  window.initializeEmpireRegion = initializeEmpireRegion;
}

export default initializeEmpireRegion;
