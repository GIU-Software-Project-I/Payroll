// backend/src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongoDBModule } from './database/mongodb.module';
import { PayrollWorkflowModule } from './payroll-workflow/payroll-workflow.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongoDBModule,
    PayrollWorkflowModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
