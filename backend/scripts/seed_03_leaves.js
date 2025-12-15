/**
 * Seed Script 03: Leaves Extended Data
 * Seeds: leavecategories, leavepolicies, leaveentitlements, leaveadjustments, 
 *        calendars, attachments
 * 
 * Run with: node scripts/seed_03_leaves.js
 */

const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

async function seedLeaves() {
    const client = new MongoClient(MONGO_URI);
    
    try {
        await client.connect();
        console.log('Connected to MongoDB');
        
        const db = client.db();
        
        // Get existing data
        const employees = await db.collection('employee_profiles').find({}).toArray();
        const leaveTypes = await db.collection('leavetypes').find({}).toArray();
        const leaveRequests = await db.collection('leaverequests').find({}).toArray();
        
        if (employees.length === 0) {
            console.error('Please run seed_complete_system.js first');
            return;
        }

        const hrEmployee = employees.find(e => e.systemRole === 'HR Employee');

        // ============================================
        // LEAVE CATEGORIES
        // ============================================
        console.log('\n=== Seeding Leave Categories ===');
        const categoryIds = [new ObjectId(), new ObjectId(), new ObjectId(), new ObjectId()];
        
        const leaveCategories = [
            {
                _id: categoryIds[0],
                name: 'Time Off',
                description: 'General time off categories including annual and casual leave',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                _id: categoryIds[1],
                name: 'Medical',
                description: 'Health-related leave categories',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                _id: categoryIds[2],
                name: 'Family',
                description: 'Family-related leave categories including parental leave',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                _id: categoryIds[3],
                name: 'Special',
                description: 'Special leave categories including religious and emergency',
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ];

        await db.collection('leavecategories').deleteMany({});
        await db.collection('leavecategories').insertMany(leaveCategories);
        console.log(`Created ${leaveCategories.length} leave categories`);

        // ============================================
        // LEAVE POLICIES
        // ============================================
        console.log('\n=== Seeding Leave Policies ===');
        const leavePolicies = [];
        
        for (const leaveType of leaveTypes) {
            leavePolicies.push({
                leaveTypeId: leaveType._id,
                accrualMethod: leaveType.name === 'Annual Leave' ? 'monthly' : 'yearly',
                monthlyRate: leaveType.name === 'Annual Leave' ? 1.75 : 0,
                yearlyRate: leaveType.defaultBalance || 0,
                carryForwardAllowed: leaveType.name === 'Annual Leave',
                maxCarryForward: leaveType.name === 'Annual Leave' ? 5 : 0,
                expiryAfterMonths: 12,
                roundingRule: 'round',
                minNoticeDays: leaveType.name === 'Sick Leave' ? 0 : 3,
                maxConsecutiveDays: leaveType.name === 'Annual Leave' ? 14 : (leaveType.name === 'Sick Leave' ? 30 : 5),
                eligibility: {
                    minTenureMonths: leaveType.name === 'Annual Leave' ? 3 : 0,
                    positionsAllowed: [],
                    contractTypesAllowed: ['FULL_TIME_CONTRACT', 'PART_TIME_CONTRACT']
                },
                createdAt: new Date(),
                updatedAt: new Date()
            });
        }

        await db.collection('leavepolicies').deleteMany({});
        if (leavePolicies.length > 0) {
            await db.collection('leavepolicies').insertMany(leavePolicies);
        }
        console.log(`Created ${leavePolicies.length} leave policies`);

        // ============================================
        // LEAVE ENTITLEMENTS
        // ============================================
        console.log('\n=== Seeding Leave Entitlements ===');
        const leaveEntitlements = [];
        
        for (const emp of employees) {
            if (emp.systemRole === 'Job Candidate') continue;
            
            for (const leaveType of leaveTypes) {
                const yearlyEntitlement = leaveType.defaultBalance || 21;
                const taken = Math.floor(Math.random() * 10);
                const pending = Math.floor(Math.random() * 3);
                
                leaveEntitlements.push({
                    employeeId: emp._id,
                    leaveTypeId: leaveType._id,
                    yearlyEntitlement: yearlyEntitlement,
                    accruedActual: yearlyEntitlement * 0.9,
                    accruedRounded: Math.round(yearlyEntitlement * 0.9),
                    carryForward: Math.floor(Math.random() * 5),
                    taken: taken,
                    pending: pending,
                    remaining: yearlyEntitlement - taken - pending,
                    lastAccrualDate: new Date('2025-12-01'),
                    nextResetDate: new Date('2026-01-01'),
                    createdAt: new Date(),
                    updatedAt: new Date()
                });
            }
        }

        await db.collection('leaveentitlements').deleteMany({});
        if (leaveEntitlements.length > 0) {
            await db.collection('leaveentitlements').insertMany(leaveEntitlements);
        }
        console.log(`Created ${leaveEntitlements.length} leave entitlements`);

        // ============================================
        // LEAVE ADJUSTMENTS
        // ============================================
        console.log('\n=== Seeding Leave Adjustments ===');
        const leaveAdjustments = [];
        
        // Create some adjustments for a few employees
        const empSubset = employees.slice(0, 5).filter(e => e.systemRole !== 'Job Candidate');
        
        for (const emp of empSubset) {
            if (leaveTypes.length > 0) {
                // Add adjustment
                leaveAdjustments.push({
                    employeeId: emp._id,
                    leaveTypeId: leaveTypes[0]._id,
                    adjustmentType: 'add',
                    amount: 2,
                    reason: 'Compensation for overtime work',
                    hrUserId: hrEmployee?._id || employees[0]._id,
                    createdAt: new Date('2025-11-15'),
                    updatedAt: new Date()
                });
                
                // Deduct adjustment
                leaveAdjustments.push({
                    employeeId: emp._id,
                    leaveTypeId: leaveTypes[0]._id,
                    adjustmentType: 'deduct',
                    amount: 1,
                    reason: 'Leave taken without prior approval',
                    hrUserId: hrEmployee?._id || employees[0]._id,
                    createdAt: new Date('2025-10-20'),
                    updatedAt: new Date()
                });
            }
        }

        // Add encashment for one employee
        if (employees.length > 0 && leaveTypes.length > 0) {
            leaveAdjustments.push({
                employeeId: employees[0]._id,
                leaveTypeId: leaveTypes[0]._id,
                adjustmentType: 'encashment',
                amount: 5,
                reason: 'Annual leave encashment request approved',
                hrUserId: hrEmployee?._id || employees[0]._id,
                createdAt: new Date('2025-12-01'),
                updatedAt: new Date()
            });
        }

        await db.collection('leaveadjustments').deleteMany({});
        if (leaveAdjustments.length > 0) {
            await db.collection('leaveadjustments').insertMany(leaveAdjustments);
        }
        console.log(`Created ${leaveAdjustments.length} leave adjustments`);

        // ============================================
        // CALENDARS
        // ============================================
        console.log('\n=== Seeding Calendars ===');
        const calendars = [
            {
                year: 2025,
                holidays: [
                    new Date('2025-01-07'), // Coptic Christmas
                    new Date('2025-01-25'), // Revolution Day
                    new Date('2025-03-30'), // Eid Al-Fitr (approx)
                    new Date('2025-03-31'),
                    new Date('2025-04-01'),
                    new Date('2025-04-25'), // Sinai Liberation Day
                    new Date('2025-05-01'), // Labour Day
                    new Date('2025-06-06'), // Eid Al-Adha (approx)
                    new Date('2025-06-07'),
                    new Date('2025-06-08'),
                    new Date('2025-06-09'),
                    new Date('2025-06-26'), // Islamic New Year (approx)
                    new Date('2025-07-23'), // Revolution Day
                    new Date('2025-09-04'), // Mawlid (approx)
                    new Date('2025-10-06'), // Armed Forces Day
                ],
                blockedPeriods: [
                    {
                        from: new Date('2025-12-25'),
                        to: new Date('2025-12-31'),
                        reason: 'Year-end closeout - limited leave approvals'
                    }
                ],
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                year: 2026,
                holidays: [
                    new Date('2026-01-07'), // Coptic Christmas
                    new Date('2026-01-25'), // Revolution Day
                    new Date('2026-03-20'), // Eid Al-Fitr (approx)
                    new Date('2026-03-21'),
                    new Date('2026-03-22'),
                    new Date('2026-04-25'), // Sinai Liberation Day
                    new Date('2026-05-01'), // Labour Day
                    new Date('2026-05-27'), // Eid Al-Adha (approx)
                    new Date('2026-05-28'),
                    new Date('2026-05-29'),
                    new Date('2026-05-30'),
                    new Date('2026-06-16'), // Islamic New Year (approx)
                    new Date('2026-07-23'), // Revolution Day
                    new Date('2026-08-25'), // Mawlid (approx)
                    new Date('2026-10-06'), // Armed Forces Day
                ],
                blockedPeriods: [],
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ];

        await db.collection('calendars').deleteMany({});
        await db.collection('calendars').insertMany(calendars);
        console.log(`Created ${calendars.length} calendars`);

        // ============================================
        // ATTACHMENTS
        // ============================================
        console.log('\n=== Seeding Attachments ===');
        const attachments = [];
        
        // Create attachments for leave requests that might need documentation
        const sickLeaveRequests = leaveRequests.filter(lr => {
            const leaveType = leaveTypes.find(lt => lt._id.equals(lr.leaveTypeId));
            return leaveType && leaveType.name === 'Sick Leave';
        });

        for (const request of sickLeaveRequests.slice(0, 3)) {
            attachments.push({
                originalName: `medical_certificate_${request._id}.pdf`,
                filePath: `/uploads/leave-attachments/medical_certificate_${request._id}.pdf`,
                fileType: 'application/pdf',
                size: Math.floor(Math.random() * 500000) + 100000,
                createdAt: new Date(),
                updatedAt: new Date()
            });
        }

        // Add some general attachments
        attachments.push({
            originalName: 'leave_policy_2025.pdf',
            filePath: '/uploads/policies/leave_policy_2025.pdf',
            fileType: 'application/pdf',
            size: 250000,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        attachments.push({
            originalName: 'leave_application_form.docx',
            filePath: '/uploads/forms/leave_application_form.docx',
            fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            size: 45000,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        await db.collection('attachments').deleteMany({});
        if (attachments.length > 0) {
            await db.collection('attachments').insertMany(attachments);
        }
        console.log(`Created ${attachments.length} attachments`);

        console.log('\n=== Leaves Extended Seed Complete ===');
        console.log('Collections seeded: leavecategories, leavepolicies, leaveentitlements,');
        console.log('leaveadjustments, calendars, attachments');

    } catch (error) {
        console.error('Seed error:', error);
    } finally {
        await client.close();
        console.log('\nDisconnected from MongoDB');
    }
}

seedLeaves();
