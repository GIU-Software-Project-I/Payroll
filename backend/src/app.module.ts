import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongoDBModule } from './database/mongodb.module';

import { PayrollConfigurationModule } from './modules/payroll-configuration/payroll-configuration.module';
import { PayrollExecutionModule } from './modules/payroll-execution/payroll-execution.module';
import { PayrollTrackingModule } from './modules/payroll-tracking/payroll-tracking.module';



@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongoDBModule,
    PayrollConfigurationModule,
    PayrollExecutionModule,
    PayrollTrackingModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
