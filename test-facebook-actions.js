const axios = require('axios');

const COMPOSIO_API_KEY = process.env.COMPOSIO_API_KEY || 'ak_C4a5-yJQmd8bjd5wsB9E';

async function listFacebookActions() {
  try {
    console.log('🔍 Searching for Facebook actions...\n');
    
    const response = await axios.get(
      'https://backend.composio.dev/api/v2/actions?appNames=facebook',
      {
        headers: {
          'X-API-Key': COMPOSIO_API_KEY
        }
      }
    );

    const actions = response.data.items || [];
    console.log(`Found ${actions.length} Facebook actions:\n`);
    
    actions.forEach(action => {
      console.log(`- ${action.name}`);
      if (action.description) {
        console.log(`  ${action.description}`);
      }
    });

  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      console.error('❌ API Error:', error.response.status);
      console.error('   Message:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('❌ Error:', error.message);
    }
  }
}

listFacebookActions();
