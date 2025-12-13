import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, Connection } from 'mongoose';
import { InjectConnection } from '@nestjs/mongoose';
import { NotificationLog, NotificationLogDocument } from '../models/notification-log.schema';
import { ShiftAssignment, ShiftAssignmentDocument } from '../models/shift-assignment.schema';
@Injectable()
export class NotificationService {
    private readonly logger = new Logger(NotificationService.name);

    constructor(
        @InjectModel(NotificationLog.name) private readonly notificationModel: Model<NotificationLogDocument>,
        @InjectModel(ShiftAssignment.name) private readonly shiftAssignmentModel: Model<ShiftAssignmentDocument>,
        @InjectConnection() private readonly connection: Connection,
    ) {}

    /**
     * Get all notifications for a specific user
     */
    async getNotificationsByUser(userId: string) {
        try {
            const notifications = await this.notificationModel
                .find({ to: new Types.ObjectId(userId) })
                .sort({ createdAt: -1 })
                .lean();

            return notifications;
        } catch (error) {
            this.logger.error('Failed to fetch notifications', error);
            throw error;
        }
    }

    /**
     * Get all notifications (for admin/HR)
     */
    async getAllNotifications(filter?: any) {
        try {
            const query = filter || {};
            const notifications = await this.notificationModel
                .find(query)
                .sort({ createdAt: -1 })
                .lean();

            return notifications;
        } catch (error) {
            this.logger.error('Failed to fetch all notifications', error);
            throw error;
        }
    }

    /**
     * Get notifications by type
     */
    async getNotificationsByType(type: string) {
        try {
            const notifications = await this.notificationModel
                .find({ type })
                .sort({ createdAt: -1 })
                .lean();

            return notifications;
        } catch (error) {
            this.logger.error('Failed to fetch notifications by type', error);
            throw error;
        }
    }

    /**
     * Manually trigger shift expiry check (for testing)
     * This method can be called from an endpoint to test the notification system
     * Automatically finds HR users - no HR_USER_ID required!
     */
    async triggerShiftExpiryCheck(days: number = 7) {
        try {
            const now = new Date();
            const threshold = new Date();
            threshold.setDate(now.getDate() + days);
            threshold.setHours(23, 59, 59, 999);

            // Find assignments expiring within the specified days
            const assignments = await this.shiftAssignmentModel.find({
                endDate: { $exists: true, $lte: threshold, $gte: now },
                status: { $in: ['PENDING', 'APPROVED'] },
            }).lean();

            if (!assignments?.length) {
                return {
                    message: `No expiring assignments in next ${days} days`,
                    count: 0,
                    assignments: [],
                    hrUsers: []
                };
            }

            // Automatically find HR users
            const hrUsers = await this.findHRUsers();
            const notificationsCreated: any[] = [];

            for (const a of assignments) {
                const msg = `Shift assignment ${a._id} for employee ${a.employeeId} expires on ${a.endDate?.toISOString().slice(0,10)}. Please review for renewal or reassignment.`;

                // Notify all HR users
                for (const hrUser of hrUsers) {
                    const hrNotification = await this.notificationModel.create({
                        to: hrUser.employeeProfileId,
                        type: 'SHIFT_EXPIRY',
                        message: msg,
                    } as any);
                    notificationsCreated.push(hrNotification);
                }

                // Notify employee
                if (a.employeeId) {
                    try {
                        const empNotification = await this.notificationModel.create({
                            to: a.employeeId,
                            type: 'SHIFT_EXPIRY_EMPLOYEE',
                            message: `Your shift assignment expires on ${a.endDate?.toISOString().slice(0,10)}. Please contact HR if renewal is needed.`,
                        } as any);
                        notificationsCreated.push(empNotification);
                    } catch (e) {
                        this.logger.warn('Failed to create notification for employee', e);
                    }
                }
            }

            return {
                message: hrUsers.length > 0
                    ? `Created ${notificationsCreated.length} notifications for ${assignments.length} expiring assignments (notified ${hrUsers.length} HR users)`
                    : `Created ${notificationsCreated.length} notifications for ${assignments.length} expiring assignments (no HR users found, only employees notified)`,
                count: notificationsCreated.length,
                hrUsersFound: hrUsers.length,
                hrUsers: hrUsers.map(u => ({ email: u.workEmail, roles: u.roles })),
                assignments: assignments.map(a => ({
                    assignmentId: a._id,
                    employeeId: a.employeeId,
                    endDate: a.endDate,
                    status: a.status
                })),
                notifications: notificationsCreated
            };
        } catch (error) {
            this.logger.error('Failed to trigger shift expiry check', error);
            throw error;
        }
    }


    private async findHRUsers(): Promise<any[]> {
        try {
            if (!this.connection.db) {
                this.logger.warn('Database connection not available');
                return [];
            }

            const HR_ROLE = 'HR Admin';

            // --- 1) Try: employees have roles embedded in employee_profiles (fast path) ---
            // If your employee_profiles documents have a `roles` array, search there first.
            const directQuery = await this.connection.db
                .collection('employee_profiles')
                .findOne({}); // probe one document to see if `roles` exists

            if (directQuery && Object.prototype.hasOwnProperty.call(directQuery, 'roles')) {
                const directHr = await this.connection.db
                    .collection('employee_profiles')
                    .find({
                        roles: { $in: [HR_ROLE] },         // match role inside employee_profiles.roles
                        // status: 'ACTIVE',                  // ensure active employees only
                    })
                    .project({ _id: 1, workEmail: 1, roles: 1, status: 1 })
                    .toArray();

                return directHr.map(e => ({
                    employeeProfileId: e._id,
                    roles: e.roles,
                    workEmail: e.workEmail,
                    isActive: e.status === 'ACTIVE',
                }));
            }

            // --- 2) Fallback: roles stored in employee_system_roles collection (existing setup) ---
            const hrRoles = await this.connection.db
                .collection('employee_system_roles')
                .find({
                    roles: { $in: [HR_ROLE] },
                    isActive: true,
                })
                .toArray();

            if (!hrRoles?.length) return [];

            // Build list of employeeProfileIds (unique)
            const employeeIds = Array.from(new Set(hrRoles.map((r: any) => String(r.employeeProfileId))))
                .map(id => new Types.ObjectId(id));

            // Fetch matching employee profiles
            const employees = await this.connection.db
                .collection('employee_profiles')
                .find({ _id: { $in: employeeIds }, status: 'ACTIVE' })
                .project({ _id: 1, workEmail: 1, status: 1 })
                .toArray();

            // Join and return only active employees
            const results = hrRoles
                .map((role: any) => {
                    const emp = employees.find(e => String(e._id) === String(role.employeeProfileId));
                    if (!emp) return null;
                    return {
                        employeeProfileId: role.employeeProfileId,
                        roles: role.roles,
                        workEmail: emp.workEmail,
                        isActive: emp.status === 'ACTIVE',
                    };
                })
                .filter(Boolean);

            return results;
        } catch (error) {
            this.logger.error('Failed to find HR users', error);
            return [];
        }
    }

    /**
     * Delete a notification
     */
    async deleteNotification(id: string) {
        try {
            const result = await this.notificationModel.findByIdAndDelete(id);
            return result;
        } catch (error) {
            this.logger.error('Failed to delete notification', error);
            throw error;
        }
    }

    /**
     * Clear all notifications for a user
     */
    async clearUserNotifications(userId: string): Promise<any> {
        try {
            const result = await this.notificationModel.deleteMany({
                to: new Types.ObjectId(userId)
            });
            return result;
        } catch (error) {
            this.logger.error('Failed to clear user notifications', error);
            throw error;
        }
    }

    /**
     * Get all HR/Admin users in the system
     * This is informational only - the system automatically finds and notifies HR users
     */
    async getHRUsers() {
        try {
            if (!this.connection.db) {
                return {
                    message: 'Database connection not available',
                    users: [],
                    note: 'Unable to query HR users at this time.'
                };
            }

            // Query for users with HR/Admin roles
            const hrRoles = await this.connection.db.collection('employeesystemroles').find({
                roles: { $in: ['HR Manager', 'System Admin', 'HR Admin'] },
                isActive: true
            }).toArray();

            if (!hrRoles || hrRoles.length === 0) {
                return {
                    message: 'No HR/Admin users found in the system',
                    users: [],
                    note: 'Notifications will only be sent to employees. Create HR users with HR Manager, HR Admin, or System Admin roles to receive notifications automatically.'
                };
            }

            // Get employee details
            const employeeIds = hrRoles.map((r: any) => r.employeeProfileId);
            const employees = await this.connection.db.collection('employeeprofiles').find({
                _id: { $in: employeeIds }
            }).toArray();

            // Combine the data
            const hrUsers = hrRoles.map((role: any) => {
                const emp: any = employees.find((e: any) => e._id.equals(role.employeeProfileId));
                return {
                    employeeId: role.employeeProfileId.toString(),
                    roles: role.roles,
                    firstName: emp?.firstName,
                    lastName: emp?.lastName,
                    workEmail: emp?.workEmail,
                    isActive: emp?.isActive
                };
            });

            return {
                message: `Found ${hrUsers.length} HR/Admin user(s)`,
                users: hrUsers,
                note: 'These users will automatically receive shift expiry notifications. No configuration required!'
            };
        } catch (error) {
            this.logger.error('Failed to fetch HR users', error);
            throw error;
        }
    }

    async findUsersByRole(roleName: string): Promise<any[]> {
        try {
            if (!this.connection.db) {
                this.logger.warn('Database connection not available');
                return [];
            }

            const ROLE = roleName;

            // Probe employee_profiles to see if roles are present
            const probe = await this.connection.db.collection('employee_profiles').findOne({});
            if (probe && Object.prototype.hasOwnProperty.call(probe, 'roles')) {
                const users = await this.connection.db
                    .collection('employee_profiles')
                    .find({ roles: { $in: [ROLE] }, status: 'ACTIVE' })
                    .project({ _id: 1, workEmail: 1, roles: 1 })
                    .toArray();

                return users.map(u => ({ employeeProfileId: u._id, workEmail: u.workEmail, roles: u.roles }));
            }

            // Fallback to employee_system_roles collection
            const roles = await this.connection.db
                .collection('employee_system_roles')
                .find({ roles: { $in: [ROLE] }, isActive: true })
                .toArray();

            if (!roles?.length) return [];

            const employeeIds = Array.from(new Set(roles.map((r: any) => String(r.employeeProfileId)))).map(id => new Types.ObjectId(id));

            const employees = await this.connection.db
                .collection('employee_profiles')
                .find({ _id: { $in: employeeIds }, status: 'ACTIVE' })
                .project({ _id: 1, workEmail: 1, status: 1 })
                .toArray();

            const results = roles
                .map((role: any) => {
                    const emp = employees.find(e => String(e._id) === String(role.employeeProfileId));
                    if (!emp) return null;
                    return { employeeProfileId: role.employeeProfileId, roles: role.roles, workEmail: emp.workEmail };
                })
                .filter(Boolean);

            return results;
        } catch (error) {
            this.logger.error('findUsersByRole failed', error);
            return [];
        }
    }
}