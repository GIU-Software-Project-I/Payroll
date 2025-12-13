#!/usr/bin/env node
// Fetch employee_system_roles document by employeeProfileId
// Usage: node scripts/fetch-employee-role.js <employeeId>

const { MongoClient, ObjectId } = require('mongodb');

(async () => {
  const id = process.argv[2];
  if (!id) { console.error('Usage: node fetch-employee-role.js <employeeId>'); process.exit(2); }
  const MONGO = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/payroll';
  console.log('[fetch-role] connecting to', MONGO);
  try {
    const client = new MongoClient(MONGO);
    await client.connect();
    const db = client.db();
    const col = db.collection('employee_system_roles');
    let q = { employeeProfileId: id };
    try { q = { employeeProfileId: new ObjectId(id) }; } catch (e) {}
    console.log('[fetch-role] query:', q);
    const doc = await col.findOne(q);
    console.log('[fetch-role] result:', doc);
    await client.close();
  } catch (err) {
    console.error('[fetch-role] error:', err);
    process.exitCode = 1;
  }
})();
