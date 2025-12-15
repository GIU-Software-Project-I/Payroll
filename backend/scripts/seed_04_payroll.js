/**
 * Seed Script 04: Payroll Extended Data
 * Seeds: allowances, paytypes, companywidesettings, signingbonus, payrollpolicies,
 *        terminationandresignationbenefits, employeepayrolldetails, employeepenalties,
 *        employeesigningbonus, claims, disputes, refunds
 * 
 * Run with: node scripts/seed_04_payroll.js
 */

const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

async function seedPayroll() {
    const client = new MongoClient(MONGO_URI);
    
    try {
        await client.connect();
        console.log('Connected to MongoDB');
        
        const db = client.db();
        
        // Get existing data
        const employees = await db.collection('employee_profiles').find({}).toArray();
        const payslips = await db.collection('payslips').find({}).toArray();
        const payrollRuns = await db.collection('payrollruns').find({}).toArray();
        
        if (employees.length === 0) {
            console.error('Please run seed_complete_system.js first');
            return;
        }

        const hrEmployee = employees.find(e => e.systemRole === 'HR Employee');
        const financeStaff = employees.find(e => e.systemRole === 'Finance Staff');
        const payrollManager = employees.find(e => e.systemRole === 'Payroll Manager');

        // ============================================
        // ALLOWANCES
        // ============================================
        console.log('\n=== Seeding Allowances ===');
        const allowanceIds = [new ObjectId(), new ObjectId(), new ObjectId(), new ObjectId(), new ObjectId()];
        
        const allowances = [
            {
                _id: allowanceIds[0],
                name: 'Housing Allowance',
                amount: 2000,
                status: 'approved',
                createdBy: hrEmployee?._id || employees[0]._id,
                approvedBy: payrollManager?._id || employees[0]._id,
                approvedAt: new Date('2025-01-15'),
                createdAt: new Date('2025-01-10'),
                updatedAt: new Date()
            },
            {
                _id: allowanceIds[1],
                name: 'Transport Allowance',
                amount: 500,
                status: 'approved',
                createdBy: hrEmployee?._id || employees[0]._id,
                approvedBy: payrollManager?._id || employees[0]._id,
                approvedAt: new Date('2025-01-15'),
                createdAt: new Date('2025-01-10'),
                updatedAt: new Date()
            },
            {
                _id: allowanceIds[2],
                name: 'Mobile Allowance',
                amount: 300,
                status: 'approved',
                createdBy: hrEmployee?._id || employees[0]._id,
                approvedBy: payrollManager?._id || employees[0]._id,
                approvedAt: new Date('2025-01-15'),
                createdAt: new Date('2025-01-10'),
                updatedAt: new Date()
            },
            {
                _id: allowanceIds[3],
                name: 'Meal Allowance',
                amount: 400,
                status: 'approved',
                createdBy: hrEmployee?._id || employees[0]._id,
                approvedBy: payrollManager?._id || employees[0]._id,
                approvedAt: new Date('2025-02-01'),
                createdAt: new Date('2025-01-25'),
                updatedAt: new Date()
            },
            {
                _id: allowanceIds[4],
                name: 'Remote Work Allowance',
                amount: 600,
                status: 'draft',
                createdBy: hrEmployee?._id || employees[0]._id,
                approvedBy: null,
                approvedAt: null,
                createdAt: new Date('2025-12-01'),
                updatedAt: new Date()
            }
        ];

        await db.collection('allowances').deleteMany({});
        await db.collection('allowances').insertMany(allowances);
        console.log(`Created ${allowances.length} allowances`);

        // ============================================
        // PAY TYPES
        // ============================================
        console.log('\n=== Seeding Pay Types ===');
        const payTypes = [
            {
                type: 'Monthly Salary',
                amount: 6000,
                status: 'approved',
                createdBy: hrEmployee?._id || employees[0]._id,
                approvedBy: payrollManager?._id || employees[0]._id,
                approvedAt: new Date('2025-01-10'),
                createdAt: new Date('2025-01-05'),
                updatedAt: new Date()
            },
            {
                type: 'Hourly Rate',
                amount: 50,
                status: 'approved',
                createdBy: hrEmployee?._id || employees[0]._id,
                approvedBy: payrollManager?._id || employees[0]._id,
                approvedAt: new Date('2025-01-10'),
                createdAt: new Date('2025-01-05'),
                updatedAt: new Date()
            },
            {
                type: 'Project-Based',
                amount: 10000,
                status: 'approved',
                createdBy: hrEmployee?._id || employees[0]._id,
                approvedBy: payrollManager?._id || employees[0]._id,
                approvedAt: new Date('2025-01-10'),
                createdAt: new Date('2025-01-05'),
                updatedAt: new Date()
            }
        ];

        await db.collection('paytypes').deleteMany({});
        await db.collection('paytypes').insertMany(payTypes);
        console.log(`Created ${payTypes.length} pay types`);

        // ============================================
        // COMPANY WIDE SETTINGS
        // ============================================
        console.log('\n=== Seeding Company Wide Settings ===');
        const companySettings = [
            {
                payDate: new Date('2025-12-28'),
                timeZone: 'Africa/Cairo',
                currency: 'EGP',
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ];

        await db.collection('companywidesettings').deleteMany({});
        await db.collection('companywidesettings').insertMany(companySettings);
        console.log(`Created ${companySettings.length} company wide settings`);

        // ============================================
        // SIGNING BONUS (Config)
        // ============================================
        console.log('\n=== Seeding Signing Bonus Configs ===');
        const signingBonusIds = [new ObjectId(), new ObjectId(), new ObjectId()];
        
        const signingBonusConfigs = [
            {
                _id: signingBonusIds[0],
                positionName: 'Junior Developer',
                amount: 3000,
                status: 'approved',
                createdBy: hrEmployee?._id || employees[0]._id,
                approvedBy: payrollManager?._id || employees[0]._id,
                approvedAt: new Date('2025-01-15'),
                createdAt: new Date('2025-01-10'),
                updatedAt: new Date()
            },
            {
                _id: signingBonusIds[1],
                positionName: 'Senior Developer',
                amount: 8000,
                status: 'approved',
                createdBy: hrEmployee?._id || employees[0]._id,
                approvedBy: payrollManager?._id || employees[0]._id,
                approvedAt: new Date('2025-01-15'),
                createdAt: new Date('2025-01-10'),
                updatedAt: new Date()
            },
            {
                _id: signingBonusIds[2],
                positionName: 'Manager',
                amount: 15000,
                status: 'approved',
                createdBy: hrEmployee?._id || employees[0]._id,
                approvedBy: payrollManager?._id || employees[0]._id,
                approvedAt: new Date('2025-01-15'),
                createdAt: new Date('2025-01-10'),
                updatedAt: new Date()
            }
        ];

        await db.collection('signingbonus').deleteMany({});
        await db.collection('signingbonus').insertMany(signingBonusConfigs);
        console.log(`Created ${signingBonusConfigs.length} signing bonus configs`);

        // Also seed signingbonuses (if different collection)
        await db.collection('signingbonuses').deleteMany({});
        await db.collection('signingbonuses').insertMany(signingBonusConfigs.map(s => ({...s, _id: new ObjectId()})));
        console.log(`Created ${signingBonusConfigs.length} signing bonuses`);

        // ============================================
        // PAYROLL POLICIES
        // ============================================
        console.log('\n=== Seeding Payroll Policies ===');
        const payrollPolicies = [
            {
                policyName: 'Standard Overtime Policy',
                policyType: 'Allowance',
                description: 'Overtime pay at 1.5x rate for hours beyond 40/week',
                effectiveDate: new Date('2025-01-01'),
                ruleDefinition: {
                    percentage: 50,
                    fixedAmount: 0,
                    thresholdAmount: 40
                },
                applicability: 'All Employees',
                status: 'approved',
                createdBy: hrEmployee?._id || employees[0]._id,
                approvedBy: payrollManager?._id || employees[0]._id,
                approvedAt: new Date('2025-01-05'),
                createdAt: new Date('2025-01-01'),
                updatedAt: new Date()
            },
            {
                policyName: 'Late Arrival Deduction Policy',
                policyType: 'Deduction',
                description: 'Deduction for late arrivals beyond 15 minutes grace period',
                effectiveDate: new Date('2025-01-01'),
                ruleDefinition: {
                    percentage: 0,
                    fixedAmount: 50,
                    thresholdAmount: 15
                },
                applicability: 'All Employees',
                status: 'approved',
                createdBy: hrEmployee?._id || employees[0]._id,
                approvedBy: payrollManager?._id || employees[0]._id,
                approvedAt: new Date('2025-01-05'),
                createdAt: new Date('2025-01-01'),
                updatedAt: new Date()
            },
            {
                policyName: 'Annual Bonus Policy',
                policyType: 'Benefit',
                description: 'Annual bonus based on performance rating',
                effectiveDate: new Date('2025-01-01'),
                ruleDefinition: {
                    percentage: 10,
                    fixedAmount: 0,
                    thresholdAmount: 1
                },
                applicability: 'Full Time Employees',
                status: 'approved',
                createdBy: hrEmployee?._id || employees[0]._id,
                approvedBy: payrollManager?._id || employees[0]._id,
                approvedAt: new Date('2025-01-05'),
                createdAt: new Date('2025-01-01'),
                updatedAt: new Date()
            },
            {
                policyName: 'Misconduct Penalty Policy',
                policyType: 'Misconduct',
                description: 'Penalty deductions for workplace misconduct',
                effectiveDate: new Date('2025-01-01'),
                ruleDefinition: {
                    percentage: 5,
                    fixedAmount: 500,
                    thresholdAmount: 1
                },
                applicability: 'All Employees',
                status: 'approved',
                createdBy: hrEmployee?._id || employees[0]._id,
                approvedBy: payrollManager?._id || employees[0]._id,
                approvedAt: new Date('2025-01-05'),
                createdAt: new Date('2025-01-01'),
                updatedAt: new Date()
            }
        ];

        await db.collection('payrollpolicies').deleteMany({});
        await db.collection('payrollpolicies').insertMany(payrollPolicies);
        console.log(`Created ${payrollPolicies.length} payroll policies`);

        // ============================================
        // TERMINATION AND RESIGNATION BENEFITS
        // ============================================
        console.log('\n=== Seeding Termination Benefits ===');
        const terminationBenefits = [
            {
                name: 'End of Service Gratuity',
                amount: 5000,
                terms: 'Paid after minimum 1 year of service',
                status: 'approved',
                createdBy: hrEmployee?._id || employees[0]._id,
                approvedBy: payrollManager?._id || employees[0]._id,
                approvedAt: new Date('2025-01-10'),
                createdAt: new Date('2025-01-05'),
                updatedAt: new Date()
            },
            {
                name: 'Notice Period Compensation',
                amount: 0,
                terms: 'One month salary if notice period waived by employer',
                status: 'approved',
                createdBy: hrEmployee?._id || employees[0]._id,
                approvedBy: payrollManager?._id || employees[0]._id,
                approvedAt: new Date('2025-01-10'),
                createdAt: new Date('2025-01-05'),
                updatedAt: new Date()
            },
            {
                name: 'Unused Leave Encashment',
                amount: 0,
                terms: 'Calculated based on remaining leave balance',
                status: 'approved',
                createdBy: hrEmployee?._id || employees[0]._id,
                approvedBy: payrollManager?._id || employees[0]._id,
                approvedAt: new Date('2025-01-10'),
                createdAt: new Date('2025-01-05'),
                updatedAt: new Date()
            }
        ];

        await db.collection('terminationandresignationbenefits').deleteMany({});
        await db.collection('terminationandresignationbenefits').insertMany(terminationBenefits);
        console.log(`Created ${terminationBenefits.length} termination benefits`);

        // ============================================
        // EMPLOYEE PAYROLL DETAILS
        // ============================================
        console.log('\n=== Seeding Employee Payroll Details ===');
        const employeePayrollDetails = [];
        const payrollRun = payrollRuns[0];
        
        for (const emp of employees.slice(0, 8)) {
            if (emp.systemRole === 'Job Candidate') continue;
            
            const baseSalary = emp.grossSalary || 10000;
            const allowancesTotal = 3200; // Housing + Transport + Mobile + Meal
            const tax = baseSalary * 0.15;
            const insurance = baseSalary * 0.11;
            const penalties = Math.random() > 0.7 ? Math.floor(Math.random() * 500) : 0;
            
            employeePayrollDetails.push({
                employeeId: emp._id,
                baseSalary: baseSalary,
                allowances: allowancesTotal,
                deductions: tax + insurance,
                deductionsBreakdown: {
                    tax: tax,
                    taxReason: '15% income tax',
                    insurance: insurance,
                    insuranceReason: '11% social insurance',
                    penalties: penalties,
                    unpaidLeave: 0,
                    unpaidLeaveReason: null,
                    total: tax + insurance + penalties
                },
                penaltiesBreakdown: {
                    misconduct: 0,
                    misconductReason: null,
                    missingWork: 0,
                    missingWorkReason: null,
                    lateness: penalties,
                    latenessReason: penalties > 0 ? 'Late arrivals' : null,
                    total: penalties
                },
                overtime: {
                    minutes: Math.floor(Math.random() * 600),
                    amount: Math.floor(Math.random() * 1000),
                    reason: 'Project deadline'
                },
                attendanceSummary: {
                    actualWorkMinutes: 9600,
                    scheduledWorkMinutes: 9600,
                    missingWorkMinutes: 0,
                    overtimeMinutes: Math.floor(Math.random() * 600),
                    latenessMinutes: Math.floor(Math.random() * 60),
                    workingDays: 22,
                    unpaidLeaveDays: 0
                },
                netSalary: baseSalary + allowancesTotal - tax - insurance - penalties,
                payrollRunId: payrollRun?._id,
                bankStatus: 'valid',
                createdAt: new Date(),
                updatedAt: new Date()
            });
        }

        await db.collection('employeepayrolldetails').deleteMany({});
        if (employeePayrollDetails.length > 0) {
            await db.collection('employeepayrolldetails').insertMany(employeePayrollDetails);
        }
        console.log(`Created ${employeePayrollDetails.length} employee payroll details`);

        // ============================================
        // EMPLOYEE PENALTIES
        // ============================================
        console.log('\n=== Seeding Employee Penalties ===');
        const employeePenalties = [];
        
        // Create penalties for a few employees
        for (const emp of employees.slice(0, 4)) {
            if (emp.systemRole === 'Job Candidate') continue;
            
            employeePenalties.push({
                employeeId: emp._id,
                penalties: [
                    {
                        reason: 'Late arrival - 3 instances',
                        amount: 150
                    },
                    {
                        reason: 'Missed deadline',
                        amount: 200
                    }
                ],
                createdAt: new Date(),
                updatedAt: new Date()
            });
        }

        await db.collection('employeepenalties').deleteMany({});
        if (employeePenalties.length > 0) {
            await db.collection('employeepenalties').insertMany(employeePenalties);
        }
        console.log(`Created ${employeePenalties.length} employee penalties`);

        // ============================================
        // EMPLOYEE SIGNING BONUS
        // ============================================
        console.log('\n=== Seeding Employee Signing Bonuses ===');
        const employeeSigningBonuses = [
            {
                employeeId: employees[0]._id,
                signingBonusId: signingBonusIds[0],
                givenAmount: 3000,
                paymentDate: new Date('2025-02-28'),
                status: 'paid',
                createdAt: new Date('2025-01-15'),
                updatedAt: new Date()
            },
            {
                employeeId: employees[1]?._id || employees[0]._id,
                signingBonusId: signingBonusIds[1],
                givenAmount: 8000,
                paymentDate: new Date('2025-03-28'),
                status: 'paid',
                createdAt: new Date('2025-02-15'),
                updatedAt: new Date()
            },
            {
                employeeId: employees[2]?._id || employees[0]._id,
                signingBonusId: signingBonusIds[0],
                givenAmount: 3500,
                paymentDate: null,
                status: 'approved',
                createdAt: new Date('2025-11-15'),
                updatedAt: new Date()
            },
            {
                employeeId: employees[3]?._id || employees[0]._id,
                signingBonusId: signingBonusIds[2],
                givenAmount: 15000,
                paymentDate: null,
                status: 'pending',
                createdAt: new Date('2025-12-01'),
                updatedAt: new Date()
            }
        ];

        await db.collection('employeesigningbonus').deleteMany({});
        await db.collection('employeesigningbonus').insertMany(employeeSigningBonuses);
        console.log(`Created ${employeeSigningBonuses.length} employee signing bonuses`);

        // ============================================
        // CLAIMS
        // ============================================
        console.log('\n=== Seeding Claims ===');
        const claims = [
            {
                claimId: 'CLAIM-0001',
                description: 'Medical expenses reimbursement',
                claimType: 'medical',
                employeeId: employees[0]._id,
                financeStaffId: financeStaff?._id || employees[0]._id,
                amount: 1500,
                approvedAmount: 1500,
                status: 'approved',
                rejectionReason: null,
                resolutionComment: 'Approved - valid medical receipts provided',
                createdAt: new Date('2025-11-01'),
                updatedAt: new Date()
            },
            {
                claimId: 'CLAIM-0002',
                description: 'Travel expense claim',
                claimType: 'travel',
                employeeId: employees[1]?._id || employees[0]._id,
                financeStaffId: financeStaff?._id || employees[0]._id,
                amount: 2500,
                approvedAmount: 2000,
                status: 'approved',
                rejectionReason: null,
                resolutionComment: 'Partially approved - some receipts missing',
                createdAt: new Date('2025-11-10'),
                updatedAt: new Date()
            },
            {
                claimId: 'CLAIM-0003',
                description: 'Equipment purchase reimbursement',
                claimType: 'equipment',
                employeeId: employees[2]?._id || employees[0]._id,
                financeStaffId: null,
                amount: 3000,
                approvedAmount: null,
                status: 'under review',
                rejectionReason: null,
                resolutionComment: null,
                createdAt: new Date('2025-12-05'),
                updatedAt: new Date()
            },
            {
                claimId: 'CLAIM-0004',
                description: 'Training course fee',
                claimType: 'training',
                employeeId: employees[3]?._id || employees[0]._id,
                financeStaffId: financeStaff?._id || employees[0]._id,
                amount: 5000,
                approvedAmount: null,
                status: 'rejected',
                rejectionReason: 'Course not pre-approved by management',
                resolutionComment: null,
                createdAt: new Date('2025-11-20'),
                updatedAt: new Date()
            }
        ];

        await db.collection('claims').deleteMany({});
        await db.collection('claims').insertMany(claims);
        console.log(`Created ${claims.length} claims`);

        // ============================================
        // DISPUTES
        // ============================================
        console.log('\n=== Seeding Disputes ===');
        const disputes = [];
        
        if (payslips.length > 0) {
            disputes.push({
                disputeId: 'DISP-0001',
                description: 'Incorrect overtime calculation',
                employeeId: employees[0]._id,
                financeStaffId: financeStaff?._id || employees[0]._id,
                payslipId: payslips[0]._id,
                status: 'approved',
                rejectionReason: null,
                resolutionComment: 'Overtime recalculated and adjusted',
                createdAt: new Date('2025-11-25'),
                updatedAt: new Date()
            });
            
            if (payslips.length > 1) {
                disputes.push({
                    disputeId: 'DISP-0002',
                    description: 'Missing allowance in payslip',
                    employeeId: employees[1]?._id || employees[0]._id,
                    financeStaffId: null,
                    payslipId: payslips[1]._id,
                    status: 'under review',
                    rejectionReason: null,
                    resolutionComment: null,
                    createdAt: new Date('2025-12-10'),
                    updatedAt: new Date()
                });
            }
            
            if (payslips.length > 2) {
                disputes.push({
                    disputeId: 'DISP-0003',
                    description: 'Incorrect deduction amount',
                    employeeId: employees[2]?._id || employees[0]._id,
                    financeStaffId: financeStaff?._id || employees[0]._id,
                    payslipId: payslips[2]._id,
                    status: 'rejected',
                    rejectionReason: 'Deduction was correctly applied per policy',
                    resolutionComment: null,
                    createdAt: new Date('2025-12-01'),
                    updatedAt: new Date()
                });
            }
        }

        await db.collection('disputes').deleteMany({});
        if (disputes.length > 0) {
            await db.collection('disputes').insertMany(disputes);
        }
        console.log(`Created ${disputes.length} disputes`);

        // ============================================
        // REFUNDS
        // ============================================
        console.log('\n=== Seeding Refunds ===');
        const refunds = [
            {
                claimId: null,
                disputeId: disputes[0]?._id,
                refundDetails: {
                    description: 'Overtime adjustment refund',
                    amount: 500
                },
                employeeId: employees[0]._id,
                financeStaffId: financeStaff?._id || employees[0]._id,
                status: 'paid',
                paidInPayrollRunId: payrollRun?._id,
                createdAt: new Date('2025-11-28'),
                updatedAt: new Date()
            },
            {
                claimId: claims[0]?._id,
                disputeId: null,
                refundDetails: {
                    description: 'Medical expense reimbursement',
                    amount: 1500
                },
                employeeId: employees[0]._id,
                financeStaffId: financeStaff?._id || employees[0]._id,
                status: 'paid',
                paidInPayrollRunId: payrollRun?._id,
                createdAt: new Date('2025-11-05'),
                updatedAt: new Date()
            },
            {
                claimId: claims[1]?._id,
                disputeId: null,
                refundDetails: {
                    description: 'Travel expense reimbursement',
                    amount: 2000
                },
                employeeId: employees[1]?._id || employees[0]._id,
                financeStaffId: financeStaff?._id || employees[0]._id,
                status: 'pending',
                paidInPayrollRunId: null,
                createdAt: new Date('2025-11-15'),
                updatedAt: new Date()
            }
        ];

        await db.collection('refunds').deleteMany({});
        await db.collection('refunds').insertMany(refunds);
        console.log(`Created ${refunds.length} refunds`);

        console.log('\n=== Payroll Extended Seed Complete ===');
        console.log('Collections seeded: allowances, paytypes, companywidesettings, signingbonus,');
        console.log('signingbonuses, payrollpolicies, terminationandresignationbenefits,');
        console.log('employeepayrolldetails, employeepenalties, employeesigningbonus, claims, disputes, refunds');

    } catch (error) {
        console.error('Seed error:', error);
    } finally {
        await client.close();
        console.log('\nDisconnected from MongoDB');
    }
}

seedPayroll();
