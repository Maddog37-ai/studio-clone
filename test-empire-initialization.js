/**
 * Test Script for Empire Region Initialization
 * Run this in the browser console on the admin tools page
 */

async function testEmpireInitialization() {
  console.log('🧪 Testing Empire Region Initialization...');
  
  try {
    // Check if Firebase is available
    if (!window.firebase || !window.firebase.firestore) {
      console.log('❌ Firebase not available in browser');
      return false;
    }
    
    const db = window.firebase.firestore();
    
    // Check if Empire region exists
    console.log('🔍 Checking for Empire Region...');
    const empireRegionDoc = await db.collection('regions').doc('empire-region').get();
    
    if (empireRegionDoc.exists) {
      console.log('✅ Empire Region found:', empireRegionDoc.data());
    } else {
      console.log('❌ Empire Region not found');
      return false;
    }
    
    // Check for Empire teams
    console.log('🔍 Checking for Empire Teams...');
    const teamsSnapshot = await db.collection('teams')
      .where('regionId', '==', 'empire-region')
      .get();
    
    const empireTeams = [];
    teamsSnapshot.forEach(doc => {
      empireTeams.push({ id: doc.id, ...doc.data() });
    });
    
    console.log(`✅ Found ${empireTeams.length} Empire teams:`, empireTeams);
    
    // Check for specific teams
    const expectedTeams = ['empire-team', 'takeover-pros', 'revolution'];
    const foundTeamIds = empireTeams.map(team => team.id);
    
    for (const expectedTeam of expectedTeams) {
      if (foundTeamIds.includes(expectedTeam)) {
        console.log(`✅ ${expectedTeam} team found`);
      } else {
        console.log(`❌ ${expectedTeam} team not found`);
      }
    }
    
    console.log('🎉 Empire initialization test complete!');
    return true;
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    return false;
  }
}

// Test verification system
async function testVerificationSystem() {
  console.log('🧪 Testing Lead Verification System...');
  
  try {
    if (!window.firebase || !window.firebase.firestore) {
      console.log('❌ Firebase not available in browser');
      return false;
    }
    
    const db = window.firebase.firestore();
    
    // Check for leads with verification field
    const leadsSnapshot = await db.collection('leads')
      .limit(5)
      .get();
    
    const leadsWithVerification = [];
    leadsSnapshot.forEach(doc => {
      const leadData = doc.data();
      if ('isVerified' in leadData) {
        leadsWithVerification.push({ id: doc.id, isVerified: leadData.isVerified });
      }
    });
    
    console.log(`✅ Found ${leadsWithVerification.length} leads with verification field:`, leadsWithVerification);
    
    return true;
    
  } catch (error) {
    console.error('❌ Verification test failed:', error);
    return false;
  }
}

// Auto-run tests
window.testEmpireInitialization = testEmpireInitialization;
window.testVerificationSystem = testVerificationSystem;

console.log(`
🧪 EMPIRE TESTING SUITE LOADED

Available commands:
1. testEmpireInitialization() - Test Empire region and teams
2. testVerificationSystem() - Test lead verification fields

Run: testEmpireInitialization()
`);
