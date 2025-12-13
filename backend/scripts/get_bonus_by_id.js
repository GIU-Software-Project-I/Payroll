#!/usr/bin/env node
require('dotenv').config();
const { MongoClient, ObjectId } = require('mongodb');

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('MONGODB_URI not set');
  process.exit(1);
}

const id = process.argv[2];
if (!id) {
  console.error('Usage: node get_bonus_by_id.js <id>');
  process.exit(1);
}

async function main() {
  const client = new MongoClient(uri);
  await client.connect();
  const dbName = uri.split('/').pop().split('?')[0];
  const db = client.db(dbName);
  const coll = db.collection('employeesigningbonuses');
  const doc = await coll.findOne({ _id: new ObjectId(id) });
  console.log(JSON.stringify(doc, null, 2));
  await client.close();
}

main().catch(err => { console.error(err); process.exit(1); });
