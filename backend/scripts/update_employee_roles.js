require('dotenv').config();
const mongoose = require('mongoose');

// MongoDB connection URI
const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('MONGODB_URI not set. Please set it in your .env or environment.');
  process.exit(1);
}

// Map email patterns to SystemRole values
const emailToRoleMap = {
  'department.employee@company.com': 'department employee',
  'department.head@company.com': 'department head',
  'hr.manager@company.com': 'HR Manager',
  'hr.employee@company.com': 'HR Employee',
  'payroll.specialist@company.com': 'Payroll Specialist',
  'payroll.manager@company.com': 'Payroll Manager',
  'system.admin@company.com': 'System Admin',
  'legal.admin@company.com': 'Legal & Policy Admin',
  'recruiter@company.com': 'Recruiter',
  'finance.staff@company.com': 'Finance Staff',
  'job.candidate@company.com': 'Job Candidate',
  'hr.admin@company.com': 'HR Admin',
};

// Also support pattern matching for emails that might have variations
function getRoleFromEmail(email) {
  if (!email) return null;
  
  const normalizedEmail = email.toLowerCase().trim();
  
  // Direct match first
  if (emailToRoleMap[normalizedEmail]) {
    return emailToRoleMap[normalizedEmail];
  }
  
  // Pattern matching
  if (normalizedEmail.includes('department.employee') || normalizedEmail.includes('department-employee')) {
    return 'department employee';
  }
  if (normalizedEmail.includes('department.head') || normalizedEmail.includes('department-head')) {
    return 'department head';
  }
  if (normalizedEmail.includes('hr.manager') || normalizedEmail.includes('hr-manager')) {
    return 'HR Manager';
  }
  if (normalizedEmail.includes('hr.employee') || normalizedEmail.includes('hr-employee')) {
    return 'HR Employee';
  }
  if (normalizedEmail.includes('payroll.specialist') || normalizedEmail.includes('payroll-specialist')) {
    return 'Payroll Specialist';
  }
  if (normalizedEmail.includes('payroll.manager') || normalizedEmail.includes('payroll-manager')) {
    return 'Payroll Manager';
  }
  if (normalizedEmail.includes('system.admin') || normalizedEmail.includes('system-admin')) {
    return 'System Admin';
  }
  if (normalizedEmail.includes('legal.admin') || normalizedEmail.includes('legal-admin') || normalizedEmail.includes('legal.policy')) {
    return 'Legal & Policy Admin';
  }
  if (normalizedEmail.includes('recruiter')) {
    return 'Recruiter';
  }
  if (normalizedEmail.includes('finance.staff') || normalizedEmail.includes('finance-staff')) {
    return 'Finance Staff';
  }
  if (normalizedEmail.includes('job.candidate') || normalizedEmail.includes('job-candidate')) {
    return 'Job Candidate';
  }
  if (normalizedEmail.includes('hr.admin') || normalizedEmail.includes('hr-admin')) {
    return 'HR Admin';
  }
  
  return null;
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

    console.log(`Found ${employees.length} employees with workEmail\n`);

    let updated = 0;
    let created = 0;
    let skipped = 0;
    let errors = 0;

    for (const emp of employees) {
      const workEmail = emp.workEmail;
      const role = getRoleFromEmail(workEmail);

      if (!role) {
        console.log(`⚠ Skipping ${workEmail} - no role mapping found`);
        skipped++;
        continue;
      }

      try {
        // Check if role document exists (check both active and inactive)
        const existingRole = await roleColl.findOne({
          employeeProfileId: emp._id
        });

        if (existingRole) {
          // Update existing role - replace with correct role based on email
          const currentRoles = existingRole.roles || [];
          
          // Check if the correct role is already in the list
          if (currentRoles.includes(role) && currentRoles.length === 1) {
            // Already has the correct single role
            if (existingRole.isActive) {
              console.log(`- Skipped ${workEmail} - already has correct role: ${role}`);
              skipped++;
            } else {
              // Reactivate if inactive
              await roleColl.updateOne(
                { _id: existingRole._id },
                { 
                  $set: { 
                    roles: [role],
                    isActive: true,
                    updatedAt: new Date()
                  }
                }
              );
              console.log(`✓ Reactivated ${workEmail}: [${role}]`);
              updated++;
            }
          } else {
            // Replace with correct role (remove incorrect ones)
            await roleColl.updateOne(
              { _id: existingRole._id },
              { 
                $set: { 
                  roles: [role], // Set only the correct role
                  isActive: true,
                  updatedAt: new Date()
                }
              }
            );
            
            console.log(`✓ Updated ${workEmail}: [${currentRoles.join(', ')}] -> [${role}]`);
            updated++;
          }
        } else {
          // Create new role document
          await roleColl.insertOne({
            employeeProfileId: emp._id,
            roles: [role],
            permissions: [],
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
          });
          
          console.log(`✓ Created role for ${workEmail}: [${role}]`);
          created++;
        }
      } catch (error) {
        console.error(`✗ Error updating ${workEmail}:`, error.message);
        errors++;
      }
    }

    console.log('\n=== Summary ===');
    console.log(`Total employees: ${employees.length}`);
    console.log(`Updated: ${updated}`);
    console.log(`Created: ${created}`);
    console.log(`Skipped: ${skipped}`);
    console.log(`Errors: ${errors}`);
    console.log('\n✅ Role update complete!');

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();

