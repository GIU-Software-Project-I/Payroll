import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import {OnBoardingService} from "../../services/OnBoarding/OnBoarding-Service";


@Controller('onboardings')
export class OnBoardingController {
    constructor(private readonly onBoardingService: OnBoardingService) {}

    @Post()
    create(@Body() createDto: any) {
        return this.onBoardingService.create(createDto);
    }

    @Get()
    findAll() {
        return this.onBoardingService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.onBoardingService.findOne(id);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() updateDto: any) {
        return this.onBoardingService.update(id, updateDto);
    }

    @Delete(':id')
    delete(@Param('id') id: string) {
        return this.onBoardingService.delete(id);
    }
}
