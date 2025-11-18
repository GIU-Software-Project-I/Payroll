import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { punchRecord } from '../models/punchRecord';

@Injectable()
export class PunchRecordService {
    constructor(
        @InjectModel(punchRecord.name) private readonly punchRecordModel: Model<punchRecord>
    ) {}

    async create(punchData: any) {
        const punch = new this.punchRecordModel(punchData);
        return await punch.save();
    }

    async findAll() {
        return await this.punchRecordModel.find().exec();
    }

    async findOne(id: string) {
        return await this.punchRecordModel.findById(id).exec();
    }

    async findByEmployee(employeeId: string) {
        return await this.punchRecordModel.find({ employeeId }).exec();
    }

    async update(id: string, punchData: any) {
        return await this.punchRecordModel.findByIdAndUpdate(id, punchData, { new: true }).exec();
    }

    async delete(id: string) {
        return await this.punchRecordModel.findByIdAndDelete(id).exec();
    }
}