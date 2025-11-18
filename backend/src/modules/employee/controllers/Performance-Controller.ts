import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { PerformanceService } from '../services/Performance-Service';

@Controller('performance')
export class PerformanceController {
    constructor(private readonly performanceService: PerformanceService) {}

    @Get('appraisals')
    getAllAppraisals() {
        return this.performanceService.getAllAppraisals();
    }

    @Get('appraisals/:id')
    getAppraisalById(@Param('id') id: string) {
        return this.performanceService.getAppraisalById(id);
    }

    @Post('appraisals')
    createAppraisal(@Body() data: any) {
        return this.performanceService.createAppraisal(data);
    }

    @Put('appraisals/:id')
    updateAppraisal(@Param('id') id: string, @Body() data: any) {
        return this.performanceService.updateAppraisal(id, data);
    }

    @Delete('appraisals/:id')
    deleteAppraisal(@Param('id') id: string) {
        return this.performanceService.deleteAppraisal(id);
    }

    @Get('cycles')
    getAllAppraisalCycles() {
        return this.performanceService.getAllAppraisalCycles();
    }

    @Get('cycles/:id')
    getAppraisalCycleById(@Param('id') id: string) {
        return this.performanceService.getAppraisalCycleById(id);
    }

    @Post('cycles')
    createAppraisalCycle(@Body() data: any) {
        return this.performanceService.createAppraisalCycle(data);
    }

    @Put('cycles/:id')
    updateAppraisalCycle(@Param('id') id: string, @Body() data: any) {
        return this.performanceService.updateAppraisalCycle(id, data);
    }

    @Delete('cycles/:id')
    deleteAppraisalCycle(@Param('id') id: string) {
        return this.performanceService.deleteAppraisalCycle(id);
    }
}
