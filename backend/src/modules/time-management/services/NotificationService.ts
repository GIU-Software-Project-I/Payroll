import { Injectable } from '@nestjs/common';
import { Notification } from '../models/Notifications';

@Injectable()
export class NotificationService {
    // Dummy in-memory notifications
    private notifications: Partial<Notification>[] = [
        {
            id: 'notif001',
            recipientId: 'emp001',
            senderId: 'system',
            message: 'Your shift has been updated.',
            relatedEntityId: 'shift001',
            status: 'Unread',
            createdAt: new Date(),
            auditTrail: [],
        },
        {
            id: 'notif002',
            recipientId: 'emp002',
            senderId: 'manager001',
            message: 'Overtime request approved.',
            relatedEntityId: 'shift002',
            status: 'Read',
            createdAt: new Date(),
            auditTrail: [],
        },
        {
            id: 'notif003',
            recipientId: 'emp003',
            senderId: 'system',
            message: 'Weekly rest day reminder.',
            relatedEntityId: 'shift003',
            status: 'Archived',
            createdAt: new Date(),
            auditTrail: [],
        },
    ];

    async create(notification: Partial<Notification>): Promise<Partial<Notification>> {
        this.notifications.push(notification);
        return notification;
    }

    async findAll(): Promise<Partial<Notification>[]> {
        return this.notifications;
    }

    async findOne(id: string): Promise<Partial<Notification> | undefined> {
        return this.notifications.find(n => n.id === id);
    }

    async update(id: string, updateData: Partial<Notification>): Promise<Partial<Notification> | undefined> {
        const idx = this.notifications.findIndex(n => n.id === id);
        if (idx > -1) {
            this.notifications[idx] = { ...this.notifications[idx], ...updateData };
            return this.notifications[idx];
        }
        return undefined;
    }

    async delete(id: string): Promise<boolean> {
        const idx = this.notifications.findIndex(n => n.id === id);
        if (idx > -1) {
            this.notifications.splice(idx, 1);
            return true;
        }
        return false;
    }
}
