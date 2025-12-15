const { MongoClient } = require('mongodb');
require('dotenv').config();

async function fixDepartments() {
    const client = new MongoClient(process.env.MONGODB_URI);
    
    try {
        await client.connect();
        const db = client.db();
        
        // Fix departments - add isActive field
        const result = await db.collection('departments').updateMany(
            {},
            { $set: { isActive: true } }
        );
        console.log('Updated ' + result.modifiedCount + ' departments to isActive: true');
        
        // Verify
        const depts = await db.collection('departments').find({}).toArray();
        console.log('\nDepartments now:');
        depts.forEach(d => console.log('  ' + d.name + ' (isActive: ' + d.isActive + ')'));
        
        // Also check employee counts
        const counts = await db.collection('employee_profiles').aggregate([
            { $match: { status: { $in: ['active', 'Active', 'ACTIVE'] } } },
            { $group: { _id: '$primaryDepartmentId', count: { $sum: 1 } } }
        ]).toArray();
        
        console.log('\nEmployee counts per department:');
        counts.forEach(c => console.log('  DeptId: ' + c._id + ' => ' + c.count + ' employees'));
        
    } finally {
        await client.close();
    }
}

fixDepartments().catch(console.error);
