#!/bin/bash

# Empire Region Setup Script
echo "🏢 Empire Region and Teams Setup"
echo "================================"

echo ""
echo "📋 This script will:"
echo "1. ✅ Remove team filters that excluded Empire teams"
echo "2. ✅ Provide initialization script for Empire region"
echo "3. ✅ Ensure admin tools display Empire region properly"

echo ""
echo "🚀 INITIALIZATION STEPS:"
echo ""
echo "1. Open your browser and navigate to: http://localhost:9002/dashboard/admin-tools"
echo ""
echo "2. Open browser console (F12 or Cmd+Option+I)"
echo ""
echo "3. Copy and paste this initialization script:"
echo ""
echo "=== COPY FROM HERE ==="
cat << 'EOF'
// Empire Region Initializer
async function initializeEmpireRegion() {
  console.log('🏢 Initializing Empire Region and Teams...');
  
  try {
    // Get Firebase instance (try multiple paths)
    let db;
    if (window.firebase && window.firebase.firestore) {
      db = window.firebase.firestore();
    } else if (window.db) {
      db = window.db;
    } else {
      console.log('❌ Firebase not accessible. Try running this on the admin tools page.');
      return;
    }
    
    // 1. Create Empire Region
    console.log('📍 Creating Empire Region...');
    await db.collection('regions').doc('empire-region').set({
      name: 'Empire',
      description: 'Empire Region - Main operational region',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }, { merge: true });
    
    console.log('✅ Empire Region created');
    
    // 2. Create Empire Teams
    const teams = [
      { id: 'empire-team', name: 'Empire', desc: 'Main Empire team' },
      { id: 'takeover-pros', name: 'TakeoverPros', desc: 'TakeoverPros specialist team' },
      { id: 'revolution', name: 'Revolution', desc: 'Revolution tactical team' }
    ];
    
    console.log('👥 Creating Empire Teams...');
    
    for (const team of teams) {
      await db.collection('teams').doc(team.id).set({
        name: team.name,
        description: team.desc,
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
      
      console.log(`✅ ${team.name} team created`);
    }
    
    console.log('🎉 Empire Region setup complete!');
    console.log('🔄 Refresh the page to see changes in admin tools');
    
    return { success: true, message: 'Empire Region initialized' };
    
  } catch (error) {
    console.error('❌ Error:', error);
    return { success: false, error: error.message };
  }
}

// Check current regions and teams
async function checkEmpireStatus() {
  console.log('🔍 Checking current Empire status...');
  
  try {
    let db;
    if (window.firebase && window.firebase.firestore) {
      db = window.firebase.firestore();
    } else if (window.db) {
      db = window.db;
    } else {
      console.log('❌ Firebase not accessible');
      return;
    }
    
    // Check regions
    const regionsSnap = await db.collection('regions').get();
    console.log('📍 Current regions:');
    regionsSnap.forEach(doc => {
      const data = doc.data();
      console.log(`  - ${data.name} (${doc.id}) - ${data.isActive ? 'Active' : 'Inactive'}`);
    });
    
    // Check teams
    const teamsSnap = await db.collection('teams').get();
    console.log('\n👥 Current teams:');
    teamsSnap.forEach(doc => {
      const data = doc.data();
      console.log(`  - ${data.name} (${doc.id}) - Region: ${data.regionId || 'None'} - ${data.isActive ? 'Active' : 'Inactive'}`);
    });
    
  } catch (error) {
    console.error('❌ Error checking status:', error);
  }
}

// Run initialization
console.log('🚀 Empire Region tools loaded!');
console.log('Commands available:');
console.log('- initializeEmpireRegion() - Create Empire region and teams');
console.log('- checkEmpireStatus() - Check current regions and teams');
console.log('');
console.log('Run: checkEmpireStatus() first to see current state');

// Make functions global
window.initializeEmpireRegion = initializeEmpireRegion;
window.checkEmpireStatus = checkEmpireStatus;
EOF
echo "=== COPY TO HERE ==="
echo ""
echo "4. Run: checkEmpireStatus() to see current state"
echo "5. Run: initializeEmpireRegion() to create Empire region and teams"
echo "6. Refresh the admin tools page"
echo ""
echo "✨ Expected Result:"
echo "📍 Empire Region with 3 teams:"
echo "   - Empire (Main team)"
echo "   - TakeoverPros (Specialist team)"
echo "   - Revolution (Tactical team)"
echo ""
echo "🎯 The admin tools should now show Empire region in the region selector"
echo "    with all three teams available for management."
