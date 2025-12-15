/**
 * Complete System Seed Script
 * 
 * Creates users, employee profiles, and all necessary data for testing.
 * 
 * Run with: node scripts/seed_complete_system.js
 */


const { MongoClient, ObjectId } = require('mongodb');
const bcrypt = require('bcrypt');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

// User definitions with roles
const USERS = [
    { 
        _id: new ObjectId('693dc3ddee07fbcd93854e05'),
        role: 'department employee',
        workEmail: 'department.employee@company.com',
        password: 'RoleUser@1234',
        firstName: 'John',
        lastName: 'Employee',
        department: 'Engineering'
    },
    { 
        _id: new ObjectId('693dc3deee07fbcd93854e0c'),
        role: 'department head',
        workEmail: 'department.head@company.com',
        password: 'RoleUser@1234',
        firstName: 'Sarah',
        lastName: 'Head',
        department: 'Engineering'
    },
    { 
        _id: new ObjectId('693dc3deee07fbcd93854e13'),
        role: 'HR Manager',
        workEmail: 'hr.manager@company.com',
        password: 'RoleUser@1234',
        firstName: 'Michael',
        lastName: 'HRManager',
        department: 'Human Resources'
    },
    { 
        _id: new ObjectId('693dc3dfee07fbcd93854e1a'),
        role: 'HR Employee',
        workEmail: 'hr.employee@company.com',
        password: 'RoleUser@1234',
        firstName: 'Emily',
        lastName: 'HREmployee',
        department: 'Human Resources'
    },
    { 
        _id: new ObjectId('693dc3dfee07fbcd93854e21'),
        role: 'Payroll Specialist',
        workEmail: 'payroll.specialist@company.com',
        password: 'RoleUser@1234',
        firstName: 'David',
        lastName: 'PayrollSpec',
        department: 'Finance'
    },
    { 
        _id: new ObjectId('693dc3e0ee07fbcd93854e28'),
        role: 'Payroll Manager',
        workEmail: 'payroll.manager@company.com',
        password: 'RoleUser@1234',
        firstName: 'Lisa',
        lastName: 'PayrollMgr',
        department: 'Finance'
    },
    { 
        _id: new ObjectId('693dc3e0ee07fbcd93854e2f'),
        role: 'System Admin',
        workEmail: 'system.admin@company.com',
        password: 'RoleUser@1234',
        firstName: 'Robert',
        lastName: 'SysAdmin',
        department: 'IT'
    },
    { 
        _id: new ObjectId('693dc3e0ee07fbcd93854e36'),
        role: 'Legal & Policy Admin',
        workEmail: 'legal.admin@company.com',
        password: 'RoleUser@1234',
        firstName: 'Jennifer',
        lastName: 'Legal',
        department: 'Legal'
    },
    { 
        _id: new ObjectId('693dc3e1ee07fbcd93854e3d'),
        role: 'Recruiter',
        workEmail: 'recruiter@company.com',
        password: 'RoleUser@1234',
        firstName: 'Thomas',
        lastName: 'Recruiter',
        department: 'Human Resources'
    },
    { 
        _id: new ObjectId('693dc3e2ee07fbcd93854e44'),
        role: 'Finance Staff',
        workEmail: 'finance.staff@company.com',
        password: 'RoleUser@1234',
        firstName: 'Amanda',
        lastName: 'Finance',
        department: 'Finance'
    },
    { 
        _id: new ObjectId('693dc3e3ee07fbcd93854e4b'),
        role: 'Job Candidate',
        workEmail: 'job.candidate@company.com',
        password: 'RoleUser@1234',
        firstName: 'Chris',
        lastName: 'Candidate',
        department: null
    },
    { 
        _id: new ObjectId('693dc3e3ee07fbcd93854e52'),
        role: 'HR Admin',
        workEmail: 'hr.admin@company.com',
        password: 'RoleUser@1234',
        firstName: 'Patricia',
        lastName: 'HRAdmin',
        department: 'Human Resources'
    }
];

const SALARIES = {
    'department employee': 5000,
    'department head': 7500,
    'HR Manager': 8000,
    'HR Employee': 5500,
    'Payroll Specialist': 6000,
    'Payroll Manager': 9000,
    'System Admin': 8500,
    'Legal & Policy Admin': 7000,
    'Recruiter': 5500,
    'Finance Staff': 6500,
    'Job Candidate': 3000,
    'HR Admin': 7500
};

// Helper functions
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomChoice(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

const NOW = new Date();
const CURRENT_YEAR = NOW.getFullYear();
const CURRENT_MONTH = NOW.getMonth() + 1;
const PREV_MONTH = CURRENT_MONTH === 1 ? 12 : CURRENT_MONTH - 1;
const PREV_YEAR = CURRENT_MONTH === 1 ? CURRENT_YEAR - 1 : CURRENT_YEAR;
const DAYS_IN_PREV_MONTH = new Date(PREV_YEAR, PREV_MONTH, 0).getDate();

async function seedDatabase() {
    const client = new MongoClient(MONGO_URI);
    
    try {
        await client.connect();
        console.log('Connected to MongoDB');
        
        const db = client.db();
        
        // ============================================
        // STEP 1: Clear existing data (except system collections)
        // ============================================
        console.log('\n=== Step 1: Clearing collections ===');
        const collections = await db.listCollections().toArray();
        const preserveCollections = ['users']; // Keep users if they exist with special handling
        
        for (const col of collections) {
            if (!preserveCollections.includes(col.name)) {
                await db.collection(col.name).deleteMany({});
                console.log(`Cleared: ${col.name}`);
            }
        }
        
        // ============================================
        // STEP 2: Create Employee System Roles
        // ============================================
        console.log('\n=== Step 2: Creating employee system roles ===');
        
        const systemRoles = [];
        for (const user of USERS) {
            const hashedPassword = await bcrypt.hash(user.password, 10);
            systemRoles.push({
                _id: user._id,
                workEmail: user.workEmail,
                password: hashedPassword,
                role: user.role,
                rolesAssigned: [user.role],
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date()
            });
        }
        
        await db.collection('employee_system_roles').insertMany(systemRoles);
        console.log(`Created ${systemRoles.length} employee system roles`);
        
        // ============================================
        // STEP 3: Create Departments
        // ============================================
        console.log('\n=== Step 3: Creating departments ===');
        
        const departments = [
            { _id: new ObjectId(), name: 'Human Resources', code: 'HR', description: 'HR Department', status: 'active', createdAt: new Date(), updatedAt: new Date() },
            { _id: new ObjectId(), name: 'Finance', code: 'FIN', description: 'Finance Department', status: 'active', createdAt: new Date(), updatedAt: new Date() },
            { _id: new ObjectId(), name: 'Engineering', code: 'ENG', description: 'Engineering Department', status: 'active', createdAt: new Date(), updatedAt: new Date() },
            { _id: new ObjectId(), name: 'Legal', code: 'LEG', description: 'Legal Department', status: 'active', createdAt: new Date(), updatedAt: new Date() },
            { _id: new ObjectId(), name: 'IT', code: 'IT', description: 'IT Department', status: 'active', createdAt: new Date(), updatedAt: new Date() },
        ];
        
        await db.collection('departments').insertMany(departments);
        console.log(`Created ${departments.length} departments`);
        
        // Map department names to IDs
        const deptMap = {};
        for (const dept of departments) {
            deptMap[dept.name] = dept._id;
        }
        
        // ============================================
        // STEP 4: Create Employee Profiles
        // ============================================
        console.log('\n=== Step 4: Creating employee profiles ===');
        
        const employeeProfiles = [];
        for (const user of USERS) {
            const salary = SALARIES[user.role] || 5000;
            const deptId = user.department ? deptMap[user.department] : null;
            
            employeeProfiles.push({
                employeeNumber: `EN${100000 + USERS.indexOf(user)}`,
                nationalId: `NID${100000 + USERS.indexOf(user)}`,
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                fullName: `${user.firstName} ${user.lastName}`,
                workEmail: user.workEmail,
                personalEmail: `${user.firstName.toLowerCase()}.${user.lastName.toLowerCase()}@personal.com`,
                phone: `+1${randomInt(1000000000, 9999999999)}`,
                dateOfBirth: new Date(1985 + randomInt(0, 15), randomInt(0, 11), randomInt(1, 28)),
                gender: randomChoice(['male', 'female']),
                nationality: 'American',
                address: {
                    street: `${randomInt(100, 999)} Main Street`,
                    city: 'New York',
                    state: 'NY',
                    country: 'USA',
                    zipCode: `${randomInt(10000, 99999)}`
                },
                employeeId: `EMP${String(USERS.indexOf(user) + 1).padStart(4, '0')}`,
                departmentId: deptId,
                department: user.department,
                position: user.role,
                jobTitle: user.role,
                employmentType: 'full-time',
                employmentStatus: 'active',
                status: 'active',
                hireDate: new Date(2023, randomInt(0, 11), randomInt(1, 28)),
                startDate: new Date(2023, randomInt(0, 11), randomInt(1, 28)),
                baseSalary: salary,
                salary: salary,
                currency: 'USD',
                bankAccountNumber: `BANK${1000000 + USERS.indexOf(user)}`,
                bankName: 'National Bank',
                taxId: `TAX${100000 + USERS.indexOf(user)}`,
                insuranceNumber: `INS${100000 + USERS.indexOf(user)}`,
                emergencyContact: {
                    name: `Emergency Contact for ${user.firstName}`,
                    relationship: 'Spouse',
                    phone: `+1${randomInt(1000000000, 9999999999)}`
                },
                systemRoleId: user._id,
                role: user.role,
                createdAt: new Date(),
                updatedAt: new Date()
            });
        }
        
        await db.collection('employee_profiles').insertMany(employeeProfiles);
        console.log(`Created ${employeeProfiles.length} employee profiles`);
        
        // ============================================
        // STEP 5: Create Positions
        // ============================================
        console.log('\n=== Step 5: Creating positions ===');
        
        const positions = [
            { _id: new ObjectId(), title: 'Software Engineer', code: 'SE', departmentId: deptMap['Engineering'], level: 'Junior', status: 'active', createdAt: new Date() },
            { _id: new ObjectId(), title: 'Senior Software Engineer', code: 'SSE', departmentId: deptMap['Engineering'], level: 'Senior', status: 'active', createdAt: new Date() },
            { _id: new ObjectId(), title: 'HR Specialist', code: 'HRS', departmentId: deptMap['Human Resources'], level: 'Mid', status: 'active', createdAt: new Date() },
            { _id: new ObjectId(), title: 'HR Manager', code: 'HRM', departmentId: deptMap['Human Resources'], level: 'Manager', status: 'active', createdAt: new Date() },
            { _id: new ObjectId(), title: 'Accountant', code: 'ACC', departmentId: deptMap['Finance'], level: 'Mid', status: 'active', createdAt: new Date() },
            { _id: new ObjectId(), title: 'Finance Manager', code: 'FM', departmentId: deptMap['Finance'], level: 'Manager', status: 'active', createdAt: new Date() },
            { _id: new ObjectId(), title: 'Legal Counsel', code: 'LC', departmentId: deptMap['Legal'], level: 'Senior', status: 'active', createdAt: new Date() },
            { _id: new ObjectId(), title: 'IT Administrator', code: 'ITA', departmentId: deptMap['IT'], level: 'Mid', status: 'active', createdAt: new Date() },
        ];
        
        await db.collection('positions').insertMany(positions);
        console.log(`Created ${positions.length} positions`);
        
        // ============================================
        // STEP 6: Create Shifts
        // ============================================
        console.log('\n=== Step 6: Creating shifts ===');
        
        const shifts = [
            { _id: new ObjectId(), name: 'Morning Shift', code: 'MORNING', startTime: '08:00', endTime: '16:00', breakMinutes: 60, workingHours: 8, status: 'active', createdAt: new Date() },
            { _id: new ObjectId(), name: 'Evening Shift', code: 'EVENING', startTime: '14:00', endTime: '22:00', breakMinutes: 60, workingHours: 8, status: 'active', createdAt: new Date() },
            { _id: new ObjectId(), name: 'Night Shift', code: 'NIGHT', startTime: '22:00', endTime: '06:00', breakMinutes: 60, workingHours: 8, status: 'active', createdAt: new Date() },
            { _id: new ObjectId(), name: 'Flexible', code: 'FLEX', startTime: '09:00', endTime: '17:00', breakMinutes: 60, workingHours: 8, status: 'active', createdAt: new Date() },
        ];
        
        await db.collection('shifts').insertMany(shifts);
        console.log(`Created ${shifts.length} shifts`);
        
        // ============================================
        // STEP 7: Create Shift Assignments
        // ============================================
        console.log('\n=== Step 7: Creating shift assignments ===');
        
        const shiftAssignments = [];
        const workingUsers = USERS.filter(u => u.role !== 'Job Candidate');
        
        for (let i = 0; i < workingUsers.length; i++) {
            const user = workingUsers[i];
            shiftAssignments.push({
                _id: new ObjectId(),
                employeeId: user._id,
                shiftId: shifts[i % shifts.length]._id,
                shift: shifts[i % shifts.length].name,
                startDate: new Date(CURRENT_YEAR, 0, 1),
                endDate: new Date(CURRENT_YEAR, 11, 31),
                status: 'approved',
                scheduledMinutes: 480,
                createdAt: new Date()
            });
        }
        
        await db.collection('shiftassignments').insertMany(shiftAssignments);
        console.log(`Created ${shiftAssignments.length} shift assignments`);
        
        // ============================================
        // STEP 8: Create Lateness Rules
        // ============================================
        console.log('\n=== Step 8: Creating lateness rules ===');
        
        const latenessRules = [
            { _id: new ObjectId(), name: 'Standard Lateness Rule', description: 'Default policy', gracePeriodMinutes: 15, graceMinutes: 15, deductionForEachMinute: 0.5, penaltyPerMinute: 0.5, maxPenalty: 100, active: true, createdAt: new Date() },
            { _id: new ObjectId(), name: 'Strict Lateness Rule', description: 'Strict policy', gracePeriodMinutes: 5, graceMinutes: 5, deductionForEachMinute: 1, penaltyPerMinute: 1, maxPenalty: 200, active: false, createdAt: new Date() },
        ];
        
        await db.collection('latenessrules').insertMany(latenessRules);
        console.log(`Created ${latenessRules.length} lateness rules`);
        
        // ============================================
        // STEP 9: Create Overtime Rules
        // ============================================
        console.log('\n=== Step 9: Creating overtime rules ===');
        
        const overtimeRules = [
            { _id: new ObjectId(), name: 'Standard Overtime', description: 'Regular 1.5x', multiplier: 1.5, maxHoursPerDay: 4, maxHoursPerMonth: 40, status: 'approved', approved: true, active: true, createdAt: new Date() },
            { _id: new ObjectId(), name: 'Weekend Overtime', description: 'Weekend 2x', multiplier: 2.0, maxHoursPerDay: 8, maxHoursPerMonth: 32, status: 'approved', approved: true, active: true, createdAt: new Date() },
            { _id: new ObjectId(), name: 'Holiday Overtime', description: 'Holiday 2.5x', multiplier: 2.5, maxHoursPerDay: 8, maxHoursPerMonth: 24, status: 'approved', approved: true, active: true, createdAt: new Date() },
        ];
        
        await db.collection('overtimerules').insertMany(overtimeRules);
        console.log(`Created ${overtimeRules.length} overtime rules`);
        
        // ============================================
        // STEP 10: Create Holidays
        // ============================================
        console.log('\n=== Step 10: Creating holidays ===');
        
        const holidays = [
            { _id: new ObjectId(), name: 'New Year', date: new Date(CURRENT_YEAR, 0, 1), type: 'public', description: 'New Year Day', createdAt: new Date() },
            { _id: new ObjectId(), name: 'Christmas', date: new Date(CURRENT_YEAR, 11, 25), type: 'public', description: 'Christmas Day', createdAt: new Date() },
            { _id: new ObjectId(), name: 'Independence Day', date: new Date(CURRENT_YEAR, 6, 4), type: 'public', description: 'Independence Day', createdAt: new Date() },
            { _id: new ObjectId(), name: 'Labor Day', date: new Date(CURRENT_YEAR, 4, 1), type: 'public', description: 'Labor Day', createdAt: new Date() },
            { _id: new ObjectId(), name: 'Thanksgiving', date: new Date(CURRENT_YEAR, 10, 28), type: 'public', description: 'Thanksgiving', createdAt: new Date() },
        ];
        
        await db.collection('holidays').insertMany(holidays);
        console.log(`Created ${holidays.length} holidays`);
        
        // ============================================
        // STEP 11: Create Leave Types
        // ============================================
        console.log('\n=== Step 11: Creating leave types ===');
        
        const leaveTypes = [
            { _id: new ObjectId(), name: 'Annual Leave', code: 'AL', description: 'Paid annual leave', defaultDays: 21, isPaid: true, requiresApproval: true, status: 'active', createdAt: new Date() },
            { _id: new ObjectId(), name: 'Sick Leave', code: 'SL', description: 'Paid sick leave', defaultDays: 14, isPaid: true, requiresApproval: true, status: 'active', createdAt: new Date() },
            { _id: new ObjectId(), name: 'Unpaid Leave', code: 'UL', description: 'Unpaid leave', defaultDays: 30, isPaid: false, requiresApproval: true, status: 'active', createdAt: new Date() },
            { _id: new ObjectId(), name: 'Maternity Leave', code: 'ML', description: 'Maternity leave', defaultDays: 90, isPaid: true, requiresApproval: true, status: 'active', createdAt: new Date() },
            { _id: new ObjectId(), name: 'Paternity Leave', code: 'PL', description: 'Paternity leave', defaultDays: 14, isPaid: true, requiresApproval: true, status: 'active', createdAt: new Date() },
        ];
        
        await db.collection('leavetypes').insertMany(leaveTypes);
        console.log(`Created ${leaveTypes.length} leave types`);
        
        // ============================================
        // STEP 12: Create Leave Balances
        // ============================================
        console.log('\n=== Step 12: Creating leave balances ===');
        
        const leaveBalances = [];
        for (const user of workingUsers) {
            for (const leaveType of leaveTypes) {
                const used = randomInt(0, 5);
                leaveBalances.push({
                    _id: new ObjectId(),
                    employeeId: user._id,
                    leaveTypeId: leaveType._id,
                    leaveType: leaveType.name,
                    year: CURRENT_YEAR,
                    totalDays: leaveType.defaultDays,
                    usedDays: used,
                    remainingDays: leaveType.defaultDays - used,
                    createdAt: new Date()
                });
            }
        }
        
        await db.collection('leavebalances').insertMany(leaveBalances);
        console.log(`Created ${leaveBalances.length} leave balances`);
        
        // ============================================
        // STEP 13: Create Leave Requests
        // ============================================
        console.log('\n=== Step 13: Creating leave requests ===');
        
        const leaveRequests = [];
        const leaveStatuses = ['approved', 'approved', 'approved', 'pending', 'rejected'];
        
        for (let i = 0; i < 15; i++) {
            const user = randomChoice(workingUsers);
            const leaveType = randomChoice(leaveTypes);
            const startDay = randomInt(1, 20);
            const duration = randomInt(1, 3);
            const status = randomChoice(leaveStatuses);
            
            leaveRequests.push({
                _id: new ObjectId(),
                employeeId: user._id,
                leaveTypeId: leaveType._id,
                leaveType: leaveType.name,
                isPaid: leaveType.isPaid,
                startDate: new Date(CURRENT_YEAR, CURRENT_MONTH - 1, startDay),
                endDate: new Date(CURRENT_YEAR, CURRENT_MONTH - 1, startDay + duration),
                days: duration,
                reason: `Leave request for ${leaveType.name}`,
                status: status,
                approvedBy: status === 'approved' ? USERS[2]._id : null,
                approvedAt: status === 'approved' ? new Date() : null,
                createdAt: new Date()
            });
        }
        
        await db.collection('leaverequests').insertMany(leaveRequests);
        console.log(`Created ${leaveRequests.length} leave requests`);
        
        // ============================================
        // STEP 14: Create Attendance Records
        // ============================================
        console.log('\n=== Step 14: Creating attendance records ===');
        
        const attendanceRecords = [];
        const daysToGenerate = Math.min(15, NOW.getDate());
        
        for (const user of workingUsers) {
            const assignment = shiftAssignments.find(sa => sa.employeeId.equals(user._id));
            const shift = assignment ? shifts.find(s => s._id.equals(assignment.shiftId)) : shifts[0];
            
            for (let day = 1; day <= daysToGenerate; day++) {
                const date = new Date(CURRENT_YEAR, CURRENT_MONTH - 1, day);
                const dayOfWeek = date.getDay();
                
                // Skip weekends
                if (dayOfWeek === 0 || dayOfWeek === 6) continue;
                
                // Check if on leave
                const onLeave = leaveRequests.find(lr => 
                    lr.employeeId.equals(user._id) && 
                    lr.status === 'approved' &&
                    new Date(lr.startDate) <= date && 
                    new Date(lr.endDate) >= date
                );
                
                if (onLeave) {
                    attendanceRecords.push({
                        _id: new ObjectId(),
                        employeeId: user._id,
                        date: date,
                        status: 'on_leave',
                        isOnLeave: true,
                        leaveType: onLeave.leaveType,
                        scheduledMinutes: 480,
                        actualWorkMinutes: 0,
                        isHoliday: false,
                        createdAt: new Date()
                    });
                    continue;
                }
                
                // Random variations
                const latenessMinutes = Math.random() < 0.2 ? randomInt(5, 45) : 0;
                const earlyDepartureMinutes = Math.random() < 0.1 ? randomInt(10, 30) : 0;
                const overtimeMinutes = Math.random() < 0.15 ? randomInt(30, 120) : 0;
                const approvedOvertimeMinutes = overtimeMinutes > 0 ? Math.floor(overtimeMinutes * 0.8) : 0;
                
                const scheduledMinutes = 480;
                const actualWorkMinutes = scheduledMinutes - latenessMinutes - earlyDepartureMinutes + overtimeMinutes;
                
                const checkIn = new Date(date);
                checkIn.setHours(8, latenessMinutes, 0);
                
                const checkOut = new Date(date);
                checkOut.setHours(16 + Math.floor(overtimeMinutes / 60), (overtimeMinutes % 60) - earlyDepartureMinutes, 0);
                
                attendanceRecords.push({
                    _id: new ObjectId(),
                    employeeId: user._id,
                    date: date,
                    checkIn: checkIn,
                    checkOut: checkOut,
                    status: 'present',
                    isOnLeave: false,
                    isHoliday: false,
                    scheduledMinutes: scheduledMinutes,
                    actualWorkMinutes: actualWorkMinutes,
                    latenessMinutes: latenessMinutes,
                    earlyDepartureMinutes: earlyDepartureMinutes,
                    overtimeMinutes: overtimeMinutes,
                    approvedOvertimeMinutes: approvedOvertimeMinutes,
                    shiftId: shift._id,
                    shiftName: shift.name,
                    createdAt: new Date()
                });
            }
        }
        
        await db.collection('attendancerecords').insertMany(attendanceRecords);
        console.log(`Created ${attendanceRecords.length} attendance records`);
        
        // ============================================
        // STEP 15: Create Allowance Types
        // ============================================
        console.log('\n=== Step 15: Creating allowance types ===');
        
        const allowanceTypes = [
            { _id: new ObjectId(), name: 'Housing Allowance', code: 'HOUSING', description: 'Monthly housing', defaultAmount: 500, isTaxable: false, status: 'active', createdAt: new Date() },
            { _id: new ObjectId(), name: 'Transportation Allowance', code: 'TRANSPORT', description: 'Monthly transport', defaultAmount: 200, isTaxable: false, status: 'active', createdAt: new Date() },
            { _id: new ObjectId(), name: 'Meal Allowance', code: 'MEAL', description: 'Daily meals', defaultAmount: 150, isTaxable: false, status: 'active', createdAt: new Date() },
            { _id: new ObjectId(), name: 'Communication Allowance', code: 'COMM', description: 'Phone/internet', defaultAmount: 100, isTaxable: false, status: 'active', createdAt: new Date() },
        ];
        
        await db.collection('allowancetypes').insertMany(allowanceTypes);
        console.log(`Created ${allowanceTypes.length} allowance types`);
        
        // ============================================
        // STEP 16: Create Employee Allowances
        // ============================================
        console.log('\n=== Step 16: Creating employee allowances ===');
        
        const employeeAllowances = [];
        for (const user of workingUsers) {
            const numAllowances = randomInt(2, 4);
            const selected = [...allowanceTypes].sort(() => 0.5 - Math.random()).slice(0, numAllowances);
            
            for (const allowance of selected) {
                employeeAllowances.push({
                    _id: new ObjectId(),
                    employeeId: user._id,
                    allowanceTypeId: allowance._id,
                    allowanceType: allowance.name,
                    amount: allowance.defaultAmount,
                    effectiveDate: new Date(CURRENT_YEAR, 0, 1),
                    status: 'active',
                    createdAt: new Date()
                });
            }
        }
        
        await db.collection('employeeallowances').insertMany(employeeAllowances);
        console.log(`Created ${employeeAllowances.length} employee allowances`);
        
        // ============================================
        // STEP 17: Create Deduction Types
        // ============================================
        console.log('\n=== Step 17: Creating deduction types ===');
        
        const deductionTypes = [
            { _id: new ObjectId(), name: 'Income Tax', code: 'TAX', description: 'Monthly income tax', calculationType: 'percentage', rate: 0.15, isMandatory: true, status: 'active', createdAt: new Date() },
            { _id: new ObjectId(), name: 'Social Security', code: 'SS', description: 'Social security', calculationType: 'percentage', rate: 0.0625, isMandatory: true, status: 'active', createdAt: new Date() },
            { _id: new ObjectId(), name: 'Health Insurance', code: 'HEALTH', description: 'Health insurance', calculationType: 'fixed', amount: 150, isMandatory: true, status: 'active', createdAt: new Date() },
            { _id: new ObjectId(), name: 'Pension', code: 'PENSION', description: 'Pension contribution', calculationType: 'percentage', rate: 0.05, isMandatory: true, status: 'active', createdAt: new Date() },
            { _id: new ObjectId(), name: 'Union Dues', code: 'UNION', description: 'Union membership', calculationType: 'fixed', amount: 25, isMandatory: false, status: 'active', createdAt: new Date() },
        ];
        
        await db.collection('deductiontypes').insertMany(deductionTypes);
        console.log(`Created ${deductionTypes.length} deduction types`);
        
        // ============================================
        // STEP 18: Create Tax Rules (Tax Brackets)
        // ============================================
        console.log('\n=== Step 18: Creating tax rules ===');
        
        const taxRules = [
            { _id: new ObjectId(), name: 'Standard Tax - 0-50K', minIncome: 0, maxIncome: 50000, rate: 0.15, year: CURRENT_YEAR, status: 'approved', createdAt: new Date() },
            { _id: new ObjectId(), name: 'Standard Tax - 50K-100K', minIncome: 50001, maxIncome: 100000, rate: 0.20, year: CURRENT_YEAR, status: 'approved', createdAt: new Date() },
            { _id: new ObjectId(), name: 'Standard Tax - 100K+', minIncome: 100001, maxIncome: null, rate: 0.25, year: CURRENT_YEAR, status: 'approved', createdAt: new Date() },
        ];
        
        await db.collection('taxrules').insertMany(taxRules);
        console.log(`Created ${taxRules.length} tax rules`);
        
        // ============================================
        // STEP 19: Create Insurance Brackets
        // ============================================
        console.log('\n=== Step 19: Creating insurance brackets ===');
        
        const insuranceBrackets = [
            { _id: new ObjectId(), name: 'Basic Insurance', minSalary: 0, maxSalary: 50000, employeeRate: 0.02, employerRate: 0.04, status: 'approved', createdAt: new Date() },
            { _id: new ObjectId(), name: 'Standard Insurance', minSalary: 50001, maxSalary: 100000, employeeRate: 0.025, employerRate: 0.05, status: 'approved', createdAt: new Date() },
            { _id: new ObjectId(), name: 'Premium Insurance', minSalary: 100001, maxSalary: null, employeeRate: 0.03, employerRate: 0.06, status: 'approved', createdAt: new Date() },
        ];
        
        await db.collection('insurancebrackets').insertMany(insuranceBrackets);
        console.log(`Created ${insuranceBrackets.length} insurance brackets`);
        
        // ============================================
        // STEP 20: Create Pay Grades
        // ============================================
        console.log('\n=== Step 20: Creating pay grades ===');
        
        const payGrades = [
            { _id: new ObjectId(), name: 'Junior Software Engineer', code: 'JSE', grade: 'JSE', minSalary: 50000, maxSalary: 70000, baseSalary: 60000, level: 1, status: 'approved', createdAt: new Date() },
            { _id: new ObjectId(), name: 'Mid-Level Software Engineer', code: 'MSE', grade: 'MSE', minSalary: 70000, maxSalary: 90000, baseSalary: 80000, level: 2, status: 'approved', createdAt: new Date() },
            { _id: new ObjectId(), name: 'Senior Software Engineer', code: 'SSE', grade: 'SSE', minSalary: 90000, maxSalary: 120000, baseSalary: 100000, level: 3, status: 'approved', createdAt: new Date() },
            { _id: new ObjectId(), name: 'Junior Accountant', code: 'JACC', grade: 'JACC', minSalary: 45000, maxSalary: 60000, baseSalary: 52000, level: 1, status: 'approved', createdAt: new Date() },
            { _id: new ObjectId(), name: 'Senior Accountant', code: 'SACC', grade: 'SACC', minSalary: 60000, maxSalary: 85000, baseSalary: 75000, level: 2, status: 'approved', createdAt: new Date() },
        ];
        
        await db.collection('paygrades').insertMany(payGrades);
        console.log(`Created ${payGrades.length} pay grades`);
        
        // ============================================
        // STEP 21: Create Payroll Configuration
        // ============================================
        console.log('\n=== Step 21: Creating payroll configuration ===');
        
        const payrollConfig = {
            _id: new ObjectId(),
            name: 'Default Payroll Configuration',
            description: 'Standard payroll config',
            currency: 'USD',
            paymentFrequency: 'monthly',
            cutoffDay: 25,
            payDay: 28,
            taxRate: 0.15,
            socialSecurityRate: 0.0625,
            healthInsuranceRate: 0.03,
            pensionRate: 0.05,
            overtimeMultiplier: 1.5,
            weekendMultiplier: 2.0,
            holidayMultiplier: 2.5,
            latenessPenaltyPerMinute: 0.5,
            latenessGracePeriod: 15,
            workingDaysPerMonth: 22,
            workingHoursPerDay: 8,
            status: 'active',
            isDefault: true,
            createdAt: new Date()
        };
        
        await db.collection('payrollconfigs').insertOne(payrollConfig);
        console.log('Created payroll configuration');
        
        // ============================================
        // STEP 22: Create Previous Month Payroll Run
        // ============================================
        console.log('\n=== Step 22: Creating previous month payroll run ===');
        
        const prevPayrollRun = {
            _id: new ObjectId(),
            payrollPeriod: {
                month: PREV_MONTH,
                year: PREV_YEAR,
                startDate: new Date(PREV_YEAR, PREV_MONTH - 1, 1),
                endDate: new Date(PREV_YEAR, PREV_MONTH - 1, DAYS_IN_PREV_MONTH),
            },
            status: 'approved',
            totalEmployees: workingUsers.length,
            totalGrossPay: 0,
            totalNetPay: 0,
            totalDeductions: 0,
            totalAllowances: 0,
            processedAt: new Date(PREV_YEAR, PREV_MONTH - 1, 28),
            approvedBy: USERS[5]._id,
            createdBy: USERS[4]._id,
            createdAt: new Date(PREV_YEAR, PREV_MONTH - 1, 25)
        };
        
        const payslips = [];
        let totalGross = 0, totalNet = 0, totalDed = 0, totalAllow = 0;
        
        for (const user of workingUsers) {
            const salary = SALARIES[user.role] || 5000;
            const empAllowances = employeeAllowances.filter(a => a.employeeId.equals(user._id));
            const totalEmpAllowances = empAllowances.reduce((sum, a) => sum + a.amount, 0);
            
            const tax = salary * 0.15;
            const socialSecurity = salary * 0.0625;
            const healthInsurance = 150;
            const pension = salary * 0.05;
            const totalEmpDeductions = tax + socialSecurity + healthInsurance + pension;
            
            const grossPay = salary + totalEmpAllowances;
            const netPay = grossPay - totalEmpDeductions;
            
            totalGross += grossPay;
            totalNet += netPay;
            totalDed += totalEmpDeductions;
            totalAllow += totalEmpAllowances;
            
            payslips.push({
                _id: new ObjectId(),
                payrollRunId: prevPayrollRun._id,
                employeeId: user._id,
                payrollPeriod: prevPayrollRun.payrollPeriod,
                baseSalary: salary,
                grossPay: grossPay,
                netPay: netPay,
                allowances: {
                    total: totalEmpAllowances,
                    items: empAllowances.map(a => ({ name: a.allowanceType, amount: a.amount }))
                },
                deductions: {
                    total: totalEmpDeductions,
                    tax: tax,
                    taxAmount: tax,
                    socialSecurity: socialSecurity,
                    healthInsurance: healthInsurance,
                    insuranceAmount: healthInsurance,
                    pension: pension,
                    penaltiesAmount: 0,
                    items: [
                        { name: 'Income Tax', amount: tax },
                        { name: 'Social Security', amount: socialSecurity },
                        { name: 'Health Insurance', amount: healthInsurance },
                        { name: 'Pension', amount: pension }
                    ]
                },
                overtime: { hours: 0, amount: 0 },
                bonuses: { total: 0, items: [] },
                status: 'paid',
                paidAt: new Date(PREV_YEAR, PREV_MONTH - 1, 28),
                createdAt: new Date(PREV_YEAR, PREV_MONTH - 1, 25)
            });
        }
        
        prevPayrollRun.totalGrossPay = totalGross;
        prevPayrollRun.totalNetPay = totalNet;
        prevPayrollRun.totalDeductions = totalDed;
        prevPayrollRun.totalAllowances = totalAllow;
        
        await db.collection('payrollruns').insertOne(prevPayrollRun);
        await db.collection('payslips').insertMany(payslips);
        console.log(`Created payroll run with ${payslips.length} payslips`);
        
        // ============================================
        // STEP 23: Create Bonus Configurations
        // ============================================
        console.log('\n=== Step 23: Creating bonus configurations ===');
        
        const bonusConfigs = [
            { _id: new ObjectId(), name: 'Performance Bonus', code: 'PERF', description: 'Quarterly performance', calculationType: 'percentage', rate: 0.1, maxAmount: 5000, status: 'active', createdAt: new Date() },
            { _id: new ObjectId(), name: 'Annual Bonus', code: 'ANNUAL', description: 'Year-end bonus', calculationType: 'percentage', rate: 0.2, maxAmount: 10000, status: 'active', createdAt: new Date() },
            { _id: new ObjectId(), name: 'Signing Bonus', code: 'SIGN', description: 'New employee', calculationType: 'fixed', amount: 1000, status: 'active', createdAt: new Date() },
            { _id: new ObjectId(), name: 'Referral Bonus', code: 'REF', description: 'Employee referral', calculationType: 'fixed', amount: 500, status: 'active', createdAt: new Date() },
        ];
        
        await db.collection('bonusconfigs').insertMany(bonusConfigs);
        console.log(`Created ${bonusConfigs.length} bonus configurations`);
        
        // ============================================
        // STEP 24: Create Benefit Types
        // ============================================
        console.log('\n=== Step 24: Creating benefit types ===');
        
        const benefitTypes = [
            { _id: new ObjectId(), name: 'Health Insurance', code: 'HEALTH', employerContribution: 200, employeeContribution: 50, status: 'active', createdAt: new Date() },
            { _id: new ObjectId(), name: 'Dental Insurance', code: 'DENTAL', employerContribution: 50, employeeContribution: 20, status: 'active', createdAt: new Date() },
            { _id: new ObjectId(), name: 'Vision Insurance', code: 'VISION', employerContribution: 30, employeeContribution: 10, status: 'active', createdAt: new Date() },
            { _id: new ObjectId(), name: '401k Matching', code: '401K', employerContribution: 300, employeeContribution: 300, status: 'active', createdAt: new Date() },
        ];
        
        await db.collection('benefittypes').insertMany(benefitTypes);
        console.log(`Created ${benefitTypes.length} benefit types`);
        
        // ============================================
        // STEP 25: Create Employee Benefits
        // ============================================
        console.log('\n=== Step 25: Creating employee benefits ===');
        
        const employeeBenefits = [];
        for (const user of workingUsers) {
            const numBenefits = randomInt(2, 4);
            const selected = [...benefitTypes].sort(() => 0.5 - Math.random()).slice(0, numBenefits);
            
            for (const benefit of selected) {
                employeeBenefits.push({
                    _id: new ObjectId(),
                    employeeId: user._id,
                    benefitTypeId: benefit._id,
                    benefitType: benefit.name,
                    employerContribution: benefit.employerContribution,
                    employeeContribution: benefit.employeeContribution,
                    startDate: new Date(CURRENT_YEAR, 0, 1),
                    status: 'active',
                    createdAt: new Date()
                });
            }
        }
        
        await db.collection('employeebenefits').insertMany(employeeBenefits);
        console.log(`Created ${employeeBenefits.length} employee benefits`);
        
        // ============================================
        // SUMMARY
        // ============================================
        console.log('\n' + '='.repeat(60));
        console.log('DATABASE SEEDING COMPLETED SUCCESSFULLY!');
        console.log('='.repeat(60));
        
        console.log('\n📋 USER CREDENTIALS:');
        console.log('-'.repeat(60));
        console.log('| Role'.padEnd(25) + '| Email'.padEnd(35) + '|');
        console.log('-'.repeat(60));
        for (const user of USERS) {
            console.log(`| ${user.role.padEnd(23)}| ${user.workEmail.padEnd(33)}|`);
        }
        console.log('-'.repeat(60));
        console.log('| Password for ALL users: RoleUser@1234'.padEnd(59) + '|');
        console.log('-'.repeat(60));
        
        console.log('\n📊 DATA SUMMARY:');
        console.log(`  - ${systemRoles.length} employee system roles (users)`);
        console.log(`  - ${employeeProfiles.length} employee profiles`);
        console.log(`  - ${departments.length} departments`);
        console.log(`  - ${positions.length} positions`);
        console.log(`  - ${shifts.length} shifts`);
        console.log(`  - ${shiftAssignments.length} shift assignments`);
        console.log(`  - ${latenessRules.length} lateness rules`);
        console.log(`  - ${overtimeRules.length} overtime rules`);
        console.log(`  - ${holidays.length} holidays`);
        console.log(`  - ${leaveTypes.length} leave types`);
        console.log(`  - ${leaveBalances.length} leave balances`);
        console.log(`  - ${leaveRequests.length} leave requests`);
        console.log(`  - ${attendanceRecords.length} attendance records`);
        console.log(`  - ${allowanceTypes.length} allowance types`);
        console.log(`  - ${employeeAllowances.length} employee allowances`);
        console.log(`  - ${deductionTypes.length} deduction types`);
        console.log(`  - ${taxRules.length} tax rules`);
        console.log(`  - ${insuranceBrackets.length} insurance brackets`);
        console.log(`  - ${payGrades.length} pay grades`);
        console.log(`  - 1 payroll configuration`);
        console.log(`  - 1 payroll run with ${payslips.length} payslips`);
        console.log(`  - ${bonusConfigs.length} bonus configurations`);
        console.log(`  - ${benefitTypes.length} benefit types`);
        console.log(`  - ${employeeBenefits.length} employee benefits`);
        
    } catch (error) {
        console.error('Error seeding database:', error);
        throw error;
    } finally {
        await client.close();
        console.log('\nDatabase connection closed');
    }
}

seedDatabase()
    .then(() => {
        console.log('\n✅ Seed script completed successfully!');
        process.exit(0);
    })
    .catch((err) => {
        console.error('❌ Seed script failed:', err);
        process.exit(1);
    });
