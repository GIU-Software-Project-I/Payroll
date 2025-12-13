#!/usr/bin/env node
const { MongoClient, ObjectId } = require('mongodb');
(async () => {
  const id = process.argv[2];
  if (!id) { console.error('Usage: node fetch-payroll-run.js <runId>'); process.exit(2); }
  const MONGO = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/payroll';
  console.log('[fetch-run] connecting to', MONGO);
  try {
    const client = new MongoClient(MONGO);
    await client.connect();
    const db = client.db();
    const col = db.collection('payrollruns');
    let q = { _id: id };
    try { q = { _id: new ObjectId(id) }; } catch (e) {}
    console.log('[fetch-run] query:', q);
    const doc = await col.findOne(q);
    console.log('[fetch-run] result:', JSON.stringify(doc, null, 2));
    await client.close();
  } catch (err) {
    console.error('[fetch-run] error:', err);
    process.exitCode = 1;
  }
})();
