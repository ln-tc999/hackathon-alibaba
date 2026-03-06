/**
 * Check Composio connected accounts
 */

const axios = require('axios');

const COMPOSIO_API_KEY = 'ak_C4a5-yJQmd8bjd5wsB9E';
const COMPOSIO_API_URL = 'https://backend.composio.dev/api';

async function checkAccounts() {
  console.log('🔍 Checking Composio Connected Accounts...\n');

  try {
    const response = await axios.get(`${COMPOSIO_API_URL}/v1/connectedAccounts`, {
      headers: {
        'X-API-Key': COMPOSIO_API_KEY,
      },
    });

    const accounts = response.data.items || [];
    
    console.log(`Found ${accounts.length} connected account(s):\n`);

    for (const account of accounts) {
      console.log(`📱 ${account.appName || 'Unknown'}`);
      console.log(`   ID: ${account.id}`);
      console.log(`   Status: ${account.status || 'unknown'}`);
      console.log(`   Created: ${account.createdAt || 'unknown'}`);
      console.log('');
    }

    // Check specific platforms
    const platforms = ['INSTAGRAM', 'YOUTUBE', 'TWITTER', 'FACEBOOK', 'TIKTOK'];
    
    console.log('\n📊 Platform Status:');
    console.log('─────────────────────────────────────');
    
    for (const platform of platforms) {
      const platformAccounts = accounts.filter(a => 
        a.appName && a.appName.toUpperCase() === platform
      );
      
      if (platformAccounts.length > 0) {
        console.log(`✅ ${platform}: ${platformAccounts.length} account(s) connected`);
        platformAccounts.forEach(acc => {
          console.log(`   └─ ${acc.id}`);
        });
      } else {
        console.log(`❌ ${platform}: Not connected`);
      }
    }
    console.log('─────────────────────────────────────\n');

  } catch (error) {
    console.error('❌ Error checking accounts:');
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error(error.message);
    }
  }
}

checkAccounts();
