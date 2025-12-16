const mongoose = require('mongoose');
require('dotenv').config();

async function updateClaimStatus() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const Claims = mongoose.connection.collection('claims');
        
        // Update CLAIM-0003 to "under review" status
        const result = await Claims.updateOne(
            { claimId: 'CLAIM-0003' },
            { 
                $set: { 
                    status: 'under review',
                    rejectionReason: null,
                    approvedAmount: null,
                    updatedAt: new Date()
                }
            }
        );

        if (result.modifiedCount > 0) {
            console.log('✅ Successfully updated CLAIM-0003 to "under review" status');
            console.log('   You can now approve or reject this claim as a Payroll Specialist');
        } else {
            console.log('⚠️  Claim not found or already updated');
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

updateClaimStatus();
