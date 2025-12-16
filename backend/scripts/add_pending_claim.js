const mongoose = require('mongoose');
require('dotenv').config();

const claimsSchema = new mongoose.Schema({
    claimId: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    claimType: { type: String, required: true },
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
    financeStaffId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    amount: { type: Number, required: true },
    approvedAmount: { type: Number },
    status: { type: String, enum: ['under review', 'approved', 'rejected'], default: 'under review' },
    rejectionReason: { type: String },
    resolutionComment: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

async function addPendingClaim() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const Claims = mongoose.model('Claims', claimsSchema, 'claims');
        const Employee = mongoose.model('Employee', new mongoose.Schema({}), 'employees');

        // Get any employee
        const employee = await Employee.findOne();
        if (!employee) {
            console.error('No employees found. Please seed employees first.');
            process.exit(1);
        }

        // Add a new claim with "under review" status
        const newClaim = await Claims.create({
            claimId: `CLAIM-${Date.now().toString().slice(-4)}`,
            description: 'Office equipment purchase - ergonomic chair and monitor',
            claimType: 'equipment',
            employeeId: employee._id,
            amount: 850,
            status: 'under review',
            createdAt: new Date(),
            updatedAt: new Date()
        });

        console.log('✅ Successfully added pending claim:', newClaim.claimId);
        console.log('   Status:', newClaim.status);
        console.log('   Amount:', newClaim.amount);

    } catch (error) {
        console.error('Error adding claim:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

addPendingClaim();
