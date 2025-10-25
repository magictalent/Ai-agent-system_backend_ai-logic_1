// Test API endpoints
// Run this with: node test-api-endpoints.js

const testEndpoints = async () => {
  const baseUrl = 'http://localhost:3001';
  
  console.log('🧪 Testing API endpoints...');
  
  // Test 1: Basic health check
  try {
    const response = await fetch(`${baseUrl}/`);
    console.log('✅ Basic endpoint:', response.status);
  } catch (error) {
    console.log('❌ Basic endpoint failed:', error.message);
  }
  
  // Test 2: Campaigns endpoint (without auth)
  try {
    const response = await fetch(`${baseUrl}/campaigns`);
    console.log('📡 Campaigns endpoint (no auth):', response.status);
  } catch (error) {
    console.log('❌ Campaigns endpoint failed:', error.message);
  }
  
  // Test 3: AI Dashboard endpoint (without auth)
  try {
    const response = await fetch(`${baseUrl}/campaigns/ai-dashboard`);
    console.log('📡 AI Dashboard endpoint (no auth):', response.status);
  } catch (error) {
    console.log('❌ AI Dashboard endpoint failed:', error.message);
  }
  
  console.log('\n🔍 If you see 401 errors, that means the endpoints exist but need authentication.');
  console.log('🔍 If you see 404 errors, the endpoints might not be registered.');
  console.log('🔍 If you see connection errors, the backend might not be running.');
};

testEndpoints();
