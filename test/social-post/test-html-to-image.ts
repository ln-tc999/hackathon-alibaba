import nodeHtmlToImage from 'node-html-to-image';
import * as fs from 'fs';
import * as path from 'path';

interface HtmlToImageResult {
  imagePath: string;
  html: string;
  width: number;
  height: number;
}

async function generateImageFromHtml(html: string, outputPath: string, width: number = 1024, height: number = 1024): Promise<HtmlToImageResult> {
  await nodeHtmlToImage({
    output: outputPath,
    html,
    puppeteerArgs: {
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
    },
    type: 'png',
  });

  return {
    imagePath: outputPath,
    html,
    width,
    height,
  };
}

async function runTest() {
  console.log('🎨 Testing HTML to Image Generation...\n');

  const resultsDir = path.join(__dirname, 'results/html-images');
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir, { recursive: true });
  }

  const tests = [
    {
      name: 'gradient-card',
      html: `
        <html>
          <head>
            <style>
              body {
                margin: 0;
                padding: 0;
                width: 1024px;
                height: 1024px;
                display: flex;
                justify-content: center;
                align-items: center;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                font-family: 'Arial', sans-serif;
              }
              .card {
                background: white;
                padding: 60px;
                border-radius: 20px;
                box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                text-align: center;
                max-width: 600px;
              }
              h1 {
                color: #667eea;
                font-size: 48px;
                margin: 0 0 20px 0;
              }
              p {
                color: #666;
                font-size: 24px;
                line-height: 1.6;
              }
            </style>
          </head>
          <body>
            <div class="card">
              <h1>VlowGen Platform</h1>
              <p>AI-Powered Social Media Automation</p>
              <p>🚀 Generate • Analyze • Post</p>
            </div>
          </body>
        </html>
      `,
    },
    {
      name: 'quote-card',
      html: `
        <html>
          <head>
            <style>
              body {
                margin: 0;
                padding: 0;
                width: 1024px;
                height: 1024px;
                display: flex;
                justify-content: center;
                align-items: center;
                background: linear-gradient(to bottom right, #ff6b6b, #feca57);
                font-family: 'Georgia', serif;
              }
              .quote-box {
                background: rgba(255, 255, 255, 0.95);
                padding: 80px;
                border-radius: 30px;
                box-shadow: 0 30px 80px rgba(0,0,0,0.2);
                max-width: 700px;
              }
              .quote {
                font-size: 36px;
                color: #2c3e50;
                font-style: italic;
                line-height: 1.5;
                margin-bottom: 30px;
              }
              .author {
                font-size: 24px;
                color: #ff6b6b;
                text-align: right;
                font-weight: bold;
              }
            </style>
          </head>
          <body>
            <div class="quote-box">
              <div class="quote">
                "The best way to predict the future is to create it."
              </div>
              <div class="author">— Peter Drucker</div>
            </div>
          </body>
        </html>
      `,
    },
    {
      name: 'stats-card',
      html: `
        <html>
          <head>
            <style>
              body {
                margin: 0;
                padding: 0;
                width: 1024px;
                height: 1024px;
                display: flex;
                justify-content: center;
                align-items: center;
                background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
                font-family: 'Arial', sans-serif;
              }
              .stats-container {
                background: white;
                padding: 60px;
                border-radius: 25px;
                box-shadow: 0 25px 70px rgba(0,0,0,0.3);
                width: 700px;
              }
              h2 {
                color: #1e3c72;
                font-size: 42px;
                margin: 0 0 40px 0;
                text-align: center;
              }
              .stat {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 25px;
                margin: 15px 0;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 15px;
                color: white;
              }
              .stat-label {
                font-size: 24px;
                font-weight: bold;
              }
              .stat-value {
                font-size: 36px;
                font-weight: bold;
              }
            </style>
          </head>
          <body>
            <div class="stats-container">
              <h2>📊 Platform Stats</h2>
              <div class="stat">
                <span class="stat-label">Posts Generated</span>
                <span class="stat-value">1,234</span>
              </div>
              <div class="stat">
                <span class="stat-label">Active Users</span>
                <span class="stat-value">567</span>
              </div>
              <div class="stat">
                <span class="stat-label">Success Rate</span>
                <span class="stat-value">98%</span>
              </div>
            </div>
          </body>
        </html>
      `,
    },
  ];

  const results: any[] = [];

  for (const test of tests) {
    console.log(`📝 Test: ${test.name}`);
    const startTime = Date.now();
    
    try {
      const outputPath = path.join(resultsDir, `${test.name}-${Date.now()}.png`);
      const result = await generateImageFromHtml(test.html, outputPath);
      const duration = Date.now() - startTime;
      
      console.log(`   ✅ Success! (${duration}ms)`);
      console.log(`   💾 Saved to: ${result.imagePath}\n`);
      
      results.push({
        test: test.name,
        status: 'success',
        duration,
        imagePath: result.imagePath,
      });
    } catch (error) {
      const duration = Date.now() - startTime;
      console.log(`   ❌ Failed! (${duration}ms)`);
      console.log(`   Error: ${error}\n`);
      
      results.push({
        test: test.name,
        status: 'error',
        duration,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  // Save summary
  const summaryPath = path.join(resultsDir, `test-summary-${Date.now()}.json`);
  fs.writeFileSync(summaryPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    totalTests: tests.length,
    passed: results.filter(r => r.status === 'success').length,
    failed: results.filter(r => r.status === 'error').length,
    results,
  }, null, 2));

  console.log(`📊 Test Summary:`);
  console.log(`   ✅ Passed: ${results.filter(r => r.status === 'success').length}/${tests.length}`);
  console.log(`   ❌ Failed: ${results.filter(r => r.status === 'error').length}/${tests.length}`);
  console.log(`\n💾 Summary saved to: ${summaryPath}`);
}

runTest();
