import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';

const COMPOSIO_API_KEY = 'ak_C4a5-yJQmd8bjd5wsB9E';
const COMPOSIO_API_URL = 'https://backend.composio.dev/api';

// Connected Account IDs from check-composio-status
const INSTAGRAM_ACCOUNT_ID = '4e014715-b7b3-48fb-a36b-4cd02a346054';
const FACEBOOK_ACCOUNT_ID = '640c5ab6-89fc-40fd-b255-b60bb2c21c95';
const YOUTUBE_ACCOUNT_ID = 'cd1cd3c5-2a39-4dff-a945-8789b3fe0b65';

const INSTAGRAM_USER_ID = '26053442284323939';

interface TestResult {
  platform: string;
  status: 'success' | 'error' | 'skipped';
  postUrl?: string;
  postId?: string;
  error?: string;
  duration: number;
}

async function testInstagram(): Promise<TestResult> {
  const startTime = Date.now();
  
  try {
    console.log('   📤 Step 1: Creating media container...');
    
    const containerResponse = await axios.post(
      `${COMPOSIO_API_URL}/v2/actions/INSTAGRAM_CREATE_MEDIA_CONTAINER/execute`,
      {
        connectedAccountId: INSTAGRAM_ACCOUNT_ID,
        input: {
          ig_user_id: INSTAGRAM_USER_ID,
          image_url: 'https://images.unsplash.com/photo-1661956602116-aa6865609028?w=1080&h=1080&fit=crop',
          caption: '🚀 VlowGen Platform Test - Instagram\n\n#VlowGen #AI #Automation',
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': COMPOSIO_API_KEY,
        },
      }
    );

    const containerId = containerResponse.data.data?.id;
    if (!containerId) {
      throw new Error('Failed to get container ID');
    }

    console.log(`   ✅ Container created: ${containerId}`);
    console.log('   📤 Step 2: Publishing post...');
    
    const publishResponse = await axios.post(
      `${COMPOSIO_API_URL}/v2/actions/INSTAGRAM_CREATE_POST/execute`,
      {
        connectedAccountId: INSTAGRAM_ACCOUNT_ID,
        input: {
          ig_user_id: INSTAGRAM_USER_ID,
          creation_id: containerId,
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': COMPOSIO_API_KEY,
        },
      }
    );

    return {
      platform: 'instagram',
      status: 'success',
      postUrl: publishResponse.data.data?.permalink,
      postId: publishResponse.data.data?.id,
      duration: Date.now() - startTime,
    };
  } catch (error: any) {
    return {
      platform: 'instagram',
      status: 'error',
      error: error.response?.data?.error || error.message,
      duration: Date.now() - startTime,
    };
  }
}

async function testFacebook(): Promise<TestResult> {
  const startTime = Date.now();
  
  try {
    console.log('   📤 Creating photo post...');
    
    const response = await axios.post(
      `${COMPOSIO_API_URL}/v2/actions/FACEBOOK_CREATE_PHOTO_POST/execute`,
      {
        connectedAccountId: FACEBOOK_ACCOUNT_ID,
        input: {
          message: '🚀 VlowGen Platform Test - Facebook\n\n#VlowGen #AI #Automation',
          url: 'https://images.unsplash.com/photo-1661956602116-aa6865609028?w=1080&h=1080&fit=crop',
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': COMPOSIO_API_KEY,
        },
      }
    );

    return {
      platform: 'facebook',
      status: 'success',
      postUrl: response.data.data?.permalink_url,
      postId: response.data.data?.id,
      duration: Date.now() - startTime,
    };
  } catch (error: any) {
    return {
      platform: 'facebook',
      status: 'error',
      error: error.response?.data?.error || error.message,
      duration: Date.now() - startTime,
    };
  }
}

async function testYouTube(): Promise<TestResult> {
  console.log('   ⏭️  Skipping (requires video file)');
  return {
    platform: 'youtube',
    status: 'skipped',
    duration: 0,
  };
}

async function runTests() {
  console.log('🚀 Testing All Social Media Platforms...\n');
  console.log('📋 Configuration:');
  console.log(`   API URL: ${COMPOSIO_API_URL}`);
  console.log(`   Instagram Account: ${INSTAGRAM_ACCOUNT_ID}`);
  console.log(`   Facebook Account: ${FACEBOOK_ACCOUNT_ID}`);
  console.log(`   YouTube Account: ${YOUTUBE_ACCOUNT_ID}\n`);

  const results: TestResult[] = [];

  // Test Instagram
  console.log('📝 Test 1: Instagram');
  const instagramResult = await testInstagram();
  console.log(`   ${instagramResult.status === 'success' ? '✅' : '❌'} ${instagramResult.status} (${instagramResult.duration}ms)`);
  if (instagramResult.error) console.log(`   Error: ${instagramResult.error}`);
  if (instagramResult.postUrl) console.log(`   Post URL: ${instagramResult.postUrl}`);
  if (instagramResult.postId) console.log(`   Post ID: ${instagramResult.postId}`);
  console.log();
  results.push(instagramResult);

  // Test Facebook
  console.log('📝 Test 2: Facebook');
  const facebookResult = await testFacebook();
  console.log(`   ${facebookResult.status === 'success' ? '✅' : '❌'} ${facebookResult.status} (${facebookResult.duration}ms)`);
  if (facebookResult.error) console.log(`   Error: ${facebookResult.error}`);
  if (facebookResult.postUrl) console.log(`   Post URL: ${facebookResult.postUrl}`);
  if (facebookResult.postId) console.log(`   Post ID: ${facebookResult.postId}`);
  console.log();
  results.push(facebookResult);

  // Test YouTube
  console.log('📝 Test 3: YouTube');
  const youtubeResult = await testYouTube();
  console.log(`   ⏭️  ${youtubeResult.status}`);
  console.log();
  results.push(youtubeResult);

  // Save results
  const resultsDir = path.join(__dirname, 'results');
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir, { recursive: true });
  }

  const summaryPath = path.join(resultsDir, `all-platforms-test-${Date.now()}.json`);
  fs.writeFileSync(summaryPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    totalTests: results.length,
    passed: results.filter(r => r.status === 'success').length,
    failed: results.filter(r => r.status === 'error').length,
    skipped: results.filter(r => r.status === 'skipped').length,
    results,
  }, null, 2));

  console.log('📊 Test Summary:');
  console.log(`   ✅ Passed: ${results.filter(r => r.status === 'success').length}/${results.length}`);
  console.log(`   ❌ Failed: ${results.filter(r => r.status === 'error').length}/${results.length}`);
  console.log(`   ⏭️  Skipped: ${results.filter(r => r.status === 'skipped').length}/${results.length}`);
  console.log(`\n💾 Results saved to: ${summaryPath}`);
}

runTests();
