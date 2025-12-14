/**
 * Script to update user roles in the database
 * Usage: node scripts/update_user_role.js <email> <role>
 * 
 * Available roles:
 * - "department employee"
 * - "department head"
 * - "HR Manager"
 * - "HR Employee"
 * - "Payroll Specialist"
 * - "Payroll Manager"
 * - "System Admin"
 * - "Legal & Policy Admin"
 * - "Recruiter"
 * - "Finance Staff"
 * - "Job Candidate"
 * - "HR Admin"
 */

require('dotenv').config();
const { MongoClient, ObjectId } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/payroll';

async function main() {
    const email = process.argv[2];
    const roleToAdd = process.argv[3];

    if (!email) {
        console.log('Usage: node scripts/update_user_role.js <email> [role]');
        console.log('\nIf role is not provided, script will show current roles');
        console.log('\nAvailable roles:');
        console.log('  - "Payroll Specialist"');
        console.log('  - "Payroll Manager"');
        console.log('  - "HR Manager"');
        console.log('  - "System Admin"');
        console.log('  - "department employee"');
        console.log('  - "department head"');
        process.exit(1);
    }

    const client = new MongoClient(MONGODB_URI);

    try {
        await client.connect();
        console.log('Connected to MongoDB');

        const db = client.db();

        // Find the employee by work email
        const employee = await db.collection('employee_profiles').findOne({
            workEmail: email
        });

        if (!employee) {
            console.log(`Employee with email "${email}" not found`);
            process.exit(1);
        }

        console.log(`\nFound employee: ${employee.firstName} ${employee.lastName}`);
        console.log(`Employee ID: ${employee._id}`);

        // Find or create the system role document
        let systemRole = await db.collection('employee_system_roles').findOne({
            employeeProfileId: employee._id
        });

        if (systemRole) {
            console.log(`\nCurrent roles: ${systemRole.roles.join(', ') || 'None'}`);
            console.log(`Is Active: ${systemRole.isActive}`);
        } else {
            console.log('\nNo system role document found for this employee');
        }

        if (roleToAdd) {
            if (systemRole) {
                // Check if role already exists
                if (systemRole.roles.includes(roleToAdd)) {
                    console.log(`\nRole "${roleToAdd}" already exists for this user`);
                } else {
                    // Add the role
                    const result = await db.collection('employee_system_roles').updateOne(
                        { employeeProfileId: employee._id },
                        {
                            $addToSet: { roles: roleToAdd },
                            $set: { isActive: true }
                        }
                    );

                    if (result.modifiedCount > 0) {
                        console.log(`\n✅ Successfully added role "${roleToAdd}"`);
                    }
                }
            } else {
                // Create new system role document
                const result = await db.collection('employee_system_roles').insertOne({
                    employeeProfileId: employee._id,
                    roles: [roleToAdd],
                    permissions: [],
                    isActive: true,
                    createdAt: new Date(),
                    updatedAt: new Date()
                });

                console.log(`\n✅ Created system role document with role "${roleToAdd}"`);
            }

            // Show updated roles
            const updatedRole = await db.collection('employee_system_roles').findOne({
                employeeProfileId: employee._id
            });
            console.log(`Updated roles: ${updatedRole.roles.join(', ')}`);
        }

        console.log('\n⚠️  Note: User must log out and log back in for role changes to take effect (JWT needs to be refreshed)');

    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    } finally {
        await client.close();
    }
}

main();
