const mongoose = require('mongoose');
require('dotenv').config();

async function checkDisputes() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        const disputes = await mongoose.connection.db.collection('disputes').find({}).toArray();
        
        console.log(`Found ${disputes.length} disputes:\n`);
        disputes.forEach(dispute => {
            console.log(`ID: ${dispute._id}`);
            console.log(`DisputeId: ${dispute.disputeId}`);
            console.log(`Status: "${dispute.status}"`);
            console.log(`Description: ${dispute.description}`);
            console.log(`Amount: $${dispute.amount}`);
            console.log(`Priority: ${dispute.priority}`);
            console.log(`Type: ${dispute.type || 'N/A'}`);
            console.log(`Created: ${dispute.createdAt}`);
            console.log(`Updated: ${dispute.updatedAt}`);
            console.log('---');
        });

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n✅ Disconnected');
    }
}

checkDisputes();
