import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {AttendanceCorrectionRequest} from "../models/attendanceCorrectionRequest";


@Injectable()
export class AttendanceCorrectionRequestService {
    constructor(
        @InjectModel(AttendanceCorrectionRequest.name)
        private readonly correctionRequestModel: Model<AttendanceCorrectionRequest>
    ) {}

    // CREATE
    async create(createDto: any): Promise<AttendanceCorrectionRequest> {
        const correctionRequest = new this.correctionRequestModel(createDto);
        return await correctionRequest.save();
    }

    // READ - Get all
    async findAll(): Promise<AttendanceCorrectionRequest[]> {
        return await this.correctionRequestModel.find().exec();
    }

    // READ - Get by ID
    async findById(id: string): Promise<AttendanceCorrectionRequest | null> {
        return await this.correctionRequestModel.findById(id).exec();
    }

    // READ - Get by Employee
    async findByEmployee(employeeId: string): Promise<AttendanceCorrectionRequest[]> {
        return await this.correctionRequestModel
            .find({ employeeId: new Types.ObjectId(employeeId) })
            .exec();
    }

    // UPDATE - Approve
    async approve(id: string, reviewedBy: Types.ObjectId): Promise<AttendanceCorrectionRequest | null> {
        return await this.correctionRequestModel
            .findByIdAndUpdate(
                id,
                {
                    status: 'Approved',
                    reviewedBy
                },
                { new: true }
            )
            .exec();
    }

    // UPDATE - Reject
    async reject(id: string, reviewedBy: Types.ObjectId, rejectionReason: string): Promise<AttendanceCorrectionRequest | null> {
        return await this.correctionRequestModel
            .findByIdAndUpdate(
                id,
                {
                    status: 'Rejected',
                    reviewedBy
                },
                { new: true }
            )
            .exec();
    }

    // DELETE
    async delete(id: string): Promise<AttendanceCorrectionRequest | null> {
        return await this.correctionRequestModel.findByIdAndDelete(id).exec();
    }
}