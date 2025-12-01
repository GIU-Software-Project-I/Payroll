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

  const employeeSigningBonusSchema = new Schema({
    employeeId: { type: Types.ObjectId, ref: 'EmployeeProfile', required: true },
    signingBonusId: { type: Types.ObjectId, ref: 'signingBonus', required: true },
    paymentDate: Date,
    status: String,
  }, { timestamps: true });

  const signingBonusSchema = new Schema({
    positionName: String,
    amount: Number,
    status: String,
    createdBy: Types.ObjectId,
    approvedBy: Types.ObjectId,
    approvedAt: Date,
  }, { timestamps: true });

  const EmployeeSigningBonus = mongoose.model('employeeSigningBonus', employeeSigningBonusSchema);
  const SigningBonus = mongoose.model('signingBonus', signingBonusSchema);

  const filter = {};
  if (argv.status) filter.status = argv.status;
  if (argv.employeeId) filter.employeeId = argv.employeeId;

  const [execBonuses, configBonuses] = await Promise.all([
    EmployeeSigningBonus.find(filter).limit(argv.limit).lean().exec(),
    SigningBonus.find().limit(100).lean().exec(),
  ]);

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
