import { Injectable, BadRequestException, ForbiddenException, Optional, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection, ClientSession } from 'mongoose';
import mongoose from 'mongoose';
import { employeeSigningBonus, employeeSigningBonusDocument } from '../models/EmployeeSigningBonus.schema';
import { payrollRuns, payrollRunsDocument } from '../models/payrollRuns.schema';
import { paySlip } from '../models/payslip.schema';
import { employeePayrollDetails } from '../models/employeePayrollDetails.schema';
import { BonusStatus, BenefitStatus, PayRollStatus, PayRollPaymentStatus, PaySlipPaymentStatus, BankStatus } from '../enums/payroll-execution-enum';
import { EmployeeTerminationResignation, EmployeeTerminationResignationDocument } from '../models/EmployeeTerminationResignation.schema';
import { SystemRole } from '../../../employee/enums/employee-profile.enums';
import { PayCalculatorService } from '../services/payCalculator.service';
import { AttendanceService } from '../../../time-management/services/AttendanceService';
import { UnifiedLeaveService } from '../../../leaves/services/leaves.service';
import { EmployeeSystemRole, EmployeeSystemRoleDocument } from '../../../employee/models/employee/employee-system-role.schema';
import {EmployeeProfileService} from "../../../employee/services/employee-profile.service";
import { AttendanceRecord, AttendanceRecordDocument } from '../../../time-management/models/attendance-record.schema';

@Injectable()
export class PayrollExecutionService {
    constructor(
        @InjectModel(employeeSigningBonus.name)
        private employeeSigningBonusModel: Model<employeeSigningBonusDocument>,
        @InjectModel(EmployeeTerminationResignation.name)
        private employeeTerminationResignationModel: Model<EmployeeTerminationResignationDocument>,
        @InjectModel(payrollRuns.name)
        private payrollRunsModel: Model<payrollRunsDocument>,
        @InjectModel(paySlip.name)
        private paySlipModel: Model<any>,
        @InjectModel(employeePayrollDetails.name)
        private employeePayrollDetailsModel: Model<any>,
        @InjectModel(AttendanceRecord.name)
        private attendanceRecordModel: Model<AttendanceRecordDocument>,
        private readonly payCalculator: PayCalculatorService,
        @InjectConnection()
        private readonly connection: Connection,
        @Optional() private readonly employeeService?: EmployeeProfileService,
        @Optional() private readonly attendanceService?: AttendanceService,
        @Optional() private readonly leavesService?: UnifiedLeaveService,
        @Optional() @InjectModel(EmployeeSystemRole.name) private readonly employeeSystemRoleModel?: Model<EmployeeSystemRoleDocument>,
    ) {}

    private get db() {
        return (this.connection && this.connection.db) ? this.connection.db : (mongoose && mongoose.connection && (mongoose.connection.db as any)) || null;
    }

    private readonly terminationCollectionName = 'employeeterminationresignations';

    // Helper method to ensure user has specific role
    private async ensureRole(userId: string | any, requiredRole: SystemRole, operationName: string): Promise<void> {
        if (!userId) throw new ForbiddenException(`${operationName} requires authentication`);
        
        const db = this.db;
        if (!db) throw new BadRequestException('Database unavailable');

        try {
            const uid = typeof userId === 'string' ? new mongoose.Types.ObjectId(userId) : userId;
            
            if (this.employeeSystemRoleModel) {
                const roleDoc = await this.employeeSystemRoleModel.findOne({ 
                    employeeProfileId: uid, 
                    isActive: true 
                }).lean().exec();
                
                if (!roleDoc || !Array.isArray(roleDoc.roles) || !roleDoc.roles.includes(requiredRole)) {
                    throw new ForbiddenException(`User does not have required role: ${requiredRole}`);
                }
                return;
            }

            // Fallback to raw DB query
            const row = await db.collection('employee_system_roles').findOne({ 
                employeeProfileId: uid,
                isActive: true 
            });
            
            if (!row || !Array.isArray(row.roles) || !row.roles.includes(requiredRole)) {
                throw new ForbiddenException(`User does not have required role: ${requiredRole}`);
            }
        } catch (e) {
            if (e instanceof ForbiddenException) throw e;
            throw new ForbiddenException(`Authorization check failed: ${e.message}`);
        }
    }

    private async ensurePayrollSpecialist(userId?: string | any): Promise<void> {
        await this.ensureRole(userId, SystemRole.PAYROLL_SPECIALIST, 'This operation');
    }

    private async ensurePayrollManager(userId?: string | any): Promise<void> {
        await this.ensureRole(userId, SystemRole.HR_MANAGER, 'Manager approval');
    }

    private async ensureFinanceStaff(userId?: string | any): Promise<void> {
        await this.ensureRole(userId, SystemRole.FINANCE_STAFF, 'Finance approval');
    }

    // Helper to validate approver exists, is active, and is not the creator (prevents self-approval)
    private async validateApprover(approverId: string, creatorId?: mongoose.Types.ObjectId | string): Promise<void> {
        // 1. Validate approver ID format
        if (!approverId || !mongoose.Types.ObjectId.isValid(approverId)) {
            throw new BadRequestException('Invalid approver ID');
        }

        // 2. Validate approver exists in Employee collection
        const db = this.db;
        if (!db) throw new BadRequestException('Database unavailable');

        const approver = await db.collection('employee_profiles').findOne({ 
            _id: new mongoose.Types.ObjectId(approverId) 
        });
        
        if (!approver) {
            throw new BadRequestException('Approver employee not found');
        }

        // 3. Validate approver is ACTIVE
        if (approver.status !== 'ACTIVE') {
            throw new BadRequestException('Approver must be an active employee');
        }

        // 4. Prevent self-approval
        if (creatorId) {
            const creatorIdStr = typeof creatorId === 'string' ? creatorId : creatorId.toString();
            if (creatorIdStr === approverId) {
                throw new ForbiddenException(
                    'Self-approval not allowed. Record must be approved by a different user.'
                );
            }
        }
    }

    // Helper to validate employee exists and has active contract
    // Helper to get attendance data from Time Management module
    private async getAttendanceData(employeeId: any, periodStart: Date, periodEnd: Date): Promise<{
        actualWorkMinutes: number;
        scheduledWorkMinutes: number;
        overtimeMinutes: number;
        latenessMinutes: number;
        missingWorkMinutes: number;
        workingDays: number;
    }> {
        try {
            if (!this.attendanceRecordModel) {
                return {
                    actualWorkMinutes: 0,
                    scheduledWorkMinutes: 0,
                    overtimeMinutes: 0,
                    latenessMinutes: 0,
                    missingWorkMinutes: 0,
                    workingDays: 0
                };
            }

            const empId = new mongoose.Types.ObjectId(employeeId);
            
            // Get all attendance records for the period
            const records = await this.attendanceRecordModel.find({
                employeeId: empId,
                date: { $gte: periodStart, $lte: periodEnd }
            }).lean().exec();

            let totalActualMinutes = 0;
            let totalScheduledMinutes = 0;
            let totalOvertimeMinutes = 0;
            let totalLatenessMinutes = 0;
            let workingDaysCount = 0;

            for (const record of records) {
                // Attendance schema may not have strong typing for overtime/lateness; fallback to 0
                const overtime = (record as any).overtimeMinutes ?? 0;
                const lateness = (record as any).latenessMinutes ?? 0;

                totalActualMinutes += record.totalWorkMinutes || 0;
                totalOvertimeMinutes += overtime;
                totalLatenessMinutes += lateness;
                
                // Get scheduled minutes using attendance service if available
                if (this.attendanceService && typeof (this.attendanceService as any).scheduledMinutesForRecord === 'function') {
                    const scheduled = await (this.attendanceService as any).scheduledMinutesForRecord(record);
                    totalScheduledMinutes += scheduled || 0;
                } else {
                    // Default to 8 hours per day
                    totalScheduledMinutes += 480;
                }
                
                if (record.totalWorkMinutes > 0) {
                    workingDaysCount++;
                }
            }

            const missingMinutes = Math.max(0, totalScheduledMinutes - totalActualMinutes);

            return {
                actualWorkMinutes: totalActualMinutes,
                scheduledWorkMinutes: totalScheduledMinutes,
                overtimeMinutes: totalOvertimeMinutes,
                latenessMinutes: totalLatenessMinutes,
                missingWorkMinutes: missingMinutes,
                workingDays: workingDaysCount
            };
        } catch (err) {
            console.error(`Error getting attendance data for employee ${employeeId}:`, err);
            return {
                actualWorkMinutes: 0,
                scheduledWorkMinutes: 0,
                overtimeMinutes: 0,
                latenessMinutes: 0,
                missingWorkMinutes: 0,
                workingDays: 0
            };
        }
    }

    // Helper to get unpaid leave days from Leaves module
    private async getUnpaidLeaveDays(employeeId: any, periodStart: Date, periodEnd: Date): Promise<number> {
        try {
            if (!this.leavesService) {
                return 0;
            }

            const db = this.db;
            if (!db) return 0;

            // Query leave requests directly from DB
            const leaveRequests = await db.collection('leaverequests').find({
                employeeId: new mongoose.Types.ObjectId(employeeId),
                status: 'APPROVED',
                'dates.from': { $lte: periodEnd },
                'dates.to': { $gte: periodStart }
            }).toArray();

            let unpaidDays = 0;

            for (const leave of leaveRequests) {
                // Get leave type to check if it's paid or unpaid
                const leaveType = await db.collection('leavetypes').findOne({
                    _id: leave.leaveTypeId
                });

                // If leave type is not paid or explicitly marked as unpaid
                if (leaveType && (!leaveType.paid || leaveType.isPaid === false)) {
                    unpaidDays += leave.durationDays || 0;
                }
            }

            return unpaidDays;
        } catch (err) {
            console.error(`Error getting unpaid leave days for employee ${employeeId}:`, err);
            return 0;
        }
    }

    private async validateEmployeeContract(employeeId: any): Promise<any> {
        const db = this.db;
        if (!db) throw new BadRequestException('Database unavailable');

        const eid = typeof employeeId === 'string' ? new mongoose.Types.ObjectId(employeeId) : employeeId;
        
        // TODO: Integration with Employee module - check if employee exists
        const employee = await db.collection('employee_profiles').findOne({ _id: eid });
        if (!employee) {
            throw new NotFoundException(`Employee ${employeeId} not found`);
        }

        // TODO: Integration with Employee module - validate active contract (BR 1, BR 66)
        // Should check: contract is active, not expired, not suspended
        // For now, we check basic status
        if (employee.status !== 'ACTIVE') {
            throw new BadRequestException(`Employee ${employeeId} does not have active status. Current status: ${employee.status}`);
        }

        return employee;
    }

    // Helper to check for duplicate payroll period
    private async validateNoDuplicatePayrollPeriod(payrollPeriod: Date, excludeRunId?: string): Promise<void> {
        const periodStart = new Date(payrollPeriod);
        periodStart.setDate(1);
        periodStart.setHours(0, 0, 0, 0);
        
        const periodEnd = new Date(periodStart);
        periodEnd.setMonth(periodStart.getMonth() + 1);
        periodEnd.setDate(0);
        periodEnd.setHours(23, 59, 59, 999);

        const query: any = {
            payrollPeriod: { $gte: periodStart, $lte: periodEnd },
            status: { $nin: [PayRollStatus.REJECTED] } // Allow creating new run if previous was rejected
        };

        if (excludeRunId) {
            query._id = { $ne: new mongoose.Types.ObjectId(excludeRunId) };
        }

        const existing = await this.payrollRunsModel.findOne(query).lean().exec();
        if (existing) {
            throw new ConflictException(`Payroll run already exists for period ${payrollPeriod.toISOString().substring(0, 7)}`);
        }
    }

    // Validate state transitions for signing bonuses
    private validateBonusStateTransition(currentStatus: BonusStatus, newStatus: BonusStatus, operation: string): void {
        const validTransitions: Record<BonusStatus, BonusStatus[]> = {
            [BonusStatus.PENDING]: [BonusStatus.APPROVED, BonusStatus.REJECTED],
            [BonusStatus.APPROVED]: [BonusStatus.PAID],
            [BonusStatus.PAID]: [], // Terminal state
            [BonusStatus.REJECTED]: [] // Terminal state
        };

        if (!validTransitions[currentStatus]?.includes(newStatus)) {
            throw new BadRequestException(
                `Invalid state transition for ${operation}: ${currentStatus} -> ${newStatus}`
            );
        }
    }

    // Validate state transitions for benefits
    private validateBenefitStateTransition(currentStatus: BenefitStatus, newStatus: BenefitStatus, operation: string): void {
        const validTransitions: Record<BenefitStatus, BenefitStatus[]> = {
            [BenefitStatus.PENDING]: [BenefitStatus.APPROVED, BenefitStatus.REJECTED],
            [BenefitStatus.APPROVED]: [BenefitStatus.PAID],
            [BenefitStatus.PAID]: [], // Terminal state
            [BenefitStatus.REJECTED]: [] // Terminal state
        };

        if (!validTransitions[currentStatus]?.includes(newStatus)) {
            throw new BadRequestException(
                `Invalid state transition for ${operation}: ${currentStatus} -> ${newStatus}`
            );
        }
    }

    // Validate state transitions for payroll runs
    private validatePayrollStateTransition(currentStatus: PayRollStatus, newStatus: PayRollStatus, operation: string): void {
        const validTransitions: Record<PayRollStatus, PayRollStatus[]> = {
            [PayRollStatus.DRAFT]: [PayRollStatus.UNDER_REVIEW, PayRollStatus.REJECTED],
            [PayRollStatus.UNDER_REVIEW]: [PayRollStatus.PENDING_FINANCE_APPROVAL, PayRollStatus.REJECTED],
            [PayRollStatus.PENDING_FINANCE_APPROVAL]: [PayRollStatus.APPROVED, PayRollStatus.REJECTED],
            [PayRollStatus.APPROVED]: [PayRollStatus.LOCKED],
            [PayRollStatus.LOCKED]: [PayRollStatus.UNLOCKED],
            [PayRollStatus.UNLOCKED]: [PayRollStatus.LOCKED],
            [PayRollStatus.REJECTED]: [PayRollStatus.DRAFT] // Can re-edit after rejection
        };

        if (!validTransitions[currentStatus]?.includes(newStatus)) {
            throw new BadRequestException(
                `Invalid state transition for ${operation}: ${currentStatus} -> ${newStatus}`
            );
        }
    }

    // ============ SIGNING BONUS METHODS ============
    
    async listSigningBonuses(status?: string) {
        const filter: any = {};
        if (status) filter.status = status;
        return this.employeeSigningBonusModel.find(filter).lean().exec();
    }

    async getSigningBonus(id: string) {
        const doc = await this.employeeSigningBonusModel.findById(id).lean().exec();
        if (!doc) {
            throw new NotFoundException(`Signing bonus ${id} not found`);
        }
        return doc;
    }

    async updateSigningBonus(id: string, dto: { status?: BonusStatus; paymentDate?: string; amount?: number; note?: string }, updatedBy?: string) {
        await this.ensurePayrollSpecialist(updatedBy);
        
        // Get current bonus
        const existing = await this.employeeSigningBonusModel.findById(id).lean().exec();
        if (!existing) {
            throw new NotFoundException(`Signing bonus ${id} not found`);
        }

        // BR 25: Manual overrides require authorization (already ensured via ensurePayrollSpecialist)
        // Validate state: cannot edit PAID or REJECTED bonuses
        if (existing.status === BonusStatus.PAID) {
            throw new BadRequestException('Cannot edit signing bonus that has already been paid');
        }
        if (existing.status === BonusStatus.REJECTED) {
            throw new BadRequestException('Cannot edit rejected signing bonus');
        }

        const update: any = {};
        
        // Validate and set status if provided
        if (dto.status !== undefined) {
            this.validateBonusStateTransition(existing.status, dto.status, 'signing bonus update');
            update.status = dto.status;
        }
        
        // Use givenAmount instead of amount (matching schema)
        if (dto.amount !== undefined) {
            if (dto.amount < 0) {
                throw new BadRequestException('Signing bonus amount cannot be negative');
            }
            update.givenAmount = dto.amount;
        }
        
        if (dto.note !== undefined) {
            update.note = dto.note;
        }
        
        if (dto.paymentDate !== undefined) {
            const d = new Date(dto.paymentDate);
            if (isNaN(d.getTime())) {
                throw new BadRequestException('Invalid paymentDate; expected ISO date string');
            }
            update.paymentDate = d;
        }

        update.updatedAt = new Date();
        
        const doc = await this.employeeSigningBonusModel.findByIdAndUpdate(
            id, 
            { $set: update }, 
            { new: true }
        ).exec();
        
        return doc;
    }

    async approveSigningBonus(id: string, approvedBy?: string) {
        await this.ensurePayrollSpecialist(approvedBy);
        
        const existing = await this.employeeSigningBonusModel.findById(id).lean().exec();
        if (!existing) {
            throw new NotFoundException(`Signing bonus ${id} not found`);
        }

        // Validate approver exists and is active
        if (approvedBy) {
            await this.validateApprover(approvedBy);
        }

        // Validate state transition
        this.validateBonusStateTransition(existing.status, BonusStatus.APPROVED, 'signing bonus approval');

        // BR 28: Ensure signing bonus is disbursed only once - check if already approved/paid
        if (existing.status === BonusStatus.APPROVED || existing.status === BonusStatus.PAID) {
            throw new BadRequestException('Signing bonus has already been approved');
        }

        const now = new Date();
        const doc = await this.employeeSigningBonusModel.findByIdAndUpdate(
            id,
            { 
                $set: { 
                    status: BonusStatus.APPROVED, 
                    paymentDate: now,
                    updatedAt: now 
                } 
            },
            { new: true },
        ).exec();
        
        return doc;
    }

    async approveSigningBonuses(approvedBy?: string) {
        await this.ensurePayrollSpecialist(approvedBy);
        
        const now = new Date();
        
        // Only approve PENDING bonuses (not REJECTED or already APPROVED/PAID)
        const res = await this.employeeSigningBonusModel.updateMany(
            { status: BonusStatus.PENDING },
            { 
                $set: { 
                    status: BonusStatus.APPROVED, 
                    paymentDate: now,
                    updatedAt: now 
                } 
            },
        ).exec();
        
        return {
            matchedCount: (res as any).matchedCount ?? (res as any).n ?? 0,
            modifiedCount: (res as any).modifiedCount ?? (res as any).nModified ?? 0,
            approvedAt: now,
        };
    }

    // ============ TERMINATION/RESIGNATION BENEFITS METHODS ============
    
    async listTerminationBenefits(status?: string) {
        const filter: any = {};
        if (status) filter.status = status;
        return this.employeeTerminationResignationModel.find(filter).lean().exec();
    }

    async getTerminationBenefit(id: string) {
        const doc = await this.employeeTerminationResignationModel.findById(id).lean().exec();
        if (!doc) {
            throw new NotFoundException(`Termination benefit ${id} not found`);
        }
        return doc;
    }

    async updateTerminationBenefit(id: string, dto: any, updatedBy?: string) {
        await this.ensurePayrollSpecialist(updatedBy);
        
        // Get current benefit
        const existing = await this.employeeTerminationResignationModel.findById(id).lean().exec();
        if (!existing) {
            throw new NotFoundException(`Termination benefit ${id} not found`);
        }

        // BR 27: Manual adjustments require approval and logging
        // Validate state: cannot edit PAID or REJECTED benefits
        if (existing.status === BenefitStatus.PAID) {
            throw new BadRequestException('Cannot edit termination benefit that has already been paid');
        }
        if (existing.status === BenefitStatus.REJECTED) {
            throw new BadRequestException('Cannot edit rejected termination benefit');
        }

        const update: any = {};
        
        // Validate and set status if provided
        if (dto.status !== undefined) {
            this.validateBenefitStateTransition(existing.status, dto.status, 'termination benefit update');
            update.status = dto.status;
        }
        
        if (dto.note !== undefined) {
            update.note = dto.note;
        }
        
        // BR 27: givenAmount validation
        if (dto.givenAmount !== undefined) {
            if (dto.givenAmount < 0) {
                throw new BadRequestException('Termination benefit amount cannot be negative');
            }
            if (dto.givenAmount > 5000000) { // Max cap for termination benefits
                throw new BadRequestException('Termination benefit amount exceeds maximum allowed (5,000,000)');
            }
            update.givenAmount = dto.givenAmount;
        }

        update.updatedAt = new Date();
        update.updatedBy = new mongoose.Types.ObjectId(updatedBy);
        
        const doc = await this.employeeTerminationResignationModel.findByIdAndUpdate(
            id, 
            { $set: update }, 
            { new: true }
        ).exec();
        
        return doc;
    }

    async approveTerminationBenefit(id: string, approvedBy?: string) {
        await this.ensurePayrollSpecialist(approvedBy);
        
        const existing = await this.employeeTerminationResignationModel.findById(id).lean().exec();
        if (!existing) {
            throw new NotFoundException(`Termination benefit ${id} not found`);
        }

        // Validate approver exists and is active
        if (approvedBy) {
            await this.validateApprover(approvedBy);
        }

        // Validate state transition
        this.validateBenefitStateTransition(existing.status, BenefitStatus.APPROVED, 'termination benefit approval');

        // BR 26: Termination benefits must not be processed until HR clearance completed
        // TODO: Integration with Offboarding module - verify HR clearance is complete
        const db = this.db;
        if (db) {
            const terminationRequest = await db.collection('termination_requests').findOne({ 
                _id: existing.terminationId 
            });
            
            if (!terminationRequest) {
                throw new BadRequestException('Associated termination request not found');
            }

            // Check if termination request is in approved state
            if (terminationRequest.status !== 'APPROVED') {
                throw new BadRequestException(
                    `Cannot approve benefits until termination request is approved. Current status: ${terminationRequest.status}`
                );
            }

            // TODO: Check HR clearance status once offboarding module is integrated
            // if (!terminationRequest.hrClearanceCompleted) {
            //     throw new BadRequestException('Cannot approve benefits until HR clearance is completed');
            // }
        }

        const now = new Date();
        const doc = await this.employeeTerminationResignationModel.findByIdAndUpdate(
            id, 
            { 
                $set: { 
                    status: BenefitStatus.APPROVED, 
                    approvedAt: now,
                    updatedAt: now 
                } 
            }, 
            { new: true }
        ).exec();
        
        return doc;
    }

    // ============ PAYROLL INITIATION AND RUN METHODS ============
    
    async getDraft(id: string, requestedBy?: string) {
        // Draft feature deprecated - returns payroll run details instead
        return this.getPayrollInitiation(id);
    }

    async createPayrollInitiation(dto: any, createdBy?: string) {
        await this.ensurePayrollSpecialist(createdBy);
        
        // Validate and parse payroll period
        let payrollPeriod: Date;
        if (dto.payrollPeriod) {
            payrollPeriod = new Date(dto.payrollPeriod);
            if (isNaN(payrollPeriod.getTime())) {
                throw new BadRequestException('Invalid payrollPeriod; expected a valid date');
            }
        } else {
            payrollPeriod = new Date();
        }

        // Validate period is not in the future
        const now = new Date();
        if (payrollPeriod > now) {
            throw new BadRequestException('Cannot create payroll for future period');
        }

        // Check for duplicate payroll period (BR 63)
        await this.validateNoDuplicatePayrollPeriod(payrollPeriod);

        // Generate unique run ID
        const runId = dto.runId || `PR-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${Date.now()}`;

        const payrollSpecialistId = createdBy ? new mongoose.Types.ObjectId(createdBy) : null;
        const payrollManagerId = dto.payrollManagerId 
            ? new mongoose.Types.ObjectId(dto.payrollManagerId)
            : payrollSpecialistId;

        const doc: any = {
            runId,
            payrollPeriod,
            status: PayRollStatus.DRAFT,
            entity: dto.entity || 'default',
            employees: dto.employees ?? 0,
            exceptions: dto.exceptions ?? 0,
            totalnetpay: dto.totalnetpay ?? 0,
            payrollSpecialistId,
            payrollManagerId,
            paymentStatus: PayRollPaymentStatus.PENDING,
        };

        const created = await this.payrollRunsModel.create(doc);
        return created;
    }

    async getPayrollInitiation(id: string) {
        const doc = await this.payrollRunsModel.findById(id).lean().exec();
        if (!doc) {
            throw new NotFoundException(`Payroll run ${id} not found`);
        }
        return doc;
    }

    async updatePayrollInitiation(id: string, dto: any, updatedBy?: string) {
        await this.ensurePayrollSpecialist(updatedBy);
        
        const existing = await this.payrollRunsModel.findById(id).lean().exec();
        if (!existing) {
            throw new NotFoundException(`Payroll run ${id} not found`);
        }

        // Validate can only edit DRAFT or REJECTED runs
        if (existing.status !== PayRollStatus.DRAFT && existing.status !== PayRollStatus.REJECTED) {
            throw new BadRequestException(
                `Cannot edit payroll in status ${existing.status}. Only DRAFT or REJECTED runs can be edited.`
            );
        }

        const update: any = {};
        
        // Validate and update payroll period if provided
        if (dto.payrollPeriod) {
            const newPeriod = new Date(dto.payrollPeriod);
            if (isNaN(newPeriod.getTime())) {
                throw new BadRequestException('Invalid payrollPeriod; expected a valid date');
            }
            
            // Check for duplicate period (excluding current run)
            await this.validateNoDuplicatePayrollPeriod(newPeriod, id);
            update.payrollPeriod = newPeriod;
        }
        
        if (dto.entity) update.entity = dto.entity;
        if (dto.employees !== undefined) update.employees = dto.employees;
        if (dto.exceptions !== undefined) update.exceptions = dto.exceptions;
        if (dto.totalnetpay !== undefined) update.totalnetpay = dto.totalnetpay;
        
        // If previously rejected, reset to draft and clear rejection reason
        if (existing.status === PayRollStatus.REJECTED) {
            update.status = PayRollStatus.DRAFT;
            update.rejectionReason = null;
        }
        
        update.updatedAt = new Date();
        
        const updated = await this.payrollRunsModel.findByIdAndUpdate(
            id, 
            { $set: update }, 
            { new: true }
        ).exec();
        
        return updated;
    }

    async approvePayrollInitiation(id: string, approvedBy?: string) {
        await this.ensurePayrollSpecialist(approvedBy);
        
        const existing = await this.payrollRunsModel.findById(id).lean().exec();
        if (!existing) {
            throw new NotFoundException(`Payroll run ${id} not found`);
        }

        // Validate state transition
        this.validatePayrollStateTransition(existing.status, PayRollStatus.UNDER_REVIEW, 'payroll initiation approval');

        const now = new Date();
        
        // Update to UNDER_REVIEW and trigger processing
        const updated = await this.payrollRunsModel.findByIdAndUpdate(
            id,
            { 
                $set: { 
                    status: PayRollStatus.UNDER_REVIEW, 
                    managerApprovalDate: now,
                    updatedAt: now 
                } 
            },
            { new: true }
        ).exec();

        try {
            // Process the payroll run (REQ-PY-23)
            await this.processPayrollRun(updated);
            
            // After successful processing, move to PENDING_FINANCE_APPROVAL
            const finalized = await this.payrollRunsModel.findByIdAndUpdate(
                id,
                { 
                    $set: { 
                        status: PayRollStatus.PENDING_FINANCE_APPROVAL,
                        updatedAt: new Date() 
                    } 
                },
                { new: true }
            ).exec();
            
            return finalized;
        } catch (err) {
            console.error('Payroll processing failed for run', id, err);
            // Revert to draft on processing failure
            await this.payrollRunsModel.findByIdAndUpdate(
                id,
                { 
                    $set: { 
                        status: PayRollStatus.DRAFT,
                        exceptions: (existing.exceptions || 0) + 1,
                        updatedAt: new Date()
                    } 
                }
            ).exec();
            throw new BadRequestException(`Payroll processing failed: ${err.message}`);
        }
    }

    async rejectPayrollInitiation(id: string, rejectedBy?: string, reason?: string) {
        await this.ensurePayrollSpecialist(rejectedBy);
        
        const existing = await this.payrollRunsModel.findById(id).lean().exec();
        if (!existing) {
            throw new NotFoundException(`Payroll run ${id} not found`);
        }

        // Can reject from DRAFT or UNDER_REVIEW
        if (existing.status !== PayRollStatus.DRAFT && existing.status !== PayRollStatus.UNDER_REVIEW) {
            throw new BadRequestException(
                `Cannot reject payroll in status ${existing.status}`
            );
        }

        if (!reason || reason.trim().length === 0) {
            throw new BadRequestException('Rejection reason is required');
        }

        const updated = await this.payrollRunsModel.findByIdAndUpdate(
            id,
            { 
                $set: { 
                    status: PayRollStatus.REJECTED, 
                    rejectionReason: reason,
                    updatedAt: new Date() 
                } 
            },
            { new: true }
        ).exec();
        
        return updated;
    }

    // REQ-PY-22: Manager approval
    async approvePayroll(id: string, approvedBy?: string) {
        await this.ensurePayrollManager(approvedBy);
        
        const existing = await this.payrollRunsModel.findById(id).lean().exec();
        if (!existing) {
            throw new NotFoundException(`Payroll run ${id} not found`);
        }

        // Validate approver and prevent self-approval (BR 30: multi-step approval)
        if (approvedBy && existing.payrollSpecialistId) {
            await this.validateApprover(approvedBy, existing.payrollSpecialistId.toString());
        }

        // Can only approve from UNDER_REVIEW or PENDING_FINANCE_APPROVAL
        if (existing.status !== PayRollStatus.UNDER_REVIEW && 
            existing.status !== PayRollStatus.PENDING_FINANCE_APPROVAL) {
            throw new BadRequestException(
                `Cannot approve payroll in status ${existing.status}`
            );
        }

        const now = new Date();
        const managerId = new mongoose.Types.ObjectId(approvedBy);
        
        const updated = await this.payrollRunsModel.findByIdAndUpdate(
            id,
            { 
                $set: { 
                    payrollManagerId: managerId,
                    managerApprovalDate: now,
                    updatedAt: now 
                } 
            },
            { new: true }
        ).exec();
        
        return updated;
    }

    // REQ-PY-15: Finance approval - final approval before payment
    async approvePayrollFinance(id: string, approvedBy?: string) {
        await this.ensureFinanceStaff(approvedBy);
        
        const existing = await this.payrollRunsModel.findById(id).lean().exec();
        if (!existing) {
            throw new NotFoundException(`Payroll run ${id} not found`);
        }

        // Validate approver and prevent self-approval (BR 30: multi-step approval)
        if (approvedBy && existing.payrollSpecialistId) {
            await this.validateApprover(approvedBy, existing.payrollSpecialistId.toString());
            // Also ensure finance approver is not the manager approver
            if (existing.payrollManagerId && existing.payrollManagerId.toString() === approvedBy) {
                throw new ForbiddenException('Finance approver cannot be the same as manager approver');
            }
        }

        // Validate state transition (BR 30: Multi-step approval)
        this.validatePayrollStateTransition(
            existing.status, 
            PayRollStatus.APPROVED, 
            'finance approval'
        );

        // Ensure manager has approved first
        if (!existing.managerApprovalDate) {
            throw new BadRequestException('Payroll must be approved by manager before finance approval');
        }

        const now = new Date();
        const financeId = new mongoose.Types.ObjectId(approvedBy);
        
        // Update status to APPROVED and payment status to PAID (BR 18)
        const updated = await this.payrollRunsModel.findByIdAndUpdate(
            id,
            { 
                $set: { 
                    status: PayRollStatus.APPROVED,
                    paymentStatus: PayRollPaymentStatus.PAID,
                    financeStaffId: financeId,
                    financeApprovalDate: now,
                    updatedAt: now 
                } 
            },
            { new: true }
        ).exec();

        // Update all payslips to PAID status (REQ-PY-8)
        await this.paySlipModel.updateMany(
            { payrollRunId: new mongoose.Types.ObjectId(id) },
            { 
                $set: { 
                    paymentStatus: PaySlipPaymentStatus.PAID,
                    updatedAt: now 
                } 
            }
        ).exec();
        
        return updated;
    }

    // REQ-PY-7: Lock/Freeze payroll
    async freezePayroll(id: string, by?: string) {
        await this.ensurePayrollManager(by);
        
        const existing = await this.payrollRunsModel.findById(id).lean().exec();
        if (!existing) {
            throw new NotFoundException(`Payroll run ${id} not found`);
        }

        // Validate state transition
        this.validatePayrollStateTransition(existing.status, PayRollStatus.LOCKED, 'freeze payroll');

        // Can only freeze APPROVED payrolls
        if (existing.status !== PayRollStatus.APPROVED) {
            throw new BadRequestException('Can only freeze approved payrolls');
        }

        const updated = await this.payrollRunsModel.findByIdAndUpdate(
            id,
            { 
                $set: { 
                    status: PayRollStatus.LOCKED,
                    updatedAt: new Date() 
                } 
            },
            { new: true }
        ).exec();
        
        return updated;
    }

    // REQ-PY-19: Unfreeze payroll with reason
    async unfreezePayroll(id: string, by?: string, reason?: string) {
        await this.ensurePayrollManager(by);
        
        const existing = await this.payrollRunsModel.findById(id).lean().exec();
        if (!existing) {
            throw new NotFoundException(`Payroll run ${id} not found`);
        }

        // Validate state transition
        this.validatePayrollStateTransition(existing.status, PayRollStatus.UNLOCKED, 'unfreeze payroll');

        // Can only unfreeze LOCKED payrolls
        if (existing.status !== PayRollStatus.LOCKED) {
            throw new BadRequestException('Can only unfreeze locked payrolls');
        }

        if (!reason || reason.trim().length === 0) {
            throw new BadRequestException('Reason is required to unfreeze payroll');
        }

        const updated = await this.payrollRunsModel.findByIdAndUpdate(
            id,
            { 
                $set: { 
                    status: PayRollStatus.UNLOCKED,
                    unlockReason: reason,
                    updatedAt: new Date() 
                } 
            },
            { new: true }
        ).exec();
        
        return updated;
    }

    // REQ-PY-8: Generate and distribute payslips
    async generatePayslips(id: string, triggeredBy?: string) {
        await this.ensureFinanceStaff(triggeredBy);
        
        const existing = await this.payrollRunsModel.findById(id).lean().exec();
        if (!existing) {
            throw new NotFoundException(`Payroll run ${id} not found`);
        }

        // Can only generate payslips for APPROVED or LOCKED payrolls
        if (existing.status !== PayRollStatus.APPROVED && existing.status !== PayRollStatus.LOCKED) {
            throw new BadRequestException(
                `Cannot generate payslips for payroll in status ${existing.status}`
            );
        }

        // Payslips are already created during processPayrollRun
        // This method marks them as distributed/sent
        const payslips = await this.paySlipModel.find({ 
            payrollRunId: new mongoose.Types.ObjectId(id) 
        }).lean().exec();

        if (payslips.length === 0) {
            throw new BadRequestException('No payslips found for this payroll run');
        }

        // TODO: Integration with notification/email service to distribute payslips
        // For now, just return the payslips count
        return {
            payrollRunId: id,
            payslipsGenerated: payslips.length,
            status: 'generated',
            generatedBy: triggeredBy,
            generatedAt: new Date()
        };
    }

    // ============ PAYROLL PROCESSING ENGINE ============
    
    private async processPayrollRun(runDoc: payrollRunsDocument | any) {
        if (!runDoc || !runDoc._id) {
            throw new BadRequestException('Invalid payroll run');
        }
        
        const db = this.db;
        if (!db) {
            throw new BadRequestException('Database unavailable');
        }

        // Calculate period boundaries
        const payrollPeriod = runDoc.payrollPeriod ? new Date(runDoc.payrollPeriod) : new Date();
        const periodStart = new Date(payrollPeriod);
        periodStart.setDate(1);
        periodStart.setHours(0, 0, 0, 0);
        
        const periodEnd = new Date(periodStart);
        periodEnd.setMonth(periodStart.getMonth() + 1);
        periodEnd.setDate(0);
        periodEnd.setHours(23, 59, 59, 999);

        const daysInMonth = periodEnd.getDate();

        // Get active employees for the period (BR 64: linked to organization accounts)
        let employeesList: any[] = [];
        if (this.employeeService && typeof (this.employeeService as any).findActive === 'function') {
            employeesList = await (this.employeeService as any).findActive(payrollPeriod);
        } else {
            // Fallback to raw DB query
            employeesList = await db.collection('employee_profiles').find({ 
                status: 'ACTIVE' 
            }).toArray();
        }

        // Get configuration data (BR 31: Payroll Schema)
        const taxRules = await db.collection('taxrules').find({ status: 'approved' }).toArray().catch(() => []);
        const insuranceBrackets = await db.collection('insurancebrackets').find({ status: 'approved' }).toArray().catch(() => []);
        const allowancesConfig = await db.collection('allowances').find({ status: 'approved' }).toArray().catch(() => []);
        
        // BR 4: Get minimum wage setting
        const companySettings = await db.collection('companywidesettings').findOne({}) || {};
        const minimumWage = companySettings.minimumWage || 0;

        let employeesCount = 0;
        let exceptionsCount = 0;
        let totalNet = 0;

        // Check for duplicate employee payroll details
        const existingDetails = await this.employeePayrollDetailsModel.find({
            payrollRunId: runDoc._id
        }).lean().exec();
        
        if (existingDetails.length > 0) {
            throw new BadRequestException('Payroll details already exist for this run. Cannot reprocess.');
        }

        // Process each employee
        for (const emp of employeesList) {
            try {
                await this.processEmployeePayroll(
                    emp,
                    runDoc,
                    periodStart,
                    periodEnd,
                    daysInMonth,
                    taxRules,
                    insuranceBrackets,
                    allowancesConfig,
                    minimumWage,
                    db
                );
                employeesCount++;
            } catch (err) {
                console.error(`Error processing employee ${emp._id}:`, err);
                exceptionsCount++;
                
                // Create exception record
                await this.employeePayrollDetailsModel.create({
                    employeeId: emp._id,
                    baseSalary: 0,
                    allowances: 0,
                    deductions: 0,
                    netSalary: 0,
                    netPay: 0,
                    bankStatus: BankStatus.MISSING,
                    exceptions: err.message || 'Processing error',
                    payrollRunId: runDoc._id,
                });
            }
        }

        // Calculate total net pay
        const allDetails = await this.employeePayrollDetailsModel.find({
            payrollRunId: runDoc._id
        }).lean().exec();
        
        totalNet = allDetails.reduce((sum, detail) => sum + (detail.netPay || 0), 0);

        // Update payroll run with final counts
        await this.payrollRunsModel.findByIdAndUpdate(
            runDoc._id,
            {
                $set: {
                    employees: employeesCount,
                    exceptions: exceptionsCount,
                    totalnetpay: totalNet,
                    updatedAt: new Date()
                }
            }
        ).exec();

        return true;
    }

    private async processEmployeePayroll(
        emp: any,
        runDoc: any,
        periodStart: Date,
        periodEnd: Date,
        daysInMonth: number,
        taxRules: any[],
        insuranceBrackets: any[],
        allowancesConfig: any[],
        minimumWage: number,
        db: any
    ) {
        const employeeId = emp._id;

        // BR 1, BR 66: Validate active contract
        await this.validateEmployeeContract(employeeId);

        // TODO: Integration with Employee module - get actual contract details
        // For now, use employee profile data
        let baseSalary = emp.baseSalary || 0;
        
        // Get employee's allowances
        // TODO: Integration with Payroll Configuration - get employee-specific allowances
        let totalAllowances = 0;

        // Check if employee was hired mid-month (REQ-PY-2: prorated salary)
        let daysWorked = daysInMonth;
        let isProratedHire = false;
        
        if (emp.dateOfHire) {
            const hireDate = new Date(emp.dateOfHire);
            if (hireDate >= periodStart && hireDate <= periodEnd) {
                // Mid-month hire - prorate salary
                isProratedHire = true;
                const daysFromHire = Math.ceil((periodEnd.getTime() - hireDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
                daysWorked = Math.min(daysFromHire, daysInMonth);
                
                // Auto-process signing bonus (REQ-PY-27, BR 28)
                await this.autoProcessSigningBonus(emp, db, runDoc);
            }
        }

        // Check for termination/resignation (REQ-PY-2: prorated salary)
        let isProratedTermination = false;
        const terminationCheck = await db.collection('termination_requests').findOne({
            employeeId: employeeId,
            status: 'APPROVED'
        });

        if (terminationCheck && terminationCheck.effectiveDate) {
            const termDate = new Date(terminationCheck.effectiveDate);
            if (termDate >= periodStart && termDate <= periodEnd) {
                // Mid-month termination - prorate salary
                isProratedTermination = true;
                const daysUntilTerm = Math.ceil((termDate.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
                daysWorked = Math.min(daysUntilTerm, daysWorked);
                
                // Auto-process termination benefits (REQ-PY-30, BR 29, BR 56)
                await this.autoProcessTerminationBenefits(emp, terminationCheck, db, runDoc);
            }
        }

        // Integration with Time Management module - get actual attendance data
        const attendanceData = await this.getAttendanceData(employeeId, periodStart, periodEnd);
        
        // Integration with Leaves module - get unpaid leave days (BR 11)
        const unpaidLeaveDays = await this.getUnpaidLeaveDays(employeeId, periodStart, periodEnd);

        // Adjust days worked for unpaid leave
        daysWorked = Math.max(0, daysWorked - unpaidLeaveDays);

        // Calculate penalty for missing work hours/days
        const hourlyRate = baseSalary / (daysInMonth * 8); // Assuming 8 hours per day
        const missingHoursPenalty = (attendanceData.missingWorkMinutes / 60) * hourlyRate;
        
        // Calculate lateness penalty (if applicable)
        const latenessPenalty = (attendanceData.latenessMinutes / 60) * hourlyRate * 0.5; // 50% deduction for lateness
        
        // Calculate overtime pay (1.5x hourly rate)
        const overtimePay = (attendanceData.overtimeMinutes / 60) * hourlyRate * 1.5;

        // Calculate prorated gross salary
        const grossSalary = baseSalary + totalAllowances;
        const proratedGross = (grossSalary / daysInMonth) * daysWorked;

        // BR 34: Apply deductions after gross calculation
        // Calculate tax (BR 3, BR 5, BR 20)
        let taxAmount = 0;
        for (const taxRule of taxRules) {
            if (taxRule.rate && typeof taxRule.rate === 'number') {
                taxAmount += (baseSalary * taxRule.rate) / 100;
            }
        }

        // BR 7, BR 8: Calculate insurance
        let insuranceAmount = 0;
        const matchingBracket = insuranceBrackets.find((b: any) => 
            baseSalary >= (b.minSalary || 0) && baseSalary <= (b.maxSalary || Number.MAX_SAFE_INTEGER)
        );
        
        if (matchingBracket && matchingBracket.employeeRate) {
            insuranceAmount = (proratedGross * matchingBracket.employeeRate) / 100;
        }

        // BR 33: Get penalties for misconduct from Payroll Tracking
        let misconductPenaltiesAmount = 0;
        const misconductPenalties = await db.collection('employeepenalties').findOne({
            employeeId: employeeId
        });
        
        if (misconductPenalties && Array.isArray(misconductPenalties.penalties)) {
            misconductPenaltiesAmount = misconductPenalties.penalties.reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
        }

        // Calculate total penalties: misconduct + missing work + lateness
        const totalPenalties = misconductPenaltiesAmount + missingHoursPenalty + latenessPenalty;

        // Integration with Payroll Tracking - get refunds
        let refundsAmount = 0;
        const refunds = await db.collection('employeerefunds').findOne({
            employeeId: employeeId,
            status: 'APPROVED',
            payrollPeriod: { $gte: periodStart, $lte: periodEnd }
        });
        
        if (refunds && Array.isArray(refunds.refunds)) {
            refundsAmount = refunds.refunds.reduce((sum: number, r: any) => sum + (r.amount || 0), 0);
        }

        // Get signing bonus if approved
        let signingBonusAmount = 0;
        const approvedBonus = await this.employeeSigningBonusModel.findOne({
            employeeId: employeeId,
            status: BonusStatus.APPROVED
        }).lean().exec();
        
        if (approvedBonus) {
            signingBonusAmount = approvedBonus.givenAmount || 0;
            // Mark as paid
            await this.employeeSigningBonusModel.findByIdAndUpdate(
                approvedBonus._id,
                { 
                    $set: { 
                        status: BonusStatus.PAID,
                        paymentDate: new Date(),
                        updatedAt: new Date() 
                    } 
                }
            ).exec();
        }

        // Get termination benefit if approved
        let terminationBenefitAmount = 0;
        const approvedBenefit = await this.employeeTerminationResignationModel.findOne({
            employeeId: employeeId,
            status: BenefitStatus.APPROVED
        }).lean().exec();
        
        if (approvedBenefit) {
            terminationBenefitAmount = approvedBenefit.givenAmount || 0;
            // Mark as paid
            await this.employeeTerminationResignationModel.findByIdAndUpdate(
                approvedBenefit._id,
                { 
                    $set: { 
                        status: BenefitStatus.PAID,
                        updatedAt: new Date() 
                    } 
                }
            ).exec();
        }

        // BR 35: Calculate net salary and net pay
        // Formula: netPay = (netSalary - penalties + overtime + refunds + bonuses + benefits)
        const totalDeductions = taxAmount + insuranceAmount;
        const netSalary = proratedGross - totalDeductions;
        let netPay = netSalary - totalPenalties + overtimePay + refundsAmount + signingBonusAmount + terminationBenefitAmount;

        // BR 60: Ensure net pay doesn't go below minimum wage (after penalties)
        const proratedMinimumWage = (minimumWage / daysInMonth) * daysWorked;
        if (netPay < proratedMinimumWage && minimumWage > 0) {
            // Flag as exception but don't fail
            await this.employeePayrollDetailsModel.create({
                employeeId: employeeId,
                baseSalary: baseSalary,
                allowances: totalAllowances,
                deductions: totalDeductions,
                netSalary: netSalary,
                netPay: proratedMinimumWage, // Enforce minimum wage
                bankStatus: BankStatus.VALID, // TODO: Validate actual bank account
                exceptions: `Net pay below minimum wage. Adjusted from ${netPay.toFixed(2)} to ${proratedMinimumWage.toFixed(2)}`,
                bonus: signingBonusAmount,
                benefit: terminationBenefitAmount,
                payrollRunId: runDoc._id,
            });
            return;
        }

        // BR 5: Flag if net pay is negative
        let exceptionMessage: string | null = null;
        if (netPay < 0) {
            exceptionMessage = `Negative net pay: ${netPay.toFixed(2)}`;
            netPay = 0; // Set to zero, don't pay negative
        }

        // TODO: BR 64: Validate bank account exists
        // For now, assume valid
        const bankStatus = BankStatus.VALID;

        // Create payroll detail record (BR 36: Store all calculation elements)
        await this.employeePayrollDetailsModel.create({
            employeeId: employeeId,
            baseSalary: baseSalary,
            allowances: totalAllowances,
            deductions: totalDeductions,
            penalties: {
                misconduct: misconductPenaltiesAmount,
                missingWork: missingHoursPenalty,
                lateness: latenessPenalty,
                total: totalPenalties
            },
            overtime: {
                minutes: attendanceData.overtimeMinutes,
                amount: overtimePay
            },
            refunds: refundsAmount,
            attendance: {
                actualWorkMinutes: attendanceData.actualWorkMinutes,
                scheduledWorkMinutes: attendanceData.scheduledWorkMinutes,
                missingWorkMinutes: attendanceData.missingWorkMinutes,
                overtimeMinutes: attendanceData.overtimeMinutes,
                latenessMinutes: attendanceData.latenessMinutes,
                workingDays: attendanceData.workingDays,
                unpaidLeaveDays: unpaidLeaveDays
            },
            netSalary: netSalary,
            netPay: netPay,
            bankStatus: bankStatus,
            exceptions: exceptionMessage,
            bonus: signingBonusAmount,
            benefit: terminationBenefitAmount,
            payrollRunId: runDoc._id,
        });

        // BR 17: Create payslip with detailed breakdown
        await this.paySlipModel.create({
            employeeId: employeeId,
            payrollRunId: runDoc._id,
            earningsDetails: {
                baseSalary: baseSalary,
                allowances: allowancesConfig,
                overtime: {
                    hours: attendanceData.overtimeMinutes / 60,
                    rate: hourlyRate * 1.5,
                    amount: overtimePay
                },
                bonuses: approvedBonus ? [approvedBonus] : [],
                benefits: approvedBenefit ? [approvedBenefit] : [],
                refunds: refundsAmount > 0 ? [{ amount: refundsAmount, description: 'Approved refunds' }] : [],
            },
            deductionsDetails: {
                taxes: taxRules,
                insurances: matchingBracket ? [matchingBracket] : [],
                penalties: {
                    misconduct: misconductPenaltiesAmount,
                    missingWork: missingHoursPenalty,
                    lateness: latenessPenalty,
                    total: totalPenalties
                },
            },
            attendanceDetails: {
                actualWorkHours: attendanceData.actualWorkMinutes / 60,
                scheduledWorkHours: attendanceData.scheduledWorkMinutes / 60,
                overtimeHours: attendanceData.overtimeMinutes / 60,
                latenessHours: attendanceData.latenessMinutes / 60,
                unpaidLeaveDays: unpaidLeaveDays,
                workingDays: attendanceData.workingDays
            },
            totalGrossSalary: proratedGross,
            totaDeductions: totalDeductions + totalPenalties,
            netPay: netPay,
            paymentStatus: PaySlipPaymentStatus.PENDING,
        });
    }

    private async autoProcessSigningBonus(emp: any, db: any, runDoc: any) {
        // BR 24, BR 28: Auto-create signing bonus for new hires from offer
        try {
            const candidate = await db.collection('candidates').findOne({ 
                personalEmail: emp.personalEmail 
            });
            
            if (!candidate) return;

            const offer = await db.collection('offers').findOne({ 
                candidateId: candidate._id,
                signingBonus: { $exists: true, $gt: 0 }
            });
            
            if (!offer || !offer.signingBonus || offer.signingBonus <= 0) return;

            // Check if signing bonus already exists for this employee
            const existingBonus = await this.employeeSigningBonusModel.findOne({
                employeeId: emp._id
            }).lean().exec();

            if (existingBonus) {
                // BR 28: Signing bonus disbursed only once
                return;
            }

            // Find or create signing bonus configuration
            let sbConfig = await db.collection('signingbonuses').findOne({
                positionName: offer.role || 'Unknown',
                amount: offer.signingBonus
            });

            if (!sbConfig) {
                const insertRes = await db.collection('signingbonuses').insertOne({
                    positionName: offer.role || 'Unknown',
                    amount: offer.signingBonus,
                    status: 'approved',
                    createdBy: runDoc.payrollSpecialistId,
                    approvedBy: runDoc.payrollManagerId,
                    approvedAt: new Date()
                });
                sbConfig = await db.collection('signingbonuses').findOne({ _id: insertRes.insertedId });
            }

            if (sbConfig) {
                // Create employee signing bonus record
                await this.employeeSigningBonusModel.create({
                    employeeId: emp._id,
                    signingBonusId: sbConfig._id,
                    givenAmount: offer.signingBonus,
                    status: BonusStatus.PENDING,
                });
            }
        } catch (err) {
            console.error('Error auto-processing signing bonus:', err);
            // Don't fail the whole payroll for this
        }
    }

    private async autoProcessTerminationBenefits(emp: any, terminationRequest: any, db: any, runDoc: any) {
        // BR 29, BR 56: Auto-calculate termination/resignation benefits
        try {
            // Check if benefit already exists
            const existingBenefit = await this.employeeTerminationResignationModel.findOne({
                employeeId: emp._id,
                terminationId: terminationRequest._id
            }).lean().exec();

            if (existingBenefit) return; // Already processed

            // TODO: Calculate benefits based on contract terms and labor law
            // For now, find configured benefit
            const benefitConfig = await db.collection('terminationandresignationbenefits').findOne({
                status: 'approved'
            });

            if (!benefitConfig) return;

            // Create employee termination benefit record
            await this.employeeTerminationResignationModel.create({
                employeeId: emp._id,
                benefitId: benefitConfig._id,
                terminationId: terminationRequest._id,
                givenAmount: benefitConfig.amount || 0,
                status: BenefitStatus.PENDING,
            });
        } catch (err) {
            console.error('Error auto-processing termination benefits:', err);
            // Don't fail the whole payroll for this
        }
    }
}
