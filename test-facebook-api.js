const axios = require('axios');

const COMPOSIO_API_KEY = process.env.COMPOSIO_API_KEY || 'ak_C4a5-yJQmd8bjd5wsB9E';

async function testFacebookAPI() {
  try {
    console.log('🔍 Getting connected Facebook accounts...\n');
    
    const accountsResponse = await axios.get(
      'https://backend.composio.dev/api/v1/connectedAccounts',
      {
        headers: {
          'X-API-Key': COMPOSIO_API_KEY
        }
      }
    );

    const facebookAccounts = accountsResponse.data.items.filter(
      acc => acc.appName === 'facebook'
    );

    if (facebookAccounts.length === 0) {
      console.log('❌ No Facebook accounts connected');
      return;
    }

    console.log(`✅ Found ${facebookAccounts.length} Facebook account(s)`);
    const connectedAccountId = facebookAccounts[0].id;
    console.log(`   Using account: ${connectedAccountId}\n`);

    // Get action details
    console.log('📋 Getting FACEBOOK_CREATE_PHOTO_POST action details...\n');
    const actionResponse = await axios.get(
      'https://backend.composio.dev/api/v2/actions/FACEBOOK_CREATE_PHOTO_POST',
      {
        headers: {
          'X-API-Key': COMPOSIO_API_KEY
        }
      }
    );

    console.log('Required parameters:');
    console.log(JSON.stringify(actionResponse.data.parameters, null, 2));

  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      console.error('❌ API Error:', error.response.status);
      console.error('   Message:', error.response.data);
    } else {
      console.error('❌ Error:', error.message);
    }
  }
}

testFacebookAPI();
