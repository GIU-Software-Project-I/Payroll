#!/usr/bin/env node
require('dotenv').config();
const mongoose = require('mongoose');

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) return console.error('MONGODB_URI not set');
  
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  const db = mongoose.connection.db;
  
  const runId = '693a80087e07119e5fd6a96b';
  
  // Delete payroll run
  const runResult = await db.collection('payrollruns').deleteOne({
    _id: new mongoose.Types.ObjectId(runId)
  });
  console.log('Deleted payroll run:', runResult.deletedCount);
  
  // Delete related payroll details
  const detailsResult = await db.collection('employeepayrolldetails').deleteMany({
    payrollRunId: new mongoose.Types.ObjectId(runId)
  });
  console.log('Deleted payroll details:', detailsResult.deletedCount);
  
  // Delete related payslips
  const payslipsResult = await db.collection('payslips').deleteMany({
    payrollRunId: new mongoose.Types.ObjectId(runId)
  });
  console.log('Deleted payslips:', payslipsResult.deletedCount);
  
  console.log('Cleanup complete');
  await mongoose.disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
