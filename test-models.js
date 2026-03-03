// no dotenv

async function testModel(modelName) {
    const url = 'https://dashscope-intl.aliyuncs.com/api/v1/services/aigc/text2image/image-synthesis';
    console.log(`Testing model: ${modelName}`);

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.DASHSCOPE_API_KEY || 'sk-466ebab0feed41f7880c3b7ca509d15b'}`,
                'X-DashScope-Async': 'enable'
            },
            body: JSON.stringify({
                model: modelName,
                input: { prompt: "A futuristic city" },
                parameters: { size: "1024*1024", n: 1 }
            })
        });

        const data = await response.json();
        console.log(`Result for ${modelName}:`, data);
    } catch (err) {
        console.error(`Fetch error for ${modelName}:`, err.message);
    }
}

async function run() {
    const modelsToTest = [
        'wan2.1-t2i-turbo',
        'wan2.1-t2i-plus',
        'wanx-v1',
        'wanx-v2',
        'wan2.6-t2i',
        'qwen-vl-plus',
        'wanx2.1-imageedit',
        'wanx2.1-t2i-turbo',
        'wanx-t2i-turbo'
    ];

    for (const model of modelsToTest) {
        await testModel(model);
        console.log('---');
    }
}

run();
