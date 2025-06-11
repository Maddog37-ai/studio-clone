// Initialize teams script
import { initializeTeams } from '../src/utils/init-teams.js';

async function runInitialization() {
  try {
    console.log('Starting team initialization...');
    await initializeTeams();
    console.log('Team initialization completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Team initialization failed:', error);
    process.exit(1);
  }
}

runInitialization();
