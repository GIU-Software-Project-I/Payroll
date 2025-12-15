/**
 * Comprehensive Payroll Test Data Seed Script
 * 
 * This script seeds the database with realistic data to test:
 * - Payroll execution workflows
 * - Irregularities and spike detection
 * - Edge cases (negative payments, prorated salaries, etc.)
 * - Manager escalation and resolution
 * - Multi-department payroll runs
 */

const { MongoClient, ObjectId } = require('mongodb');
const bcrypt = require('bcrypt');
require('dotenv').config();

const SALT_ROUNDS = 10;

// Helper to generate ObjectIds
const genId = () => new ObjectId();

// Date helpers
const now = new Date();
const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
const twoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1);

async function seedData() {
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db();
    
    console.log('🚀 Starting comprehensive payroll test data seeding...\n');

    // ============================================
    // 1. DEPARTMENTS
    // ============================================
    console.log('📁 Creating departments...');
    
    const departments = [
      { _id: genId(), name: 'Engineering', code: 'ENG', headCount: 15, budget: 500000 },
      { _id: genId(), name: 'Human Resources', code: 'HR', headCount: 8, budget: 200000 },
      { _id: genId(), name: 'Finance', code: 'FIN', headCount: 10, budget: 300000 },
      { _id: genId(), name: 'Sales', code: 'SALES', headCount: 12, budget: 400000 },
      { _id: genId(), name: 'Marketing', code: 'MKT', headCount: 6, budget: 180000 },
      { _id: genId(), name: 'Operations', code: 'OPS', headCount: 20, budget: 350000 },
    ];

    await db.collection('departments').deleteMany({});
    await db.collection('departments').insertMany(departments);
    console.log(`   ✅ Created ${departments.length} departments`);

    // ============================================
    // 2. USERS (System Users with Roles)
    // ============================================
    console.log('👤 Creating system users...');
    
    const hashedPassword = await bcrypt.hash('Test@123', SALT_ROUNDS);
    
    const users = [
      // Payroll Specialists
      { _id: genId(), email: 'specialist1@payroll.com', password: hashedPassword, firstName: 'Ahmed', lastName: 'Hassan', role: 'payroll_specialist', department: 'Finance', isActive: true },
      { _id: genId(), email: 'specialist2@payroll.com', password: hashedPassword, firstName: 'Sara', lastName: 'Mohamed', role: 'payroll_specialist', department: 'Finance', isActive: true },
      
      // Payroll Managers
      { _id: genId(), email: 'manager1@payroll.com', password: hashedPassword, firstName: 'Omar', lastName: 'Ali', role: 'payroll_manager', department: 'Finance', isActive: true },
      { _id: genId(), email: 'manager2@payroll.com', password: hashedPassword, firstName: 'Fatima', lastName: 'Ibrahim', role: 'payroll_manager', department: 'Finance', isActive: true },
      
      // Finance Staff
      { _id: genId(), email: 'finance1@payroll.com', password: hashedPassword, firstName: 'Khaled', lastName: 'Mahmoud', role: 'finance_staff', department: 'Finance', isActive: true },
      { _id: genId(), email: 'finance2@payroll.com', password: hashedPassword, firstName: 'Nour', lastName: 'Ahmed', role: 'finance_staff', department: 'Finance', isActive: true },
      
      // HR Manager (for escalations)
      { _id: genId(), email: 'hr.manager@payroll.com', password: hashedPassword, firstName: 'Layla', lastName: 'Youssef', role: 'hr_manager', department: 'Human Resources', isActive: true },
      
      // Admin
      { _id: genId(), email: 'admin@payroll.com', password: hashedPassword, firstName: 'System', lastName: 'Admin', role: 'admin', department: 'IT', isActive: true },
    ];

    await db.collection('users').deleteMany({ email: { $regex: /@payroll\.com$/ } });
    await db.collection('users').insertMany(users);
    console.log(`   ✅ Created ${users.length} system users`);

    const specialistId = users[0]._id;
    const managerId = users[2]._id;
    const financeId = users[4]._id;

    // ============================================
    // 3. EMPLOYEES (Various scenarios)
    // ============================================
    console.log('👥 Creating employees with various scenarios...');

    const employees = [
      // ENGINEERING DEPARTMENT - Various scenarios
      {
        _id: genId(),
        employeeId: 'EMP001',
        firstName: 'Mohamed',
        lastName: 'Karim',
        email: 'mohamed.karim@company.com',
        department: departments[0]._id, // Engineering
        departmentName: 'Engineering',
        position: 'Senior Software Engineer',
        hireDate: new Date('2020-03-15'),
        status: 'active',
        salary: {
          baseSalary: 25000,
          currency: 'EGP',
          allowances: {
            housing: 3000,
            transportation: 1500,
            mobile: 500,
          },
          deductions: {
            socialInsurance: 1400,
            healthInsurance: 500,
          }
        },
        bankInfo: { bankName: 'CIB', accountNumber: '1234567890', iban: 'EG123456789012345678901234' },
        taxInfo: { taxId: 'TAX001', taxBracket: '22.5%' },
      },
      {
        _id: genId(),
        employeeId: 'EMP002',
        firstName: 'Yasmine',
        lastName: 'Farouk',
        email: 'yasmine.farouk@company.com',
        department: departments[0]._id,
        departmentName: 'Engineering',
        position: 'DevOps Engineer',
        hireDate: new Date('2021-08-01'),
        status: 'active',
        salary: {
          baseSalary: 22000,
          currency: 'EGP',
          allowances: { housing: 2500, transportation: 1200 },
          deductions: { socialInsurance: 1200, healthInsurance: 400 }
        },
        bankInfo: { bankName: 'NBE', accountNumber: '9876543210' },
        taxInfo: { taxId: 'TAX002', taxBracket: '22.5%' },
        // SCENARIO: Has overtime spike this month
        overtimeRate: 1.5,
      },
      {
        _id: genId(),
        employeeId: 'EMP003',
        firstName: 'Amr',
        lastName: 'Saleh',
        email: 'amr.saleh@company.com',
        department: departments[0]._id,
        departmentName: 'Engineering',
        position: 'Junior Developer',
        hireDate: new Date('2024-11-15'), // NEW HIRE - prorated salary
        status: 'active',
        salary: {
          baseSalary: 12000,
          currency: 'EGP',
          allowances: { housing: 1500, transportation: 800 },
          deductions: { socialInsurance: 700, healthInsurance: 300 }
        },
        bankInfo: { bankName: 'QNB', accountNumber: '5555555555' },
        taxInfo: { taxId: 'TAX003', taxBracket: '10%' },
        // SCENARIO: New hire with prorated first month
      },
      {
        _id: genId(),
        employeeId: 'EMP004',
        firstName: 'Dina',
        lastName: 'Mostafa',
        email: 'dina.mostafa@company.com',
        department: departments[0]._id,
        departmentName: 'Engineering',
        position: 'QA Lead',
        hireDate: new Date('2019-06-01'),
        terminationDate: new Date('2024-12-31'), // TERMINATION - final payment
        status: 'terminated',
        salary: {
          baseSalary: 20000,
          currency: 'EGP',
          allowances: { housing: 2000, transportation: 1000 },
          deductions: { socialInsurance: 1100, healthInsurance: 400 }
        },
        bankInfo: { bankName: 'HSBC', accountNumber: '7777777777' },
        taxInfo: { taxId: 'TAX004', taxBracket: '22.5%' },
        // SCENARIO: Terminated - needs end of service calculation
        endOfService: {
          reason: 'resignation',
          noticePeriod: 30,
          unusedLeaveDays: 15,
          severancePay: 40000,
        }
      },

      // HR DEPARTMENT
      {
        _id: genId(),
        employeeId: 'EMP005',
        firstName: 'Hana',
        lastName: 'Gamal',
        email: 'hana.gamal@company.com',
        department: departments[1]._id, // HR
        departmentName: 'Human Resources',
        position: 'HR Specialist',
        hireDate: new Date('2022-01-15'),
        status: 'active',
        salary: {
          baseSalary: 15000,
          currency: 'EGP',
          allowances: { housing: 1800, transportation: 900 },
          deductions: { socialInsurance: 850, healthInsurance: 350 }
        },
        bankInfo: { bankName: 'CIB', accountNumber: '1111111111' },
        taxInfo: { taxId: 'TAX005', taxBracket: '15%' },
      },
      {
        _id: genId(),
        employeeId: 'EMP006',
        firstName: 'Tarek',
        lastName: 'Nabil',
        email: 'tarek.nabil@company.com',
        department: departments[1]._id,
        departmentName: 'Human Resources',
        position: 'Recruitment Manager',
        hireDate: new Date('2018-09-01'),
        status: 'active',
        salary: {
          baseSalary: 28000,
          currency: 'EGP',
          allowances: { housing: 3500, transportation: 1500, phone: 800 },
          deductions: { socialInsurance: 1540, healthInsurance: 600 }
        },
        bankInfo: { bankName: 'NBE', accountNumber: '2222222222' },
        taxInfo: { taxId: 'TAX006', taxBracket: '25%' },
        // SCENARIO: Got a mid-month salary increase (spike)
        salaryHistory: [
          { effectiveDate: new Date('2024-11-01'), baseSalary: 25000 },
          { effectiveDate: new Date('2024-12-01'), baseSalary: 28000 }, // 12% increase
        ]
      },

      // FINANCE DEPARTMENT
      {
        _id: genId(),
        employeeId: 'EMP007',
        firstName: 'Mona',
        lastName: 'Ashraf',
        email: 'mona.ashraf@company.com',
        department: departments[2]._id, // Finance
        departmentName: 'Finance',
        position: 'Senior Accountant',
        hireDate: new Date('2017-04-01'),
        status: 'active',
        salary: {
          baseSalary: 23000,
          currency: 'EGP',
          allowances: { housing: 2800, transportation: 1200 },
          deductions: { socialInsurance: 1265, healthInsurance: 500 }
        },
        bankInfo: { bankName: 'AAIB', accountNumber: '3333333333' },
        taxInfo: { taxId: 'TAX007', taxBracket: '22.5%' },
      },
      {
        _id: genId(),
        employeeId: 'EMP008',
        firstName: 'Sherif',
        lastName: 'Adel',
        email: 'sherif.adel@company.com',
        department: departments[2]._id,
        departmentName: 'Finance',
        position: 'Finance Analyst',
        hireDate: new Date('2023-02-15'),
        status: 'active',
        salary: {
          baseSalary: 18000,
          currency: 'EGP',
          allowances: { housing: 2200, transportation: 1000 },
          deductions: { socialInsurance: 990, healthInsurance: 400 }
        },
        bankInfo: { bankName: 'Banque Misr', accountNumber: '4444444444' },
        taxInfo: { taxId: 'TAX008', taxBracket: '15%' },
        // SCENARIO: Has a loan deduction
        loans: [{
          loanId: 'LOAN001',
          type: 'personal',
          totalAmount: 50000,
          monthlyDeduction: 2500,
          remainingBalance: 35000,
          startDate: new Date('2024-06-01'),
        }]
      },

      // SALES DEPARTMENT
      {
        _id: genId(),
        employeeId: 'EMP009',
        firstName: 'Ramy',
        lastName: 'Fathy',
        email: 'ramy.fathy@company.com',
        department: departments[3]._id, // Sales
        departmentName: 'Sales',
        position: 'Sales Manager',
        hireDate: new Date('2019-01-15'),
        status: 'active',
        salary: {
          baseSalary: 30000,
          currency: 'EGP',
          allowances: { housing: 4000, transportation: 2000, car: 3000 },
          deductions: { socialInsurance: 1650, healthInsurance: 700 }
        },
        bankInfo: { bankName: 'CIB', accountNumber: '5555555555' },
        taxInfo: { taxId: 'TAX009', taxBracket: '25%' },
        // SCENARIO: Commission-based with high variance
        commissionRate: 5,
        hasVariableCompensation: true,
      },
      {
        _id: genId(),
        employeeId: 'EMP010',
        firstName: 'Noha',
        lastName: 'Khaled',
        email: 'noha.khaled@company.com',
        department: departments[3]._id,
        departmentName: 'Sales',
        position: 'Sales Representative',
        hireDate: new Date('2022-07-01'),
        status: 'active',
        salary: {
          baseSalary: 12000,
          currency: 'EGP',
          allowances: { housing: 1500, transportation: 1000 },
          deductions: { socialInsurance: 660, healthInsurance: 300 }
        },
        bankInfo: { bankName: 'NBE', accountNumber: '6666666666' },
        taxInfo: { taxId: 'TAX010', taxBracket: '10%' },
        // SCENARIO: On unpaid leave
        leaveStatus: {
          onLeave: true,
          leaveType: 'unpaid',
          startDate: new Date('2024-12-10'),
          endDate: new Date('2024-12-25'),
          unpaidDays: 12,
        }
      },

      // MARKETING DEPARTMENT  
      {
        _id: genId(),
        employeeId: 'EMP011',
        firstName: 'Youssef',
        lastName: 'Sameh',
        email: 'youssef.sameh@company.com',
        department: departments[4]._id, // Marketing
        departmentName: 'Marketing',
        position: 'Marketing Director',
        hireDate: new Date('2016-11-01'),
        status: 'active',
        salary: {
          baseSalary: 45000,
          currency: 'EGP',
          allowances: { housing: 6000, transportation: 3000, car: 5000, phone: 1000 },
          deductions: { socialInsurance: 2475, healthInsurance: 1000 }
        },
        bankInfo: { bankName: 'HSBC', accountNumber: '7777777777' },
        taxInfo: { taxId: 'TAX011', taxBracket: '27.5%' },
      },
      {
        _id: genId(),
        employeeId: 'EMP012',
        firstName: 'Aya',
        lastName: 'Hassan',
        email: 'aya.hassan@company.com',
        department: departments[4]._id,
        departmentName: 'Marketing',
        position: 'Content Creator',
        hireDate: new Date('2024-01-15'),
        status: 'active',
        salary: {
          baseSalary: 10000,
          currency: 'EGP',
          allowances: { housing: 1200, transportation: 600 },
          deductions: { socialInsurance: 550, healthInsurance: 250 }
        },
        bankInfo: { bankName: 'CIB', accountNumber: '8888888888' },
        taxInfo: { taxId: 'TAX012', taxBracket: '10%' },
        // SCENARIO: Has penalty deduction for late attendance
        penalties: [{
          type: 'late_attendance',
          amount: 500,
          date: new Date('2024-12-05'),
          reason: 'Late arrival 3 times this month',
        }]
      },

      // OPERATIONS DEPARTMENT
      {
        _id: genId(),
        employeeId: 'EMP013',
        firstName: 'Mahmoud',
        lastName: 'Sayed',
        email: 'mahmoud.sayed@company.com',
        department: departments[5]._id, // Operations
        departmentName: 'Operations',
        position: 'Operations Manager',
        hireDate: new Date('2015-03-01'),
        status: 'active',
        salary: {
          baseSalary: 35000,
          currency: 'EGP',
          allowances: { housing: 4500, transportation: 2000, phone: 800 },
          deductions: { socialInsurance: 1925, healthInsurance: 800 }
        },
        bankInfo: { bankName: 'NBE', accountNumber: '9999999999' },
        taxInfo: { taxId: 'TAX013', taxBracket: '25%' },
      },
      {
        _id: genId(),
        employeeId: 'EMP014',
        firstName: 'Salma',
        lastName: 'Omar',
        email: 'salma.omar@company.com',
        department: departments[5]._id,
        departmentName: 'Operations',
        position: 'Logistics Coordinator',
        hireDate: new Date('2021-05-15'),
        status: 'active',
        salary: {
          baseSalary: 14000,
          currency: 'EGP',
          allowances: { housing: 1700, transportation: 900 },
          deductions: { socialInsurance: 770, healthInsurance: 350 }
        },
        bankInfo: { bankName: 'QNB', accountNumber: '1010101010' },
        taxInfo: { taxId: 'TAX014', taxBracket: '15%' },
        // SCENARIO: Multiple absence deductions
        absences: [{
          date: new Date('2024-12-03'),
          type: 'unexcused',
          deductionAmount: 466.67, // 1 day salary
        }, {
          date: new Date('2024-12-12'),
          type: 'unexcused',
          deductionAmount: 466.67,
        }]
      },
      {
        _id: genId(),
        employeeId: 'EMP015',
        firstName: 'Hassan',
        lastName: 'Reda',
        email: 'hassan.reda@company.com',
        department: departments[5]._id,
        departmentName: 'Operations',
        position: 'Warehouse Supervisor',
        hireDate: new Date('2020-08-01'),
        status: 'suspended', // SCENARIO: Suspended employee
        salary: {
          baseSalary: 16000,
          currency: 'EGP',
          allowances: { housing: 2000, transportation: 1000 },
          deductions: { socialInsurance: 880, healthInsurance: 400 }
        },
        bankInfo: { bankName: 'Banque Misr', accountNumber: '1212121212' },
        taxInfo: { taxId: 'TAX015', taxBracket: '15%' },
        suspension: {
          startDate: new Date('2024-12-01'),
          reason: 'Pending investigation',
          withPay: false, // No pay during suspension
        }
      },
    ];

    await db.collection('employees').deleteMany({ employeeId: { $regex: /^EMP0/ } });
    await db.collection('employees').insertMany(employees);
    console.log(`   ✅ Created ${employees.length} employees with various scenarios`);

    // ============================================
    // 4. ATTENDANCE RECORDS (for overtime/absence calculations)
    // ============================================
    console.log('📅 Creating attendance records...');

    const attendanceRecords = [];
    
    // Generate attendance for current month
    for (let day = 1; day <= Math.min(now.getDate(), 28); day++) {
      const date = new Date(now.getFullYear(), now.getMonth(), day);
      if (date.getDay() === 0 || date.getDay() === 6) continue; // Skip weekends
      
      for (const emp of employees.filter(e => e.status === 'active')) {
        // EMP002 (Yasmine) has excessive overtime - SPIKE scenario
        const isOvertimeSpike = emp.employeeId === 'EMP002' && day <= 15;
        const overtimeHours = isOvertimeSpike ? 4 + Math.random() * 2 : Math.random() * 2;
        
        // EMP014 (Salma) has absences
        const isAbsent = emp.employeeId === 'EMP014' && (day === 3 || day === 12);
        
        // EMP010 (Noha) is on unpaid leave
        const isOnLeave = emp.employeeId === 'EMP010' && day >= 10;
        
        if (!isAbsent && !isOnLeave) {
          attendanceRecords.push({
            _id: genId(),
            employeeId: emp._id,
            employeeCode: emp.employeeId,
            date: date,
            checkIn: new Date(date.setHours(9, 0, 0)),
            checkOut: new Date(date.setHours(17 + Math.floor(overtimeHours), 0, 0)),
            hoursWorked: 8 + overtimeHours,
            overtimeHours: overtimeHours,
            status: 'present',
            createdAt: new Date(),
          });
        }
      }
    }

    await db.collection('attendance').deleteMany({ employeeCode: { $regex: /^EMP0/ } });
    await db.collection('attendance').insertMany(attendanceRecords);
    console.log(`   ✅ Created ${attendanceRecords.length} attendance records`);

    // ============================================
    // 5. PAYROLL RUNS WITH IRREGULARITIES
    // ============================================
    console.log('💰 Creating payroll runs with various scenarios...');

    // Calculate payroll items for each employee
    const calculatePayrollItem = (emp, period, scenarioOverrides = {}) => {
      const salary = emp.salary;
      const baseSalary = salary.baseSalary;
      const allowances = Object.values(salary.allowances || {}).reduce((a, b) => a + b, 0);
      const deductions = Object.values(salary.deductions || {}).reduce((a, b) => a + b, 0);
      
      let grossPay = baseSalary + allowances;
      let totalDeductions = deductions;
      let overtime = 0;
      let commission = 0;
      let penalties = 0;
      let loanDeduction = 0;
      let absenceDeduction = 0;
      let unpaidLeaveDeduction = 0;
      
      // Apply scenario-specific calculations
      if (scenarioOverrides.overtime) {
        overtime = scenarioOverrides.overtime;
        grossPay += overtime;
      }
      
      if (scenarioOverrides.commission) {
        commission = scenarioOverrides.commission;
        grossPay += commission;
      }
      
      if (emp.penalties && emp.penalties.length > 0) {
        penalties = emp.penalties.reduce((sum, p) => sum + p.amount, 0);
        totalDeductions += penalties;
      }
      
      if (emp.loans && emp.loans.length > 0) {
        loanDeduction = emp.loans.reduce((sum, l) => sum + l.monthlyDeduction, 0);
        totalDeductions += loanDeduction;
      }
      
      if (emp.absences && emp.absences.length > 0) {
        absenceDeduction = emp.absences.reduce((sum, a) => sum + a.deductionAmount, 0);
        totalDeductions += absenceDeduction;
      }
      
      if (emp.leaveStatus?.onLeave && emp.leaveStatus.leaveType === 'unpaid') {
        const dailyRate = baseSalary / 30;
        unpaidLeaveDeduction = dailyRate * emp.leaveStatus.unpaidDays;
        totalDeductions += unpaidLeaveDeduction;
      }
      
      // Prorated for new hires
      let proratedFactor = 1;
      if (scenarioOverrides.prorated) {
        proratedFactor = scenarioOverrides.prorated;
        grossPay = grossPay * proratedFactor;
      }
      
      // Tax calculation (simplified)
      const taxableIncome = grossPay - (salary.deductions?.socialInsurance || 0);
      let tax = 0;
      if (taxableIncome > 40000) tax = taxableIncome * 0.25;
      else if (taxableIncome > 25000) tax = taxableIncome * 0.225;
      else if (taxableIncome > 15000) tax = taxableIncome * 0.15;
      else if (taxableIncome > 8000) tax = taxableIncome * 0.10;
      
      totalDeductions += tax;
      
      const netPay = grossPay - totalDeductions;
      
      return {
        _id: genId(),
        employeeId: emp._id,
        employeeCode: emp.employeeId,
        employeeName: `${emp.firstName} ${emp.lastName}`,
        department: emp.departmentName,
        period: period,
        baseSalary: baseSalary * proratedFactor,
        allowances: allowances * proratedFactor,
        overtime: overtime,
        commission: commission,
        grossPay: grossPay,
        deductions: {
          socialInsurance: (salary.deductions?.socialInsurance || 0) * proratedFactor,
          healthInsurance: (salary.deductions?.healthInsurance || 0) * proratedFactor,
          tax: tax,
          loan: loanDeduction,
          penalties: penalties,
          absence: absenceDeduction,
          unpaidLeave: unpaidLeaveDeduction,
        },
        totalDeductions: totalDeductions,
        netPay: netPay,
        proratedFactor: proratedFactor,
        createdAt: new Date(),
      };
    };

    // Clear existing test payroll data
    await db.collection('payrollruns').deleteMany({ runId: { $regex: /^TEST-/ } });
    await db.collection('payrollitems').deleteMany({ employeeCode: { $regex: /^EMP0/ } });
    await db.collection('irregularities').deleteMany({});

    // ----------------------------------------
    // PAYROLL RUN 1: Engineering - Current Month (DRAFT with irregularities)
    // ----------------------------------------
    const engEmployees = employees.filter(e => e.departmentName === 'Engineering' && e.status === 'active');
    const engItems = engEmployees.map(emp => {
      const overrides = {};
      
      // EMP002 has overtime spike
      if (emp.employeeId === 'EMP002') {
        overrides.overtime = 8500; // Excessive overtime
      }
      
      // EMP003 is new hire - prorated
      if (emp.employeeId === 'EMP003') {
        overrides.prorated = 0.5; // Started mid-month
      }
      
      return calculatePayrollItem(emp, currentMonth, overrides);
    });

    const engRun = {
      _id: genId(),
      runId: 'TEST-ENG-2024-12',
      payrollPeriod: currentMonth,
      entity: 'Engineering',
      entityId: departments[0]._id,
      status: 'draft',
      employees: engItems.length,
      totalBaseSalary: engItems.reduce((s, i) => s + i.baseSalary, 0),
      totalAllowances: engItems.reduce((s, i) => s + i.allowances, 0),
      totalOvertime: engItems.reduce((s, i) => s + i.overtime, 0),
      totalGrossPay: engItems.reduce((s, i) => s + i.grossPay, 0),
      totalDeductions: engItems.reduce((s, i) => s + i.totalDeductions, 0),
      totalnetpay: engItems.reduce((s, i) => s + i.netPay, 0),
      exceptions: 2, // Overtime spike + new hire
      payrollSpecialistId: specialistId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Link items to run
    engItems.forEach(item => item.payrollRunId = engRun._id);

    // Create irregularities for Engineering run
    const engIrregularities = [
      {
        _id: genId(),
        payrollRunId: engRun._id,
        employeeId: employees.find(e => e.employeeId === 'EMP002')._id,
        employeeCode: 'EMP002',
        employeeName: 'Yasmine Farouk',
        type: 'overtime_spike',
        severity: 'high',
        status: 'pending',
        description: 'Overtime increased by 320% compared to previous month average',
        currentValue: 8500,
        previousAverage: 2000,
        variancePercentage: 325,
        flaggedAt: new Date(),
        flaggedBy: 'system',
        resolution: null,
      },
      {
        _id: genId(),
        payrollRunId: engRun._id,
        employeeId: employees.find(e => e.employeeId === 'EMP003')._id,
        employeeCode: 'EMP003',
        employeeName: 'Amr Saleh',
        type: 'new_hire_prorated',
        severity: 'info',
        status: 'pending',
        description: 'New hire with prorated salary (50% - started mid-month)',
        currentValue: engItems.find(i => i.employeeCode === 'EMP003')?.netPay,
        proratedFactor: 0.5,
        flaggedAt: new Date(),
        flaggedBy: 'system',
        resolution: null,
      },
    ];

    // ----------------------------------------
    // PAYROLL RUN 2: HR - Current Month (UNDER_REVIEW with salary spike)
    // ----------------------------------------
    const hrEmployees = employees.filter(e => e.departmentName === 'Human Resources' && e.status === 'active');
    const hrItems = hrEmployees.map(emp => calculatePayrollItem(emp, currentMonth, {}));

    const hrRun = {
      _id: genId(),
      runId: 'TEST-HR-2024-12',
      payrollPeriod: currentMonth,
      entity: 'Human Resources',
      entityId: departments[1]._id,
      status: 'under review',
      employees: hrItems.length,
      totalBaseSalary: hrItems.reduce((s, i) => s + i.baseSalary, 0),
      totalAllowances: hrItems.reduce((s, i) => s + i.allowances, 0),
      totalGrossPay: hrItems.reduce((s, i) => s + i.grossPay, 0),
      totalDeductions: hrItems.reduce((s, i) => s + i.totalDeductions, 0),
      totalnetpay: hrItems.reduce((s, i) => s + i.netPay, 0),
      exceptions: 1, // Salary spike
      payrollSpecialistId: specialistId,
      submittedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    hrItems.forEach(item => item.payrollRunId = hrRun._id);

    const hrIrregularities = [
      {
        _id: genId(),
        payrollRunId: hrRun._id,
        employeeId: employees.find(e => e.employeeId === 'EMP006')._id,
        employeeCode: 'EMP006',
        employeeName: 'Tarek Nabil',
        type: 'salary_spike',
        severity: 'medium',
        status: 'escalated',
        description: 'Base salary increased by 12% from previous month',
        currentValue: 28000,
        previousValue: 25000,
        variancePercentage: 12,
        flaggedAt: new Date(Date.now() - 86400000),
        flaggedBy: 'system',
        escalatedTo: managerId,
        escalatedAt: new Date(),
        escalationReason: 'Salary increase requires manager approval',
        resolution: null,
      },
    ];

    // ----------------------------------------
    // PAYROLL RUN 3: Finance - Current Month (APPROVED, pending finance)
    // ----------------------------------------
    const finEmployees = employees.filter(e => e.departmentName === 'Finance' && e.status === 'active');
    const finItems = finEmployees.map(emp => calculatePayrollItem(emp, currentMonth, {}));

    const finRun = {
      _id: genId(),
      runId: 'TEST-FIN-2024-12',
      payrollPeriod: currentMonth,
      entity: 'Finance',
      entityId: departments[2]._id,
      status: 'approved',
      employees: finItems.length,
      totalBaseSalary: finItems.reduce((s, i) => s + i.baseSalary, 0),
      totalAllowances: finItems.reduce((s, i) => s + i.allowances, 0),
      totalGrossPay: finItems.reduce((s, i) => s + i.grossPay, 0),
      totalDeductions: finItems.reduce((s, i) => s + i.totalDeductions, 0),
      totalnetpay: finItems.reduce((s, i) => s + i.netPay, 0),
      exceptions: 1, // Loan deduction
      payrollSpecialistId: specialistId,
      payrollManagerId: managerId,
      managerApprovalDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    finItems.forEach(item => item.payrollRunId = finRun._id);

    const finIrregularities = [
      {
        _id: genId(),
        payrollRunId: finRun._id,
        employeeId: employees.find(e => e.employeeId === 'EMP008')._id,
        employeeCode: 'EMP008',
        employeeName: 'Sherif Adel',
        type: 'loan_deduction',
        severity: 'info',
        status: 'resolved',
        description: 'Monthly loan deduction of EGP 2,500 applied',
        currentValue: 2500,
        remainingBalance: 35000,
        flaggedAt: new Date(Date.now() - 172800000),
        flaggedBy: 'system',
        resolution: {
          action: 'approved',
          resolvedBy: managerId,
          resolvedAt: new Date(Date.now() - 86400000),
          notes: 'Loan deduction confirmed per HR records',
        },
      },
    ];

    // ----------------------------------------
    // PAYROLL RUN 4: Sales - Current Month (DRAFT with negative net pay!)
    // ----------------------------------------
    const salesEmployees = employees.filter(e => e.departmentName === 'Sales' && e.status === 'active');
    const salesItems = salesEmployees.map(emp => {
      const overrides = {};
      
      // EMP009 has large commission
      if (emp.employeeId === 'EMP009') {
        overrides.commission = 15000; // High commission month
      }
      
      return calculatePayrollItem(emp, currentMonth, overrides);
    });

    // Manually create a NEGATIVE payment scenario for EMP010 (unpaid leave > salary)
    const nohaItem = salesItems.find(i => i.employeeCode === 'EMP010');
    if (nohaItem) {
      // Simulate excessive deductions leading to negative
      nohaItem.deductions.unpaidLeave = 8000; // 12 days unpaid
      nohaItem.deductions.advance = 5000; // Salary advance taken
      nohaItem.totalDeductions = Object.values(nohaItem.deductions).reduce((a, b) => a + b, 0);
      nohaItem.netPay = nohaItem.grossPay - nohaItem.totalDeductions;
      // This will be NEGATIVE!
    }

    const salesRun = {
      _id: genId(),
      runId: 'TEST-SALES-2024-12',
      payrollPeriod: currentMonth,
      entity: 'Sales',
      entityId: departments[3]._id,
      status: 'draft',
      employees: salesItems.length,
      totalBaseSalary: salesItems.reduce((s, i) => s + i.baseSalary, 0),
      totalAllowances: salesItems.reduce((s, i) => s + i.allowances, 0),
      totalOvertime: salesItems.reduce((s, i) => s + (i.overtime || 0), 0),
      totalCommission: salesItems.reduce((s, i) => s + (i.commission || 0), 0),
      totalGrossPay: salesItems.reduce((s, i) => s + i.grossPay, 0),
      totalDeductions: salesItems.reduce((s, i) => s + i.totalDeductions, 0),
      totalnetpay: salesItems.reduce((s, i) => s + i.netPay, 0),
      exceptions: 3, // Commission spike, unpaid leave, negative pay
      hasNegativePayments: true,
      payrollSpecialistId: specialistId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    salesItems.forEach(item => item.payrollRunId = salesRun._id);

    const salesIrregularities = [
      {
        _id: genId(),
        payrollRunId: salesRun._id,
        employeeId: employees.find(e => e.employeeId === 'EMP009')._id,
        employeeCode: 'EMP009',
        employeeName: 'Ramy Fathy',
        type: 'commission_spike',
        severity: 'medium',
        status: 'pending',
        description: 'Commission of EGP 15,000 is 200% above monthly average',
        currentValue: 15000,
        previousAverage: 5000,
        variancePercentage: 200,
        flaggedAt: new Date(),
        flaggedBy: 'system',
        resolution: null,
      },
      {
        _id: genId(),
        payrollRunId: salesRun._id,
        employeeId: employees.find(e => e.employeeId === 'EMP010')._id,
        employeeCode: 'EMP010',
        employeeName: 'Noha Khaled',
        type: 'negative_net_pay',
        severity: 'critical',
        status: 'pending',
        description: 'Net pay is NEGATIVE due to excessive deductions (unpaid leave + salary advance)',
        currentValue: nohaItem?.netPay || -1500,
        deductionBreakdown: {
          unpaidLeave: 8000,
          advance: 5000,
          insurance: 960,
          tax: 0,
        },
        flaggedAt: new Date(),
        flaggedBy: 'system',
        resolution: null,
        requiresManagerAction: true,
      },
      {
        _id: genId(),
        payrollRunId: salesRun._id,
        employeeId: employees.find(e => e.employeeId === 'EMP010')._id,
        employeeCode: 'EMP010',
        employeeName: 'Noha Khaled',
        type: 'extended_unpaid_leave',
        severity: 'high',
        status: 'pending',
        description: 'Employee on extended unpaid leave (12 days)',
        unpaidDays: 12,
        flaggedAt: new Date(),
        flaggedBy: 'system',
        resolution: null,
      },
    ];

    // ----------------------------------------
    // PAYROLL RUN 5: Marketing - Current Month (REJECTED - needs correction)
    // ----------------------------------------
    const mktEmployees = employees.filter(e => e.departmentName === 'Marketing' && e.status === 'active');
    const mktItems = mktEmployees.map(emp => calculatePayrollItem(emp, currentMonth, {}));

    const mktRun = {
      _id: genId(),
      runId: 'TEST-MKT-2024-12',
      payrollPeriod: currentMonth,
      entity: 'Marketing',
      entityId: departments[4]._id,
      status: 'rejected',
      employees: mktItems.length,
      totalBaseSalary: mktItems.reduce((s, i) => s + i.baseSalary, 0),
      totalAllowances: mktItems.reduce((s, i) => s + i.allowances, 0),
      totalGrossPay: mktItems.reduce((s, i) => s + i.grossPay, 0),
      totalDeductions: mktItems.reduce((s, i) => s + i.totalDeductions, 0),
      totalnetpay: mktItems.reduce((s, i) => s + i.netPay, 0),
      exceptions: 1,
      payrollSpecialistId: specialistId,
      payrollManagerId: managerId,
      rejectedAt: new Date(Date.now() - 43200000),
      rejectionReason: 'Penalty deduction for EMP012 not properly documented. Please attach HR approval.',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mktItems.forEach(item => item.payrollRunId = mktRun._id);

    const mktIrregularities = [
      {
        _id: genId(),
        payrollRunId: mktRun._id,
        employeeId: employees.find(e => e.employeeId === 'EMP012')._id,
        employeeCode: 'EMP012',
        employeeName: 'Aya Hassan',
        type: 'penalty_deduction',
        severity: 'medium',
        status: 'rejected',
        description: 'Penalty of EGP 500 for late attendance requires HR documentation',
        currentValue: 500,
        penaltyReason: 'Late arrival 3 times this month',
        flaggedAt: new Date(Date.now() - 86400000),
        flaggedBy: 'system',
        resolution: {
          action: 'rejected',
          resolvedBy: managerId,
          resolvedAt: new Date(Date.now() - 43200000),
          notes: 'Missing HR approval document. Please resubmit with proper documentation.',
        },
      },
    ];

    // ----------------------------------------
    // PAYROLL RUN 6: Operations - Current Month (LOCKED - fully processed)
    // ----------------------------------------
    const opsEmployees = employees.filter(e => e.departmentName === 'Operations' && e.status === 'active');
    const opsItems = opsEmployees.map(emp => calculatePayrollItem(emp, currentMonth, {}));

    const opsRun = {
      _id: genId(),
      runId: 'TEST-OPS-2024-12',
      payrollPeriod: currentMonth,
      entity: 'Operations',
      entityId: departments[5]._id,
      status: 'locked',
      employees: opsItems.length,
      totalBaseSalary: opsItems.reduce((s, i) => s + i.baseSalary, 0),
      totalAllowances: opsItems.reduce((s, i) => s + i.allowances, 0),
      totalGrossPay: opsItems.reduce((s, i) => s + i.grossPay, 0),
      totalDeductions: opsItems.reduce((s, i) => s + i.totalDeductions, 0),
      totalnetpay: opsItems.reduce((s, i) => s + i.netPay, 0),
      exceptions: 2,
      payrollSpecialistId: specialistId,
      payrollManagerId: managerId,
      financeApprovedBy: financeId,
      managerApprovalDate: new Date(Date.now() - 172800000),
      financeApprovalDate: new Date(Date.now() - 86400000),
      lockedAt: new Date(Date.now() - 86400000),
      paymentStatus: 'processed',
      payslipsGenerated: true,
      createdAt: new Date(Date.now() - 259200000),
      updatedAt: new Date(),
    };

    opsItems.forEach(item => item.payrollRunId = opsRun._id);

    const opsIrregularities = [
      {
        _id: genId(),
        payrollRunId: opsRun._id,
        employeeId: employees.find(e => e.employeeId === 'EMP014')._id,
        employeeCode: 'EMP014',
        employeeName: 'Salma Omar',
        type: 'absence_deduction',
        severity: 'medium',
        status: 'resolved',
        description: '2 unexcused absences - EGP 933.34 deducted',
        currentValue: 933.34,
        absenceDays: 2,
        flaggedAt: new Date(Date.now() - 259200000),
        flaggedBy: 'system',
        resolution: {
          action: 'approved',
          resolvedBy: managerId,
          resolvedAt: new Date(Date.now() - 172800000),
          notes: 'Absences confirmed with department head. Deductions approved.',
        },
      },
      {
        _id: genId(),
        payrollRunId: opsRun._id,
        employeeId: employees.find(e => e.employeeId === 'EMP015')._id,
        employeeCode: 'EMP015',
        employeeName: 'Hassan Reda',
        type: 'suspended_employee',
        severity: 'high',
        status: 'resolved',
        description: 'Employee suspended without pay - excluded from payroll',
        suspensionReason: 'Pending investigation',
        flaggedAt: new Date(Date.now() - 259200000),
        flaggedBy: 'system',
        resolution: {
          action: 'excluded',
          resolvedBy: managerId,
          resolvedAt: new Date(Date.now() - 172800000),
          notes: 'Confirmed suspension without pay per HR directive dated Dec 1.',
        },
      },
    ];

    // ----------------------------------------
    // PAYROLL RUN 7: Operations - Last Month (Historical - LOCKED)
    // ----------------------------------------
    const opsLastMonthRun = {
      _id: genId(),
      runId: 'TEST-OPS-2024-11',
      payrollPeriod: lastMonth,
      entity: 'Operations',
      entityId: departments[5]._id,
      status: 'locked',
      employees: 3,
      totalBaseSalary: 65000,
      totalAllowances: 12100,
      totalGrossPay: 77100,
      totalDeductions: 15430,
      totalnetpay: 61670,
      exceptions: 0,
      payrollSpecialistId: specialistId,
      payrollManagerId: managerId,
      financeApprovedBy: financeId,
      lockedAt: lastMonth,
      paymentStatus: 'processed',
      payslipsGenerated: true,
      createdAt: lastMonth,
      updatedAt: lastMonth,
    };

    // Insert all payroll runs
    const allRuns = [engRun, hrRun, finRun, salesRun, mktRun, opsRun, opsLastMonthRun];
    await db.collection('payrollruns').insertMany(allRuns);
    console.log(`   ✅ Created ${allRuns.length} payroll runs`);

    // Insert all payroll items
    const allItems = [...engItems, ...hrItems, ...finItems, ...salesItems, ...mktItems, ...opsItems];
    await db.collection('payrollitems').insertMany(allItems);
    console.log(`   ✅ Created ${allItems.length} payroll items`);

    // Insert all irregularities
    const allIrregularities = [
      ...engIrregularities,
      ...hrIrregularities,
      ...finIrregularities,
      ...salesIrregularities,
      ...mktIrregularities,
      ...opsIrregularities,
    ];
    await db.collection('irregularities').insertMany(allIrregularities);
    console.log(`   ✅ Created ${allIrregularities.length} irregularities`);

    // ============================================
    // 6. SUMMARY
    // ============================================
    console.log('\n========================================');
    console.log('📊 SEED DATA SUMMARY');
    console.log('========================================\n');
    
    console.log('DEPARTMENTS:', departments.length);
    console.log('USERS:', users.length);
    console.log('EMPLOYEES:', employees.length);
    console.log('ATTENDANCE RECORDS:', attendanceRecords.length);
    console.log('PAYROLL RUNS:', allRuns.length);
    console.log('PAYROLL ITEMS:', allItems.length);
    console.log('IRREGULARITIES:', allIrregularities.length);
    
    console.log('\n📋 PAYROLL RUN STATUS BREAKDOWN:');
    console.log('   - Draft: 2 (Engineering, Sales)');
    console.log('   - Under Review: 1 (HR)');
    console.log('   - Approved (Pending Finance): 1 (Finance)');
    console.log('   - Rejected: 1 (Marketing)');
    console.log('   - Locked: 2 (Operations current & last month)');
    
    console.log('\n⚠️  IRREGULARITIES BY TYPE:');
    console.log('   - overtime_spike: 1 (EMP002 - Yasmine)');
    console.log('   - salary_spike: 1 (EMP006 - Tarek)');
    console.log('   - negative_net_pay: 1 (EMP010 - Noha) ⚡ CRITICAL');
    console.log('   - commission_spike: 1 (EMP009 - Ramy)');
    console.log('   - new_hire_prorated: 1 (EMP003 - Amr)');
    console.log('   - loan_deduction: 1 (EMP008 - Sherif)');
    console.log('   - penalty_deduction: 1 (EMP012 - Aya)');
    console.log('   - absence_deduction: 1 (EMP014 - Salma)');
    console.log('   - suspended_employee: 1 (EMP015 - Hassan)');
    console.log('   - extended_unpaid_leave: 1 (EMP010 - Noha)');

    console.log('\n🔐 TEST CREDENTIALS:');
    console.log('   All users: Password = Test@123');
    console.log('   - Specialist: specialist1@payroll.com');
    console.log('   - Manager: manager1@payroll.com');
    console.log('   - Finance: finance1@payroll.com');
    console.log('   - Admin: admin@payroll.com');

    console.log('\n✅ Seeding complete!');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  } finally {
    await client.close();
  }
}

// Run the seed
seedData().catch(console.error);
