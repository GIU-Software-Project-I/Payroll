// eslint-disable-next-line @typescript-eslint/no-unused-vars
// src/time-management/holiday/holiday.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Holiday, HolidayDocument } from '../models/holiday.schema';
import { HolidayType } from '../models/enums';

/**
 * HolidayService
 * - small helper service to query the Holiday collection
 * - provides isHoliday(date) and getHolidayForDate(date)
 *
 * Behavior notes:
 * - NATIONAL and ORGANIZATIONAL holidays are matched by date range (startDate..endDate)
 * - WEEKLY_REST entries are treated as recurring weekly days. To define a weekly rest day,
 *   create a Holiday with type=WEEKLY_REST and set `startDate` to any date whose weekday
 *   corresponds to the weekly rest day (e.g. a Sunday). Optionally set `startDate` <= date
 *   and `endDate` to limit the active range; otherwise the weekly rest is considered active
 *   from `startDate` forward.
 */
@Injectable()
export class HolidayService {
    private readonly logger = new Logger(HolidayService.name);

    constructor(@InjectModel(Holiday.name) private readonly holidayModel: Model<HolidayDocument>) {}

    /**
     * Returns the Holiday document covering `date`, or null if none.
     * A Holiday with no endDate is a single-day holiday.
     * Also handles WEEKLY_REST entries by weekday matching.
     */
    async getHolidayForDate(date: Date) {
        const start = new Date(date);
        start.setHours(0,0,0,0);
        const end = new Date(date);
        end.setHours(23,59,59,999);

        try {
            // First, try to find NATIONAL or ORGANIZATIONAL holidays that cover the date
            const direct = await this.holidayModel.findOne({
                active: true,
                type: { $in: [HolidayType.NATIONAL, HolidayType.ORGANIZATIONAL] },
                startDate: { $lte: end },
                $or: [
                    { endDate: { $exists: false } },
                    { endDate: { $gte: start } }
                ]
            }).lean();

            if (direct) return direct;

            // Next, check for WEEKLY_REST entries (treated as recurring weekly by weekday)
            const weeklyRows = await this.holidayModel.find({ active: true, type: HolidayType.WEEKLY_REST }).lean();
            if (weeklyRows && weeklyRows.length) {
                const targetWeekday = date.getDay(); // 0 (Sun) - 6 (Sat)
                for (const w of weeklyRows) {
                    if (!w.startDate) continue;
                    const startWeekday = new Date(w.startDate).getDay();

                    // Only consider entries that match the weekday
                    if (startWeekday !== targetWeekday) continue;

                    // If row has startDate/endDate constraints, ensure date falls within them
                    const rowStart = new Date(w.startDate);
                    rowStart.setHours(0,0,0,0);

                    if (w.endDate) {
                        const rowEnd = new Date(w.endDate);
                        rowEnd.setHours(23,59,59,999);
                        if (date >= rowStart && date <= rowEnd) return w;
                    } else {
                        // No endDate -> active from startDate forward
                        if (date >= rowStart) return w;
                    }
                }
            }

            return null;
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

    // --- CRUD helpers for controller usage (no schema changes) ---
    async listAll(): Promise<HolidayDocument[]> {
        return await this.holidayModel.find({}).sort({ startDate: 1 }).lean();
    }

    async getById(id: string): Promise<HolidayDocument | null> {
        return await this.holidayModel.findById(id).lean();
    }

    async createHoliday(payload: Partial<Holiday>): Promise<HolidayDocument> {
        const doc = await this.holidayModel.create(payload as any);
        return doc.toObject() as HolidayDocument;
    }

    async updateHoliday(id: string, payload: Partial<Holiday>): Promise<HolidayDocument | null> {
        return await this.holidayModel.findByIdAndUpdate(id, payload as any, { new: true }).lean();
    }

    async deleteHoliday(id: string): Promise<boolean> {
        const res = await this.holidayModel.findByIdAndDelete(id).lean();
        return !!res;
    }
}
