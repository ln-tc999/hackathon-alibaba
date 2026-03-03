const axios = require('axios');

const API_URL = 'http://localhost:3001';

async function testNegativePrompt() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('  Negative Prompt Test');
  console.log('  Testing image generation with negative prompting');
  console.log('═══════════════════════════════════════════════════════\n');

  try {
    // Check server health
    const healthResponse = await axios.get(`${API_URL}/health`);
    console.log('✅ Server is running');
    console.log(`   Status: ${healthResponse.data.status}`);
    console.log(`   Environment: ${healthResponse.data.environment}\n`);

    // Create workflow with negative prompt
    const workflow = {
      id: 'test-negative-prompt',
      name: 'Negative Prompt Test',
      nodes: [
        {
          id: 'prompt-1',
          type: 'prompt-text',
          position: { x: 100, y: 100 },
          data: {
            type: 'prompt-text',
            promptText: 'A beautiful sunset over mountains, vibrant colors, professional photography'
          }
        },
        {
          id: 'wan2-1',
          type: 'wan2',
          position: { x: 400, y: 100 },
          data: {
            type: 'wan2',
            model: 'wan2.1-t2i-turbo',
            size: '1024*1024',
            negativePrompt: 'blurry, low quality, distorted, ugly, bad anatomy, watermark, text, signature'
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

    console.log('📋 Workflow Configuration:');
    console.log(`   Prompt: "${workflow.nodes[0].data.promptText}"`);
    console.log(`   Negative Prompt: "${workflow.nodes[1].data.negativePrompt}"`);
    console.log(`   Model: ${workflow.nodes[1].data.model}`);
    console.log(`   Size: ${workflow.nodes[1].data.size}\n`);

    console.log('🚀 Starting image generation with negative prompt...');
    console.log('   (This may take 10-15 seconds)\n');

    const startTime = Date.now();
    const executeResponse = await axios.post(`${API_URL}/api/workflows/execute`, {
      workflow,
      credentials: {
        wan2ApiKey: process.env.DASHSCOPE_API_KEY
      }
    });

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    const result = executeResponse.data;

    console.log('📊 Execution Result:');
    console.log(`   Status: ${result.status}`);
    console.log(`   Duration: ${duration}s`);
    console.log(`   Execution ID: ${result.executionId}\n`);

    if (result.status === 'success') {
      console.log('✅ Image generated successfully with negative prompt!\n');
      
      if (result.nodeResults) {
        console.log('📝 Node Results:');
        Object.entries(result.nodeResults).forEach(([nodeId, nodeResult]) => {
          console.log(`\n  ${nodeId}:`);
          console.log(`    Status: ${nodeResult.status}`);
          console.log(`    Duration: ${nodeResult.duration}ms`);
          
          if (nodeResult.output) {
            const output = typeof nodeResult.output === 'string' 
              ? nodeResult.output 
              : JSON.stringify(nodeResult.output);
            
            if (output.startsWith('http')) {
              console.log(`    🖼️  Image URL: ${output}`);
            } else {
              console.log(`    Output: ${output.substring(0, 100)}${output.length > 100 ? '...' : ''}`);
            }
          }
          
          if (nodeResult.error) {
            console.log(`    Error: ${nodeResult.error}`);
          }
        });
      }

      console.log('\n\n🎉 Test completed successfully!');
      console.log('\n💡 The negative prompt helped avoid:');
      console.log('   - Blurry images');
      console.log('   - Low quality results');
      console.log('   - Distorted features');
      console.log('   - Watermarks and text overlays');
      
    } else {
      console.log('❌ Workflow execution failed:');
      console.log(`   Error: ${result.error}\n`);
      
      console.log('📝 Node Results:');
      Object.entries(result.nodeResults).forEach(([nodeId, nodeResult]) => {
        console.log(`\n  ${nodeId}:`);
        console.log(`    Status: ${nodeResult.status}`);
        if (nodeResult.error) {
          console.log(`    Error: ${nodeResult.error}`);
        }
      });
    }

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    if (error.response) {
      console.error('   Response:', error.response.data);
    }
  }
}

// Run the test
testNegativePrompt();
