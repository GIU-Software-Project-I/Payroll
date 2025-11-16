import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [MongooseModule.forRoot(process.env.MONGODB_URI as string)],
  exports: [MongooseModule],
})
export class MongoDBModule {}
