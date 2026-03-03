const axios = require('axios');

const COMPOSIO_API_KEY = process.env.COMPOSIO_API_KEY || 'ak_C4a5-yJQmd8bjd5wsB9E';

async function getFacebookPages() {
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

    const connectedAccountId = facebookAccounts[0].id;
    console.log(`✅ Using account: ${connectedAccountId}\n`);

    // Try to get pages
    console.log('📋 Getting Facebook pages...\n');
    const pagesResponse = await axios.post(
      'https://backend.composio.dev/api/v2/actions/FACEBOOK_GET_PAGES/execute',
      {
        connectedAccountId
      },
      {
        headers: {
          'X-API-Key': COMPOSIO_API_KEY
        }
      }
    );

    console.log('Pages response:');
    console.log(JSON.stringify(pagesResponse.data, null, 2));

  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      console.error('❌ API Error:', error.response.status);
      console.error('   Message:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('❌ Error:', error.message);
    }
  }
}

getFacebookPages();
