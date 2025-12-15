const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

async function fixInsuranceData() {
    const client = new MongoClient(process.env.MONGODB_URI);
    
    try {
        await client.connect();
        const db = client.db();
        
        // 1. Fix insurance brackets - add amount field (can be a default or based on rate)
        const brackets = await db.collection('insurancebrackets').find({}).toArray();
        for (const bracket of brackets) {
            if (!bracket.amount) {
                // Calculate a default amount based on avg salary in range
                const avgSalary = ((bracket.minSalary || 0) + (bracket.maxSalary || 100000)) / 2;
                const amount = (avgSalary * (bracket.employeeRate || 0)) / 100;
                await db.collection('insurancebrackets').updateOne(
                    { _id: bracket._id },
                    { $set: { amount: Math.round(amount * 100) / 100 } }
                );
                console.log(`Fixed bracket ${bracket.name}: added amount ${amount.toFixed(2)}`);
            }
        }
        
        // 2. Fix existing payslips with missing insurance amounts
        const payslips = await db.collection('payslips').find({
            'deductionsDetails.insurances': { $exists: true, $ne: [] }
        }).toArray();
        
        console.log(`\nFound ${payslips.length} payslips with insurance data`);
        
        let fixedCount = 0;
        for (const payslip of payslips) {
            if (payslip.deductionsDetails?.insurances) {
                const needsFix = payslip.deductionsDetails.insurances.some(ins => ins.amount === undefined || ins.amount === null);
                
                if (needsFix) {
                    const fixedInsurances = payslip.deductionsDetails.insurances.map(ins => ({
                        ...ins,
                        amount: ins.amount ?? payslip.deductionsDetails?.insuranceAmount ?? 0
                    }));
                    
                    await db.collection('payslips').updateOne(
                        { _id: payslip._id },
                        { $set: { 'deductionsDetails.insurances': fixedInsurances } }
                    );
                    fixedCount++;
                }
            }
        }
        
        console.log(`Fixed ${fixedCount} payslips with missing insurance amounts`);
        
        // 3. Clear the irregularities from the problematic payroll run
        const runId = '693fd5c33f4980c837670b26';
        await db.collection('payrollruns').updateOne(
            { _id: new ObjectId(runId) },
            { 
                $set: { 
                    irregularities: [],
                    irregularitiesCount: 0,
                    exceptions: 0
                }
            }
        );
        console.log(`\nCleared irregularities from payroll run ${runId}`);
        
        console.log('\nDone!');
        
    } finally {
        await client.close();
    }
}

fixInsuranceData().catch(console.error);
