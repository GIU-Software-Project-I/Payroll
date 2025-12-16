const mongoose = require('mongoose');
require('dotenv').config();

async function checkEmployee() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  const employeeProfiles = mongoose.connection.collection('employeeprofiles');
  
  // Find the payroll specialist
  const employee = await employeeProfiles.findOne({ 
    workEmail: { $regex: /payroll\.specialist@company\.com/i } 
  });
  
  if (employee) {
    console.log('Found Employee:');
    console.log('  _id:', employee._id.toString());
    console.log('  name:', employee.firstName, employee.lastName);
    console.log('  workEmail:', employee.workEmail);
    console.log('  employeeId:', employee.employeeId);
    console.log('\nThis _id should be in localStorage.hr_system_user.id');
  } else {
    console.log('No employee found with payroll.specialist@company.com email');
    
    // List employees with payroll in email
    const payrollEmployees = await employeeProfiles.find({ 
      workEmail: { $regex: /payroll/i } 
    }).toArray();
    console.log('\nEmployees with "payroll" in email:');
    payrollEmployees.forEach(e => {
      console.log('  -', e._id.toString(), e.workEmail);
    });
  }
  
  // Also check for the ID from localStorage
  const specificId = '693fd36e2236f97574f2e597';
  const byId = await employeeProfiles.findOne({ _id: new mongoose.Types.ObjectId(specificId) });
  
  console.log('\n\nEmployee with ID 693fd36e2236f97574f2e597:');
  if (byId) {
    console.log('  _id:', byId._id.toString());
    console.log('  name:', byId.firstName, byId.lastName);
    console.log('  workEmail:', byId.workEmail);
    console.log('  employeeId:', byId.employeeId);
  } else {
    console.log('  NOT FOUND in employeeprofiles collection');
  }
  
  await mongoose.disconnect();
}

checkEmployee().catch(console.error);
