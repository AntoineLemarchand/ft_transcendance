import { Test } from '@nestjs/testing';
import { GameService } from './game.service';
import { UserService } from '../user/user.service';
import { DataSource } from 'typeorm';
import { setupDataSource, TestDatabase } from '../test.databaseFake.utils';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../user/user.entities';
import { Channel } from '../channel/channel.entities';
import { GameModule } from './game.module';
import {GameObject, GameState} from './game.entities';

let gameService: GameService;
let userService: UserService;
let dataSource: DataSource;
let testDataBase: TestDatabase;

beforeAll(async () => {
  testDataBase = await setupDataSource();
  dataSource = testDataBase.dataSource;
});

beforeEach(async () => {
  testDataBase.reset();
  const module = await Test.createTestingModule({
    imports: [GameModule],
  })
    .overrideProvider(getRepositoryToken(User))
    .useValue(dataSource.getRepository(User))
    .overrideProvider(getRepositoryToken(Channel))
    .useValue(dataSource.getRepository(Channel))
    .compile();
  gameService = module.get<GameService>(GameService);
  userService = module.get<UserService>(UserService);
  await userService.createUser(new User('player1', 'admin'));
  await userService.createUser(new User('player42', 'test'));
});

describe('creating a game', () => {
  it('should fail to initiate when given a player twice', async () => {
    await expect(
      async () => await gameService.initGame('player1', 'player1'),
    ).rejects.toThrow();
  });

  it('should fail to initiate with a non existing player', async () => {
    await expect(
      async () => await gameService.initGame('player1', 'player2'),
    ).rejects.toThrowError('all players must be registered users');
    expect(gameService.getOpenGames().length).toBe(0);
  });

  //todo: do we need protection against ddos? -> allow only a limited number of open games

  it('should a GameObject which has not yet started', async function () {
    const result = await gameService.initGame('player1', 'player42');

    expect(result.getStatus()).toBe(GameState.INITIALIZED);
    expect(result.getPlayerNames()).toStrictEqual(['player1', 'player42']);
  });

  it('should add a GameObject to the list of open games', async function () {
    await gameService.initGame('player1', 'player42');

    const result: GameObject[] = gameService.getOpenGames();

    expect(result.length).toBe(1);
  });
});
