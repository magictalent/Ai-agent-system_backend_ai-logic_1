// testHubspot.js
import fetch from 'node-fetch'

// 🧠 Replace this with your real Supabase access token
const SUPABASE_ACCESS_TOKEN = 'eyJhbGciOiJIUzI1NiIsImtpZCI6IjY2c2V0b0s0ZURjSkE0dVYiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL3hmYXB2cXVjd3RwbmR3Z2VuZXByLnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiIyNTc0MmVjMC0zNzYwLTQxNmMtOWY0ZS1jZGE2NDNjZjUxYmUiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzYxNjM0MDI5LCJpYXQiOjE3NjE2MzA0MjksImVtYWlsIjoiYW5kaS50b3B0YWxlbnRAZ21haWwuY29tIiwicGhvbmUiOiIiLCJhcHBfbWV0YWRhdGEiOnsicHJvdmlkZXIiOiJlbWFpbCIsInByb3ZpZGVycyI6WyJlbWFpbCIsImdvb2dsZSJdfSwidXNlcl9tZXRhZGF0YSI6eyJhdmF0YXJfdXJsIjoiaHR0cHM6Ly9saDMuZ29vZ2xldXNlcmNvbnRlbnQuY29tL2EvQUNnOG9jSmNLdHI1WEItZVh4WFdRVTViVDRPZ2lXYklqZEJMb2x3eDhWcFhZLXA3a2lYVkdBdz1zOTYtYyIsImNvbXBhbnlfbmFtZSI6IkNsaWZ0b24iLCJlbWFpbCI6ImFuZGkudG9wdGFsZW50QGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJmaXJzdF9uYW1lIjoiQW5kaSIsImZ1bGxfbmFtZSI6IkFuZGkiLCJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJsYXN0X25hbWUiOiJqYWNrc29uIiwibmFtZSI6IkFuZGkiLCJwaG9uZV92ZXJpZmllZCI6ZmFsc2UsInBpY3R1cmUiOiJodHRwczovL2xoMy5nb29nbGV1c2VyY29udGVudC5jb20vYS9BQ2c4b2NKY0t0cjVYQi1lWHhYV1FVNWJUNE9naVdiSWpkQkxvbHd4OFZwWFktcDdraVhWR0F3PXM5Ni1jIiwicHJvdmlkZXJfaWQiOiIxMDY2MzMxOTk5OTk2NDk4NTYwNDMiLCJzdWIiOiIxMDY2MzMxOTk5OTk2NDk4NTYwNDMifSwicm9sZSI6ImF1dGhlbnRpY2F0ZWQiLCJhYWwiOiJhYWwxIiwiYW1yIjpbeyJtZXRob2QiOiJvYXV0aCIsInRpbWVzdGFtcCI6MTc2MTYyNjgyN31dLCJzZXNzaW9uX2lkIjoiNmEwZjk0NzAtMDE0MC00MjRlLTgzZjgtZjYyODE1M2ExYTUzIiwiaXNfYW5vbnltb3VzIjpmYWxzZX0.JtapL1nEYcfd216692rWdFnHQuR6-pJ4rGPV-4-epNQ'

// 🖥️ Your backend base URL
const BASE_URL = 'http://localhost:3001'

// Helper to print results nicely
async function testEndpoint(path, method = 'GET') {
  const url = `${BASE_URL}${path}`
  console.log(`\n🔹 Testing: ${url}`)
  try {
    const res = await fetch(url, {
      method,
      headers: { Authorization: `Bearer ${SUPABASE_ACCESS_TOKEN}` },
    })
    const text = await res.text()
    console.log('✅ Status:', res.status)
    console.log('📦 Response:', text)
  } catch (err) {
    console.error('❌ Error:', err.message)
  }
}

async function runTests() {
  if (!SUPABASE_ACCESS_TOKEN || SUPABASE_ACCESS_TOKEN.startsWith('PASTE_')) {
    console.error('\n⚠️ Please set your Supabase access token before running this test.')
    process.exit(1)
  }

  console.log('🚀 Starting HubSpot API tests...\n')

  await testEndpoint('/hubspot/auth/status')
  await testEndpoint('/crm/test?provider=hubspot')
  await testEndpoint('/crm/leads?provider=hubspot')
  await testEndpoint('/crm/import?provider=hubspot', 'POST')

  console.log('\n✅ All tests finished.\n')
}

runTests()
