const { MongoClient, ObjectId } = require('mongodb');
const bcrypt = require('bcrypt');
require('dotenv').config();

async function fixEmployeeProfiles() {
    const client = new MongoClient(process.env.MONGODB_URI);
    
    try {
        await client.connect();
        const db = client.db();
        
        // Hash password
        const hashedPassword = await bcrypt.hash('RoleUser@1234', 10);
        console.log('Hashed password created');
        
        // Get existing system roles (which have email info)
        const systemRoles = await db.collection('employee_system_roles').find({}).toArray();
        console.log('Found ' + systemRoles.length + ' system roles');
        
        // Delete existing employee_profiles and recreate with proper data
        await db.collection('employee_profiles').deleteMany({});
        console.log('Cleared employee_profiles collection');
        
        const departments = await db.collection('departments').find({}).toArray();
        const positions = await db.collection('positions').find({}).toArray();
        const payGrades = await db.collection('paygrades').find({}).toArray();
        
        // Create employee profiles with proper workEmail and password
        const profiles = [];
        for (let i = 0; i < systemRoles.length; i++) {
            const role = systemRoles[i];
            const profileId = new ObjectId();
            
            // Extract name from email (e.g., "hr.manager@company.com" -> "HR Manager")
            const emailName = role.workEmail.split('@')[0].replace('.', ' ');
            const nameParts = emailName.split(' ').map(p => p.charAt(0).toUpperCase() + p.slice(1));
            const firstName = nameParts[0] || 'Employee';
            const lastName = nameParts[1] || 'User';
            
            profiles.push({
                _id: profileId,
                firstName: firstName,
                middleName: null,
                lastName: lastName,
                fullName: firstName + ' ' + lastName,
                nationalId: '29' + String(i + 1).padStart(12, '0'),
                password: hashedPassword,
                gender: i % 2 === 0 ? 'male' : 'female',
                maritalStatus: i % 3 === 0 ? 'single' : 'married',
                dateOfBirth: new Date(1985 + i, i % 12, (i % 28) + 1),
                personalEmail: 'personal.' + role.workEmail,
                workEmail: role.workEmail,  // KEY: This is what login uses
                mobilePhone: '+201' + String(1000000000 + i),
                homePhone: '+202' + String(1000000 + i),
                address: {
                    city: 'Cairo',
                    streetAddress: String((i + 1) * 10) + ' Main Street',
                    country: 'Egypt'
                },
                emergencyContacts: [{
                    name: 'Emergency Contact ' + (i + 1),
                    relationship: 'Spouse',
                    phone: '+201' + String(2000000000 + i),
                    isPrimary: true
                }],
                employeeNumber: 'EMP-2024-' + String(i + 1).padStart(4, '0'),
                dateOfHire: new Date(2024, 0, 15 + i),
                biography: 'Experienced professional',
                contractStartDate: new Date(2024, 0, 15 + i),
                bankName: 'National Bank of Egypt',
                bankAccountNumber: '1234567890' + String(i + 1).padStart(4, '0'),
                contractType: i % 2 === 0 ? 'permanent' : 'fixed_term',
                workType: i % 3 === 0 ? 'remote' : (i % 3 === 1 ? 'hybrid' : 'on_site'),
                status: 'active',
                statusEffectiveFrom: new Date(2024, 0, 15 + i),
                primaryPositionId: positions.length > 0 ? positions[i % positions.length]._id : null,
                primaryDepartmentId: departments.length > 0 ? departments[i % departments.length]._id : null,
                payGradeId: payGrades.length > 0 ? payGrades[i % payGrades.length]._id : null,
                createdAt: new Date(),
                updatedAt: new Date()
            });
            
            // Update employee_system_roles with the link to this profile
            await db.collection('employee_system_roles').updateOne(
                { _id: role._id },
                { 
                    $set: { 
                        employeeProfileId: profileId,
                        roles: [role.role],  // Convert single role to array
                        isActive: true
                    }
                }
            );
        }
        
        await db.collection('employee_profiles').insertMany(profiles);
        console.log('Created ' + profiles.length + ' employee profiles with workEmail and password');
        
        // Verify
        console.log('\n=== Verification ===');
        const sample = await db.collection('employee_profiles').findOne({});
        console.log('Sample profile:');
        console.log('  workEmail: ' + sample.workEmail);
        console.log('  password exists: ' + !!sample.password);
        console.log('  password length: ' + sample.password.length);
        
        // List all login credentials
        console.log('\n=== Login Credentials ===');
        const allProfiles = await db.collection('employee_profiles').find({}).toArray();
        allProfiles.forEach(p => {
            console.log('Email: ' + p.workEmail + ' | Password: RoleUser@1234');
        });
        
        console.log('\nDone! You can now login with any of the above emails and password: RoleUser@1234');
        
    } finally {
        await client.close();
    }
}

fixEmployeeProfiles().catch(console.error);
