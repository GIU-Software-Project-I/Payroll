#!/usr/bin/env node
require('dotenv').config();
const mongoose = require('mongoose');

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) return console.error('MONGODB_URI not set');
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  const db = mongoose.connection.db;
  const cols = await db.listCollections().toArray();
  console.log('Collections in DB:');
  for (const c of cols) {
    const count = await db.collection(c.name).countDocuments();
    console.log('-', c.name, count);
  }
  await mongoose.disconnect();
}

main().catch(err => { console.error(err); process.exit(1); });
