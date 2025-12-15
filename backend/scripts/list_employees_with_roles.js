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
    }).sort({ workEmail: 1 }).toArray();

    console.log(`Total Employees: ${employees.length}\n`);
    console.log('='.repeat(100));
    console.log('EMPLOYEE EMAIL'.padEnd(50) + ' | ' + 'ROLE(S)'.padEnd(35) + ' | ' + 'STATUS');
    console.log('='.repeat(100));

    const employeesList = [];

    for (const emp of employees) {
      const roleDoc = await roleColl.findOne({
        employeeProfileId: emp._id
      });

      const roles = roleDoc ? roleDoc.roles : ['NO ROLE ASSIGNED'];
      const isActive = roleDoc ? roleDoc.isActive : false;
      const status = isActive ? 'ACTIVE' : 'INACTIVE';

      const email = emp.workEmail || 'N/A';
      const rolesStr = roles.join(', ');

      console.log(
        email.padEnd(50) + ' | ' + 
        rolesStr.padEnd(35) + ' | ' + 
        status
      );

      employeesList.push({
        email: email,
        roles: roles,
        status: status,
        employeeNumber: emp.employeeNumber || 'N/A',
        name: `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || 'N/A'
      });
    }

    console.log('='.repeat(100));
    console.log(`\nTotal: ${employees.length} employees\n`);

    // Also output as JSON for easy copying
    console.log('\n--- JSON Format ---');
    console.log(JSON.stringify(employeesList, null, 2));

    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();

