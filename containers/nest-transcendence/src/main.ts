import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { urlencoded, json } from 'express';
import { MyExceptionFilter } from './exceptions.filter';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: ['http://' + process.env.SERVER_URL],
    credentials: true,
  });
  app.use(cookieParser());
  app.use(json({ limit: '50mb' }));
  app.useGlobalFilters(new MyExceptionFilter());
  app.useGlobalPipes(new ValidationPipe());
  app.use(urlencoded({ extended: true, limit: '50mb' }));
  await app.listen(3000);
}

bootstrap();
