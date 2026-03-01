import axios from 'axios';

const COMPOSIO_API_KEY = process.env.COMPOSIO_API_KEY || 'ak_C4a5-yJQmd8bjd5wsB9E';
const COMPOSIO_API_URL = process.env.COMPOSIO_API_URL || 'https://backend.composio.dev/api';

async function checkConnectionStatus() {
  console.log('🔍 Checking Composio Connection Status...\n');
  console.log(`API URL: ${COMPOSIO_API_URL}`);
  console.log(`API Key: ${COMPOSIO_API_KEY.substring(0, 10)}...\n`);

  try {
    // Check connected accounts
    console.log('📋 Fetching connected accounts...');
    const response = await axios.get(
      `${COMPOSIO_API_URL}/v1/connectedAccounts`,
      {
        headers: {
          'X-API-Key': COMPOSIO_API_KEY,
        },
      }
    );

    const accounts = response.data.items || [];
    
    if (accounts.length === 0) {
      console.log('\n❌ No connected accounts found!');
      console.log('\n📝 To connect accounts:');
      console.log('   1. Visit: https://app.composio.dev/apps');
      console.log('   2. Connect Instagram, Facebook, and YouTube');
      console.log('   3. Run this script again to verify\n');
      return;
    }

    console.log(`\n✅ Found ${accounts.length} connected account(s):\n`);

    const platforms = ['instagram', 'facebook', 'youtube'];
    const connectedPlatforms: Record<string, any> = {};

    for (const account of accounts) {
      const appName = account.appName?.toLowerCase() || '';
      const status = account.status || 'unknown';
      const entityId = account.id || 'unknown';
      
      console.log(`📱 ${account.appName || 'Unknown'}`);
      console.log(`   Status: ${status === 'ACTIVE' ? '✅ Active' : '❌ ' + status}`);
      console.log(`   Entity ID: ${entityId}`);
      console.log(`   Integration ID: ${account.integrationId || 'N/A'}`);
      console.log(`   Connected Account ID: ${account.connectedAccountId || 'N/A'}`);
      console.log(`   Member ID: ${account.memberId || 'N/A'}`);
      console.log(`   Full data:`, JSON.stringify(account, null, 2));
      console.log();

      if (platforms.some(p => appName.includes(p))) {
        connectedPlatforms[appName] = {
          status,
          entityId,
          integrationId: account.integrationId,
        };
      }
    }

    // Check which platforms are missing
    console.log('📊 Platform Status:');
    for (const platform of platforms) {
      const found = Object.keys(connectedPlatforms).some(key => key.includes(platform));
      if (found) {
        console.log(`   ✅ ${platform.charAt(0).toUpperCase() + platform.slice(1)}: Connected`);
      } else {
        console.log(`   ❌ ${platform.charAt(0).toUpperCase() + platform.slice(1)}: Not connected`);
      }
    }

    console.log('\n💡 To use in tests:');
    console.log('   export INSTAGRAM_ENTITY_ID=default');
    console.log('   export FACEBOOK_ENTITY_ID=default');
    console.log('   export YOUTUBE_ENTITY_ID=default');
    console.log('\n   Or use specific entity IDs from above\n');

  } catch (error: any) {
    console.error('\n❌ Error checking connection status:');
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Message: ${error.response.data?.message || error.message}`);
      
      if (error.response.status === 401) {
        console.error('\n   → Invalid API key. Check your COMPOSIO_API_KEY');
      } else if (error.response.status === 404) {
        console.error('\n   → API endpoint not found. Check COMPOSIO_API_URL');
      }
    } else {
      console.error(`   ${error.message}`);
    }
    console.log();
  }
}

checkConnectionStatus();
