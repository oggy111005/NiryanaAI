const fs = require('fs');
const path = require('path');

const tenderContent = `
PROCUREMENT TENDER #99102

1. Objective
The objective of this procurement is to acquire high-quality construction materials for the new bridge project.

2. Technical Requirements
The contractor must supply Ordinary Portland Cement that meets all physical and chemical requirements. It must be suitable for high-strength concrete applications and pass rigorous compression tests.

3. Safety Standards
All materials must be non-toxic and safe for handling.
`;

fs.writeFileSync('tender.txt', tenderContent);

async function run() {
  // Login to get token
  let token = '';
  try {
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'adminpassword', role: 'admin' })
    });
    const loginData = await loginRes.json();
    token = loginData.token;
  } catch (err) {
    console.error('Login failed', err);
    return;
  }

  // Use Node.js native FormData (available in Node 18+)
  const form = new FormData();
  const fileBlob = new Blob([fs.readFileSync('tender.txt')], { type: 'text/plain' });
  form.append('file', fileBlob, 'tender.txt');

  try {
    const res = await fetch('http://localhost:5000/api/analyze-tender', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: form
    });
    
    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
  } catch (err) {
    console.error(err);
  }
}

run();

