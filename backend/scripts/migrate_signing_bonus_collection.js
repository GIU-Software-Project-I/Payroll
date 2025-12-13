#!/usr/bin/env node
require('dotenv').config();
const mongoose = require('mongoose');

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('MONGODB_URI not set.');
  process.exit(1);
}

async function main() {
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  const nativeDb = mongoose.connection.db;

  const srcName = 'employee_signing_bonuses';
  const dstName = 'employeesigningbonuses';

  const src = nativeDb.collection(srcName);
  const dst = nativeDb.collection(dstName);

  const docs = await src.find({}).toArray();
  if (!docs.length) {
    console.log('No documents to migrate from', srcName);
    await mongoose.disconnect();
    return;
  }

  // Remove _id so Mongo assigns new ids when inserting into dst, or preserve _id if desired
  const toInsert = docs.map(d => {
    const copy = Object.assign({}, d);
    // keep the same employeeId and signingBonusId
    return copy;
  });

  const res = await dst.insertMany(toInsert);
  console.log('Migrated', res.insertedCount, 'documents to', dstName);

  await mongoose.disconnect();
}

main().catch(err => {
  console.error('Migration error:', err);
  process.exit(1);
});
