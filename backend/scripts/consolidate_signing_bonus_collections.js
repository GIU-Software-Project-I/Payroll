#!/usr/bin/env node
require('dotenv').config();
const { MongoClient, ObjectId } = require('mongodb');

(async function(){
  const uri = process.env.MONGODB_URI;
  if (!uri) { console.error('MONGODB_URI not set'); process.exit(1); }
  const client = new MongoClient(uri);
  await client.connect();
  const dbName = uri.split('/').pop().split('?')[0];
  const db = client.db(dbName);

  const canonical = 'employeesigningbonuses';
  const sources = ['employee_signing_bonuses','employeesigningbonuses','employee_signingbonuses'];

  // ensure canonical exists
  const canonicalColl = db.collection(canonical);

  const moved = [];
  for (const src of sources) {
    if (src === canonical) continue;
    const srcColl = db.collection(src);
    const count = await srcColl.countDocuments();
    if (!count) continue;
    console.log('Migrating', count, 'docs from', src, '->', canonical);
    const docs = await srcColl.find({}).toArray();
    for (const d of docs) {
      // if a doc with same _id already exists in canonical, skip
      const exists = await canonicalColl.findOne({ _id: d._id });
      if (exists) continue;
      // preserve document as-is (including _id types)
      await canonicalColl.insertOne(d);
      moved.push(String(d._id));
    }
    // optionally drop source collection if empty now
    const remaining = await srcColl.countDocuments();
    if (remaining === 0) {
      try { await srcColl.drop(); console.log('Dropped empty source collection', src); } catch (e) { console.log('Drop failed for', src, e.message); }
    }
  }

  console.log('Moved docs (ids):', moved);
  await client.close();
})();
