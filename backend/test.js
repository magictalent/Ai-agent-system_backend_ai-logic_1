console.log('Running test.js from:', process.cwd());
const fs = require('fs');
console.log('List of files in CWD:', fs.readdirSync(process.cwd()));
require('dotenv').config();
console.log(process.env);
const axios = require('axios');

const apiKey = process.env.HUBSPOT_API_KEY;
const baseUrl = 'https://api.hubapi.com';

console.log('HUBSPOT_API_KEY:', apiKey ? '[loaded]' : '[missing]');

if (!apiKey) {
  console.log('No HUBSPOT_API_KEY found.');
  process.exit(1);
}

console.log('Sending request to HubSpot...');
axios
axios
.get(`${baseUrl}/crm/v3/objects/contacts`, {
  params: {
    hapikey: apiKey,
    limit: 5,
    properties: 'firstname,lastname,email,phone'
  }
})
.then(res => {
  console.log('Contacts:', res.data.results);
})
.catch(err => {
  console.error('Error:', err.response?.data || err.message);
});