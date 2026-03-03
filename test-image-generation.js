/**
 * Test Script: Generate Image Only (No Instagram)
 * 
 * Usage: node test-image-generation.js
 */

const API_URL = 'http://localhost:3001';

// Simple workflow: Prompt Text → Wan2 Image
const testWorkflow = {
  id: 'test-image-gen',
  name: 'Test: Image Generation Only',
  nodes: [
    {
      id: 'prompt-1',
      type: 'prompt-text',
      position: { x: 100, y: 100 },
      data: {
        type: 'prompt-text',
        promptText: 'A beautiful sunset over Indonesian rice terraces, golden hour lighting, vibrant colors, photorealistic, 4k quality'
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
    }
  ],
  edges: [
    {
      id: 'e1',
      source: 'prompt-1',
      target: 'wan2-1'
    }
  ]
};

// Test credentials
const testCredentials = {
  wan2ApiKey: process.env.DASHSCOPE_API_KEY || 'sk-466ebab0feed41f7880c3b7ca509d15b'
};

async function testImageGeneration() {
  console.log('🚀 Starting Image Generation Test...\n');
  
  // Step 1: Validate workflow
  console.log('📋 Step 1: Validating workflow...');
  try {
    const validateResponse = await fetch(`${API_URL}/api/workflows/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        workflow: testWorkflow
      })
    });

    const validateResult = await validateResponse.json();
    
    if (!validateResult.valid) {
      console.error('❌ Workflow validation failed:');
      console.error(JSON.stringify(validateResult.errors, null, 2));
      return;
    }
    
    console.log('✅ Workflow is valid\n');
  } catch (error) {
    console.error('❌ Validation request failed:', error.message);
    return;
  }

  // Step 2: Execute workflow
  console.log('⚡ Step 2: Executing workflow...');
  console.log('   Generating image from prompt...');
  console.log('   (This may take 30-60 seconds)\n');

  const startTime = Date.now();

  try {
    const executeResponse = await fetch(`${API_URL}/api/workflows/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        workflow: testWorkflow,
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
        }
      }
      return;
    }
    
    console.log('\n✅ Image generated successfully!\n');
    
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
            console.log(`    📥 Download: curl -o generated-image.jpg "${result.output}"`);
          } else {
            console.log(`    Output: ${result.output}`);
          }
        }
        console.log('');
      }
    }
    
    console.log('🎉 Test completed successfully!');
    console.log('\n💡 Tip: Copy the image URL and open it in your browser to view the generated image.');
    
  } catch (error) {
    console.error('❌ Execution request failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Check if server is running
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

// Main execution
async function main() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('  Image Generation Test');
  console.log('  Prompt → Wan2.1 Image Generation');
  console.log('═══════════════════════════════════════════════════════\n');
  
  // Check environment variables
  console.log('🔑 Checking credentials...');
  if (!process.env.DASHSCOPE_API_KEY) {
    console.log('⚠️  DASHSCOPE_API_KEY not set, using hardcoded key');
  } else {
    console.log('✅ DASHSCOPE_API_KEY found in environment');
  }
  console.log('');
  
  // Check server
  const serverRunning = await checkServer();
  if (!serverRunning) {
    process.exit(1);
  }
  
  // Run test
  await testImageGeneration();
}

main().catch(console.error);
