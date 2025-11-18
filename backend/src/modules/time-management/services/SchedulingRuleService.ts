import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SchedulingRule } from '../models/schedulingRules';

@Injectable()
export class SchedulingRuleService {
    constructor(
        @InjectModel(SchedulingRule.name) private readonly schedulingRuleModel: Model<SchedulingRule>
    ) {}

    async create(ruleData: any) {
        const rule = new this.schedulingRuleModel(ruleData);
        return await rule.save();
    }

    async findAll() {
        return await this.schedulingRuleModel.find().exec();
    }

    async findOne(id: string) {
        return await this.schedulingRuleModel.findById(id).exec();
    }

    async update(id: string, ruleData: any) {
        return await this.schedulingRuleModel.findByIdAndUpdate(id, ruleData, { new: true }).exec();
    }

    async delete(id: string) {
        return await this.schedulingRuleModel.findByIdAndDelete(id).exec();
    }
}