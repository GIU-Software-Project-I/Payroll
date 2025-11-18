import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { OvertimePolicy } from '../models/OvertimePolicy';

@Injectable()
export class OvertimePolicyService {
    constructor(
        @InjectModel(OvertimePolicy.name) private readonly overtimePolicyModel: Model<OvertimePolicy>
    ) {}

    async create(policyData: any) {
        const policy = new this.overtimePolicyModel(policyData);
        return await policy.save();
    }

    async findAll() {
        return await this.overtimePolicyModel.find().exec();
    }

    async findOne(id: string) {
        return await this.overtimePolicyModel.findById(id).exec();
    }

    async update(id: string, policyData: any) {
        return await this.overtimePolicyModel.findByIdAndUpdate(id, policyData, { new: true }).exec();
    }

    async delete(id: string) {
        return await this.overtimePolicyModel.findByIdAndDelete(id).exec();
    }
}