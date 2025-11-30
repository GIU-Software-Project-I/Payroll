import mongoose from 'mongoose';
const { config } = require('dotenv');
config();

const MONGO = process.env.MONGODB_URI || 'mongodb://localhost:27017/payroll';
const employeeId = process.argv[2] || process.env.EMPLOYEE_ID || null;

async function run() {
  try {
    await mongoose.connect(MONGO, { });
    const db = mongoose.connection.db;

    console.log('Connected to', MONGO);

    const collections = ['payslips', 'claims', 'disputes', 'employees'];
    for (const name of collections) {
      const coll = db.collection(name);
      const count = await coll.countDocuments();
      console.log(`\nCollection ${name} - count: ${count}`);
      const sample = await coll.find().limit(3).toArray();
      console.log('Sample docs:', sample.map(d => ({ _id: d._id, employeeId: d.employeeId || d.payslipId || null, status: d.status || null })));
    }

    if (employeeId) {
      console.log(`\nChecking records for employeeId: ${employeeId}`);
      const pays = await db.collection('payslips').find({ employeeId: employeeId }).toArray();
      console.log('Payslips for employee:', pays.length);
      if (pays.length) console.log(pays.map(p => ({ _id: p._id, gross: p.gross, net: p.net }))); 

      const claims = await db.collection('claims').find({ employeeId: employeeId }).toArray();
      console.log('Claims for employee:', claims.length);
      if (claims.length) console.log(claims.map(c => ({ _id: c._id, amountClaimed: c.amountClaimed, status: c.status })));

      const disputes = await db.collection('disputes').find({ employeeId: employeeId }).toArray();
      console.log('Disputes for employee:', disputes.length);
      if (disputes.length) console.log(disputes.map(d => ({ _id: d._id, type: d.type, status: d.status })));
    } else {
      console.log('\nNo employeeId argument supplied. To check a specific employee pass ID as first arg or set EMPLOYEE_ID env var.');
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error during check:', err);
    process.exit(2);
  }
}

run();
