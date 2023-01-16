import { Test } from '@nestjs/testing';
import { GameService } from './game.service';
import { UserService } from '../user/user.service';
import { DataSource } from 'typeorm';
import { setupDataSource, TestDatabase } from '../test.databaseFake.utils';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../user/user.entities';
import { Channel } from '../channel/channel.entities';
import { GameModule } from './game.module';
import { GameObject, GameProgress } from './game.entities';
import { GameObjectRepository } from './game.currentGames.repository';
import { executionCtx } from 'pg-mem/types/utils';
import {BroadcastingGateway} from "../broadcasting/broadcasting.gateway";

let gameService: GameService;
let userService: UserService;
let dataSource: DataSource;
let currentGames: GameObjectRepository;
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
  currentGames = module.get<GameObjectRepository>(GameObjectRepository);
  await userService.createUser(new User('player1', 'admin'));
  await userService.createUser(new User('player42', 'test'));
  await userService.createUser(new User('outsider', 'password'));
});

describe('setting up a game', () => {
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

    expect(result.getStatus()).toBe(GameProgress.INITIALIZED);
    expect(result.getPlayerNames()).toStrictEqual(['player1', 'player42']);
  });

  it('should add a GameObject to the list of open games', async function () {
    await gameService.initGame('player1', 'player42');

    const result: GameObject[] = gameService.getOpenGames();

    expect(result.length).toBe(1);
  });

  it('should put both players in a socket room', async function () {
    const spy = jest.spyOn(BroadcastingGateway.prototype, 'putUserInRoom');

    const game = await gameService.initGame('player1', 'player42');

    expect(spy).toHaveBeenCalledWith('player1', game.getId().toString());
    expect(spy).toHaveBeenCalledWith('player42', game.getId().toString());
  });
});

describe('starting a game', () => {
  it('should fail if the executing user is not one of the players', async () => {
    const gameObject = await gameService.initGame('player1', 'player42');

    await expect(
      async () => await gameService.setReady('outsider', gameObject.getId()),
    ).rejects.toThrow();
  });

  it('should not change the GameObject state unless both players are ready', async () => {
    const gameObject = await gameService.initGame('player1', 'player42');

    await gameService.setReady('player1', gameObject.getId());

    const result = await currentGames.findOne(gameObject.getId());
    expect(result.getStatus()).toBe(GameProgress.INITIALIZED);
  });

  it('should start the game when both players are ready', async () => {
    const gameObject = await gameService.initGame('player1', 'player42');

    await gameService.setReady('player1', gameObject.getId());
    await gameService.setReady('player42', gameObject.getId());

    const result = await currentGames.findOne(gameObject.getId());
    expect(result.getStatus()).toBe(GameProgress.RUNNING);
  });

  it('should not have an effect to run ready twice as same user', async () => {
    const gameObject = await gameService.initGame('player1', 'player42');

    await gameService.setReady('player1', gameObject.getId());
    await gameService.setReady('player1', gameObject.getId());

    const result = await currentGames.findOne(gameObject.getId());
    expect(result.getStatus()).toBe(GameProgress.INITIALIZED);
  });
});

describe('running a game', () => {
  // it('should call the game logic', async () => {
  //   const spy = jest.spyOn(GameObject.prototype, 'init')
  //   const gameObject = await gameService.initGame('player1', 'player42');
  //   await gameService.setReady('player1', gameObject.getId());
  //   await gameService.setReady('player42', gameObject.getId());
  //
  // });
});