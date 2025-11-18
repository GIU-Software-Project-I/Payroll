import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { HolidayCalendar } from '../models/HolidayCalendar';

@Injectable()
export class HolidayCalendarService {
    constructor(
        @InjectModel(HolidayCalendar.name) private readonly holidayModel: Model<HolidayCalendar>
    ) {}

    async create(holidayData: any) {
        const holiday = new this.holidayModel(holidayData);
        return await holiday.save();
    }

    async findAll() {
        return await this.holidayModel.find().exec();
    }

    async findOne(id: string) {
        return await this.holidayModel.findById(id).exec();
    }

    async update(id: string, holidayData: any) {
        return await this.holidayModel.findByIdAndUpdate(id, holidayData, { new: true }).exec();
    }

    async delete(id: string) {
        return await this.holidayModel.findByIdAndDelete(id).exec();
    }
}