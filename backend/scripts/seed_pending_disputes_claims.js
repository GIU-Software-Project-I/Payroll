require('dotenv').config();
const mongoose = require('mongoose');

const disputesSchema = new mongoose.Schema({}, { strict: false, collection: 'disputes' });
const claimsSchema = new mongoose.Schema({}, { strict: false, collection: 'claims' });
const employeeProfileSchema = new mongoose.Schema({}, { strict: false, collection: 'employeeprofiles' });

const Dispute = mongoose.model('Dispute', disputesSchema);
const Claim = mongoose.model('Claim', claimsSchema);
const EmployeeProfile = mongoose.model('EmployeeProfile', employeeProfileSchema);

async function seedPendingDisputesAndClaims() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/payroll_system');
    console.log('Connected to MongoDB');

    // Try to get employees, if not found create fake employee IDs
    let employees = await EmployeeProfile.find().limit(5).lean();
    
    if (employees.length === 0) {
      console.log('No employees found. Creating with fake employee IDs...');
      // Create fake employee structure
      employees = [
        { _id: new mongoose.Types.ObjectId(), firstName: 'John', lastName: 'Doe', department: 'Engineering' },
        { _id: new mongoose.Types.ObjectId(), firstName: 'Jane', lastName: 'Smith', department: 'Sales' },
        { _id: new mongoose.Types.ObjectId(), firstName: 'Bob', lastName: 'Johnson', department: 'Marketing' },
        { _id: new mongoose.Types.ObjectId(), firstName: 'Alice', lastName: 'Williams', department: 'HR' },
        { _id: new mongoose.Types.ObjectId(), firstName: 'Charlie', lastName: 'Brown', department: 'Finance' },
      ];
    }

    console.log(`Using ${employees.length} employees`);

    // Create 5 PENDING disputes (for Payroll Specialist to approve)
    const disputes = [];
    for (let i = 0; i < 5; i++) {
      const employee = employees[i % employees.length];
      const dispute = {
        disputeId: `DISP-${2000 + i}`,
        employeeId: employee._id,
        disputeType: ['Salary Calculation Error', 'Missing Allowance', 'Deduction Error', 'Tax Miscalculation', 'Bonus Dispute'][i],
        description: `This dispute needs to be reviewed by Payroll Specialist. Employee ${employee.firstName} ${employee.lastName} reports an issue.`,
        amount: 400 + (i * 200),
        payPeriod: '2025-12',
        status: 'pending', // PENDING - needs Payroll Specialist approval
        priority: ['medium', 'high', 'critical', 'low', 'high'][i],
        department: employee.department || 'Engineering',
        needsRefund: true,
        refundStatus: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      disputes.push(dispute);
    }

    const insertedDisputes = await Dispute.insertMany(disputes);
    console.log(`✅ Created ${insertedDisputes.length} PENDING disputes for Payroll Specialist approval`);

    // Create 5 PENDING claims (for Payroll Specialist to approve)
    const claims = [];
    for (let i = 0; i < 5; i++) {
      const employee = employees[i % employees.length];
      const claim = {
        claimId: `CLM-${3000 + i}`,
        employeeId: employee._id,
        title: ['Travel Reimbursement', 'Medical Expense', 'Office Supplies', 'Training Fee', 'Meal Allowance'][i],
        description: `Claim submitted by ${employee.firstName} ${employee.lastName} awaiting Payroll Specialist review.`,
        amount: 250 + (i * 100),
        claimType: ['Travel', 'Medical', 'Equipment', 'Training', 'Meal'][i],
        category: ['Travel', 'Medical', 'Equipment', 'Training', 'Meal'][i],
        payPeriod: '2025-12',
        status: 'pending', // PENDING - needs Payroll Specialist approval
        priority: ['low', 'medium', 'high', 'critical', 'medium'][i],
        department: employee.department || 'Engineering',
        needsRefund: true,
        refundStatus: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      claims.push(claim);
    }

    const insertedClaims = await Claim.insertMany(claims);
    console.log(`✅ Created ${insertedClaims.length} PENDING claims for Payroll Specialist approval`);

    console.log('\n📊 Summary:');
    console.log(`   - Pending Disputes: ${insertedDisputes.length}`);
    console.log(`   - Pending Claims: ${insertedClaims.length}`);
    console.log(`   - Total items to approve: ${insertedDisputes.length + insertedClaims.length}`);
    console.log('\n✅ Now login as Payroll Specialist to approve these disputes and claims!');

    await mongoose.connection.close();
    console.log('\n✅ Seeding completed successfully');
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
}

seedPendingDisputesAndClaims();
