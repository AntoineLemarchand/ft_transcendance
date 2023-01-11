import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { environment } from './utils/environmentParser'
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: ['http://' + environment.SERVER_URL, 'http://localhost'],
      credentials: true,
    },
  });
  app.use(cookieParser());
  await app.listen(3000);
}

bootstrap();
