// backend/src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { config } from 'dotenv';

// Load .env manually for debugging
config();
console.log('MONGODB_URI from .env:', process.env.MONGODB_URI ? '✅ Loaded' : '❌ Not loaded');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}
void bootstrap();
