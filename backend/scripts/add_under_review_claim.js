const mongoose = require('mongoose');
require('dotenv').config();

async function addUnderReviewClaim() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        const Claims = mongoose.connection.db.collection('claims');
        const Employees = mongoose.connection.db.collection('employee_profiles');

        // Get first employee
        const employee = await Employees.findOne();
        if (!employee) {
            console.error('❌ No employees found');
            process.exit(1);
        }

        // Create new claim with under review status
        const newClaim = {
            claimId: `CLAIM-${Date.now()}`,
            employeeId: employee._id,
            claimType: 'travel',
            description: 'Transportation expenses for client meeting',
            amount: 250,
            claimDate: new Date(),
            status: 'under review',
            documents: [],
            createdAt: new Date(),
            updatedAt: new Date()
        };

        await Claims.insertOne(newClaim);
        console.log('✅ Created new claim with "under review" status');
        console.log(`   Claim ID: ${newClaim.claimId}`);
        console.log(`   Amount: $${newClaim.amount}`);
        console.log(`   Status: ${newClaim.status}`);

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n✅ Disconnected');
    }
}

addUnderReviewClaim();
