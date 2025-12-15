#!/usr/bin/env node
/**
 * Script to assign employees to departments
 * 
 * This script handles the scenario where employees exist but are not assigned to any department.
 * It can either:
 * 1. Assign all unassigned employees to a specific department
 * 2. Distribute employees across all active departments
 * 3. Show current assignment status
 * 
 * Usage:
 *   node assign_employees_to_departments.js --status           # Show current status
 *   node assign_employees_to_departments.js --assign-all <deptId>  # Assign all to one dept
 *   node assign_employees_to_departments.js --distribute       # Distribute across all depts
 */

require('dotenv').config();
const mongoose = require('mongoose');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

const argv = yargs(hideBin(process.argv))
  .option('status', { type: 'boolean', default: false, describe: 'Show current assignment status' })
  .option('assign-all', { type: 'string', describe: 'Assign all unassigned employees to this department ID' })
  .option('distribute', { type: 'boolean', default: false, describe: 'Distribute unassigned employees across all active departments' })
  .option('dry-run', { type: 'boolean', default: false, describe: 'Show what would be done without making changes' })
  .argv;

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('MONGODB_URI not set. Please set it in your .env or environment.');
  process.exit(1);
}
if (process.env.NODE_ENV === 'production') {
  console.error('Refusing to run in production without explicit confirmation');
  process.exit(1);
}

async function main() {
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to MongoDB');

  const db = mongoose.connection;
  const empColl = db.collection('employee_profiles');
  const deptColl = db.collection('departments');
  const posColl = db.collection('positions');

  // Get stats
  const totalEmployees = await empColl.countDocuments({ status: { $in: ['ACTIVE', 'Active', 'active'] } });
  const withDepartment = await empColl.countDocuments({ 
    status: { $in: ['ACTIVE', 'Active', 'active'] },
    primaryDepartmentId: { $exists: true, $ne: null }
  });
  const withoutDepartment = await empColl.countDocuments({ 
    status: { $in: ['ACTIVE', 'Active', 'active'] },
    $or: [
      { primaryDepartmentId: { $exists: false } },
      { primaryDepartmentId: null }
    ]
  });

  console.log('\n=== Employee Department Assignment Status ===');
  console.log(`Total Active Employees: ${totalEmployees}`);
  console.log(`With Department: ${withDepartment}`);
  console.log(`Without Department: ${withoutDepartment}`);

  // Get departments
  const departments = await deptColl.find({ isActive: true }).toArray();
  console.log(`\nActive Departments: ${departments.length}`);
  
  if (departments.length === 0) {
    console.log('\n⚠️  No active departments found! Creating a default department...');
    
    if (!argv.dryRun) {
      const defaultDept = await deptColl.insertOne({
        code: 'DEFAULT',
        name: 'General',
        description: 'Default department for unassigned employees',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log(`Created default department with ID: ${defaultDept.insertedId}`);
      departments.push({ _id: defaultDept.insertedId, code: 'DEFAULT', name: 'General' });
    }
  }

  // Show department details
  console.log('\nDepartments:');
  for (const dept of departments) {
    const empCount = await empColl.countDocuments({ 
      primaryDepartmentId: dept._id,
      status: { $in: ['ACTIVE', 'Active', 'active'] }
    });
    console.log(`  - ${dept.name} (${dept.code}): ${empCount} employees - ID: ${dept._id}`);
  }

  // Status only mode
  if (argv.status) {
    console.log('\n=== Employees Without Department ===');
    const unassigned = await empColl.find({
      status: { $in: ['ACTIVE', 'Active', 'active'] },
      $or: [
        { primaryDepartmentId: { $exists: false } },
        { primaryDepartmentId: null }
      ]
    }).limit(20).toArray();
    
    for (const emp of unassigned) {
      console.log(`  - ${emp.fullName || emp.firstName + ' ' + emp.lastName} (${emp.employeeNumber}) - ${emp.workEmail}`);
    }
    if (withoutDepartment > 20) {
      console.log(`  ... and ${withoutDepartment - 20} more`);
    }
    
    await mongoose.disconnect();
    return;
  }

  // Assign all to one department
  if (argv.assignAll) {
    const deptId = argv.assignAll;
    const dept = departments.find(d => d._id.toString() === deptId);
    if (!dept) {
      console.error(`\n❌ Department ${deptId} not found or not active`);
      await mongoose.disconnect();
      process.exit(1);
    }

    console.log(`\n📋 Assigning all ${withoutDepartment} unassigned employees to: ${dept.name}`);
    
    if (argv.dryRun) {
      console.log('(Dry run - no changes made)');
    } else {
      const result = await empColl.updateMany(
        {
          status: { $in: ['ACTIVE', 'Active', 'active'] },
          $or: [
            { primaryDepartmentId: { $exists: false } },
            { primaryDepartmentId: null }
          ]
        },
        {
          $set: { 
            primaryDepartmentId: dept._id,
            updatedAt: new Date()
          }
        }
      );
      console.log(`✅ Updated ${result.modifiedCount} employees`);
    }

    await mongoose.disconnect();
    return;
  }

  // Distribute across departments
  if (argv.distribute) {
    if (departments.length === 0) {
      console.error('\n❌ No departments available to distribute employees');
      await mongoose.disconnect();
      process.exit(1);
    }

    const unassigned = await empColl.find({
      status: { $in: ['ACTIVE', 'Active', 'active'] },
      $or: [
        { primaryDepartmentId: { $exists: false } },
        { primaryDepartmentId: null }
      ]
    }).toArray();

    console.log(`\n📋 Distributing ${unassigned.length} unassigned employees across ${departments.length} departments`);

    if (argv.dryRun) {
      console.log('(Dry run - no changes made)');
      const perDept = Math.ceil(unassigned.length / departments.length);
      departments.forEach((dept, i) => {
        const start = i * perDept;
        const end = Math.min(start + perDept, unassigned.length);
        console.log(`  ${dept.name}: would get ${end - start} employees`);
      });
    } else {
      let updated = 0;
      for (let i = 0; i < unassigned.length; i++) {
        const emp = unassigned[i];
        const dept = departments[i % departments.length];
        
        await empColl.updateOne(
          { _id: emp._id },
          { 
            $set: { 
              primaryDepartmentId: dept._id,
              updatedAt: new Date()
            }
          }
        );
        updated++;
      }
      console.log(`✅ Updated ${updated} employees`);
      
      // Show new distribution
      console.log('\nNew distribution:');
      for (const dept of departments) {
        const empCount = await empColl.countDocuments({ 
          primaryDepartmentId: dept._id,
          status: { $in: ['ACTIVE', 'Active', 'active'] }
        });
        console.log(`  - ${dept.name}: ${empCount} employees`);
      }
    }

    await mongoose.disconnect();
    return;
  }

  // No action specified - show help
  console.log('\n📌 To assign employees to departments, use one of these options:');
  console.log('   --assign-all <deptId>  : Assign all unassigned to one department');
  console.log('   --distribute           : Distribute across all active departments');
  console.log('   --dry-run              : Preview changes without applying');
  console.log('\nExample:');
  if (departments.length > 0) {
    console.log(`   node assign_employees_to_departments.js --assign-all ${departments[0]._id}`);
  }
  console.log('   node assign_employees_to_departments.js --distribute');

  await mongoose.disconnect();
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
