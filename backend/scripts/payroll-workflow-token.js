#!/usr/bin/env node
// Simple workflow using a provided Bearer token (skip login)
// Usage:
//   $env:PROVIDED_TOKEN='...'; node .\scripts\payroll-workflow-token.js
// or
//   node .\scripts\payroll-workflow-token.js <TOKEN>

(async () => {
  const BASE_URL = process.env.BASE_URL || 'http://localhost:8000';
  const token = process.env.PROVIDED_TOKEN || process.argv[2];
  if (!token) {
    console.error('No token provided. Set PROVIDED_TOKEN env var or pass as first arg.');
    process.exitCode = 2; return;
  }

  function log(...args) { console.log('[workflow-token]', ...args); }

  async function createInitiation() {
    const url = `${BASE_URL}/payroll-execution/initiation`;
    const payload = { payrollPeriod: '2025-12-01', name: 'Auto Run Dec 2025' };
    log('POST', url, 'payload=', payload);
    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(payload),
    });
    const txt = await resp.text();
    let json = null; try { json = JSON.parse(txt); } catch(e){}
    return { status: resp.status, bodyText: txt, body: json };
  }

  async function approveInitiation(id) {
    const url = `${BASE_URL}/payroll-execution/initiation/${id}/approve`;
    log('POST', url);
    const resp = await fetch(url, { method: 'POST', headers: { 'Authorization': `Bearer ${token}` } });
    const txt = await resp.text();
    let json = null; try { json = JSON.parse(txt); } catch(e){}
    return { status: resp.status, bodyText: txt, body: json };
  }

  try {
    const createRes = await createInitiation();
    log('Create status=', createRes.status);
    log('Create body=', createRes.body || createRes.bodyText);
    const createdId = createRes.body?.id;
    if (!createdId) {
      console.error('Create initiation did not return an id. Aborting.');
      process.exitCode = 3; return;
    }

    const approveRes = await approveInitiation(createdId);
    log('Approve status=', approveRes.status);
    log('Approve body=', approveRes.body || approveRes.bodyText);
    log('Done.');
  } catch (err) {
    console.error('Workflow error:', err);
    process.exitCode = 1;
  }
})();
