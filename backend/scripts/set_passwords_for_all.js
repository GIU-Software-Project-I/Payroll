require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// MongoDB connection URI - get from environment
const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('MONGODB_URI not set. Please set it in your .env or environment.');
  process.exit(1);
}

const saltRounds = 10;
const defaultPassword = 'RoleUser@1234';

async function hashPassword(password) {
  return bcrypt.hash(password, saltRounds);
}

async function main() {
  try {
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB');

    const db = mongoose.connection;
    const empColl = db.collection('employee_profiles');

    // Find all employees with workEmail (they need passwords to login)
    const employees = await empColl.find({
      workEmail: { $exists: true, $ne: null, $ne: '' }
    }).toArray();

    console.log(`Found ${employees.length} employees with workEmail`);

    // Hash the password once
    const hashedPassword = await hashPassword(defaultPassword);
    console.log('Password hashed successfully');

    let updated = 0;
    let skipped = 0;

    // Update all employees with the hashed password
    for (const emp of employees) {
      // Check if employee already has a password
      if (emp.password && emp.password.startsWith('$2')) {
        console.log(`Skipping ${emp.workEmail} - already has a password`);
        skipped++;
        continue;
      }

      const result = await empColl.updateOne(
        { _id: emp._id },
        { $set: { password: hashedPassword } }
      );

      if (result.modifiedCount > 0) {
        console.log(`✓ Set password for ${emp.workEmail || emp.employeeNumber || emp._id}`);
        updated++;
      }
    }

    console.log('\n=== Summary ===');
    console.log(`Total employees: ${employees.length}`);
    console.log(`Updated: ${updated}`);
    console.log(`Skipped (already had password): ${skipped}`);
    console.log(`\nDefault password set: ${defaultPassword}`);
    console.log('\n✅ Password update complete!');

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();

