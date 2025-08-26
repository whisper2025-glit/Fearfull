// Simple test script to debug OpenRouter API
const apiKey = "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";

async function testOpenRouterDirectly() {
  console.log('🔍 Testing OpenRouter API directly...');
  console.log('API Key format:', apiKey.substring(0, 20) + '...');
  
  try {
    // Test 1: Check models endpoint
    console.log('📋 Testing models endpoint...');
    const modelsResponse = await fetch('https://openrouter.ai/api/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      }
    });
    
    console.log('Models endpoint status:', modelsResponse.status);
    if (modelsResponse.ok) {
      const models = await modelsResponse.json();
      console.log('✅ Models endpoint working, found models:', models.data?.length || 0);
    } else {
      const errorText = await modelsResponse.text();
      console.log('❌ Models endpoint error:', errorText);
    }
    
    // Test 2: Simple chat completion
    console.log('💬 Testing chat completion...');
    const chatResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': 'Roleplay Chat App'
      },
      body: JSON.stringify({
        model: 'mistralai/mistral-7b-instruct:free',
        messages: [{ role: 'user', content: 'Hi' }],
        max_tokens: 10
      })
    });
    
    console.log('Chat completion status:', chatResponse.status);
    if (chatResponse.ok) {
      const result = await chatResponse.json();
      console.log('✅ Chat completion working:', result.choices[0]?.message?.content);
    } else {
      const errorText = await chatResponse.text();
      console.log('❌ Chat completion error:', errorText);
    }
    
  } catch (error) {
    console.error('🚨 Test failed with error:', error);
  }
}

// Export for browser console usage
window.testOpenRouter = testOpenRouterDirectly;

console.log('🚀 OpenRouter test loaded. Run window.testOpenRouter() in console to test.');
