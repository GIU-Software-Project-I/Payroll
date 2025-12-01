import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { BackupService } from './Backup-Service';
import { BackupController } from './Backup-Controller';

// Note: Removed dependencies on missing modules for standalone operation
// When integrating with main system, add back:
// - CronBackupService from '../Scheduler/Backup-Cron'
// - AuditLogModule from '../../Audit-Log/Module/Audit-Log.Module'
// - AuthModule from '../../Authentication/Module/Authentication-Module'

@Module({
    imports: [ScheduleModule.forRoot()],
    providers: [BackupService],
    controllers: [BackupController],
    exports: [BackupService],
})
export class BackupModule {}

