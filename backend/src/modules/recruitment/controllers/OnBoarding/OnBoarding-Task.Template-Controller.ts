import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import {OnboardingTaskTemplateService} from "../../services/OnBoarding/OnBoarding-Task-Template.Service";


@Controller('onboarding-task-templates')
export class OnboardingTaskTemplateController {
    constructor(private readonly onboardingTaskTemplateService: OnboardingTaskTemplateService) {}

    @Post()
    create(@Body() createDto: any) {
        return this.onboardingTaskTemplateService.create(createDto);
    }

    @Get()
    findAll() {
        return this.onboardingTaskTemplateService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.onboardingTaskTemplateService.findOne(id);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() updateDto: any) {
        return this.onboardingTaskTemplateService.update(id, updateDto);
    }

    @Delete(':id')
    delete(@Param('id') id: string) {
        return this.onboardingTaskTemplateService.delete(id);
    }
}
