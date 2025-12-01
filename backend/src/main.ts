import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import * as express from 'express';
import { join } from 'path';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';


async function bootstrap() {

    const app = await NestFactory.create(AppModule);

    app.use(cookieParser());

    // Note: `whitelist:true` removes properties that don't have class-validator decorators.
    // Many DTOs in this codebase rely on plain objects, so disable whitelist to avoid
    // unintentionally stripping incoming JSON. Consider adding class-validator
    // decorators to DTOs and re-enabling whitelist for stricter validation.
    app.useGlobalPipes(new ValidationPipe({ whitelist: false, transform: true }));

    app.enableCors({
        origin: ['http://localhost:3999', 'http://localhost:3000', 'http://localhost:5000'],
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    });

    const config = new DocumentBuilder()
        .setTitle('HR System API')
        .setDescription('API documentation — limited to safe public models (no secrets).')
        .setVersion('1.0')
        .addBearerAuth({type: 'http', scheme: 'bearer', bearerFormat: 'JWT', in: 'header',}, 'access-token',).build();

    const document = SwaggerModule.createDocument(app, config, {});

    SwaggerModule.setup('api', app, document);

     const port = Number(process.env.PORT) || 8000;

     await app.listen(port);

    console.log(`Application running on http://localhost:${port}`);

    console.log(`Swagger running on http://localhost:${port}/api`);
}
bootstrap()


