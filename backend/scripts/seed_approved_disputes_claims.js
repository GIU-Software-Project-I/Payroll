require('dotenv').config();
const mongoose = require('mongoose');

const disputesSchema = new mongoose.Schema({}, { strict: false, collection: 'disputes' });
const claimsSchema = new mongoose.Schema({}, { strict: false, collection: 'claims' });
const employeeProfileSchema = new mongoose.Schema({}, { strict: false, collection: 'employeeprofiles' });

const Dispute = mongoose.model('Dispute', disputesSchema);
const Claim = mongoose.model('Claim', claimsSchema);
const EmployeeProfile = mongoose.model('EmployeeProfile', employeeProfileSchema);

async function seedApprovedDisputesAndClaims() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/payroll_system');
    console.log('Connected to MongoDB');

    // Get some employees
    const employees = await EmployeeProfile.find().limit(5).lean();
    
    if (employees.length === 0) {
      console.log('No employees found. Please run employee seed script first.');
      return;
    }

    console.log(`Found ${employees.length} employees`);

    // Clear existing approved disputes and claims for clean test
    await Dispute.deleteMany({ status: 'approved' });
    await Claim.deleteMany({ status: 'approved' });
    console.log('Cleared existing approved disputes and claims');

    // Create 4 approved disputes
    const disputes = [];
    for (let i = 0; i < 4; i++) {
      const employee = employees[i % employees.length];
      const dispute = {
        employeeId: employee._id,
        disputeType: ['Salary Calculation Error', 'Missing Allowance', 'Deduction Error', 'Tax Miscalculation'][i],
        description: `Dispute description for ${employee.fullName || employee.firstName + ' ' + employee.lastName}`,
        amount: 500 + (i * 250),
        payPeriod: '2025-11',
        status: 'approved',
        priority: ['medium', 'high', 'critical', 'low'][i],
        approvedBy: 'Payroll Manager',
        needsRefund: i % 2 === 0,
        refundStatus: i % 2 === 0 ? 'pending' : 'paid',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      disputes.push(dispute);
    }

    const insertedDisputes = await Dispute.insertMany(disputes);
    console.log(`✅ Created ${insertedDisputes.length} approved disputes`);

    // Create 4 approved claims
    const claims = [];
    for (let i = 0; i < 4; i++) {
      const employee = employees[i % employees.length];
      const claim = {
        employeeId: employee._id,
        claimId: `CLM-2025-${1000 + i}`,
        title: ['Travel Expenses', 'Medical Reimbursement', 'Equipment Purchase', 'Training Course'][i],
        description: `Claim for ${employee.fullName || employee.firstName + ' ' + employee.lastName}`,
        amount: 300 + (i * 150),
        claimType: ['Travel', 'Medical', 'Equipment', 'Training'][i],
        category: ['Travel', 'Medical', 'Equipment', 'Training'][i],
        payPeriod: '2025-11',
        status: 'approved',
        priority: ['low', 'medium', 'high', 'critical'][i],
        approvedBy: 'Payroll Manager',
        approvedAmount: 300 + (i * 150),
        needsRefund: i % 2 === 1,
        refundStatus: i % 2 === 1 ? 'pending' : 'processed',
        resolutionComment: 'Confirmed by Payroll Manager',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      claims.push(claim);
    }

    const insertedClaims = await Claim.insertMany(claims);
    console.log(`✅ Created ${insertedClaims.length} approved claims`);

    console.log('\n📊 Summary:');
    console.log(`   - Approved Disputes: ${insertedDisputes.length}`);
    console.log(`   - Approved Claims: ${insertedClaims.length}`);
    console.log(`   - Total notifications: ${insertedDisputes.length + insertedClaims.length}`);

    await mongoose.connection.close();
    console.log('\n✅ Seeding completed successfully');
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
}

seedApprovedDisputesAndClaims();
