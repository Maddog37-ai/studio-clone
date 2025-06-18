/**
 * Browser Console Script to Initialize Empire Region and Teams
 * Copy and paste this entire script into your browser console while on the admin tools page
 */

async function initializeEmpireRegionInConsole() {
  console.log('🏢 Initializing Empire Region and Teams via Browser...');
  
  try {
    // Check if Firebase is available
    if (typeof window.db === 'undefined') {
      console.log('❌ Firebase db not found in window. Trying alternative...');
      
      // Try to access via common paths
      const possiblePaths = [
        'firebase.firestore()',
        'app.firestore()', 
        'window.firebase.firestore()'
      ];
      
      console.log('🔍 Available Firebase paths:', Object.keys(window).filter(k => k.includes('firebase')));
      return;
    }
    
    const db = window.db;
    
    // 1. Create Empire Region
    console.log('📍 Creating Empire Region...');
    const empireRegionRef = db.collection('regions').doc('empire-region');
    
    await empireRegionRef.set({
      name: 'Empire',
      description: 'Empire Region - Main operational region',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }, { merge: true });
    
    console.log('✅ Empire Region created/updated');
    
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
    
    console.log('👥 Creating Empire Teams...');
    
    for (const team of teams) {
      const teamRef = db.collection('teams').doc(team.id);
      
      await teamRef.set({
        name: team.name,
        description: team.description,
        regionId: 'empire-region',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        settings: {
          autoAssignment: true,
          maxLeadsPerCloser: 5,
          workingHours: {
            start: '08:00',
            end: '18:00',
            timezone: 'America/New_York'
          }
        }
      }, { merge: true });
      
      console.log(`✅ ${team.name} team created/updated`);
    }
    
    console.log('🎉 Empire Region initialization complete!');
    console.log('🔄 Refresh the admin tools page to see the changes');
    
    return {
      success: true,
      region: 'empire-region',
      teams: teams.map(t => t.id)
    };
    
  } catch (error) {
    console.error('❌ Error initializing Empire Region:', error);
    return { success: false, error: error.message };
  }
}

// Alternative method using Firestore SDK if available
async function initializeEmpireWithSDK() {
  console.log('🔥 Trying with Firebase SDK...');
  
  try {
    // Try to get firestore instance
    let firestore;
    
    if (window.firebase && window.firebase.firestore) {
      firestore = window.firebase.firestore();
    } else if (window.getFirestore) {
      firestore = window.getFirestore();
    } else {
      console.log('❌ No Firestore SDK found');
      return false;
    }
    
    // Create region
    await firestore.collection('regions').doc('empire-region').set({
      name: 'Empire',
      description: 'Empire Region - Main operational region',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }, { merge: true });
    
    // Create teams
    const teams = ['empire-team', 'takeover-pros', 'revolution'];
    const teamNames = ['Empire', 'TakeoverPros', 'Revolution'];
    
    for (let i = 0; i < teams.length; i++) {
      await firestore.collection('teams').doc(teams[i]).set({
        name: teamNames[i],
        description: `${teamNames[i]} team`,
        regionId: 'empire-region',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        settings: {
          autoAssignment: true,
          maxLeadsPerCloser: 5,
          workingHours: {
            start: '08:00',
            end: '18:00',
            timezone: 'America/New_York'
          }
        }
      }, { merge: true });
      
      console.log(`✅ ${teamNames[i]} team created`);
    }
    
    console.log('🎉 Empire Region created successfully!');
    return true;
    
  } catch (error) {
    console.error('❌ SDK initialization failed:', error);
    return false;
  }
}

// Auto-detect and run appropriate method
async function autoInitializeEmpire() {
  console.log('🚀 Auto-detecting Firebase setup...');
  
  // Try SDK method first
  const sdkResult = await initializeEmpireWithSDK();
  
  if (!sdkResult) {
    // Try console method
    return await initializeEmpireRegionInConsole();
  }
  
  return { success: true, method: 'SDK' };
}

// Make functions available globally
window.initializeEmpireRegion = initializeEmpireRegionInConsole;
window.initializeEmpireWithSDK = initializeEmpireWithSDK;
window.autoInitializeEmpire = autoInitializeEmpire;

console.log(`
🏢 EMPIRE REGION INITIALIZER LOADED

Available commands:
1. autoInitializeEmpire() - Auto-detect and initialize
2. initializeEmpireRegion() - Manual console method  
3. initializeEmpireWithSDK() - SDK method

Will create:
📍 Empire Region (empire-region)
👥 Empire Team (empire-team)
👥 TakeoverPros Team (takeover-pros)  
👥 Revolution Team (revolution)

Run: autoInitializeEmpire()
`);

// Auto-run if user wants
// autoInitializeEmpire();
