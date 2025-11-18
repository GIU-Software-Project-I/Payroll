import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { attendanceRecord } from '../models/attendanceRecord';

@Injectable()
export class AttendanceRecordService {
    constructor(
        @InjectModel(attendanceRecord.name)
        private readonly attendanceRecordModel: Model<attendanceRecord>
    ) {}

    // CREATE
    async create(createDto: any): Promise<attendanceRecord> {
        const attendanceRecord = new this.attendanceRecordModel(createDto);
        return await attendanceRecord.save();
    }

    // READ - Get all
    async findAll(): Promise<attendanceRecord[]> {
        return await this.attendanceRecordModel.find().exec();
    }

    // READ - Get by ID
    async findById(id: string): Promise<attendanceRecord | null> {
        return await this.attendanceRecordModel.findById(id).exec();
    }

    // READ - Get by Employee
    async findByEmployee(employeeId: string): Promise<attendanceRecord[]> {
        return await this.attendanceRecordModel
            .find({ employeeId: new Types.ObjectId(employeeId) })
            .exec();
    }

    // READ - Get by Date Range
    async findByDateRange(employeeId: string, startDate: Date, endDate: Date): Promise<attendanceRecord[]> {
        return await this.attendanceRecordModel
            .find({
                employeeId: new Types.ObjectId(employeeId),
                date: { $gte: startDate, $lte: endDate }
            })
            .exec();
    }

    // UPDATE
    async update(id: string, updateDto: any): Promise<attendanceRecord | null> {
        return await this.attendanceRecordModel
            .findByIdAndUpdate(id, updateDto, { new: true })
            .exec();
    }

    // UPDATE - Add Punch Record
    async addPunchRecord(id: string, punchRecordId: Types.ObjectId): Promise<attendanceRecord | null> {
        return await this.attendanceRecordModel
            .findByIdAndUpdate(
                id,
                { $push: { punchRecordIds: punchRecordId } },
                { new: true }
            )
            .exec();
    }

    // UPDATE - Update Status
    async updateStatus(id: string, status: string): Promise<attendanceRecord | null> {
        return await this.attendanceRecordModel
            .findByIdAndUpdate(
                id,
                { status },
                { new: true }
            )
            .exec();
    }

    // DELETE
    async delete(id: string): Promise<attendanceRecord | null> {
        return await this.attendanceRecordModel.findByIdAndDelete(id).exec();
    }
}