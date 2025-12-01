// src/time-management/holiday/holiday.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Holiday, HolidayDocument } from '../models/holiday.schema';

/**
 * HolidayService
 * - small helper service to query the Holiday collection
 * - provides isHoliday(date) and getHolidayForDate(date)
 */
@Injectable()
export class HolidayService {
    private readonly logger = new Logger(HolidayService.name);

    constructor(@InjectModel(Holiday.name) private readonly holidayModel: Model<HolidayDocument>) {}

    /**
     * Returns the Holiday document covering `date`, or null if none.
     * A Holiday with no endDate is a single-day holiday.
     */
    async getHolidayForDate(date: Date) {
        const start = new Date(date);
        start.setHours(0,0,0,0);
        const end = new Date(date);
        end.setHours(23,59,59,999);

        try {
            const holiday = await this.holidayModel.findOne({
                active: true,
                startDate: { $lte: end },
                $or: [
                    { endDate: { $exists: false } },
                    { endDate: { $gte: start } }
                ]
            });

            return holiday || null;
        } catch (e) {
            this.logger.error('getHolidayForDate failed', e);
            return null;
        }
    }

    /**
     * Boolean helper
     */
    async isHoliday(date: Date): Promise<boolean> {
        const h = await this.getHolidayForDate(date);
        return !!h;
    }
}
