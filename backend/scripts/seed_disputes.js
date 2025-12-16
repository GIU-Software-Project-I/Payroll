const mongoose = require('mongoose');
require('dotenv').config();

const disputesSchema = new mongoose.Schema({
    disputeId: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
    payrollRunId: { type: mongoose.Schema.Types.ObjectId, ref: 'PayrollRun' },
    payslipId: { type: mongoose.Schema.Types.ObjectId, ref: 'paySlip' },
    amount: { type: Number },
    status: { type: String, enum: ['pending', 'under review', 'resolved', 'rejected', 'pending_review', 'under_review', 'approved_by_specialist', 'escalated'], default: 'pending' },
    priority: { type: String, enum: ['low', 'medium', 'high', 'urgent', 'critical'], default: 'medium' },
    type: { type: String, enum: ['salary', 'deduction', 'hours', 'other'], default: 'other' },
    resolutionComment: { type: String },
    rejectionReason: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

async function seedDisputes() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const Disputes = mongoose.model('Disputes', disputesSchema, 'disputes');
        const Employee = mongoose.model('Employee', new mongoose.Schema({}), 'employee_profiles');

        // Clear existing disputes
        await Disputes.deleteMany({});
        console.log('🧹 Cleared existing disputes');

        // Get employees
        const employees = await Employee.find().limit(3);
        if (employees.length === 0) {
            console.error('❌ No employees found. Please seed employees first.');
            process.exit(1);
        }

        // Create sample disputes
        const disputes = [
            {
                disputeId: 'DISPUTE-0001',
                description: 'Overtime hours not calculated correctly in last payroll',
                employeeId: employees[0]._id,
                amount: 450,
                status: 'pending_review',
                priority: 'high',
                type: 'hours',
                resolutionComment: null,
                rejectionReason: null,
                createdAt: new Date('2025-12-05'),
                updatedAt: new Date('2025-12-05')
            },
            {
                disputeId: 'DISPUTE-0002',
                description: 'Missing performance bonus from Q4 results',
                employeeId: employees[1]?._id || employees[0]._id,
                amount: 2000,
                status: 'pending_review',
                priority: 'medium',
                type: 'salary',
                resolutionComment: null,
                rejectionReason: null,
                createdAt: new Date('2025-12-10'),
                updatedAt: new Date('2025-12-10')
            },
            {
                disputeId: 'DISPUTE-0003',
                description: 'Incorrect tax deduction applied to salary',
                employeeId: employees[2]?._id || employees[0]._id,
                amount: 320,
                status: 'under_review',
                priority: 'critical',
                type: 'deduction',
                resolutionComment: null,
                rejectionReason: null,
                createdAt: new Date('2025-12-12'),
                updatedAt: new Date('2025-12-12')
            },
            {
                disputeId: 'DISPUTE-0004',
                description: 'Leave days deduction error in payroll calculation',
                employeeId: employees[0]._id,
                amount: 180,
                status: 'approved_by_specialist',
                priority: 'low',
                type: 'deduction',
                resolutionComment: 'Verified and corrected in system. Adjustment will be made in next payroll.',
                rejectionReason: null,
                createdAt: new Date('2025-12-01'),
                updatedAt: new Date('2025-12-03')
            }
        ];

        const result = await Disputes.insertMany(disputes);
        console.log(`✅ Successfully seeded ${result.length} disputes`);
        console.log('\nDisputes created:');
        result.forEach(dispute => {
            console.log(`  - ${dispute.disputeId}: ${dispute.status} (${dispute.priority}) - $${dispute.amount}`);
        });

    } catch (error) {
        console.error('❌ Error seeding disputes:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n✅ Disconnected from MongoDB');
    }
}

seedDisputes();
