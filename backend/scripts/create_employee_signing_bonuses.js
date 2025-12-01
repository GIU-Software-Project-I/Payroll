#!/usr/bin/env node
require('dotenv').config();
const mongoose = require('mongoose');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

const argv = yargs(hideBin(process.argv))
  .option('role', { type: 'string', describe: 'Create bonuses for employees with this role (optional)' })
  .option('employeeIds', { type: 'string', describe: 'Comma-separated employee ObjectIds to target' })
  .option('configIds', { type: 'string', describe: 'Comma-separated signingBonus config ObjectIds to use (optional)' })
  .option('limit', { type: 'number', default: 100, describe: 'Limit employees to process' })
  .argv;

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
  console.log('Connected to', uri.replace(/(mongodb\+srv:\/\/).*@/, '$1***@'));

  // use the native DB handle from the established mongoose connection
  const nativeDb = mongoose.connection.db;
  const empColl = nativeDb.collection('employee_profiles');
  const roleColl = nativeDb.collection('employee_system_roles');
  const execColl = nativeDb.collection('employee_signingbonuses');
  // NOTE: collection name used by schema in project is likely 'employeesigningbonuses' or similar; we will detect existing names

  // Try common collection names if default not present
  const possibleExecNames = ['employee_signing_bonuses', 'employee_signingbonuses', 'employeesigningbonuses', 'employeeSigningBonus', 'employee_signing_bonus', 'employeeSigningBonuses', 'employeeSigningBonus'];
  let execCollectionName = null;
  for (const n of possibleExecNames) {
    if ((await nativeDb.listCollections({ name: n }).toArray()).length) {
      execCollectionName = n;
      break;
    }
  }
  if (!execCollectionName) {
    // fallback: create a collection named 'employee_signing_bonuses'
    execCollectionName = 'employee_signing_bonuses';
  }
  const employeeSigningBonusColl = nativeDb.collection(execCollectionName);

  // signing bonus configs
  const signingBonusColl = nativeDb.collection('signingbonuses');
  const configCollectionNames = ['signing_bonus', 'signingBonus', 'signingbonuses', 'signing_bonuses'];
  let signingConfigName = null;
  for (const n of configCollectionNames) {
    if ((await nativeDb.listCollections({ name: n }).toArray()).length) {
      signingConfigName = n;
      break;
    }
  }
  if (!signingConfigName) signingConfigName = 'signingbonuses';
  const signingConfigColl = nativeDb.collection(signingConfigName);

  // build employee filter
  let employeeFilter = {};
  if (argv.employeeIds) {
    const ids = argv.employeeIds.split(',').map(s => s.trim());
    employeeFilter._id = { $in: ids.map(id => mongoose.Types.ObjectId(id)) };
  }

  let employees = [];
  if (argv.role) {
    // find role docs and map to employees
    const roles = await roleColl.find({ roles: argv.role, isActive: true }).limit(argv.limit).toArray();
    const ids = roles.map(r => r.employeeProfileId).filter(Boolean);
    employees = await empColl.find({ _id: { $in: ids } }).limit(argv.limit).toArray();
  } else if (employeeFilter._id) {
    employees = await empColl.find(employeeFilter).toArray();
  } else {
    employees = await empColl.find({}).limit(argv.limit).toArray();
  }

  if (!employees.length) {
    console.log('No employees found for given criteria.');
    await mongoose.disconnect();
    return;
  }

  // find signing bonus configs (approved first)
  let configs = [];
  if (argv.configIds) {
    const ids = argv.configIds.split(',').map(s => s.trim()).map(id => mongoose.Types.ObjectId(id));
    configs = await signingConfigColl.find({ _id: { $in: ids } }).toArray();
  } else {
    configs = await signingConfigColl.find({}).toArray();
  }

  if (!configs.length) {
    console.log('No signing bonus configurations found; aborting.');
    await mongoose.disconnect();
    return;
  }

  const created = [];
  for (const emp of employees) {
    for (const cfg of configs) {
      // check if exists
      const exists = await employeeSigningBonusColl.findOne({ employeeId: emp._id, signingBonusId: cfg._id });
      if (exists) continue;
      const paymentDate = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30); // default 30 days from now
      const doc = { employeeId: emp._id, signingBonusId: cfg._id, paymentDate, status: 'pending', createdAt: new Date(), updatedAt: new Date() };
      const res = await employeeSigningBonusColl.insertOne(doc);
      created.push({ insertedId: res.insertedId.toString(), employeeId: emp._id.toString(), signingBonusId: cfg._id.toString() });
      console.log('Created signing bonus record for employee', emp._id.toString(), 'config', cfg._id.toString());
    }
  }

  console.log('\nCreated:', JSON.stringify(created, null, 2));
  await mongoose.disconnect();
}

main().catch(err => {
  console.error('Error creating employee signing bonuses:', err);
  process.exit(1);
});
