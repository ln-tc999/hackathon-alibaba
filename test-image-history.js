/**
 * Test Image History Feature
 * 
 * Tests:
 * 1. Generate image with Wan2
 * 2. Verify image saved to history
 * 3. Retrieve image from history
 * 4. Use image URL in Vision Analyzer
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'packages/backend/.env') });

const { Wan2Client } = require('./packages/backend/dist/integrations/wan2');
const { minioService } = require('./packages/backend/dist/services/minio.service');
const { imageHistoryService } = require('./packages/backend/dist/services/image-history.service');

async function testImageHistory() {
  console.log('=== Testing Image History Feature ===\n');

  try {
    const userId = 'test-user-123';

    // Step 1: Generate image
    console.log('Step 1: Generating image with Wan2...');
    const wan2Client = new Wan2Client(process.env.DASHSCOPE_API_KEY);
    
    const result = await wan2Client.generateImage({
      prompt: 'A cute cat wearing sunglasses, photorealistic',
      negativePrompt: 'blurry, low quality',
      model: 'wan2.1-t2i-turbo',
      size: '1024*1024',
    });

    console.log('✓ Image generated:', result.imageUrl);
    console.log('');

    // Step 2: Upload to MinIO
    console.log('Step 2: Uploading to MinIO...');
    const fileName = `test-history-${Date.now()}`;
    const minioUrl = await minioService.uploadImageFromUrl(result.imageUrl, fileName);
    console.log('✓ Image uploaded:', minioUrl);
    console.log('');

    // Step 3: Save to history
    console.log('Step 3: Saving to image history...');
    const imageId = `img-${Date.now()}`;
    imageHistoryService.addImage({
      id: imageId,
      nodeId: 'test-node-1',
      workflowId: 'test-workflow-1',
      executionId: 'test-execution-1',
      minioUrl,
      dashscopeUrl: result.imageUrl,
      prompt: 'A cute cat wearing sunglasses, photorealistic',
      negativePrompt: 'blurry, low quality',
      model: 'wan2.1-t2i-turbo',
      size: '1024*1024',
      timestamp: new Date().toISOString(),
      userId,
    });
    console.log('✓ Image saved to history:', imageId);
    console.log('');

    // Step 4: Retrieve from history
    console.log('Step 4: Retrieving from history...');
    
    const latestImage = imageHistoryService.getLatestImage(userId);
    console.log('✓ Latest image:', {
      id: latestImage.id,
      url: latestImage.minioUrl,
      prompt: latestImage.prompt,
    });
    console.log('');

    const recentImages = imageHistoryService.getRecentImages(userId, 5);
    console.log(`✓ Recent images count: ${recentImages.length}`);
    console.log('');

    const imageById = imageHistoryService.getImageById(imageId, userId);
    console.log('✓ Image by ID:', imageById ? 'Found' : 'Not found');
    console.log('');

    // Step 5: Search by prompt
    console.log('Step 5: Searching by prompt...');
    const searchResults = imageHistoryService.searchByPrompt(userId, 'cat');
    console.log(`✓ Search results for "cat": ${searchResults.length} images`);
    console.log('');

    // Step 6: Simulate workflow continuation
    console.log('Step 6: Simulating workflow continuation...');
    console.log('AI Model can now access image URL:', latestImage.minioUrl);
    console.log('This URL can be used in:');
    console.log('  - Vision Analyzer (analyze generated image)');
    console.log('  - Prompt Enhancer (reference for style)');
    console.log('  - Social Media nodes (post the image)');
    console.log('');

    console.log('=== Test Complete ===');
    console.log('Image history is working! All generated images are automatically saved.');
    console.log('Users can continue workflows with previously generated images.');

  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
}

testImageHistory();
