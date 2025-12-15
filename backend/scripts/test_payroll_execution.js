#!/usr/bin/env node
// Test payroll execution script
require('dotenv').config();

(async () => {
  const BASE_URL = 'http://localhost:3000';
  const EMAIL = 'payroll.spec@example.com';
  const PASSWORD = 'Payroll@1234';

  console.log('Logging in...');
  const loginResp = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  
  const loginData = await loginResp.json();
  if (!loginData.access_token) {
    console.error('Login failed:', loginData);
    process.exit(1);
  }
  console.log('Logged in successfully');

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${loginData.access_token}`
  };

  // Create payroll initiation
  console.log('\nCreating payroll initiation for HR department...');
  const createResp = await fetch(`${BASE_URL}/payroll-execution/initiation`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      payrollPeriod: '2025-12-31',
      entity: 'HR',
      entityId: '693a80037e07119e5fd6a889'
    }),
  });

  const createData = await createResp.json();
  console.log('Create status:', createResp.status);
  console.log('Create response:', JSON.stringify(createData, null, 2));

  if (!createData._id && !createData.id) {
    console.error('Failed to create initiation');
    process.exit(1);
  }

  const initiationId = createData._id || createData.id;
  console.log('Created initiation ID:', initiationId);

  // Approve the initiation to trigger processing
  console.log('\nApproving initiation (this will process payroll)...');
  const approveResp = await fetch(`${BASE_URL}/payroll-execution/initiation/${initiationId}/approve`, {
    method: 'POST',
    headers,
  });

  const approveData = await approveResp.json();
  console.log('Approve status:', approveResp.status);
  console.log('Approve response:', JSON.stringify(approveData, null, 2));

  // Fetch the draft to see results
  console.log('\nFetching payroll results...');
  const draftResp = await fetch(`${BASE_URL}/payroll-execution/draft/${initiationId}`, {
    method: 'GET',
    headers,
  });

  const draftData = await draftResp.json();
  console.log('Draft status:', draftResp.status);
  console.log('Draft response:', JSON.stringify(draftData, null, 2));

  console.log('\n=== PAYROLL TEST COMPLETE ===');
})();
