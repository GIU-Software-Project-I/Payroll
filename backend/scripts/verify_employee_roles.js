require('dotenv').config();
const mongoose = require('mongoose');

// MongoDB connection URI
const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('MONGODB_URI not set. Please set it in your .env or environment.');
  process.exit(1);
}

async function main() {
  try {
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB\n');

    const db = mongoose.connection;
    const empColl = db.collection('employee_profiles');
    const roleColl = db.collection('employee_system_roles');

    // Find all employees with workEmail
    const employees = await empColl.find({
      workEmail: { $exists: true, $ne: null, $ne: '' }
    }).toArray();

    console.log(`Found ${employees.length} employees\n`);
    console.log('Current Role Assignments:');
    console.log('='.repeat(80));

    for (const emp of employees) {
      const roleDoc = await roleColl.findOne({
        employeeProfileId: emp._id
      });

      const roles = roleDoc ? roleDoc.roles : ['NO ROLE ASSIGNED'];
      const isActive = roleDoc ? roleDoc.isActive : false;
      const status = isActive ? '✓ ACTIVE' : '✗ INACTIVE';

      console.log(`${emp.workEmail.padEnd(40)} | ${roles.join(', ').padEnd(30)} | ${status}`);
    }

    console.log('='.repeat(80));
    console.log('\n✅ Verification complete!');

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();

