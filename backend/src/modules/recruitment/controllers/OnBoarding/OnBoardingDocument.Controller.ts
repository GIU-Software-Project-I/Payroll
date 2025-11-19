import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import {OnBoardingDocumentService} from "../../services/OnBoarding/OnBoarding-Document-Service";


@Controller('onboarding-documents')
export class OnBoardingDocumentController {
    constructor(private readonly onBoardingDocumentService: OnBoardingDocumentService) {}

    @Post()
    create(@Body() createDto: any) {
        return this.onBoardingDocumentService.create(createDto);
    }

    @Get()
    findAll() {
        return this.onBoardingDocumentService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.onBoardingDocumentService.findOne(id);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() updateDto: any) {
        return this.onBoardingDocumentService.update(id, updateDto);
    }

    @Delete(':id')
    delete(@Param('id') id: string) {
        return this.onBoardingDocumentService.delete(id);
    }
}
