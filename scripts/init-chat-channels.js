#!/usr/bin/env node

/**
 * Script to initialize chat channels for existing teams
 * Run with: node scripts/init-chat-channels.js
 */

import admin from 'firebase-admin';

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'leadflow-4lvrr'
  });
}

const db = admin.firestore();

async function initializeChatChannels() {
  try {
    console.log('🚀 Starting chat channel initialization...');
    
    // Get all teams
    const teamsSnapshot = await db.collection('teams').get();
    const teams = teamsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    console.log(`📊 Found ${teams.length} teams to process`);
    
    // Initialize region channel first
    const regionChannelId = 'empire-region';
    const regionChannelRef = db.collection('chatChannels').doc(regionChannelId);
    const regionChannelDoc = await regionChannelRef.get();
    
    if (!regionChannelDoc.exists) {
      await regionChannelRef.set({
        name: 'Empire Region',
        type: 'region',
        teamId: null,
        memberCount: teams.length,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        isActive: true
      });
      console.log('✅ Created Empire Region channel');
    } else {
      // Update member count
      await regionChannelRef.update({
        memberCount: teams.length,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log('✅ Updated Empire Region channel member count');
    }
    
    // Initialize team channels
    let processedCount = 0;
    let createdCount = 0;
    let updatedCount = 0;
    
    for (const team of teams) {
      const teamChannelId = `team-${team.id}`;
      const teamChannelRef = db.collection('chatChannels').doc(teamChannelId);
      const teamChannelDoc = await teamChannelRef.get();
      
      if (!teamChannelDoc.exists) {
        await teamChannelRef.set({
          name: team.name || 'Unnamed Team',
          type: 'team',
          teamId: team.id,
          memberCount: 1, // Default to 1, will be updated by cloud functions
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          isActive: true
        });
        createdCount++;
        console.log(`✅ Created channel for team: ${team.name || team.id}`);
      } else {
        // Update existing channel
        await teamChannelRef.update({
          name: team.name || 'Unnamed Team',
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          isActive: true
        });
        updatedCount++;
        console.log(`🔄 Updated channel for team: ${team.name || team.id}`);
      }
      
      processedCount++;
    }
    
    console.log('\n🎉 Chat channel initialization complete!');
    console.log(`📈 Summary:`);
    console.log(`   - Teams processed: ${processedCount}`);
    console.log(`   - Channels created: ${createdCount}`);
    console.log(`   - Channels updated: ${updatedCount}`);
    console.log(`   - Region channel: ✅ Ready`);
    
  } catch (error) {
    console.error('❌ Error initializing chat channels:', error);
    process.exit(1);
  }
}

// Run the initialization
initializeChatChannels()
  .then(() => {
    console.log('\n✨ Initialization completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
