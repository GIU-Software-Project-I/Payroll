import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LatenessPolicy } from '../models/LatenessPolicy';

@Injectable()
export class LatenessPolicyService {
    constructor(
        @InjectModel(LatenessPolicy.name) private readonly latenessPolicyModel: Model<LatenessPolicy>
    ) {}

    async create(policyData: any) {
        const policy = new this.latenessPolicyModel(policyData);
        return await policy.save();
    }

    async findAll() {
        return await this.latenessPolicyModel.find().exec();
    }

    async findOne(id: string) {
        return await this.latenessPolicyModel.findById(id).exec();
    }

    async update(id: string, policyData: any) {
        return await this.latenessPolicyModel.findByIdAndUpdate(id, policyData, { new: true }).exec();
    }

    async delete(id: string) {
        return await this.latenessPolicyModel.findByIdAndDelete(id).exec();
    }
}