#!/usr/bin/env node
require('dotenv').config();
const mongoose = require('mongoose');

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('MONGODB_URI not set. Please set it in .env or environment.');
  process.exit(1);
}

const argv = require('yargs/yargs')(process.argv.slice(2)).options({
  status: { type: 'string', describe: 'Filter by bonus status (pending, approved, paid, rejected)' },
  employeeId: { type: 'string', describe: 'Filter by employee ObjectId' },
  limit: { type: 'number', default: 50, describe: 'Limit results' },
}).argv;

async function main() {
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to', uri.replace(/(mongodb\+srv:\/\/).*@/, '$1***@'));

  const { Schema, Types } = mongoose;

  // Use native DB handle and canonical collection names to ensure we read actual documents
  const nativeDb = mongoose.connection.db;
  const execColl = nativeDb.collection('employeesigningbonuses');
  const configColl = nativeDb.collection('signingbonuses');

  const filter = {};
  if (argv.status) filter.status = argv.status;
  if (argv.employeeId) filter.employeeId = argv.employeeId;

  const execBonuses = await execColl.find(filter).limit(argv.limit).toArray();
  const configBonuses = await configColl.find({}).limit(100).toArray();

  console.log(`Found ${execBonuses.length} employee signing bonus records (showing up to ${argv.limit})`);
  console.log(JSON.stringify(execBonuses, null, 2));

  console.log(`\nFound ${configBonuses.length} signing bonus configurations`);
  console.log(JSON.stringify(configBonuses, null, 2));

  await mongoose.disconnect();
}

main().catch(err => {
  console.error('Error fetching signing bonuses:', err);
  process.exit(1);
});
