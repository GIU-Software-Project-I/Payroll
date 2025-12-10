import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { BackupService } from './Backup-Service';
import { BackupController } from './Backup-Controller';


@Module({
    imports: [ScheduleModule.forRoot()],
    providers: [BackupService],
    controllers: [BackupController],
    exports: [BackupService],
})
export class BackupModule {}

