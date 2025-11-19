// backend/src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { config } from 'dotenv';

config(); // load .env

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`✅ Nest application is running at http://localhost:${port}`);
  console.log('MONGODB_URI from .env:', process.env.MONGODB_URI ? '✅ Loaded' : '❌ Not loaded');
}

void bootstrap();
