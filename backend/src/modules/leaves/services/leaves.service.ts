import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { LeaveRequest, LeaveRequestDocument } from '../models/leave-request.schema';
import { LeaveType, LeaveTypeDocument } from '../models/leave-type.schema';

@Injectable()
export class LeavesService {
	constructor(
		@InjectModel(LeaveRequest.name) private readonly leaveRequestModel: Model<LeaveRequestDocument>,
		@InjectModel(LeaveType.name) private readonly leaveTypeModel: Model<LeaveTypeDocument>,
	) {}

	/**
	 * Returns the number of unpaid leave days for the employee within the date range.
	 * Counts only APPROVED leave requests whose LeaveType.paid === false and which overlap the period.
	 */
	async getUnpaidLeaveDays(employeeId: string, startDate: Date, endDate: Date): Promise<number> {
		if (!employeeId) throw new BadRequestException('employeeId required');
		const empOid = typeof employeeId === 'string' ? new Types.ObjectId(employeeId) : employeeId;

		// Find approved leave requests for employee overlapping range
		const requests = await this.leaveRequestModel.find({
			employeeId: empOid,
			status: 'approved',
			$or: [
				{ 'dates.from': { $lte: endDate }, 'dates.to': { $gte: startDate } },
			],
		}).lean().exec();

		if (!requests || requests.length === 0) return 0;

		// For each request, check its leave type to see if unpaid
		let totalUnpaid = 0;
		for (const r of requests) {
			try {
				const lt = await this.leaveTypeModel.findById(r.leaveTypeId).lean().exec();
				if (!lt) continue;
				if (lt.paid === false) {
					// compute overlap days between r.dates and [startDate,endDate]
					const from = r.dates?.from ? new Date(r.dates.from) : null;
					const to = r.dates?.to ? new Date(r.dates.to) : null;
					if (!from || !to) continue;
					const overlapStart = from > startDate ? from : startDate;
					const overlapEnd = to < endDate ? to : endDate;
					if (overlapEnd >= overlapStart) {
						const ms = overlapEnd.getTime() - overlapStart.getTime();
						// inclusive days: add 1 day
						const days = Math.floor(ms / (1000 * 60 * 60 * 24)) + 1;
						totalUnpaid += days;
					}
				}
			} catch (e) {
				continue;
			}
		}

		return totalUnpaid;
	}
}
