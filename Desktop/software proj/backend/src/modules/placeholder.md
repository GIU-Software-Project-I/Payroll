### Here every subsystem in the Payroll wil create a folder named for example 
 - payroll-config/ 
 - payroll-processing/ 
 - payroll-tracking

you create your modules then import them in the app.module.ts in the imports [    ]
 ```ts // backend/src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongoDBModule } from './database/mongodb.module';
import { PayrollConfigModule } from './modules/payroll-config/payroll-config.module';
import { PayrollProcessingModule } from './modules/payroll-processing/payroll-processing.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongoDBModule,
    PayrollConfigModule,
    PayrollProcessingModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {} ```
