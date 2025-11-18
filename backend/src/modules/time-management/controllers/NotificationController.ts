import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';

import { Notification } from '../models/Notifications';
import {NotificationService} from "../services/NotificationService";

@Controller('notifications')
export class NotificationController {
    constructor(private readonly notificationService: NotificationService) {}

    @Get()
    async getAll() {
        return this.notificationService.findAll();
    }

    @Get(':id')
    async getOne(@Param('id') id: string) {
        return this.notificationService.findOne(id);
    }

    @Post()
    async create(@Body() notification: Partial<Notification>) {
        return this.notificationService.create(notification);
    }

    @Put(':id')
    async update(@Param('id') id: string, @Body() updateData: Partial<Notification>) {
        return this.notificationService.update(id, updateData);
    }

    @Delete(':id')
    async remove(@Param('id') id: string) {
        const deleted = await this.notificationService.delete(id);
        return { deleted };
    }
}
