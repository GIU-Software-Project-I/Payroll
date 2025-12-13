const { MongoClient } = require('mongodb');
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

async function run() {
  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  try {
    await client.connect();
    const db = client.db();

    // paygrades
    const paygrades = db.collection('paygrades');
    const pgCount = await paygrades.countDocuments();
    if (pgCount === 0) {
      console.log('Seeding default paygrades...');
      await paygrades.insertMany([
        { grade: 'Junior', baseSalary: 6000, grossSalary: 7000, status: 'approved' },
        { grade: 'Mid', baseSalary: 10000, grossSalary: 12000, status: 'approved' },
        { grade: 'Senior', baseSalary: 20000, grossSalary: 24000, status: 'approved' },
      ]);
    } else {
      console.log('Paygrades already present, skipping');
    }

    // tax rules
    const tax = db.collection('taxrules');
    const taxCount = await tax.countDocuments();
    if (taxCount === 0) {
      console.log('Seeding default tax rule...');
      await tax.insertOne({ name: 'default_flat', rate: 10, status: 'approved' });
    } else {
      console.log('Tax rules already present, skipping');
    }

    // signing bonuses (if missing)
    const signing = db.collection('signingbonuses');
    const signingCount = await signing.countDocuments();
    if (signingCount === 0) {
      console.log('Seeding default signing bonus config...');
      await signing.insertOne({ name: 'default_signing', amount: 1000, status: 'approved' });
    } else {
      console.log('Signing bonus configs present, skipping');
    }

    // termination benefits
    const tbenefits = db.collection('terminationandresignationbenefits');
    const tbCount = await tbenefits.countDocuments();
    if (tbCount === 0) {
      console.log('Seeding default termination benefits...');
      await tbenefits.insertOne({ name: 'default_termination', formula: 'contract', status: 'approved' });
    } else {
      console.log('Termination benefits present, skipping');
    }

    console.log('Seeding complete');
  } catch (err) {
    console.error('Error seeding:', err);
  } finally {
    await client.close();
  }
}

run();
