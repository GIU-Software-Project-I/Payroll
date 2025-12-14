/* Seed script to create a System Admin and a Payroll Specialist for development.

Run:
  $env:MONGODB_URI = 'mongodb://localhost:27017/payroll'
  node scripts/create_admin.js

This script is safe for development only. It will not run in production by default.
*/

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error('MONGODB_URI is not set. Please set MONGODB_URI in your .env file to the Atlas connection string.');
  process.exit(1);
}

if (uri.includes('localhost') || uri.includes('127.0.0.1')) {
  console.error('Refusing to use a localhost MongoDB URI. This project requires a non-localhost MongoDB (use Atlas).');
  process.exit(1);
}

async function hashPassword(p) {
  const saltRounds = 10;
  return bcrypt.hash(p, saltRounds);
}

async function main() {
  if (process.env.NODE_ENV === 'production') {
    console.error('Refusing to run seed script in production');
    process.exit(1);
  }

  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to', uri);

  const db = mongoose.connection;
  const empColl = db.collection('employee_profiles');
  const roleColl = db.collection('employee_system_roles');

  // Helper to upsert an employee
  async function upsertEmployee({ employeeNumber, firstName, lastName, nationalId, workEmail, personalEmail, mobilePhone, password, dateOfHire }) {
    const existing = await empColl.findOne({ $or: [{ workEmail }, { personalEmail }, { nationalId }] });
    if (existing) {
      console.log('employee already exists for', workEmail || personalEmail || nationalId, ' ->', existing._id.toString());
      return existing;
    }

    const hashed = await hashPassword(password);
    const fullName = ['firstName', 'middleName', 'lastName'].map(f => (f === 'middleName' ? null : null)).filter(Boolean);

    const doc = {
      firstName,
      lastName,
      fullName: `${firstName} ${lastName}`,
      nationalId,
      password: hashed,
      workEmail,
      personalEmail,
      mobilePhone,
      employeeNumber,
      dateOfHire: dateOfHire || new Date(),
      status: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const res = await empColl.insertOne(doc);
    console.log('Created employee', res.insertedId.toString());
    return await empColl.findOne({ _id: res.insertedId });
  }

  async function ensureRole(employeeId, roles) {
    const existing = await roleColl.findOne({ employeeProfileId: employeeId });
    if (existing) {
      const newRoles = Array.from(new Set([...(existing.roles || []), ...roles]));
      await roleColl.updateOne({ _id: existing._id }, { $set: { roles: newRoles, isActive: true, updatedAt: new Date() } });
      console.log('Updated roles for', employeeId.toString(), '=>', newRoles);
      return;
    }
    await roleColl.insertOne({ employeeProfileId: employeeId, roles, permissions: [], isActive: true, createdAt: new Date(), updatedAt: new Date() });
    console.log('Inserted roles for', employeeId.toString(), '=>', roles);
  }

  // Create System Admin
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@1234';
  const admin = await upsertEmployee({
    employeeNumber: 'ADMIN-0001',
    firstName: 'System',
    lastName: 'Admin',
    nationalId: 'ADMIN-0001',
    workEmail: 'admin@example.com',
    personalEmail: 'admin@example.com',
    mobilePhone: '+0000000000',
    password: adminPassword,
  });

  await ensureRole(admin._id, ['System Admin', 'HR Admin']);

  // Create Payroll Specialist
  const psPassword = process.env.PAYROLL_SPECIALIST_PASSWORD || 'Payroll@1234';
  const ps = await upsertEmployee({
    employeeNumber: 'PS-0001',
    firstName: 'Payroll',
    lastName: 'Specialist',
    nationalId: 'PS-0001',
    workEmail: 'payroll.spec@example.com',
    personalEmail: 'payroll.spec@example.com',
    mobilePhone: '+0000000001',
    password: psPassword,
  });

  await ensureRole(ps._id, ['Payroll Specialist']);

  console.log('\nSeed complete. Credentials:');
  console.log('Admin -> email: admin@example.com password:', adminPassword);
  console.log('Payroll Specialist -> email: payroll.spec@example.com password:', psPassword);

  await mongoose.disconnect();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
