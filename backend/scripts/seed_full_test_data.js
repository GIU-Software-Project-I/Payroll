/**
 * Comprehensive Database Seed Script
 * 
 * This script:
 * 1. Clears all collections except employee_profiles and employeesystemroles for the specified users
 * 2. Seeds all necessary data for testing the payroll module
 * 
 * Run with: node scripts/seed_full_test_data.js
 */

const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/payroll';

// Employee IDs to preserve
const EMPLOYEE_IDS = [
    '693dc3ddee07fbcd93854e05', // department employee
    '693dc3deee07fbcd93854e0c', // department head
    '693dc3deee07fbcd93854e13', // HR Manager
    '693dc3dfee07fbcd93854e1a', // HR Employee
    '693dc3dfee07fbcd93854e21', // Payroll Specialist
    '693dc3e0ee07fbcd93854e28', // Payroll Manager
    '693dc3e0ee07fbcd93854e2f', // System Admin
    '693dc3e0ee07fbcd93854e36', // Legal & Policy Admin
    '693dc3e1ee07fbcd93854e3d', // Recruiter
    '693dc3e2ee07fbcd93854e44', // Finance Staff
    '693dc3e3ee07fbcd93854e4b', // Job Candidate
    '693dc3e3ee07fbcd93854e52', // HR Admin
];

// Employee details for reference
const EMPLOYEES = [
    { _id: '693dc3ddee07fbcd93854e05', role: 'department employee', email: 'department.employee@company.department-employee.com', name: 'John Employee' },
    { _id: '693dc3deee07fbcd93854e0c', role: 'department head', email: 'department.head@company.department-head.com', name: 'Sarah Head' },
    { _id: '693dc3deee07fbcd93854e13', role: 'HR Manager', email: 'hr.manager@company.hr-manager.com', name: 'Michael HRManager' },
    { _id: '693dc3dfee07fbcd93854e1a', role: 'HR Employee', email: 'hr.employee@company.hr-employee.com', name: 'Emily HREmployee' },
    { _id: '693dc3dfee07fbcd93854e21', role: 'Payroll Specialist', email: 'payroll.specialist@company.payroll-specialist.com', name: 'David PayrollSpec' },
    { _id: '693dc3e0ee07fbcd93854e28', role: 'Payroll Manager', email: 'payroll.manager@company.payroll-manager.com', name: 'Lisa PayrollMgr' },
    { _id: '693dc3e0ee07fbcd93854e2f', role: 'System Admin', email: 'system.admin@company.system-admin.com', name: 'Robert SysAdmin' },
    { _id: '693dc3e0ee07fbcd93854e36', role: 'Legal & Policy Admin', email: 'legal.policy.admin@company.legal-policy-admin.com', name: 'Jennifer Legal' },
    { _id: '693dc3e1ee07fbcd93854e3d', role: 'Recruiter', email: 'recruiter.user@company.recruiter.com', name: 'Thomas Recruiter' },
    { _id: '693dc3e2ee07fbcd93854e44', role: 'Finance Staff', email: 'finance.staff@company.finance-staff.com', name: 'Amanda Finance' },
    { _id: '693dc3e3ee07fbcd93854e4b', role: 'Job Candidate', email: 'job.candidate@company.job-candidate.com', name: 'Chris Candidate' },
    { _id: '693dc3e3ee07fbcd93854e52', role: 'HR Admin', email: 'hr.admin@company.hr-admin.com', name: 'Patricia HRAdmin' },
];

// Collections to preserve (won't be cleared)
const PRESERVE_COLLECTIONS = ['employee_profiles', 'employeesystemroles', 'users'];

// Helper functions
function generateObjectId() {
    return new ObjectId();
}

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomChoice(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function getDateInMonth(year, month, day) {
    return new Date(year, month - 1, day);
}

// Current date info
const NOW = new Date();
const CURRENT_YEAR = NOW.getFullYear();
const CURRENT_MONTH = NOW.getMonth() + 1; // 1-12
const DAYS_IN_CURRENT_MONTH = new Date(CURRENT_YEAR, CURRENT_MONTH, 0).getDate();

// Previous month for historical data
const PREV_MONTH = CURRENT_MONTH === 1 ? 12 : CURRENT_MONTH - 1;
const PREV_YEAR = CURRENT_MONTH === 1 ? CURRENT_YEAR - 1 : CURRENT_YEAR;
const DAYS_IN_PREV_MONTH = new Date(PREV_YEAR, PREV_MONTH, 0).getDate();

async function seedDatabase() {
    const client = new MongoClient(MONGO_URI);
    
    try {
        await client.connect();
        console.log('Connected to MongoDB');
        
        const db = client.db();
        
        // Step 1: Get all collections and clear non-preserved ones
        console.log('\n=== Step 1: Clearing collections ===');
        const collections = await db.listCollections().toArray();
        
        for (const col of collections) {
            const colName = col.name;
            if (!PRESERVE_COLLECTIONS.includes(colName.toLowerCase())) {
                await db.collection(colName).deleteMany({});
                console.log(`Cleared: ${colName}`);
            } else {
                console.log(`Preserved: ${colName}`);
            }
        }
        
        // Step 2: Update employee profiles with proper salary data
        console.log('\n=== Step 2: Updating employee profiles with salary data ===');
        const salaries = [5000, 7500, 8000, 5500, 6000, 9000, 8500, 7000, 5500, 6500, 3000, 7500];
        
        for (let i = 0; i < EMPLOYEES.length; i++) {
            const emp = EMPLOYEES[i];
            await db.collection('employee_profiles').updateOne(
                { _id: new ObjectId(emp._id) },
                {
                    $set: {
                        baseSalary: salaries[i],
                        salary: salaries[i],
                        bankAccountNumber: `BANK${1000000 + i}`,
                        bankName: 'National Bank',
                        taxId: `TAX${100000 + i}`,
                        insuranceNumber: `INS${100000 + i}`,
                        employmentType: 'full-time',
                        status: 'active',
                        hireDate: new Date(2023, randomInt(0, 11), randomInt(1, 28)),
                    }
                },
                { upsert: false }
            );
            console.log(`Updated salary for ${emp.name}: $${salaries[i]}`);
        }
        
        // Step 3: Seed Organization Structure
        console.log('\n=== Step 3: Seeding organization structure ===');
        
        // Departments
        const departments = [
            { _id: generateObjectId(), name: 'Human Resources', code: 'HR', description: 'HR Department', headId: new ObjectId(EMPLOYEES[2]._id), status: 'active', createdAt: new Date(), updatedAt: new Date() },
            { _id: generateObjectId(), name: 'Finance', code: 'FIN', description: 'Finance Department', headId: new ObjectId(EMPLOYEES[9]._id), status: 'active', createdAt: new Date(), updatedAt: new Date() },
            { _id: generateObjectId(), name: 'Engineering', code: 'ENG', description: 'Engineering Department', headId: new ObjectId(EMPLOYEES[1]._id), status: 'active', createdAt: new Date(), updatedAt: new Date() },
            { _id: generateObjectId(), name: 'Legal', code: 'LEG', description: 'Legal Department', headId: new ObjectId(EMPLOYEES[7]._id), status: 'active', createdAt: new Date(), updatedAt: new Date() },
            { _id: generateObjectId(), name: 'IT', code: 'IT', description: 'IT Department', headId: new ObjectId(EMPLOYEES[6]._id), status: 'active', createdAt: new Date(), updatedAt: new Date() },
        ];
        await db.collection('departments').insertMany(departments);
        console.log(`Inserted ${departments.length} departments`);
        
        // Step 4: Seed Time Management - Shifts
        console.log('\n=== Step 4: Seeding shifts ===');
        
        const shifts = [
            { _id: generateObjectId(), name: 'Morning Shift', code: 'MORNING', startTime: '08:00', endTime: '16:00', breakMinutes: 60, workingHours: 8, status: 'active', createdAt: new Date(), updatedAt: new Date() },
            { _id: generateObjectId(), name: 'Evening Shift', code: 'EVENING', startTime: '14:00', endTime: '22:00', breakMinutes: 60, workingHours: 8, status: 'active', createdAt: new Date(), updatedAt: new Date() },
            { _id: generateObjectId(), name: 'Night Shift', code: 'NIGHT', startTime: '22:00', endTime: '06:00', breakMinutes: 60, workingHours: 8, status: 'active', createdAt: new Date(), updatedAt: new Date() },
            { _id: generateObjectId(), name: 'Flexible Shift', code: 'FLEX', startTime: '09:00', endTime: '17:00', breakMinutes: 60, workingHours: 8, status: 'active', createdAt: new Date(), updatedAt: new Date() },
        ];
        await db.collection('shifts').insertMany(shifts);
        console.log(`Inserted ${shifts.length} shifts`);
        
        // Step 5: Seed Shift Assignments
        console.log('\n=== Step 5: Seeding shift assignments ===');
        
        const shiftAssignments = [];
        for (let i = 0; i < EMPLOYEES.length - 1; i++) { // Exclude Job Candidate
            const emp = EMPLOYEES[i];
            if (emp.role === 'Job Candidate') continue;
            
            shiftAssignments.push({
                _id: generateObjectId(),
                employeeId: new ObjectId(emp._id),
                shiftId: shifts[i % shifts.length]._id,
                shift: shifts[i % shifts.length].name,
                startDate: new Date(CURRENT_YEAR, 0, 1),
                endDate: new Date(CURRENT_YEAR, 11, 31),
                status: 'approved',
                scheduledMinutes: 480, // 8 hours
                createdAt: new Date(),
                updatedAt: new Date(),
            });
        }
        await db.collection('shiftassignments').insertMany(shiftAssignments);
        console.log(`Inserted ${shiftAssignments.length} shift assignments`);
        
        // Step 6: Seed Lateness Rules
        console.log('\n=== Step 6: Seeding lateness rules ===');
        
        const latenessRules = [
            { _id: generateObjectId(), name: 'Standard Lateness Rule', description: 'Default lateness policy', gracePeriodMinutes: 15, graceMinutes: 15, deductionForEachMinute: 0.5, penaltyPerMinute: 0.5, maxPenalty: 100, active: true, createdAt: new Date(), updatedAt: new Date() },
            { _id: generateObjectId(), name: 'Strict Lateness Rule', description: 'Strict policy for critical roles', gracePeriodMinutes: 5, graceMinutes: 5, deductionForEachMinute: 1, penaltyPerMinute: 1, maxPenalty: 200, active: false, createdAt: new Date(), updatedAt: new Date() },
        ];
        await db.collection('latenessrules').insertMany(latenessRules);
        console.log(`Inserted ${latenessRules.length} lateness rules`);
        
        // Step 7: Seed Overtime Rules
        console.log('\n=== Step 7: Seeding overtime rules ===');
        
        const overtimeRules = [
            { _id: generateObjectId(), name: 'Standard Overtime', description: 'Regular overtime at 1.5x', multiplier: 1.5, maxHoursPerDay: 4, maxHoursPerMonth: 40, status: 'approved', approved: true, active: true, createdAt: new Date(), updatedAt: new Date() },
            { _id: generateObjectId(), name: 'Weekend Overtime', description: 'Weekend overtime at 2x', multiplier: 2.0, maxHoursPerDay: 8, maxHoursPerMonth: 32, status: 'approved', approved: true, active: true, createdAt: new Date(), updatedAt: new Date() },
            { _id: generateObjectId(), name: 'Holiday Overtime', description: 'Holiday overtime at 2.5x', multiplier: 2.5, maxHoursPerDay: 8, maxHoursPerMonth: 24, status: 'approved', approved: true, active: true, createdAt: new Date(), updatedAt: new Date() },
        ];
        await db.collection('overtimerules').insertMany(overtimeRules);
        console.log(`Inserted ${overtimeRules.length} overtime rules`);
        
        // Step 8: Seed Holidays
        console.log('\n=== Step 8: Seeding holidays ===');
        
        const holidays = [
            { _id: generateObjectId(), name: 'New Year', date: new Date(CURRENT_YEAR, 0, 1), type: 'public', description: 'New Year Day', createdAt: new Date(), updatedAt: new Date() },
            { _id: generateObjectId(), name: 'Christmas', date: new Date(CURRENT_YEAR, 11, 25), type: 'public', description: 'Christmas Day', createdAt: new Date(), updatedAt: new Date() },
            { _id: generateObjectId(), name: 'Independence Day', date: new Date(CURRENT_YEAR, 6, 4), type: 'public', description: 'Independence Day', createdAt: new Date(), updatedAt: new Date() },
            { _id: generateObjectId(), name: 'Labor Day', date: new Date(CURRENT_YEAR, 4, 1), type: 'public', description: 'Labor Day', createdAt: new Date(), updatedAt: new Date() },
            { _id: generateObjectId(), name: 'Thanksgiving', date: new Date(CURRENT_YEAR, 10, 28), type: 'public', description: 'Thanksgiving Day', createdAt: new Date(), updatedAt: new Date() },
        ];
        await db.collection('holidays').insertMany(holidays);
        console.log(`Inserted ${holidays.length} holidays`);
        
        // Step 9: Seed Leave Types
        console.log('\n=== Step 9: Seeding leave types ===');
        
        const leaveTypes = [
            { _id: generateObjectId(), name: 'Annual Leave', code: 'AL', description: 'Paid annual leave', defaultDays: 21, isPaid: true, requiresApproval: true, status: 'active', createdAt: new Date(), updatedAt: new Date() },
            { _id: generateObjectId(), name: 'Sick Leave', code: 'SL', description: 'Paid sick leave', defaultDays: 14, isPaid: true, requiresApproval: true, status: 'active', createdAt: new Date(), updatedAt: new Date() },
            { _id: generateObjectId(), name: 'Unpaid Leave', code: 'UL', description: 'Unpaid personal leave', defaultDays: 30, isPaid: false, requiresApproval: true, status: 'active', createdAt: new Date(), updatedAt: new Date() },
            { _id: generateObjectId(), name: 'Maternity Leave', code: 'ML', description: 'Maternity leave', defaultDays: 90, isPaid: true, requiresApproval: true, status: 'active', createdAt: new Date(), updatedAt: new Date() },
            { _id: generateObjectId(), name: 'Paternity Leave', code: 'PL', description: 'Paternity leave', defaultDays: 14, isPaid: true, requiresApproval: true, status: 'active', createdAt: new Date(), updatedAt: new Date() },
        ];
        await db.collection('leavetypes').insertMany(leaveTypes);
        console.log(`Inserted ${leaveTypes.length} leave types`);
        
        // Step 10: Seed Leave Balances
        console.log('\n=== Step 10: Seeding leave balances ===');
        
        const leaveBalances = [];
        for (const emp of EMPLOYEES) {
            if (emp.role === 'Job Candidate') continue;
            
            for (const leaveType of leaveTypes) {
                leaveBalances.push({
                    _id: generateObjectId(),
                    employeeId: new ObjectId(emp._id),
                    leaveTypeId: leaveType._id,
                    leaveType: leaveType.name,
                    year: CURRENT_YEAR,
                    totalDays: leaveType.defaultDays,
                    usedDays: randomInt(0, 5),
                    remainingDays: leaveType.defaultDays - randomInt(0, 5),
                    createdAt: new Date(),
                    updatedAt: new Date(),
                });
            }
        }
        await db.collection('leavebalances').insertMany(leaveBalances);
        console.log(`Inserted ${leaveBalances.length} leave balances`);
        
        // Step 11: Seed Leave Requests (mix of approved, pending, rejected)
        console.log('\n=== Step 11: Seeding leave requests ===');
        
        const leaveRequests = [];
        const leaveStatuses = ['approved', 'approved', 'approved', 'pending', 'rejected'];
        
        for (let i = 0; i < 15; i++) {
            const emp = randomChoice(EMPLOYEES.filter(e => e.role !== 'Job Candidate'));
            const leaveType = randomChoice(leaveTypes);
            const startDay = randomInt(1, 20);
            const duration = randomInt(1, 3);
            const status = randomChoice(leaveStatuses);
            
            leaveRequests.push({
                _id: generateObjectId(),
                employeeId: new ObjectId(emp._id),
                leaveTypeId: leaveType._id,
                leaveType: leaveType.name,
                isPaid: leaveType.isPaid,
                startDate: new Date(CURRENT_YEAR, CURRENT_MONTH - 1, startDay),
                endDate: new Date(CURRENT_YEAR, CURRENT_MONTH - 1, startDay + duration),
                days: duration,
                reason: `Leave request for ${leaveType.name}`,
                status: status,
                approvedBy: status === 'approved' ? new ObjectId(EMPLOYEES[2]._id) : null,
                approvedAt: status === 'approved' ? new Date() : null,
                createdAt: new Date(),
                updatedAt: new Date(),
            });
        }
        await db.collection('leaverequests').insertMany(leaveRequests);
        console.log(`Inserted ${leaveRequests.length} leave requests`);
        
        // Step 12: Seed Attendance Records for current month
        console.log('\n=== Step 12: Seeding attendance records ===');
        
        const attendanceRecords = [];
        const workingEmployees = EMPLOYEES.filter(e => e.role !== 'Job Candidate');
        
        // Generate attendance for the past 15 days of current month
        const daysToGenerate = Math.min(15, NOW.getDate());
        
        for (const emp of workingEmployees) {
            const shiftAssignment = shiftAssignments.find(sa => sa.employeeId.toString() === emp._id);
            const shift = shiftAssignment ? shifts.find(s => s._id.equals(shiftAssignment.shiftId)) : shifts[0];
            
            for (let day = 1; day <= daysToGenerate; day++) {
                const date = new Date(CURRENT_YEAR, CURRENT_MONTH - 1, day);
                const dayOfWeek = date.getDay();
                
                // Skip weekends
                if (dayOfWeek === 0 || dayOfWeek === 6) continue;
                
                // Check if on leave
                const onLeave = leaveRequests.find(lr => 
                    lr.employeeId.toString() === emp._id && 
                    lr.status === 'approved' &&
                    new Date(lr.startDate) <= date && 
                    new Date(lr.endDate) >= date
                );
                
                if (onLeave) {
                    attendanceRecords.push({
                        _id: generateObjectId(),
                        employeeId: new ObjectId(emp._id),
                        date: date,
                        status: 'on_leave',
                        isOnLeave: true,
                        leaveType: onLeave.leaveType,
                        scheduledMinutes: 480,
                        actualWorkMinutes: 0,
                        isHoliday: false,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    });
                    continue;
                }
                
                // Random attendance variation
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
                    _id: generateObjectId(),
                    employeeId: new ObjectId(emp._id),
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
                    createdAt: new Date(),
                    updatedAt: new Date(),
                });
            }
        }
        await db.collection('attendancerecords').insertMany(attendanceRecords);
        console.log(`Inserted ${attendanceRecords.length} attendance records`);
        
        // Step 13: Seed Payroll Configuration
        console.log('\n=== Step 13: Seeding payroll configuration ===');
        
        const payrollConfig = {
            _id: generateObjectId(),
            name: 'Default Payroll Configuration',
            description: 'Standard payroll configuration',
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
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        await db.collection('payrollconfigs').insertOne(payrollConfig);
        console.log('Inserted payroll configuration');
        
        // Step 14: Seed Allowance Types
        console.log('\n=== Step 14: Seeding allowance types ===');
        
        const allowanceTypes = [
            { _id: generateObjectId(), name: 'Housing Allowance', code: 'HOUSING', description: 'Monthly housing allowance', defaultAmount: 500, isTaxable: false, status: 'active', createdAt: new Date(), updatedAt: new Date() },
            { _id: generateObjectId(), name: 'Transportation Allowance', code: 'TRANSPORT', description: 'Monthly transportation allowance', defaultAmount: 200, isTaxable: false, status: 'active', createdAt: new Date(), updatedAt: new Date() },
            { _id: generateObjectId(), name: 'Meal Allowance', code: 'MEAL', description: 'Daily meal allowance', defaultAmount: 150, isTaxable: false, status: 'active', createdAt: new Date(), updatedAt: new Date() },
            { _id: generateObjectId(), name: 'Communication Allowance', code: 'COMM', description: 'Phone and internet allowance', defaultAmount: 100, isTaxable: false, status: 'active', createdAt: new Date(), updatedAt: new Date() },
        ];
        await db.collection('allowancetypes').insertMany(allowanceTypes);
        console.log(`Inserted ${allowanceTypes.length} allowance types`);
        
        // Step 15: Seed Employee Allowances
        console.log('\n=== Step 15: Seeding employee allowances ===');
        
        const employeeAllowances = [];
        for (const emp of workingEmployees) {
            // Give each employee 2-4 random allowances
            const numAllowances = randomInt(2, 4);
            const selectedAllowances = [...allowanceTypes].sort(() => 0.5 - Math.random()).slice(0, numAllowances);
            
            for (const allowance of selectedAllowances) {
                employeeAllowances.push({
                    _id: generateObjectId(),
                    employeeId: new ObjectId(emp._id),
                    allowanceTypeId: allowance._id,
                    allowanceType: allowance.name,
                    amount: allowance.defaultAmount,
                    effectiveDate: new Date(CURRENT_YEAR, 0, 1),
                    status: 'active',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                });
            }
        }
        await db.collection('employeeallowances').insertMany(employeeAllowances);
        console.log(`Inserted ${employeeAllowances.length} employee allowances`);
        
        // Step 16: Seed Deduction Types
        console.log('\n=== Step 16: Seeding deduction types ===');
        
        const deductionTypes = [
            { _id: generateObjectId(), name: 'Income Tax', code: 'TAX', description: 'Monthly income tax', calculationType: 'percentage', rate: 0.15, isMandatory: true, status: 'active', createdAt: new Date(), updatedAt: new Date() },
            { _id: generateObjectId(), name: 'Social Security', code: 'SS', description: 'Social security contribution', calculationType: 'percentage', rate: 0.0625, isMandatory: true, status: 'active', createdAt: new Date(), updatedAt: new Date() },
            { _id: generateObjectId(), name: 'Health Insurance', code: 'HEALTH', description: 'Health insurance premium', calculationType: 'fixed', amount: 150, isMandatory: true, status: 'active', createdAt: new Date(), updatedAt: new Date() },
            { _id: generateObjectId(), name: 'Pension', code: 'PENSION', description: 'Pension contribution', calculationType: 'percentage', rate: 0.05, isMandatory: true, status: 'active', createdAt: new Date(), updatedAt: new Date() },
            { _id: generateObjectId(), name: 'Union Dues', code: 'UNION', description: 'Union membership dues', calculationType: 'fixed', amount: 25, isMandatory: false, status: 'active', createdAt: new Date(), updatedAt: new Date() },
        ];
        await db.collection('deductiontypes').insertMany(deductionTypes);
        console.log(`Inserted ${deductionTypes.length} deduction types`);
        
        // Step 17: Seed a completed payroll run for previous month
        console.log('\n=== Step 17: Seeding previous month payroll run ===');
        
        const prevMonthPayrollRun = {
            _id: generateObjectId(),
            payrollPeriod: {
                month: PREV_MONTH,
                year: PREV_YEAR,
                startDate: new Date(PREV_YEAR, PREV_MONTH - 1, 1),
                endDate: new Date(PREV_YEAR, PREV_MONTH - 1, DAYS_IN_PREV_MONTH),
            },
            status: 'approved',
            totalEmployees: workingEmployees.length,
            totalGrossPay: 0,
            totalNetPay: 0,
            totalDeductions: 0,
            totalAllowances: 0,
            totalOvertimePay: 0,
            totalBonuses: 0,
            processedAt: new Date(PREV_YEAR, PREV_MONTH - 1, 28),
            approvedAt: new Date(PREV_YEAR, PREV_MONTH - 1, 29),
            approvedBy: new ObjectId(EMPLOYEES[5]._id), // Payroll Manager
            createdBy: new ObjectId(EMPLOYEES[4]._id), // Payroll Specialist
            createdAt: new Date(PREV_YEAR, PREV_MONTH - 1, 25),
            updatedAt: new Date(PREV_YEAR, PREV_MONTH - 1, 29),
        };
        
        // Calculate totals for prev month
        let totalGross = 0, totalNet = 0, totalDed = 0, totalAllow = 0;
        const prevMonthPayslips = [];
        
        for (let i = 0; i < workingEmployees.length; i++) {
            const emp = workingEmployees[i];
            const baseSalary = salaries[i];
            
            // Get employee allowances
            const empAllowances = employeeAllowances.filter(a => a.employeeId.toString() === emp._id);
            const totalEmpAllowances = empAllowances.reduce((sum, a) => sum + a.amount, 0);
            
            // Calculate deductions
            const tax = baseSalary * 0.15;
            const socialSecurity = baseSalary * 0.0625;
            const healthInsurance = 150;
            const pension = baseSalary * 0.05;
            const totalEmpDeductions = tax + socialSecurity + healthInsurance + pension;
            
            const grossPay = baseSalary + totalEmpAllowances;
            const netPay = grossPay - totalEmpDeductions;
            
            totalGross += grossPay;
            totalNet += netPay;
            totalDed += totalEmpDeductions;
            totalAllow += totalEmpAllowances;
            
            prevMonthPayslips.push({
                _id: generateObjectId(),
                payrollRunId: prevMonthPayrollRun._id,
                employeeId: new ObjectId(emp._id),
                payrollPeriod: prevMonthPayrollRun.payrollPeriod,
                baseSalary: baseSalary,
                grossPay: grossPay,
                netPay: netPay,
                allowances: {
                    total: totalEmpAllowances,
                    items: empAllowances.map(a => ({ name: a.allowanceType, amount: a.amount })),
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
                        { name: 'Pension', amount: pension },
                    ],
                },
                overtime: { hours: 0, amount: 0 },
                bonuses: { total: 0, items: [] },
                status: 'paid',
                paidAt: new Date(PREV_YEAR, PREV_MONTH - 1, 28),
                createdAt: new Date(PREV_YEAR, PREV_MONTH - 1, 25),
                updatedAt: new Date(PREV_YEAR, PREV_MONTH - 1, 28),
            });
        }
        
        prevMonthPayrollRun.totalGrossPay = totalGross;
        prevMonthPayrollRun.totalNetPay = totalNet;
        prevMonthPayrollRun.totalDeductions = totalDed;
        prevMonthPayrollRun.totalAllowances = totalAllow;
        
        await db.collection('payrollruns').insertOne(prevMonthPayrollRun);
        await db.collection('payslips').insertMany(prevMonthPayslips);
        console.log(`Inserted previous month payroll run with ${prevMonthPayslips.length} payslips`);
        
        // Step 18: Seed bonus configurations
        console.log('\n=== Step 18: Seeding bonus configurations ===');
        
        const bonusConfigs = [
            { _id: generateObjectId(), name: 'Performance Bonus', code: 'PERF', description: 'Quarterly performance bonus', calculationType: 'percentage', rate: 0.1, maxAmount: 5000, status: 'active', createdAt: new Date(), updatedAt: new Date() },
            { _id: generateObjectId(), name: 'Annual Bonus', code: 'ANNUAL', description: 'Year-end bonus', calculationType: 'percentage', rate: 0.2, maxAmount: 10000, status: 'active', createdAt: new Date(), updatedAt: new Date() },
            { _id: generateObjectId(), name: 'Signing Bonus', code: 'SIGN', description: 'New employee signing bonus', calculationType: 'fixed', amount: 1000, status: 'active', createdAt: new Date(), updatedAt: new Date() },
            { _id: generateObjectId(), name: 'Referral Bonus', code: 'REF', description: 'Employee referral bonus', calculationType: 'fixed', amount: 500, status: 'active', createdAt: new Date(), updatedAt: new Date() },
        ];
        await db.collection('bonusconfigs').insertMany(bonusConfigs);
        console.log(`Inserted ${bonusConfigs.length} bonus configurations`);
        
        // Step 19: Seed tax brackets
        console.log('\n=== Step 19: Seeding tax brackets ===');
        
        const taxBrackets = [
            { _id: generateObjectId(), name: 'Tax Bracket 0-5K', minIncome: 0, maxIncome: 5000, rate: 0.10, year: CURRENT_YEAR, status: 'active', createdAt: new Date(), updatedAt: new Date() },
            { _id: generateObjectId(), name: 'Tax Bracket 5K-10K', minIncome: 5001, maxIncome: 10000, rate: 0.15, year: CURRENT_YEAR, status: 'active', createdAt: new Date(), updatedAt: new Date() },
            { _id: generateObjectId(), name: 'Tax Bracket 10K-20K', minIncome: 10001, maxIncome: 20000, rate: 0.20, year: CURRENT_YEAR, status: 'active', createdAt: new Date(), updatedAt: new Date() },
            { _id: generateObjectId(), name: 'Tax Bracket 20K-50K', minIncome: 20001, maxIncome: 50000, rate: 0.25, year: CURRENT_YEAR, status: 'active', createdAt: new Date(), updatedAt: new Date() },
            { _id: generateObjectId(), name: 'Tax Bracket 50K+', minIncome: 50001, maxIncome: null, rate: 0.30, year: CURRENT_YEAR, status: 'active', createdAt: new Date(), updatedAt: new Date() },
        ];
        await db.collection('taxbrackets').insertMany(taxBrackets);
        console.log(`Inserted ${taxBrackets.length} tax brackets`);
        
        // Step 20: Seed benefits
        console.log('\n=== Step 20: Seeding employee benefits ===');
        
        const benefitTypes = [
            { _id: generateObjectId(), name: 'Health Insurance', code: 'HEALTH', description: 'Company health insurance', employerContribution: 200, employeeContribution: 50, status: 'active', createdAt: new Date(), updatedAt: new Date() },
            { _id: generateObjectId(), name: 'Dental Insurance', code: 'DENTAL', description: 'Dental coverage', employerContribution: 50, employeeContribution: 20, status: 'active', createdAt: new Date(), updatedAt: new Date() },
            { _id: generateObjectId(), name: 'Vision Insurance', code: 'VISION', description: 'Vision coverage', employerContribution: 30, employeeContribution: 10, status: 'active', createdAt: new Date(), updatedAt: new Date() },
            { _id: generateObjectId(), name: '401k Matching', code: '401K', description: 'Retirement matching', employerContribution: 300, employeeContribution: 300, status: 'active', createdAt: new Date(), updatedAt: new Date() },
        ];
        await db.collection('benefittypes').insertMany(benefitTypes);
        console.log(`Inserted ${benefitTypes.length} benefit types`);
        
        // Assign benefits to employees
        const employeeBenefits = [];
        for (const emp of workingEmployees) {
            const numBenefits = randomInt(2, 4);
            const selectedBenefits = [...benefitTypes].sort(() => 0.5 - Math.random()).slice(0, numBenefits);
            
            for (const benefit of selectedBenefits) {
                employeeBenefits.push({
                    _id: generateObjectId(),
                    employeeId: new ObjectId(emp._id),
                    benefitTypeId: benefit._id,
                    benefitType: benefit.name,
                    employerContribution: benefit.employerContribution,
                    employeeContribution: benefit.employeeContribution,
                    startDate: new Date(CURRENT_YEAR, 0, 1),
                    status: 'active',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                });
            }
        }
        await db.collection('employeebenefits').insertMany(employeeBenefits);
        console.log(`Inserted ${employeeBenefits.length} employee benefits`);
        
        // Summary
        console.log('\n========================================');
        console.log('DATABASE SEEDING COMPLETED SUCCESSFULLY!');
        console.log('========================================');
        console.log('\nSeeded data summary:');
        console.log(`- ${departments.length} departments`);
        console.log(`- ${shifts.length} shifts`);
        console.log(`- ${shiftAssignments.length} shift assignments`);
        console.log(`- ${latenessRules.length} lateness rules`);
        console.log(`- ${overtimeRules.length} overtime rules`);
        console.log(`- ${holidays.length} holidays`);
        console.log(`- ${leaveTypes.length} leave types`);
        console.log(`- ${leaveBalances.length} leave balances`);
        console.log(`- ${leaveRequests.length} leave requests`);
        console.log(`- ${attendanceRecords.length} attendance records`);
        console.log(`- 1 payroll configuration`);
        console.log(`- ${allowanceTypes.length} allowance types`);
        console.log(`- ${employeeAllowances.length} employee allowances`);
        console.log(`- ${deductionTypes.length} deduction types`);
        console.log(`- 1 previous month payroll run`);
        console.log(`- ${prevMonthPayslips.length} payslips`);
        console.log(`- ${bonusConfigs.length} bonus configurations`);
        console.log(`- ${taxBrackets.length} tax brackets`);
        console.log(`- ${benefitTypes.length} benefit types`);
        console.log(`- ${employeeBenefits.length} employee benefits`);
        console.log('\nEmployees preserved with updated salaries:');
        for (let i = 0; i < EMPLOYEES.length; i++) {
            console.log(`  - ${EMPLOYEES[i].name} (${EMPLOYEES[i].role}): $${salaries[i]}`);
        }
        
    } catch (error) {
        console.error('Error seeding database:', error);
        throw error;
    } finally {
        await client.close();
        console.log('\nDatabase connection closed');
    }
}

// Run the seed script
seedDatabase()
    .then(() => {
        console.log('\nSeed script completed successfully!');
        process.exit(0);
    })
    .catch((err) => {
        console.error('Seed script failed:', err);
        process.exit(1);
    });
