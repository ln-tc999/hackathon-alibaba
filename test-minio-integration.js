/**
 * Test MinIO Integration
 * 
 * Tests image generation with MinIO storage
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'packages/backend/.env') });

const { Wan2Client } = require('./packages/backend/dist/integrations/wan2');
const { minioService } = require('./packages/backend/dist/services/minio.service');

async function testMinIOIntegration() {
  console.log('=== Testing MinIO Integration ===\n');

  try {
    // Step 1: Generate image with Wan2
    console.log('Step 1: Generating image with Wan2...');
    const wan2Client = new Wan2Client(process.env.DASHSCOPE_API_KEY);
    
    const result = await wan2Client.generateImage({
      prompt: 'A beautiful sunset over mountains, photorealistic',
      negativePrompt: 'blurry, low quality, distorted',
      model: 'wan2.1-t2i-turbo',
      size: '1024*1024',
    });

    console.log('✓ Image generated:', result.imageUrl);
    console.log('');

    // Step 2: Upload to MinIO
    console.log('Step 2: Uploading to MinIO...');
    const fileName = `test-${Date.now()}`;
    const minioUrl = await minioService.uploadImageFromUrl(result.imageUrl, fileName);

    console.log('✓ Image uploaded to MinIO:', minioUrl);
    console.log('');

    // Step 3: Verify MinIO URL is accessible
    console.log('Step 3: Verifying MinIO URL...');
    const fetch = (await import('node-fetch')).default;
    const response = await fetch(minioUrl);

    if (response.ok) {
      console.log('✓ MinIO URL is accessible');
      console.log('  Status:', response.status);
      console.log('  Content-Type:', response.headers.get('content-type'));
      console.log('  Content-Length:', response.headers.get('content-length'));
    } else {
      console.log('✗ MinIO URL is not accessible');
      console.log('  Status:', response.status);
    }

    console.log('\n=== Test Complete ===');
    console.log('MinIO URL:', minioUrl);
    console.log('Original DashScope URL:', result.imageUrl);

  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
}

testMinIOIntegration();
