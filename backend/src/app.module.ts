// backend/src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongoDBModule } from './database/mongodb.module';
import { PayrollConfigModule } from './modules/payroll-config/payroll-config.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongoDBModule,
    PayrollConfigModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
