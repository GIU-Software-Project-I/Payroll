// backend/src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { config } from 'dotenv';
import { ValidationPipe } from '@nestjs/common';

// Load .env manually for debugging
config();
console.log('MONGODB_URI from .env:', process.env.MONGODB_URI ? '✅ Loaded' : '❌ Not loaded');

async function listenWithFallback(app: any, preferredPort?: number) {
  const explicitPort = Number.isFinite(Number(process.env.PORT)) ? Number(process.env.PORT) : undefined;

  // If an explicit PORT is set, try it first; if busy (EADDRINUSE), fall back to the next available ports
  if (explicitPort !== undefined) {
    try {
      await app.listen(explicitPort);
      return explicitPort;
    } catch (err: any) {
      if (err?.code !== 'EADDRINUSE') throw err;
      // Try subsequent ports if the explicit one is busy
      const start = explicitPort + 1;
      const maxAttempts = 10; // try up to explicitPort + 10
      for (let i = 0; i < maxAttempts; i++) {
        const port = start + i;
        try {
          await app.listen(port);
          return port;
        } catch (e: any) {
          if (e?.code === 'EADDRINUSE') {
            if (i === maxAttempts - 1) throw e; // rethrow after last attempt
            continue; // try next port
          }
          throw e; // unknown error
        }
      }
    }
  }

  // Otherwise, attempt preferred (default 3000) and then try next few ports
  const start = preferredPort && Number.isFinite(preferredPort) ? preferredPort : 3000;
  const maxAttempts = 10; // try up to 3009
  for (let i = 0; i < maxAttempts; i++) {
    const port = start + i;
    try {
      await app.listen(port);
      return port;
    } catch (err: any) {
      if (err?.code === 'EADDRINUSE') {
        if (i === maxAttempts - 1) throw err; // rethrow after last attempt
        continue; // try next port
      }
      throw err; // unknown error
    }
  }
  // Should never reach here
  throw new Error('Unable to bind to any port');
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));

  const chosenPort = await listenWithFallback(app, 3000);
  console.log(`🚀 Server listening on http://localhost:${chosenPort}`);
}
void bootstrap();
