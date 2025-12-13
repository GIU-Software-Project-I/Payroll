#!/usr/bin/env node
// Automated payroll workflow script
// Usage:
//   node scripts/payroll-workflow.js
// Environment variables (optional):
//   BASE_URL - base API URL (default: http://localhost:8000)
//   EMAIL    - login email (default: payroll.spec@example.com)
//   PASSWORD - login password (default: Payroll@1234)
// Notes:
// - This script uses the global Fetch API (Node 18+). If you run an older Node,
//   install `node-fetch` and adjust the script accordingly.

(async () => {
  const BASE_URL = process.env.BASE_URL || 'http://localhost:8000';
  const EMAIL = process.env.EMAIL || 'payroll.spec@example.com';
  const PASSWORD = process.env.PASSWORD || 'Payroll@1234';

  function log(...args) { console.log('[workflow]', ...args); }

  function extractCookieHeader(headers) {
    // headers may be a Fetch Headers object. Try to obtain set-cookie values.
    try {
      if (typeof headers.get === 'function') {
        const raw = headers.get('set-cookie');
        if (raw) return raw.split(/,(?=[^ ;]+=)/).map(s => s.split(';')[0]).join('; ');
      }
      if (headers.raw && typeof headers.raw === 'function') {
        const arr = headers.raw()['set-cookie'];
        if (arr && arr.length) return arr.map(s => s.split(';')[0]).join('; ');
      }
    } catch (e) {
      // ignore
    }
    return null;
  }

  async function login() {
    const url = `${BASE_URL}/auth/login`;
    log('POST', url, 'email=', EMAIL);
    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
    });

    const text = await resp.text();
    let json = null;
    try { json = JSON.parse(text); } catch (e) { /* not json */ }

    // Prefer access_token in body
    if (json && json.access_token) {
      log('Login returned access_token in body.');
      return { type: 'bearer', token: json.access_token, rawBody: json };
    }

    // Try to extract cookie from headers
    const cookieHeader = extractCookieHeader(resp.headers) || resp.headers.get('set-cookie');
    if (cookieHeader) {
      log('Login returned Set-Cookie header. Using cookie for auth.');
      return { type: 'cookie', cookie: cookieHeader, rawBody: json || text };
    }

    // Nothing useful
    return { type: 'none', rawBody: json || text };
  }

  async function createInitiation(auth) {
    const url = `${BASE_URL}/payroll-execution/initiation`;
    const payload = { payrollPeriod: '2025-12-01', name: 'Auto Run Dec 2025' };
    const headers = { 'Content-Type': 'application/json' };
    if (auth.type === 'bearer') headers['Authorization'] = `Bearer ${auth.token}`;
    if (auth.type === 'cookie') headers['Cookie'] = auth.cookie;

    log('POST', url, 'payload=', payload);
    const resp = await fetch(url, { method: 'POST', headers, body: JSON.stringify(payload) });
    const txt = await resp.text();
    let json = null;
    try { json = JSON.parse(txt); } catch (e) { }
    return { status: resp.status, bodyText: txt, body: json };
  }

  async function approveInitiation(auth, id) {
    const url = `${BASE_URL}/payroll-execution/initiation/${id}/approve`;
    const headers = {};
    if (auth.type === 'bearer') headers['Authorization'] = `Bearer ${auth.token}`;
    if (auth.type === 'cookie') headers['Cookie'] = auth.cookie;

    log('POST', url);
    const resp = await fetch(url, { method: 'POST', headers });
    const txt = await resp.text();
    let json = null;
    try { json = JSON.parse(txt); } catch (e) { }
    return { status: resp.status, bodyText: txt, body: json };
  }

  try {
    const auth = await login();
    log('Login result type=', auth.type);
    if (auth.rawBody && auth.rawBody.user) {
      log('Login user =', auth.rawBody.user);
    }
    if (auth.type === 'none') {
      console.error('Login did not return a token or cookie. Response:', auth.rawBody);
      process.exitCode = 2; return;
    }

    // Create initiation
    const createRes = await createInitiation(auth);
    log('Create status=', createRes.status);
    log('Create body=', createRes.body || createRes.bodyText);
    const createdId = createRes.body?.id;
    if (!createdId) {
      console.error('Create initiation did not return an id. Aborting.');
      process.exitCode = 3; return;
    }

    // Approve
    const approveRes = await approveInitiation(auth, createdId);
    log('Approve status=', approveRes.status);
    log('Approve body=', approveRes.body || approveRes.bodyText);

    log('Workflow finished.');
  } catch (err) {
    console.error('Workflow error:', err);
    process.exitCode = 1;
  }

})();
