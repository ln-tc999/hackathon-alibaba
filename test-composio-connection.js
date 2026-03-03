/**
 * Test Composio API Connection
 * Verifies Composio API is reachable and API key is valid
 */

const COMPOSIO_API_KEY = 'ak_C4a5-yJQmd8bjd5wsB9E';
const COMPOSIO_API_URL = 'https://backend.composio.dev/api';

async function testComposioConnection() {
  console.log('🧪 Testing Composio API Connection...\n');
  
  // Test 1: Check API endpoint
  console.log('📡 Test 1: Checking API endpoint...');
  try {
    const response = await fetch(`${COMPOSIO_API_URL}/v1/apps`, {
      headers: {
        'X-API-Key': COMPOSIO_API_KEY,
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API endpoint reachable');
      console.log(`   Found ${data.items?.length || 0} apps\n`);
    } else {
      console.error('❌ API endpoint returned error:', response.status);
      const error = await response.text();
      console.error('   Error:', error, '\n');
      return false;
    }
  } catch (error) {
    console.error('❌ Cannot reach Composio API');
    console.error('   Error:', error.message);
    console.error('   This might be a network issue\n');
    return false;
  }
  
  // Test 2: Check connected accounts
  console.log('🔗 Test 2: Checking connected accounts...');
  try {
    const response = await fetch(`${COMPOSIO_API_URL}/v1/connectedAccounts`, {
      headers: {
        'X-API-Key': COMPOSIO_API_KEY,
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Connected accounts API working');
      console.log(`   Found ${data.items?.length || 0} connected accounts`);
      
      if (data.items && data.items.length > 0) {
        console.log('\n   Connected Platforms:');
        data.items.forEach(account => {
          console.log(`   - ${account.appName}: ${account.id}`);
        });
      } else {
        console.log('   ⚠️  No accounts connected yet');
        console.log('   You need to complete OAuth flow for each platform');
      }
      console.log('');
    } else {
      console.error('❌ Connected accounts API error:', response.status, '\n');
      return false;
    }
  } catch (error) {
    console.error('❌ Error checking connected accounts');
    console.error('   Error:', error.message, '\n');
    return false;
  }
  
  // Test 3: Check available integrations
  console.log('🔌 Test 3: Checking available integrations...');
  try {
    const platforms = ['INSTAGRAM', 'FACEBOOK', 'TWITTER'];
    
    for (const platform of platforms) {
      const response = await fetch(`${COMPOSIO_API_URL}/v1/apps/${platform}`, {
        headers: {
          'X-API-Key': COMPOSIO_API_KEY,
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log(`   ✅ ${platform}: Available`);
      } else {
        console.log(`   ❌ ${platform}: Not available or error`);
      }
    }
    console.log('');
  } catch (error) {
    console.error('❌ Error checking integrations');
    console.error('   Error:', error.message, '\n');
  }
  
  // Test 4: List available actions
  console.log('⚡ Test 4: Checking available actions...');
  try {
    const response = await fetch(`${COMPOSIO_API_URL}/v2/actions?appNames=INSTAGRAM,FACEBOOK,TWITTER`, {
      headers: {
        'X-API-Key': COMPOSIO_API_KEY,
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Actions API working');
      console.log(`   Found ${data.items?.length || 0} actions\n`);
      
      // Group by app
      const actionsByApp = {};
      data.items?.forEach(action => {
        const app = action.appName;
        if (!actionsByApp[app]) actionsByApp[app] = [];
        actionsByApp[app].push(action.name);
      });
      
      Object.keys(actionsByApp).forEach(app => {
        console.log(`   ${app}: ${actionsByApp[app].length} actions`);
      });
      console.log('');
    } else {
      console.error('❌ Actions API error:', response.status, '\n');
    }
  } catch (error) {
    console.error('❌ Error checking actions');
    console.error('   Error:', error.message, '\n');
  }
  
  return true;
}

async function main() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('  Composio API Connection Test');
  console.log('═══════════════════════════════════════════════════════\n');
  
  const success = await testComposioConnection();
  
  if (success) {
    console.log('🎉 Composio API is working!\n');
    console.log('Next steps:');
    console.log('1. Complete OAuth for each platform');
    console.log('2. Run: node test-social-media-workflows.js [platform]');
    console.log('3. Check posts on social media\n');
  } else {
    console.log('❌ Composio API test failed\n');
    console.log('Possible issues:');
    console.log('1. Network connectivity problem');
    console.log('2. Invalid API key');
    console.log('3. Composio service is down');
    console.log('4. Firewall blocking api.composio.dev\n');
    console.log('Try:');
    console.log('- Check internet connection');
    console.log('- Verify API key in Composio dashboard');
    console.log('- Try: curl https://backend.composio.dev/api/v1/apps\n');
  }
}

main().catch(console.error);
