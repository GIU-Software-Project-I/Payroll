#!/usr/bin/env node
/*
  create_termination_request.js
  Usage:
    node create_termination_request.js --employeeId=<id> --contractId=<id> [--initiator=hr] [--reason="..."] [--terminationDate=2025-12-15]

  Requires MONGODB_URI in environment or .env file. Refuses localhost URIs.
*/
const mongoose = require('mongoose');
const dotenv = require('dotenv');
// simple argv parser to avoid extra dependencies
function parseArgs() {
  const out = {};
  for (const raw of process.argv.slice(2)) {
    if (raw.startsWith('--')) {
      const eq = raw.indexOf('=');
      if (eq === -1) out[raw.slice(2)] = true;
      else out[raw.slice(2, eq)] = raw.slice(eq + 1);
    } else if (raw.startsWith('-')) {
      const key = raw.slice(1);
      out[key] = true;
    }
  }
  return out;
}
const argv = parseArgs();

dotenv.config();
const uri = process.env.MONGODB_URI || process.env.MONGO_URI || process.env.ATLAS_URI;
if (!uri) {
  console.error('MONGODB_URI is required in environment or .env');
  process.exit(1);
}
if (/localhost|127\.0\.0\.1/.test(uri)) {
  console.error('Refusing to run against localhost. Please use Atlas MONGODB_URI.');
  process.exit(1);
}

const employeeId = argv.employeeId || argv.e;
const contractId = argv.contractId || argv.c;
const initiator = argv.initiator || 'hr';
const reason = argv.reason || 'Automated termination request for testing';
const terminationDate = argv.terminationDate ? new Date(argv.terminationDate) : undefined;

if (!employeeId || !contractId) {
  console.error('Please provide --employeeId and --contractId');
  process.exit(1);
}

function isObjectIdString(s) {
  return typeof s === 'string' && /^[0-9a-fA-F]{24}$/.test(s);
}

async function run() {
  try {
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    const db = mongoose.connection.db;
    if (!db) throw new Error('No native db handle');

    const doc = {
      employeeId: isObjectIdString(employeeId) ? new mongoose.Types.ObjectId(employeeId) : employeeId,
      initiator,
      reason,
      contractId: isObjectIdString(contractId) ? new mongoose.Types.ObjectId(contractId) : contractId,
    };
    if (terminationDate && !isNaN(terminationDate.getTime())) doc.terminationDate = terminationDate;

    const collName = 'terminationrequests';
    const coll = db.collection(collName);
    const res = await coll.insertOne(doc);
    console.log('Inserted termination request into', collName, 'with _id=', res.insertedId.toString());
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error creating termination request:', err && err.message ? err.message : err);
    try { await mongoose.disconnect(); } catch (e) {}
    process.exit(1);
  }
}

run();
