#!/usr/bin/env node
const { MongoClient } = require('mongodb');
(async () => {
  const MONGO = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/payroll';
  console.log('[list-runs] connecting to', MONGO);
  try {
    const client = new MongoClient(MONGO);
    await client.connect();
    const db = client.db();
    const col = db.collection('payrollruns');
    const docs = await col.find({}).sort({ createdAt: -1 }).limit(20).toArray();
    console.log('[list-runs] count=', docs.length);
    docs.forEach(d => console.log(JSON.stringify(d, null, 2)));
    await client.close();
  } catch (err) {
    console.error('[list-runs] error:', err);
    process.exitCode = 1;
  }
})();
