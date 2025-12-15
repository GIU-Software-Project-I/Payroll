const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

async function investigateEmployeeCount() {
    const client = new MongoClient(process.env.MONGODB_URI);
    
    try {
        await client.connect();
        const db = client.db();
        
        const runId = '693fd5c33f4980c837670b26';
        const run = await db.collection('payrollruns').findOne({ _id: new ObjectId(runId) });
        
        console.log('=== Payroll Run Info ===');
        console.log('Run ID:', run._id);
        console.log('Entity:', run.entity);
        console.log('Entity ID:', run.entityId);
        console.log('employees field:', run.employees);
        console.log('totalEmployees field:', run.totalEmployees);
        console.log('Total Net Pay:', run.totalnetpay);
        
        const deptId = run.entityId;
        
        console.log('\n=== Employees in IT Department ===');
        const allEmps = await db.collection('employee_profiles').find({ 
            primaryDepartmentId: new ObjectId(deptId) 
        }).toArray();
        
        console.log('Total employees in department:', allEmps.length);
        allEmps.forEach(e => {
            console.log(`  - ${e.fullName} (status: ${e.status}, ID: ${e._id})`);
        });
        
        // Check department details
        console.log('\n=== Department Info ===');
        const dept = await db.collection('departments').findOne({ _id: new ObjectId(deptId) });
        console.log('Department:', JSON.stringify(dept, null, 2));
        
        // Check if there are payslips for this run
        console.log('\n=== Payslips for this Run ===');
        const payslips = await db.collection('payslips').find({ 
            payrollRunId: new ObjectId(runId) 
        }).toArray();
        console.log('Payslips count:', payslips.length);
        
        // Check what statuses exist in employee_profiles
        console.log('\n=== All Employee Statuses ===');
        const statuses = await db.collection('employee_profiles').distinct('status');
        console.log('Distinct statuses:', statuses);
        
    } finally {
        await client.close();
    }
}

investigateEmployeeCount().catch(console.error);
