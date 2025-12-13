import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { NotificationLog, NotificationLogDocument } from '../../time-management/models/notification-log.schema';
import { EmployeeProfile, EmployeeProfileDocument } from '../../employee/models/employee/employee-profile.schema';
import { EmployeeSystemRole, EmployeeSystemRoleDocument } from '../../employee/models/employee/employee-system-role.schema';
import { SystemRole, EmployeeStatus } from '../../employee/enums/employee-profile.enums';

@Injectable()
export class SharedEmployeeService {
    private readonly logger = new Logger(SharedEmployeeService.name);

    constructor(
        @InjectModel(NotificationLog.name) private notificationModel: Model<NotificationLogDocument>,
        @InjectModel(EmployeeProfile.name) private employeeProfileModel: Model<EmployeeProfileDocument>,
        @InjectModel(EmployeeSystemRole.name) private systemRoleModel: Model<EmployeeSystemRoleDocument>,
    ) {}

    private async createNotification(to: Types.ObjectId | string, type: string, message: string): Promise<NotificationLog> {
        const toId = typeof to === 'string' ? new Types.ObjectId(to) : to;
        const notification = new this.notificationModel({ to: toId, type, message });
        return notification.save();
    }

    private async findUsersByRoles(roles: SystemRole[]): Promise<any[]> {
        try {
            const systemRoles = await this.systemRoleModel.find({ roles: { $in: roles }, isActive: true }).exec();
            if (!systemRoles.length) return [];
            const employeeIds = systemRoles.map(r => r.employeeProfileId);
            const employees = await this.employeeProfileModel.find({
                _id: { $in: employeeIds },
                status: { $ne: EmployeeStatus.TERMINATED },
            }).select('_id').exec();
            return systemRoles
                .map(role => {
                    const emp = employees.find(e => e._id.toString() === role.employeeProfileId?.toString());
                    return emp ? { employeeProfileId: role.employeeProfileId } : null;
                })
                .filter(Boolean);
        } catch (error) {
            this.logger.error('Failed to find users by roles', error);
            return [];
        }
    }

    private async notifyHRUsers(type: string, message: string): Promise<void> {
        const hrUsers = await this.findUsersByRoles([SystemRole.HR_MANAGER, SystemRole.HR_ADMIN, SystemRole.HR_EMPLOYEE]);
        for (const user of hrUsers) {
            await this.createNotification(user.employeeProfileId, type, message);
        }
    }

    async sendProfileUpdatedNotification(employeeId: string, employeeName: string): Promise<void> {
        await this.createNotification(employeeId, 'N-037', `Your profile has been updated.`);
        await this.notifyHRUsers('N-037', `Employee ${employeeName} profile has been updated.`);
    }

    async sendChangeRequestSubmittedNotification(employeeId: string, employeeName: string, requestId: string): Promise<void> {
        await this.createNotification(employeeId, 'N-040', `Your profile change request (${requestId}) has been submitted and is pending review.`);
        await this.notifyHRUsers('N-040', `Employee ${employeeName} submitted a profile change request (${requestId}).`);
    }

    async sendChangeRequestProcessedNotification(employeeId: string, requestId: string, status: string, rejectionReason?: string): Promise<void> {
        const message = status === 'APPROVED'
            ? `Your profile change request (${requestId}) has been approved.`
            : `Your profile change request (${requestId}) has been rejected. Reason: ${rejectionReason || 'Not specified'}`;
        await this.createNotification(employeeId, 'N-037', message);
    }

    async syncEmployeeStatusToPayroll(employeeId: string, status: string, employeeName: string): Promise<void> {
        if (status === EmployeeStatus.TERMINATED || status === EmployeeStatus.SUSPENDED) {
            await this.notifyHRUsers('PAYROLL_BLOCK_REQUIRED', `Employee ${employeeName} status changed to ${status}. Payroll processing should be blocked.`);
        }
    }

    async syncPayGradeChange(employeeId: string, employeeName: string, newPayGrade: string): Promise<void> {
        await this.notifyHRUsers('PAY_GRADE_CHANGED', `Employee ${employeeName} pay grade changed to ${newPayGrade}. Payroll configuration update may be required.`);
    }
}

