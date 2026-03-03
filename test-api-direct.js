/**
 * Direct API Test - Test Wan2 API directly without backend
 */

const API_KEY = 'sk-466ebab0feed41f7880c3b7ca509d15b';
const BASE_URL = 'https://dashscope-intl.aliyuncs.com/api/v1';

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testDirectAPI() {
  console.log('🧪 Testing Wan2 API directly...\n');
  
  // Step 1: Create task
  console.log('📤 Step 1: Creating image generation task...');
  const createResponse = await fetch(`${BASE_URL}/services/aigc/text2image/image-synthesis`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
      'X-DashScope-Async': 'enable',
    },
    body: JSON.stringify({
      model: 'wan2.1-t2i-turbo',
      input: {
        prompt: 'A beautiful sunset over Indonesian rice terraces'
      },
      parameters: {
        size: '1024*1024',
        n: 1
      }
    })
  });

  const createResult = await createResponse.json();
  console.log('Response:', JSON.stringify(createResult, null, 2));
  
  if (!createResult.output?.task_id) {
    console.error('❌ Failed to create task');
    return;
  }

  const taskId = createResult.output.task_id;
  console.log(`✅ Task created: ${taskId}\n`);

  // Step 2: Poll for result
  console.log('⏳ Step 2: Polling for result (max 2 minutes)...');
  const maxAttempts = 40;
  const pollInterval = 3000;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    await sleep(pollInterval);
    
    console.log(`   Attempt ${attempt}/${maxAttempts}...`);
    
    const statusResponse = await fetch(`${BASE_URL}/tasks/${taskId}`, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
      }
    });

    const statusResult = await statusResponse.json();
    const status = statusResult.output?.task_status;
    
    console.log(`   Status: ${status}`);

    if (status === 'SUCCEEDED') {
      console.log('\n✅ Image generated successfully!\n');
      console.log('📊 Result:');
      console.log(JSON.stringify(statusResult, null, 2));
      
      if (statusResult.output?.results?.[0]?.url) {
        console.log('\n🖼️  Image URL:', statusResult.output.results[0].url);
        console.log('📥 Download: curl -o generated-image.jpg "' + statusResult.output.results[0].url + '"');
      }
      return;
    } else if (status === 'FAILED') {
      console.error('\n❌ Task failed');
      console.error(JSON.stringify(statusResult, null, 2));
      return;
    }
  }

  console.error('\n❌ Timeout after 2 minutes');
}

testDirectAPI().catch(console.error);
