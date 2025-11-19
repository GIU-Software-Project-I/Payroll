import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import {ResourceReservationService} from "../../services/OnBoarding/Resource-Reservation.Service";


@Controller('resource-reservations')
export class ResourceReservationController {
    constructor(private readonly resourceReservationService: ResourceReservationService) {}

    @Post()
    create(@Body() createDto: any) {
        return this.resourceReservationService.create(createDto);
    }

    @Get()
    findAll() {
        return this.resourceReservationService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.resourceReservationService.findOne(id);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() updateDto: any) {
        return this.resourceReservationService.update(id, updateDto);
    }

    @Delete(':id')
    delete(@Param('id') id: string) {
        return this.resourceReservationService.delete(id);
    }
}
