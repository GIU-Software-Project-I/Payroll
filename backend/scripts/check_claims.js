const mongoose = require('mongoose');
require('dotenv').config();

async function checkClaims() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB\n');

        const Claims = mongoose.connection.collection('claims');
        
        // Get all claims
        const allClaims = await Claims.find({}).toArray();
        
        console.log(`📊 Total Claims: ${allClaims.length}\n`);
        
        // Group by status
        const statusCounts = {};
        allClaims.forEach(claim => {
            const status = claim.status || 'undefined';
            statusCounts[status] = (statusCounts[status] || 0) + 1;
        });
        
        console.log('Status breakdown:');
        Object.entries(statusCounts).forEach(([status, count]) => {
            console.log(`  - ${status}: ${count}`);
        });
        
        console.log('\n📋 Claims Details:');
        allClaims.forEach(claim => {
            console.log(`  ${claim.claimId}: ${claim.status} - ${claim.description.substring(0, 50)}...`);
        });

        // Check for "under review" status
        const underReview = allClaims.filter(c => c.status === 'under review');
        console.log(`\n✅ Claims with "under review" status: ${underReview.length}`);
        
        if (underReview.length === 0) {
            console.log('\n⚠️  No claims with "under review" status found!');
            console.log('   Creating a new one...\n');
            
            const Employee = mongoose.connection.collection('employees');
            const employee = await Employee.findOne({});
            
            if (employee) {
                await Claims.insertOne({
                    claimId: `CLAIM-${Date.now().toString().slice(-4)}`,
                    description: 'Office equipment purchase - ergonomic chair and standing desk',
                    claimType: 'equipment',
                    employeeId: employee._id,
                    amount: 1200,
                    status: 'under review',
                    createdAt: new Date(),
                    updatedAt: new Date()
                });
                console.log('✅ Created new claim with "under review" status');
            }
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

checkClaims();
