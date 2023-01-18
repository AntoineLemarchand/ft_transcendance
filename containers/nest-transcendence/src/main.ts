import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { environment } from './utils/environmentParser';
import * as cookieParser from 'cookie-parser';
import { urlencoded, json } from 'express';
import { MyExceptionFilter } from './exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: ['http://' + environment.SERVER_URL, 'http://localhost'],
      credentials: true,
    },
  });
  app.use(cookieParser());
  app.use(json({ limit: '50mb' }));
  app.useGlobalFilters(new MyExceptionFilter());
  app.use(urlencoded({ extended: true, limit: '50mb' }));
  await app.listen(3000);
}

bootstrap();
