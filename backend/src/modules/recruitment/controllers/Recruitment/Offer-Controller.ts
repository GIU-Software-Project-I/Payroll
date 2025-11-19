import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import {OfferService} from "../../services/Recruitment/Offer-Service";


@Controller('offers')
export class OfferController {
    constructor(private readonly offerService: OfferService) {}

    @Post()
    create(@Body() createDto: any) {
        return this.offerService.create(createDto);
    }

    @Get()
    findAll() {
        return this.offerService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.offerService.findOne(id);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() updateDto: any) {
        return this.offerService.update(id, updateDto);
    }

    @Delete(':id')
    delete(@Param('id') id: string) {
        return this.offerService.delete(id);
    }
}
