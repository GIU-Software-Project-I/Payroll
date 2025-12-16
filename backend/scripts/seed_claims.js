/**
 * Seed Script: Claims Only
 * Seeds 3 sample claims into the database
 * 
 * Run with: node scripts/seed_claims.js
 */

const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

async function seedClaims() {
    const client = new MongoClient(MONGO_URI);
    
    try {
        await client.connect();
        console.log('Connected to MongoDB');
        
        const db = client.db();
        
        // Get existing employees to reference
        const employees = await db.collection('employee_profiles').find({}).toArray();
        
        if (employees.length === 0) {
            console.error('No employees found. Please run employee seed script first.');
            return;
        }

        // Find a finance staff member for assignment
        const financeStaff = employees.find(e => 
            e.systemRole === 'Finance Staff' || 
            e.systemRole === 'Payroll Manager' ||
            e.systemRole === 'HR Admin'
        );

        // Sample claims data matching the claims schema
        const claims = [
            {
                claimId: 'CLAIM-0001',
                description: 'Medical expenses reimbursement for emergency room visit',
                claimType: 'medical',
                employeeId: employees[0]._id,
                financeStaffId: financeStaff?._id,
                amount: 2500,
                approvedAmount: 2500,
                status: 'approved',
                rejectionReason: null,
                resolutionComment: 'Approved - Valid medical receipts and insurance documentation provided',
                createdAt: new Date('2025-12-01'),
                updatedAt: new Date('2025-12-05')
            },
            {
                claimId: 'CLAIM-0002',
                description: 'Business travel expenses including flights and accommodation',
                claimType: 'travel',
                employeeId: employees[1]?._id || employees[0]._id,
                financeStaffId: null,
                amount: 3500,
                approvedAmount: null,
                status: 'under review',
                rejectionReason: null,
                resolutionComment: null,
                createdAt: new Date('2025-12-10'),
                updatedAt: new Date('2025-12-10')
            },
            {
                claimId: 'CLAIM-0003',
                description: 'Professional development course and certification fees',
                claimType: 'training',
                employeeId: employees[2]?._id || employees[0]._id,
                financeStaffId: financeStaff?._id,
                amount: 1800,
                approvedAmount: null,
                status: 'rejected',
                rejectionReason: 'Training course not pre-approved by department manager',
                resolutionComment: null,
                createdAt: new Date('2025-12-08'),
                updatedAt: new Date('2025-12-12')
            }
        ];

        // Clear existing claims (optional - comment out if you want to preserve existing data)
        await db.collection('claims').deleteMany({});
        console.log('Cleared existing claims');

        // Insert new claims
        const result = await db.collection('claims').insertMany(claims);
        console.log(`Successfully seeded ${result.insertedCount} claims`);

        // Display seeded claims
        console.log('\n=== Seeded Claims ===');
        claims.forEach((claim, index) => {
            console.log(`${index + 1}. ${claim.claimId} - ${claim.claimType} - ${claim.status} - $${claim.amount}`);
        });

    } catch (error) {
        console.error('Error seeding claims:', error);
    } finally {
        await client.close();
        console.log('\nDisconnected from MongoDB');
    }
}

// Run the seed function
seedClaims();
