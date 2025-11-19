import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongoDBModule } from './database/mongodb.module';
import { PayrollTrackingModule } from './modules/payroll-tracking/payroll-tracking.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongoDBModule,
    PayrollTrackingModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
