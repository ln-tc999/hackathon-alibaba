/**
 * Test Script: Social Media Workflows
 * Tests: Image Generation → Post to Instagram/Facebook/Twitter
 * 
 * Usage: node test-social-media-workflows.js [platform]
 * Example: node test-social-media-workflows.js instagram
 */

const API_URL = 'http://localhost:3001';

const PLATFORMS = {
  instagram: {
    name: 'Instagram',
    requiresMedia: 'image',
    prompt: 'Viral Indonesian street food: colorful neon-lit food cart at night market, vibrant atmosphere, trending on social media, photorealistic, 4k'
  },
  facebook: {
    name: 'Facebook',
    requiresMedia: 'image',
    prompt: 'Breaking news: Record-breaking traffic in Jakarta, aerial view, dramatic sunset, photojournalism style'
  },
  twitter: {
    name: 'Twitter',
    requiresMedia: 'image',
    prompt: 'Trending: Traditional Indonesian batik with modern neon colors, high fashion editorial, viral content'
  }
};

function createWorkflow(platform) {
  const config = PLATFORMS[platform];
  
  return {
    id: `test-${platform}-workflow`,
    name: `Test: ${config.name} Post`,
    nodes: [
      {
        id: 'prompt-1',
        type: 'prompt-text',
        position: { x: 100, y: 100 },
        data: {
          type: 'prompt-text',
          promptText: config.prompt
        }
      },
      {
        id: 'wan2-1',
        type: 'wan2',
        position: { x: 400, y: 100 },
        data: {
          type: 'wan2',
          model: 'wan2.1-t2i-turbo',
          size: '1024*1024'
        }
      },
      {
        id: `${platform}-1`,
        type: platform,
        position: { x: 700, y: 100 },
        data: {
          type: platform,
          authenticated: true,
          accountHandle: 'test_account'
        }
      }
    ],
    edges: [
      {
        id: 'e1',
        source: 'prompt-1',
        target: 'wan2-1'
      },
      {
        id: 'e2',
        source: 'wan2-1',
        target: `${platform}-1`
      }
    ]
  };
}

const testCredentials = {
  wan2ApiKey: process.env.DASHSCOPE_API_KEY || 'sk-466ebab0feed41f7880c3b7ca509d15b',
  composioApiKey: process.env.COMPOSIO_API_KEY || 'ak_C4a5-yJQmd8bjd5wsB9E',

  composioApiUrl: 'https://backend.composio.dev/api'

  composioApiUrl: 'https://api.composio.dev'

};

async function testPlatform(platform) {
  const config = PLATFORMS[platform];
  
  console.log('═══════════════════════════════════════════════════════');
  console.log(`  ${config.name} Workflow Test`);
  console.log(`  Viral Content → Generate Image → Post to ${config.name}`);
  console.log('═══════════════════════════════════════════════════════\n');
  
  const workflow = createWorkflow(platform);
  
  // Step 1: Validate
  console.log('📋 Step 1: Validating workflow...');
  try {
    const validateResponse = await fetch(`${API_URL}/api/workflows/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workflow })
    });

    const validateResult = await validateResponse.json();
    
    if (!validateResult.valid) {
      console.error('❌ Workflow validation failed:');
      console.error(JSON.stringify(validateResult.errors, null, 2));
      return false;
    }
    
    console.log('✅ Workflow is valid\n');
  } catch (error) {
    console.error('❌ Validation request failed:', error.message);
    return false;
  }

  // Step 2: Execute
  console.log('⚡ Step 2: Executing workflow...');
  console.log(`   1. Generate image from viral ${platform} prompt`);
  console.log(`   2. Post image to ${config.name}`);
  console.log('   (This may take 30-60 seconds)\n');

  const startTime = Date.now();

  try {
    const executeResponse = await fetch(`${API_URL}/api/workflows/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        workflow,
        credentials: testCredentials,
        userId: 'test-user-123'
      })
    });

    const executeResult = await executeResponse.json();
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    console.log('📊 Execution Result:');
    console.log('Status:', executeResult.status);
    console.log('Duration:', duration + 's');
    console.log('Execution ID:', executeResult.executionId);
    
    if (executeResult.status === 'error') {
      console.error('\n❌ Workflow execution failed:');
      console.error('Error:', executeResult.error);
      
      if (executeResult.results?.nodeResults) {
        console.log('\n📝 Node Results:');
        for (const [nodeId, result] of Object.entries(executeResult.results.nodeResults)) {
          console.log(`\n  ${nodeId}:`);
          console.log(`    Status: ${result.status}`);
          if (result.error) {
            console.log(`    Error: ${result.error}`);
          }
          if (result.output) {
            const output = typeof result.output === 'string' 
              ? result.output.substring(0, 100) + '...' 
              : JSON.stringify(result.output);
            console.log(`    Output: ${output}`);
          }
        }
      }
      return false;
    }
    
    console.log(`\n✅ Successfully posted to ${config.name}!\n`);
    
    // Display results
    if (executeResult.results?.nodeResults) {
      console.log('📝 Detailed Results:\n');
      
      for (const [nodeId, result] of Object.entries(executeResult.results.nodeResults)) {
        console.log(`  ${nodeId}:`);
        console.log(`    Status: ${result.status}`);
        console.log(`    Duration: ${result.duration}ms`);
        
        if (result.output) {
          if (nodeId.includes('wan2')) {
            console.log(`    🖼️  Image URL: ${result.output}`);
          } else if (nodeId.includes(platform)) {
            console.log(`    📱 Post URL: ${result.output}`);
          } else {
            console.log(`    Output: ${result.output}`);
          }
        }
        console.log('');
      }
    }
    
    return true;
  } catch (error) {
    console.error('❌ Execution request failed:', error.message);
    return false;
  }
}

async function checkServer() {
  try {
    const response = await fetch(`${API_URL}/health`);
    const health = await response.json();
    console.log('✅ Server is running');
    console.log('   Status:', health.status);
    console.log('   Environment:', health.environment);
    console.log('');
    return true;
  } catch (error) {
    console.error('❌ Server is not running at', API_URL);
    console.error('   Please start the backend server first:');
    console.error('   cd packages/backend && npm run dev');
    return false;
  }
}

async function setupOAuth(platform) {
  console.log(`\n🔐 ${PLATFORMS[platform].name} OAuth Setup Required\n`);
  console.log('Before posting to social media, you need to authenticate:');
  console.log('');
  console.log('1. Get OAuth URL:');
  console.log(`   curl http://localhost:3001/api/auth/${platform}/url`);
  console.log('');
  console.log('2. Open the returned URL in browser and authorize');
  console.log('');
  console.log('3. After authorization, the token will be stored');
  console.log('');
  console.log('Note: For this test, we\'ll simulate authentication.');
  console.log('      In production, complete the OAuth flow first.\n');
}

async function main() {
  const args = process.argv.slice(2);
  const platform = args[0] || 'instagram';
  
  if (!PLATFORMS[platform]) {
    console.error('❌ Invalid platform. Choose: instagram, facebook, or twitter');
    console.error('Usage: node test-social-media-workflows.js [platform]');
    process.exit(1);
  }
  
  console.log('🔑 Checking credentials...');
  if (!process.env.DASHSCOPE_API_KEY) {
    console.log('⚠️  DASHSCOPE_API_KEY not set, using hardcoded key');
  } else {
    console.log('✅ DASHSCOPE_API_KEY found');
  }
  
  if (!process.env.COMPOSIO_API_KEY) {
    console.log('⚠️  COMPOSIO_API_KEY not set, using hardcoded key');
  } else {
    console.log('✅ COMPOSIO_API_KEY found');
  }
  console.log('');
  
  const serverRunning = await checkServer();
  if (!serverRunning) {
    process.exit(1);
  }
  
  await setupOAuth(platform);
  
  const success = await testPlatform(platform);
  
  if (success) {
    console.log('🎉 Test completed successfully!');
    console.log(`\n💡 Next: Test other platforms:`);
    console.log('   node test-social-media-workflows.js facebook');
    console.log('   node test-social-media-workflows.js twitter');
  } else {
    console.log('\n❌ Test failed. Check the errors above.');
    console.log('\nCommon issues:');
    console.log('1. OAuth not setup - Complete authentication first');
    console.log('2. Invalid Composio API key');
    console.log('3. Platform not connected in Composio dashboard');
  }
}

main().catch(console.error);
