const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

async function fixPayrollRun() {
    const client = new MongoClient(process.env.MONGODB_URI);
    
    try {
        await client.connect();
        const db = client.db();
        
        const runId = '693fd5c33f4980c837670b26';
        
        // Get all employee payroll details for this run
        const allDetails = await db.collection('employeepayrolldetails').find({
            payrollRunId: new ObjectId(runId)
        }).toArray();
        
        console.log('Total records:', allDetails.length);
        
        // Group by employeeId
        const byEmployee = {};
        for (const detail of allDetails) {
            const empId = detail.employeeId.toString();
            if (!byEmployee[empId]) {
                byEmployee[empId] = [];
            }
            byEmployee[empId].push(detail);
        }
        
        console.log('\nRecords per employee:');
        let successfulCount = 0;
        const idsToDelete = [];
        
        for (const [empId, records] of Object.entries(byEmployee)) {
            console.log(`  Employee ${empId}: ${records.length} records`);
            
            // Keep the successful record (netPay > 0), delete the failed ones
            const successful = records.find(r => r.netPay > 0 && !r.exceptions);
            const failed = records.filter(r => r.netPay === 0 || r.exceptions);
            
            if (successful) {
                successfulCount++;
                console.log(`    - Keeping record with netPay: ${successful.netPay}`);
            }
            
            // Mark failed duplicates for deletion
            for (const f of failed) {
                if (successful) {
                    idsToDelete.push(f._id);
                    console.log(`    - Will delete failed record: ${f._id}`);
                }
            }
        }
        
        // Delete duplicate failed records
        if (idsToDelete.length > 0) {
            const deleteResult = await db.collection('employeepayrolldetails').deleteMany({
                _id: { $in: idsToDelete }
            });
            console.log(`\nDeleted ${deleteResult.deletedCount} duplicate/failed records`);
        }
        
        // Update the payroll run with correct employee count
        const updateResult = await db.collection('payrollruns').updateOne(
            { _id: new ObjectId(runId) },
            {
                $set: {
                    employees: successfulCount,
                    exceptions: 0,
                    irregularities: [],
                    irregularitiesCount: 0
                }
            }
        );
        
        console.log(`\nUpdated payroll run: employees = ${successfulCount}`);
        
        // Verify
        const updatedRun = await db.collection('payrollruns').findOne({ _id: new ObjectId(runId) });
        console.log('\nVerification:');
        console.log('  employees:', updatedRun.employees);
        console.log('  exceptions:', updatedRun.exceptions);
        console.log('  totalnetpay:', updatedRun.totalnetpay);
        
    } finally {
        await client.close();
    }
}

fixPayrollRun().catch(console.error);
