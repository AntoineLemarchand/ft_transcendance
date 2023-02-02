import { DataSource } from 'typeorm';
import { Test } from '@nestjs/testing';
import { AppModule } from './app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './typeorm';
import { Channel } from './channel/channel.entities';
import { MyExceptionFilter } from './exceptions.filter';
import { GameStat } from './game/game.entities';
import { ValidationPipe } from "@nestjs/common";

export async function createTestModule(dataSource: DataSource) {
  const module = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(getRepositoryToken(User))
    .useValue(dataSource.getRepository(User))
    .overrideProvider(getRepositoryToken(GameStat))
    .useValue(dataSource.getRepository(GameStat))
    .overrideProvider(getRepositoryToken(Channel))
    .useValue(dataSource.getRepository(Channel))
    .compile();
  const app = module.createNestApplication();
  app.useGlobalFilters(new MyExceptionFilter());
  app.useGlobalPipes(new ValidationPipe());
  return app;
}
