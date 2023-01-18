import { DataSource } from 'typeorm';
import { Test } from '@nestjs/testing';
import { AppModule } from './app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './typeorm';
import { Channel } from './channel/channel.entities';
import { GameStat } from './game/game.entities';
import { GameModule } from './game/game.module';

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
  return module.createNestApplication();
}
