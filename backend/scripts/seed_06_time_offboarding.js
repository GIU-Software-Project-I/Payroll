/**
 * Seed Script 06: Time Management Extended Data
 * Seeds: schedulerules, shifttypes, timeexceptions, attendancecorrectionrequests,
 *        notificationlogs, clearancechecklists, terminationrequests
 * 
 * Run with: node scripts/seed_06_time_offboarding.js
 */

const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

async function seedTimeAndOffboarding() {
    const client = new MongoClient(MONGO_URI);
    
    try {
        await client.connect();
        console.log('Connected to MongoDB');
        
        const db = client.db();
        
        // Get existing data
        const employees = await db.collection('employeeprofiles').find({}).toArray();
        const attendanceRecords = await db.collection('attendancerecords').find({}).toArray();
        const contracts = await db.collection('contracts').find({}).toArray();
        
        if (employees.length === 0) {
            console.error('Please run seed_complete_system.js first');
            return;
        }

        const hrManager = employees.find(e => e.systemRole === 'HR Manager');
        const deptHead = employees.find(e => e.systemRole === 'department head');

        // ============================================
        // SCHEDULE RULES
        // ============================================
        console.log('\n=== Seeding Schedule Rules ===');
        const scheduleRules = [
            {
                name: 'Standard 5-Day Week',
                pattern: 'Mon-Fri',
                active: true,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                name: '6-Day Week',
                pattern: 'Sun-Fri',
                active: true,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                name: 'Rotating Schedule',
                pattern: '4-on-3-off',
                active: true,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                name: 'Flexible Hours',
                pattern: 'flexible',
                active: true,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                name: 'Night Shift Pattern',
                pattern: 'night-rotation',
                active: false,
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ];

        await db.collection('schedulerules').deleteMany({});
        await db.collection('schedulerules').insertMany(scheduleRules);
        console.log(`Created ${scheduleRules.length} schedule rules`);

        // ============================================
        // SHIFT TYPES
        // ============================================
        console.log('\n=== Seeding Shift Types ===');
        const shiftTypes = [
            {
                name: 'Day Shift',
                active: true,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                name: 'Night Shift',
                active: true,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                name: 'Morning Shift',
                active: true,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                name: 'Evening Shift',
                active: true,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                name: 'Split Shift',
                active: false,
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ];

        await db.collection('shifttypes').deleteMany({});
        await db.collection('shifttypes').insertMany(shiftTypes);
        console.log(`Created ${shiftTypes.length} shift types`);

        // ============================================
        // TIME EXCEPTIONS
        // ============================================
        console.log('\n=== Seeding Time Exceptions ===');
        const timeExceptions = [];
        
        const exceptionTypes = ['MISSED_PUNCH', 'LATE', 'EARLY_LEAVE', 'SHORT_TIME', 'OVERTIME_REQUEST'];
        const exceptionStatuses = ['OPEN', 'PENDING', 'APPROVED', 'REJECTED', 'RESOLVED'];
        
        // Create exceptions for some attendance records
        for (let i = 0; i < Math.min(attendanceRecords.length, 10); i++) {
            const record = attendanceRecords[i];
            timeExceptions.push({
                employeeId: record.employeeId,
                type: exceptionTypes[i % exceptionTypes.length],
                attendanceRecordId: record._id,
                assignedTo: deptHead?._id || employees[0]._id,
                status: exceptionStatuses[i % exceptionStatuses.length],
                reason: i % 2 === 0 ? 'System error' : 'Personal emergency',
                createdAt: new Date(),
                updatedAt: new Date()
            });
        }

        // Add some additional exceptions
        if (employees.length > 2 && attendanceRecords.length > 0) {
            timeExceptions.push({
                employeeId: employees[2]._id,
                type: 'OVERTIME_REQUEST',
                attendanceRecordId: attendanceRecords[0]._id,
                assignedTo: hrManager?._id || employees[0]._id,
                status: 'APPROVED',
                reason: 'Project deadline - approved overtime',
                createdAt: new Date('2025-12-05'),
                updatedAt: new Date()
            });
            
            timeExceptions.push({
                employeeId: employees[3]?._id || employees[0]._id,
                type: 'MANUAL_ADJUSTMENT',
                attendanceRecordId: attendanceRecords[1]?._id || attendanceRecords[0]._id,
                assignedTo: hrManager?._id || employees[0]._id,
                status: 'PENDING',
                reason: 'Badge reader malfunction',
                createdAt: new Date('2025-12-10'),
                updatedAt: new Date()
            });
        }

        await db.collection('timeexceptions').deleteMany({});
        if (timeExceptions.length > 0) {
            await db.collection('timeexceptions').insertMany(timeExceptions);
        }
        console.log(`Created ${timeExceptions.length} time exceptions`);

        // ============================================
        // ATTENDANCE CORRECTION REQUESTS
        // ============================================
        console.log('\n=== Seeding Attendance Correction Requests ===');
        const correctionRequests = [];
        
        for (let i = 0; i < Math.min(5, attendanceRecords.length); i++) {
            const record = attendanceRecords[i];
            const statuses = ['SUBMITTED', 'IN_REVIEW', 'APPROVED', 'REJECTED', 'ESCALATED'];
            
            correctionRequests.push({
                employeeId: record.employeeId,
                attendanceRecord: record._id,
                reason: i === 0 ? 'Forgot to punch out' : 
                        i === 1 ? 'Badge not working' :
                        i === 2 ? 'Worked from different location' :
                        i === 3 ? 'System error during punch' : 'Internet connectivity issue',
                status: statuses[i % statuses.length],
                createdAt: new Date(Date.now() - (i * 24 * 60 * 60 * 1000)),
                updatedAt: new Date()
            });
        }

        await db.collection('attendancecorrectionrequests').deleteMany({});
        if (correctionRequests.length > 0) {
            await db.collection('attendancecorrectionrequests').insertMany(correctionRequests);
        }
        console.log(`Created ${correctionRequests.length} attendance correction requests`);

        // ============================================
        // NOTIFICATION LOGS
        // ============================================
        console.log('\n=== Seeding Notification Logs ===');
        const notificationLogs = [];
        
        const notificationTypes = [
            'LEAVE_APPROVED',
            'LEAVE_REJECTED',
            'ATTENDANCE_REMINDER',
            'PAYSLIP_READY',
            'APPRAISAL_DUE',
            'SHIFT_CHANGE',
            'POLICY_UPDATE'
        ];
        
        for (const emp of employees.slice(0, 8)) {
            if (emp.systemRole === 'Job Candidate') continue;
            
            // Each employee gets a few notifications
            for (let j = 0; j < 3; j++) {
                const notifType = notificationTypes[(employees.indexOf(emp) + j) % notificationTypes.length];
                notificationLogs.push({
                    to: emp._id,
                    type: notifType,
                    message: notifType === 'LEAVE_APPROVED' ? 'Your leave request has been approved' :
                             notifType === 'LEAVE_REJECTED' ? 'Your leave request has been rejected' :
                             notifType === 'ATTENDANCE_REMINDER' ? 'Reminder: Please check in for today' :
                             notifType === 'PAYSLIP_READY' ? 'Your payslip for this month is ready' :
                             notifType === 'APPRAISAL_DUE' ? 'Your performance appraisal is due soon' :
                             notifType === 'SHIFT_CHANGE' ? 'Your shift schedule has been updated' :
                             'Company policy has been updated',
                    createdAt: new Date(Date.now() - (j * 7 * 24 * 60 * 60 * 1000)),
                    updatedAt: new Date()
                });
            }
        }

        await db.collection('notificationlogs').deleteMany({});
        if (notificationLogs.length > 0) {
            await db.collection('notificationlogs').insertMany(notificationLogs);
        }
        console.log(`Created ${notificationLogs.length} notification logs`);

        // ============================================
        // TERMINATION REQUESTS
        // ============================================
        console.log('\n=== Seeding Termination Requests ===');
        const terminationRequests = [];
        const terminationRequestIds = [new ObjectId(), new ObjectId()];
        
        // Create a couple of termination requests
        if (employees.length >= 2 && contracts.length >= 1) {
            terminationRequests.push({
                _id: terminationRequestIds[0],
                employeeId: employees[employees.length - 2]?._id || employees[0]._id,
                initiator: 'employee',
                reason: 'Personal reasons - relocating to another city',
                employeeComments: 'Thank you for the opportunity. Moving for family reasons.',
                hrComments: 'Accepted resignation. Exit interview scheduled.',
                status: 'approved',
                terminationDate: new Date('2026-01-31'),
                contractId: contracts[0]._id,
                createdAt: new Date('2025-12-01'),
                updatedAt: new Date()
            });
            
            terminationRequests.push({
                _id: terminationRequestIds[1],
                employeeId: employees[employees.length - 1]?._id || employees[0]._id,
                initiator: 'hr',
                reason: 'End of project contract',
                employeeComments: null,
                hrComments: 'Contract ended as per agreement',
                status: 'pending',
                terminationDate: new Date('2026-02-28'),
                contractId: contracts[contracts.length - 1]?._id || contracts[0]._id,
                createdAt: new Date('2025-12-10'),
                updatedAt: new Date()
            });
        }

        await db.collection('terminationrequests').deleteMany({});
        if (terminationRequests.length > 0) {
            await db.collection('terminationrequests').insertMany(terminationRequests);
        }
        console.log(`Created ${terminationRequests.length} termination requests`);

        // ============================================
        // CLEARANCE CHECKLISTS
        // ============================================
        console.log('\n=== Seeding Clearance Checklists ===');
        const clearanceChecklists = [];
        
        if (terminationRequests.length > 0) {
            clearanceChecklists.push({
                terminationId: terminationRequestIds[0],
                items: [
                    {
                        department: 'IT',
                        status: 'approved',
                        comments: 'All accounts disabled, laptop returned',
                        updatedBy: employees.find(e => e.systemRole === 'System Admin')?._id || employees[0]._id,
                        updatedAt: new Date('2025-12-15')
                    },
                    {
                        department: 'Finance',
                        status: 'approved',
                        comments: 'All advances settled',
                        updatedBy: employees.find(e => e.systemRole === 'Finance Staff')?._id || employees[0]._id,
                        updatedAt: new Date('2025-12-16')
                    },
                    {
                        department: 'HR',
                        status: 'pending',
                        comments: null,
                        updatedBy: null,
                        updatedAt: null
                    },
                    {
                        department: 'Admin',
                        status: 'approved',
                        comments: 'Parking card returned',
                        updatedBy: hrManager?._id || employees[0]._id,
                        updatedAt: new Date('2025-12-14')
                    }
                ],
                equipmentList: [
                    {
                        equipmentId: new ObjectId(),
                        name: 'Laptop - Dell XPS 15',
                        returned: true,
                        condition: 'Good'
                    },
                    {
                        equipmentId: new ObjectId(),
                        name: 'Monitor - Dell 27"',
                        returned: true,
                        condition: 'Good'
                    },
                    {
                        equipmentId: new ObjectId(),
                        name: 'Office Keys',
                        returned: true,
                        condition: 'Good'
                    }
                ],
                cardReturned: true,
                createdAt: new Date('2025-12-10'),
                updatedAt: new Date()
            });
            
            if (terminationRequests.length > 1) {
                clearanceChecklists.push({
                    terminationId: terminationRequestIds[1],
                    items: [
                        {
                            department: 'IT',
                            status: 'pending',
                            comments: null,
                            updatedBy: null,
                            updatedAt: null
                        },
                        {
                            department: 'Finance',
                            status: 'pending',
                            comments: null,
                            updatedBy: null,
                            updatedAt: null
                        },
                        {
                            department: 'HR',
                            status: 'pending',
                            comments: null,
                            updatedBy: null,
                            updatedAt: null
                        }
                    ],
                    equipmentList: [
                        {
                            equipmentId: new ObjectId(),
                            name: 'Laptop - MacBook Pro',
                            returned: false,
                            condition: null
                        }
                    ],
                    cardReturned: false,
                    createdAt: new Date('2025-12-12'),
                    updatedAt: new Date()
                });
            }
        }

        await db.collection('clearancechecklists').deleteMany({});
        if (clearanceChecklists.length > 0) {
            await db.collection('clearancechecklists').insertMany(clearanceChecklists);
        }
        console.log(`Created ${clearanceChecklists.length} clearance checklists`);

        // ============================================
        // EMPLOYEE TERMINATION RESIGNATIONS (Payroll)
        // ============================================
        console.log('\n=== Seeding Employee Termination Resignations ===');
        const terminationBenefits = await db.collection('terminationandresignationbenefits').find({}).toArray();
        const employeeTerminations = [];
        
        if (terminationRequests.length > 0 && terminationBenefits.length > 0) {
            employeeTerminations.push({
                employeeId: terminationRequests[0].employeeId,
                benefitId: terminationBenefits[0]._id,
                givenAmount: terminationBenefits[0].amount || 5000,
                terminationId: terminationRequestIds[0],
                status: 'approved',
                createdAt: new Date('2025-12-15'),
                updatedAt: new Date()
            });
        }

        await db.collection('employeeterminationresignations').deleteMany({});
        if (employeeTerminations.length > 0) {
            await db.collection('employeeterminationresignations').insertMany(employeeTerminations);
        }
        console.log(`Created ${employeeTerminations.length} employee termination resignations`);

        console.log('\n=== Time & Offboarding Seed Complete ===');
        console.log('Collections seeded: schedulerules, shifttypes, timeexceptions,');
        console.log('attendancecorrectionrequests, notificationlogs, terminationrequests,');
        console.log('clearancechecklists, employeeterminationresignations');

    } catch (error) {
        console.error('Seed error:', error);
    } finally {
        await client.close();
        console.log('\nDisconnected from MongoDB');
    }
}

seedTimeAndOffboarding();
