#!/usr/bin/env node
/**
 * Script to check and assign pay grades to employees
 */

require('dotenv').config();
const mongoose = require('mongoose');

const uri = process.env.MONGODB_URI;

async function main() {
  await mongoose.connect(uri);
  console.log('Connected to MongoDB');

  const db = mongoose.connection;
  
  // Check pay grades
  const grades = await db.collection('paygrades').find({}).toArray();
  console.log('\n=== Pay Grades ===');
  if (grades.length === 0) {
    console.log('No pay grades found! Creating default pay grades...');
    
    const defaultGrades = [
      { grade: 'Junior', baseSalary: 8000, grossSalary: 10000, status: 'approved', createdAt: new Date(), updatedAt: new Date() },
      { grade: 'Mid-Level', baseSalary: 12000, grossSalary: 15000, status: 'approved', createdAt: new Date(), updatedAt: new Date() },
      { grade: 'Senior', baseSalary: 18000, grossSalary: 22000, status: 'approved', createdAt: new Date(), updatedAt: new Date() },
      { grade: 'Lead', baseSalary: 25000, grossSalary: 30000, status: 'approved', createdAt: new Date(), updatedAt: new Date() },
      { grade: 'Manager', baseSalary: 35000, grossSalary: 42000, status: 'approved', createdAt: new Date(), updatedAt: new Date() },
    ];
    
    await db.collection('paygrades').insertMany(defaultGrades);
    console.log('Created default pay grades');
    grades.push(...defaultGrades);
  }
  
  for (const g of grades) {
    console.log(`  - ${g.grade}: Base=${g.baseSalary}, Gross=${g.grossSalary}, Status=${g.status}, ID=${g._id}`);
  }
  
  // Check employees
  const emps = await db.collection('employee_profiles').find({
    status: { $in: ['ACTIVE', 'Active', 'active'] }
  }).toArray();
  
  console.log('\n=== Employees ===');
  let withGrade = 0;
  let withoutGrade = 0;
  
  for (const e of emps) {
    if (e.payGradeId) {
      withGrade++;
      const grade = grades.find(g => g._id.toString() === e.payGradeId.toString());
      console.log(`  ✅ ${e.fullName || e.employeeNumber}: ${grade?.grade || 'Unknown grade'}`);
    } else {
      withoutGrade++;
      console.log(`  ❌ ${e.fullName || e.employeeNumber}: No pay grade`);
    }
  }
  
  console.log(`\nTotal: ${emps.length}, With Pay Grade: ${withGrade}, Without: ${withoutGrade}`);
  
  // Assign pay grades to employees without one
  if (withoutGrade > 0) {
    console.log('\n=== Assigning Pay Grades ===');
    
    // Get approved grades
    const approvedGrades = grades.filter(g => g.status === 'approved');
    if (approvedGrades.length === 0) {
      console.log('No approved pay grades available!');
      await mongoose.disconnect();
      return;
    }
    
    // Default to Junior grade for most, but assign different based on role pattern
    const juniorGrade = approvedGrades.find(g => g.grade.toLowerCase().includes('junior')) || approvedGrades[0];
    const midGrade = approvedGrades.find(g => g.grade.toLowerCase().includes('mid')) || approvedGrades[Math.min(1, approvedGrades.length - 1)];
    const seniorGrade = approvedGrades.find(g => g.grade.toLowerCase().includes('senior')) || approvedGrades[Math.min(2, approvedGrades.length - 1)];
    const managerGrade = approvedGrades.find(g => g.grade.toLowerCase().includes('manager')) || approvedGrades[approvedGrades.length - 1];
    
    for (const e of emps) {
      if (!e.payGradeId) {
        // Determine grade based on employee name/role
        let assignGrade = juniorGrade;
        const nameOrNumber = (e.fullName || e.employeeNumber || '').toLowerCase();
        
        if (nameOrNumber.includes('manager') || nameOrNumber.includes('head') || nameOrNumber.includes('admin')) {
          assignGrade = managerGrade;
        } else if (nameOrNumber.includes('senior') || nameOrNumber.includes('specialist')) {
          assignGrade = seniorGrade;
        } else if (nameOrNumber.includes('mid') || nameOrNumber.includes('staff')) {
          assignGrade = midGrade;
        }
        
        await db.collection('employee_profiles').updateOne(
          { _id: e._id },
          { $set: { payGradeId: assignGrade._id, updatedAt: new Date() } }
        );
        console.log(`  Assigned ${e.fullName || e.employeeNumber} → ${assignGrade.grade} (${assignGrade.baseSalary})`);
      }
    }
    
    console.log('\n✅ All employees now have pay grades assigned');
  }
  
  await mongoose.disconnect();
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
