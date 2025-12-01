import { Injectable } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { AttendanceService } from './AttendanceService';

@Injectable()
export class TimeManagementService {
	// This service acts as a thin public façade for time-management subsystem.
	constructor(private readonly attendanceService: AttendanceService) {}

	/**
	 * Simple delegate: return attendance records for an employee in a given range.
	 * If start/end not provided return last 30 days of records via AttendanceService.getMonthlyAttendance.
	 */
	async findByEmployee(employeeId: string, start?: Date, end?: Date): Promise<any[]> {
		if (start && end) {
			// AttendanceService has getMonthlyAttendance which expects month/year; fall back to direct monthly range
			// For simplicity, request monthly attendance for the month containing `start` through `end` by calling getMonthlyAttendance
			// If range spans multiple months the caller can call this multiple times. Here we simply return attendance within the start/end range.
			const month = start.getMonth() + 1;
			const year = start.getFullYear();
			const recs = await this.attendanceService.getMonthlyAttendance(employeeId, month, year);
			return (recs || []).filter((r: any) => {
				const hasPunch = (r.punches || []).some((p: any) => {
					const t = new Date(p.time);
					return t >= start && t <= end;
				});
				return hasPunch;
			});
		}

		// Default: return payroll-ready attendance for current month
		const now = new Date();
		const month = now.getMonth() + 1;
		const year = now.getFullYear();
		return await this.attendanceService.getMonthlyAttendance(employeeId, month, year);
	}

	/**
	 * Return an attendance summary: daysWorked and attendanceRecords within range.
	 */
	async findAttendanceSummary(employeeId: string, startDate: Date, endDate: Date): Promise<{ daysWorked: number; attendanceRecords: any[] }> {
		// Use AttendanceService.getMonthlyAttendance to fetch records in the month(s) involved
		const recs = await this.attendanceService.getMonthlyAttendance(employeeId, startDate.getMonth() + 1, startDate.getFullYear());
		const records = (recs || []).filter((r: any) => {
			// check if any punch falls within range
			return (r.punches || []).some((p: any) => {
				const t = new Date(p.time);
				return t >= startDate && t <= endDate;
			});
		});
		const daysWorked = records.length;
		return { daysWorked, attendanceRecords: records };
	}
}
