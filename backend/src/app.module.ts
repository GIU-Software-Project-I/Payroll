// backend/src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongoDBModule } from './database/mongodb.module';
import { PayrollProcessingModule } from './modules/payroll.processing/payroll.processing.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongoDBModule,
    PayrollProcessingModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
