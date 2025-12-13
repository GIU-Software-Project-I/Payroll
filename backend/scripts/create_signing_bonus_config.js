#!/usr/bin/env node
require('dotenv').config();
const mongoose = require('mongoose');

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('MONGODB_URI not set. Please set it in your .env or environment.');
  process.exit(1);
}
if (uri.includes('localhost') || uri.includes('127.0.0.1')) {
  console.error('Refusing to use a localhost MongoDB URI. This project requires a non-localhost MongoDB (use Atlas).');
  process.exit(1);
}
if (process.env.NODE_ENV === 'production') {
  console.error('Refusing to run seed script in production');
  process.exit(1);
}

async function main() {
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  const nativeDb = mongoose.connection.db;
  const signingConfigColl = nativeDb.collection('signingbonuses');

  const doc = {
    name: 'Default Signing Bonus Config',
    amount: 1000,
    currency: 'USD',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    notes: 'Auto-created default config for testing'
  };

  const res = await signingConfigColl.insertOne(doc);
  console.log('Inserted signing bonus config id:', res.insertedId.toString());
  await mongoose.disconnect();
}

main().catch(err => {
  console.error('Error inserting signing bonus config:', err);
  process.exit(1);
});
