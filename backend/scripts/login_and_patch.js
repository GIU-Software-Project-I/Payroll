(async () => {
  const fetch = (await import('node-fetch')).default;
  try {
    const loginRes = await fetch('http://localhost:8000/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'payroll.spec@example.com', password: 'Payroll@1234' }),
    });
    const loginBody = await loginRes.json();
    console.log('LOGIN BODY:', loginBody);
    const token = loginBody.access_token || '';
    if (!token) {
      console.error('No access token returned');
      process.exit(1);
    }
    const initiationId = '692d2b5b09063ec75ba4b06d';
    const patchRes = await fetch(`http://localhost:8000/payroll-execution/initiation/${initiationId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
      body: JSON.stringify({ exceptions: 2, totalnetpay: 122000 }),
    });
    const body = await patchRes.json();
    console.log('PATCH STATUS', patchRes.status);
    console.log('PATCH BODY', JSON.stringify(body, null, 2));
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
})();
