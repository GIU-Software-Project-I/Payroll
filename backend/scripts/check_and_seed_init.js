const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('MONGODB_URI not set in .env');
  process.exit(1);
}
if (uri.includes('localhost') || uri.includes('127.0.0.1')) {
  console.error('Refusing to run seed on localhost. Use Atlas URI.');
  process.exit(1);
}

async function ensureCollectionHasDefaults(db) {
  // paygrades, taxrules, signingbonuses, terminationandresignationbenefits
  const paygrades = db.collection('paygrades');
  const pgCount = await paygrades.countDocuments();
  if (pgCount === 0) {
    console.log('Seeding default paygrades...');
    await paygrades.insertMany([
      { grade: 'Junior', baseSalary: 6000, grossSalary: 7000, status: 'approved' },
      { grade: 'Mid', baseSalary: 10000, grossSalary: 12000, status: 'approved' },
      { grade: 'Senior', baseSalary: 20000, grossSalary: 24000, status: 'approved' },
    ]);
  } else console.log('Paygrades present');

  const tax = db.collection('taxrules');
  const taxCount = await tax.countDocuments();
  if (taxCount === 0) {
    console.log('Seeding default tax rule...');
    await tax.insertOne({ name: 'default_flat', rate: 10, status: 'approved' });
  } else console.log('Tax rules present');

  const signing = db.collection('signingbonuses');
  const signingCount = await signing.countDocuments();
  if (signingCount === 0) {
    console.log('Seeding default signing bonus config...');
    await signing.insertOne({ name: 'default_signing', amount: 1000, status: 'approved' });
  } else console.log('Signing bonus config present');

  const tbenefits = db.collection('terminationandresignationbenefits');
  const tbCount = await tbenefits.countDocuments();
  if (tbCount === 0) {
    console.log('Seeding default termination benefits...');
    await tbenefits.insertOne({ name: 'default_termination', formula: 'contract', status: 'approved' });
  } else console.log('Termination benefits present');
}

async function ensurePayrollSpecialist(db) {
  // Try to find an existing payroll specialist in employee_system_roles
  const rolesColl = db.collection('employee_system_roles');
  const existing = await rolesColl.findOne({ roles: { $in: ['Payroll Specialist'] } });
  if (existing) {
    console.log('Found existing payroll specialist role for employee:', existing.employeeProfileId);
    return existing.employeeProfileId;
  }

  // If none, create a minimal employee profile and role record
  const profiles = db.collection('employee_profiles');
  const email = 'payroll.spec@example.com';
  let profile = await profiles.findOne({ workEmail: email });
  if (!profile) {
    const newProfile = {
      firstName: 'Payroll',
      lastName: 'Spec',
      workEmail: email,
      employeeNumber: 'PS-SEED-001',
      dateOfHire: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const res = await profiles.insertOne(newProfile);
    profile = await profiles.findOne({ _id: res.insertedId });
    console.log('Inserted employee profile:', profile._id.toString());
  } else {
    console.log('Found existing employee profile:', profile._id.toString());
  }

  const roleRec = { employeeProfileId: profile._id, roles: ['Payroll Specialist'], createdAt: new Date() };
  await rolesColl.insertOne(roleRec);
  console.log('Inserted employee_system_roles for', profile._id.toString());
  return profile._id;
}

async function ensurePayrollRun(db, specialistId) {
  const runs = db.collection('payrollruns');
  // Check if there is a recent test run for period 2025-11-30
  const period = new Date('2025-11-30');
  const existing = await runs.findOne({ payrollPeriod: period });
  if (existing) {
    console.log('Found existing payroll run:', existing._id.toString());
    return existing._id;
  }

  const run = {
    runId: `PR-SEED-${Date.now()}`,
    payrollPeriod: period,
    status: 'draft',
    entity: 'Acme Corp',
    employees: 120,
    exceptions: 3,
    totalnetpay: 123456.78,
    payrollSpecialistId: specialistId,
    payrollManagerId: specialistId,
    paymentStatus: 'pending',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  const res = await runs.insertOne(run);
  console.log('Inserted payroll run:', res.insertedId.toString());
  return res.insertedId;
}

async function main() {
  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  try {
    await client.connect();
    const db = client.db();
    console.log('Connected to', (await db.admin().serverStatus()).host || 'database employee content cluster');

    await ensureCollectionHasDefaults(db);
    const specialistId = await ensurePayrollSpecialist(db);
    await ensurePayrollRun(db, specialistId);

    console.log('Check and seed complete');
  } catch (err) {
    console.error('Error:', err);
    process.exitCode = 1;
  } finally {
    await client.close();
  }
}

if (require.main === module) main();
