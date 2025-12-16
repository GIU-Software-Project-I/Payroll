const mongoose = require('mongoose');
require('dotenv').config();

async function checkEmployees() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Try different collection names
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('\nAvailable collections:');
        collections.forEach(c => console.log(`  - ${c.name}`));

        // Check for employee-like collections
        const employeeCollections = collections.filter(c => 
            c.name.toLowerCase().includes('employee') || 
            c.name.toLowerCase().includes('user')
        );

        for (const col of employeeCollections) {
            const count = await mongoose.connection.db.collection(col.name).countDocuments();
            console.log(`\n${col.name}: ${count} documents`);
            if (count > 0) {
                const sample = await mongoose.connection.db.collection(col.name).findOne();
                console.log('Sample document fields:', Object.keys(sample));
            }
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

checkEmployees();
