#!/usr/bin/env node
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

const argv = yargs(hideBin(process.argv))
  .option('count', { type: 'number', default: 5, describe: 'How many employees to create' })
  .option('role', { type: 'string', default: 'Payroll Specialist', describe: 'SystemRole to assign' })
  .option('prefix', { type: 'string', default: 'emp', describe: 'Email/employeeNumber prefix' })
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

async function hashPassword(password) {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

async function main() {
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to', uri.replace(/(mongodb\+srv:\/\/).*@/, '$1***@'));

  const db = mongoose.connection;
  const empColl = db.collection('employee_profiles');
  const roleColl = db.collection('employee_system_roles');

  const created = [];
  for (let i = 0; i < argv.count; i++) {
    const idx = Date.now().toString().slice(-6) + '-' + i;
    const employeeNumber = `${argv.prefix.toUpperCase()}-${idx}`;
    const workEmail = `${argv.prefix}${idx}@example.com`;
    const personalEmail = workEmail;
    const nationalId = `NID-${idx}`;

    // check duplicates
    const existing = await empColl.findOne({ $or: [{ workEmail }, { personalEmail }, { nationalId }, { employeeNumber }] });
    if (existing) {
      console.log('Skipping existing employee for', workEmail);
      continue;
    }

    const password = process.env.DEFAULT_EMPLOYEE_PASSWORD || 'Test@1234';
    const hashed = await hashPassword(password);

    const doc = {
      firstName: `Auto${i}`,
      middleName: undefined,
      lastName: 'User',
      fullName: `Auto${i} User`,
      nationalId,
      password: hashed,
      workEmail,
      personalEmail,
      mobilePhone: '+0000000000',
      employeeNumber,
      dateOfHire: new Date(),
      status: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const res = await empColl.insertOne(doc);
    const empId = res.insertedId;
    console.log('Created employee', workEmail, 'id', empId.toString());

    // create system role
    const roles = [argv.role];
    await roleColl.insertOne({ employeeProfileId: empId, roles, permissions: [], isActive: true, createdAt: new Date(), updatedAt: new Date() });

    created.push({ _id: empId.toString(), workEmail, password });
  }

  console.log('\nCreated employees:');
  console.log(JSON.stringify(created, null, 2));

  await mongoose.disconnect();
}

main().catch(err => {
  console.error('Error creating employees:', err);
  process.exit(1);
});
