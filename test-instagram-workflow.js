/**
 * Test Script: Viral News → Generate Image → Post to Instagram
 * 
 * Usage: node test-instagram-workflow.js
 */

const API_URL = 'http://localhost:3001';

// Workflow: Prompt Text → Wan2 Image → Instagram
const testWorkflow = {
  id: 'test-instagram-workflow',
  name: 'Test: Viral News to Instagram',
  nodes: [
    {
      id: 'prompt-1',
      type: 'prompt-text',
      position: { x: 100, y: 100 },
      data: {
        type: 'prompt-text',
        promptText: 'A stunning viral moment: Indonesian street food vendor goes viral for creative neon-lit food cart design. Vibrant colors, night market atmosphere, photorealistic, trending on social media, 4k quality'
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
      id: 'instagram-1',
      type: 'instagram',
      position: { x: 700, y: 100 },
      data: {
        type: 'instagram',
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
      target: 'instagram-1'
    }
  ]
};

// Test credentials (you need to replace with actual values)
const testCredentials = {
  wan2ApiKey: process.env.DASHSCOPE_API_KEY || 'your-dashscope-api-key',
  composioApiKey: process.env.COMPOSIO_API_KEY || 'your-composio-api-key',
  composioApiUrl: 'https://api.composio.dev'
};

async function testWorkflowExecution() {
  console.log('🚀 Starting Instagram Workflow Test...\n');
  
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
  console.log('   This will:');
  console.log('   1. Generate image from viral news prompt');
  console.log('   2. Post image to Instagram');
  console.log('   (This may take 30-60 seconds)\n');

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
    
    console.log('📊 Execution Result:');
    console.log('Status:', executeResult.status);
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
            console.log(`    Output: ${typeof result.output === 'string' ? result.output.substring(0, 100) + '...' : JSON.stringify(result.output)}`);
          }
        }
      }
      return;
    }
    
    console.log('\n✅ Workflow executed successfully!\n');
    
    // Display results
    if (executeResult.results?.nodeResults) {
      console.log('📝 Detailed Node Results:\n');
      
      for (const [nodeId, result] of Object.entries(executeResult.results.nodeResults)) {
        console.log(`  ${nodeId}:`);
        console.log(`    Status: ${result.status}`);
        console.log(`    Duration: ${result.duration}ms`);
        
        if (result.output) {
          if (nodeId.includes('wan2')) {
            console.log(`    Image URL: ${result.output}`);
          } else if (nodeId.includes('instagram')) {
            console.log(`    Post URL: ${result.output}`);
          } else {
            console.log(`    Output: ${result.output}`);
          }
        }
        
        if (result.error) {
          console.log(`    Error: ${result.error}`);
        }
        console.log('');
      }
    }
    
    console.log('🎉 Test completed successfully!');
    
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
  console.log('  Instagram Workflow Test');
  console.log('  Viral News → Generate Image → Post to Instagram');
  console.log('═══════════════════════════════════════════════════════\n');
  
  // Check environment variables
  console.log('🔑 Checking credentials...');
  if (!process.env.DASHSCOPE_API_KEY) {
    console.warn('⚠️  DASHSCOPE_API_KEY not set in environment');
    console.warn('   Set it with: export DASHSCOPE_API_KEY=your-key');
  } else {
    console.log('✅ DASHSCOPE_API_KEY found');
  }
  
  if (!process.env.COMPOSIO_API_KEY) {
    console.warn('⚠️  COMPOSIO_API_KEY not set in environment');
    console.warn('   Set it with: export COMPOSIO_API_KEY=your-key');
  } else {
    console.log('✅ COMPOSIO_API_KEY found');
  }
  console.log('');
  
  // Check server
  const serverRunning = await checkServer();
  if (!serverRunning) {
    process.exit(1);
  }
  
  // Run test
  await testWorkflowExecution();
}

main().catch(console.error);
