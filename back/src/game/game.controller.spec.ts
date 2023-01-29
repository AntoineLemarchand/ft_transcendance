import { HttpStatus, INestApplication, Module } from '@nestjs/common';
import * as testUtils from '../test.request.utils';
import { UserService } from '../user/user.service';
import { DataSource } from 'typeorm';
import { setupDataSource, TestDatabase } from '../test.databaseFake.utils';
import { createTestModule } from '../test.module.utils';
import { User } from '../user/user.entities';
import { GameService } from './game.service';
import { GameObjectRepository } from './game.currentGames.repository';
import { GameObject } from './game.entities';
import { getAllGamesForUser, getAllRunning } from '../test.request.utils';
import { MyExceptionFilter } from '../exceptions.filter';
import { ErrNotFound, ErrUnAuthorized } from '../exceptions';

jest.mock('../broadcasting/broadcasting.gateway');
jest.mock('./game.service');
jest.mock('@nestjs/typeorm', () => {
  const original = jest.requireActual('@nestjs/typeorm');
  original.TypeOrmModule.forRoot = jest
    .fn()
    .mockImplementation(({}) => fakeForRoot);
  @Module({})
  class fakeForRoot {}
  return {
    ...original,
  };
});

let app: INestApplication;
let userService: UserService;
let dataSource: DataSource;
let testDataBase: TestDatabase;
let repo: GameObjectRepository;
let gameService: GameService;

beforeAll(async () => {
  testDataBase = await setupDataSource();
  dataSource = testDataBase.dataSource;
});
beforeEach(async () => {
  testDataBase.reset();
  app = await createTestModule(dataSource);
  userService = app.get<UserService>(UserService);
  gameService = app.get<GameService>(GameService);
  repo = app.get<GameObjectRepository>(GameObjectRepository);
  await app.init();
  await userService.createUser(new User('admin', 'admin'));
  await userService.createUser(new User('Thomas', 'test'));
});

describe('initializing a game', () => {
  it('should fail if user not logged in ', async () => {
    const result = await testUtils.initGame(app, 'invalid token', 'Thomas');

    expect(result.status).toBe(401);
  });

  it('should transform all not found errors of the logic into 404 responses', async () => {
    jest
      .spyOn(gameService, 'initGame')
      .mockImplementation(async (p1: string, p2: string) => {
        throw new ErrNotFound('what the heck');
      });
    const jwt = await testUtils.getLoginToken(app, 'admin', 'admin');
    const result = await testUtils.initGame(app, jwt, 'Thomas');

    expect(result.status).toBe(404);
  });

  it('should transform all unauthorized errors of the logic into 401 responses', async () => {
    jest
      .spyOn(gameService, 'initGame')
      .mockImplementation(async (p1: string, p2: string) => {
        throw new ErrUnAuthorized('what the heck');
      });
    const jwt = await testUtils.getLoginToken(app, 'admin', 'admin');
    const result = await testUtils.initGame(app, jwt, 'Thomas');

    expect(result.status).toBe(401);
  });

  it('should return successfully', async () => {
    const jwt = await testUtils.getLoginToken(app, 'admin', 'admin');
    const result = await testUtils.initGame(app, jwt, 'Thomas');

    expect(result.status).toBe(201);
  });

  it('should call the appropriate service ', async () => {
    const spy = jest.spyOn(gameService, 'initGame');
    const jwt = await testUtils.getLoginToken(app, 'admin', 'admin');

    await testUtils.initGame(app, jwt, 'Thomas');

    expect(spy).toHaveBeenCalledWith('admin', 'Thomas');
  });

  it('should return the game object', async () => {
    const spy = jest
      .spyOn(gameService, 'initGame')
      .mockImplementation(async (p1: string, s: string) => {
        return new GameObject(666, p1, s);
      });
    const jwt = await testUtils.getLoginToken(app, 'admin', 'admin');

    const result = await testUtils.initGame(app, jwt, 'Thomas');

    expect(result.body.gameObject.gameId).toBe(666);
  });
});

describe('starting a game', () => {
  it('should fail if user not logged in', async function () {
    const jwt = await testUtils.getLoginToken(app, 'admin', 'admin');
    await testUtils.initGame(app, jwt, 'Thomas');
    const result = await testUtils.setReadyForGame(app, 'invalid token', 0);

    expect(result.status).toBe(401);
  });

  it('should call the appropriate service ', async () => {
    const spy = jest.spyOn(gameService, 'setReady');
    const jwt = await testUtils.getLoginToken(app, 'admin', 'admin');
    await testUtils.initGame(app, jwt, 'Thomas');

    await testUtils.setReadyForGame(app, jwt, 0);

    expect(spy).toHaveBeenCalledWith('admin', 0);
  });

  it('should parse int body', async () => {
    const spy = jest.spyOn(gameService, 'setReady');
    const jwt = await testUtils.getLoginToken(app, 'admin', 'admin');
    await testUtils.initGame(app, jwt, 'Thomas');

    await testUtils.setReadyForGame(app, jwt, 0);

    expect(spy).toHaveBeenCalledWith('admin', 0);
  });
});

describe('unset ready a game', () => {
  it('should fail if user not logged in', async function () {
    const jwt = await testUtils.getLoginToken(app, 'admin', 'admin');
    await testUtils.initGame(app, jwt, 'Thomas');
    const result = await testUtils.setNotReadyForGame(app, 'invalid token', 0);

    expect(result.status).toBe(401);
  });

  it('should call the appropriate service ', async () => {
    const spy = jest.spyOn(gameService, 'unsetReady');
    const jwt = await testUtils.getLoginToken(app, 'admin', 'admin');
    await testUtils.initGame(app, jwt, 'Thomas');

    await testUtils.setNotReadyForGame(app, jwt, 0);

    expect(spy).toHaveBeenCalledWith('admin', 0);
  });

  it('should parse int body', async () => {
    const spy = jest.spyOn(gameService, 'unsetReady');
    const jwt = await testUtils.getLoginToken(app, 'admin', 'admin');
    await testUtils.initGame(app, jwt, 'Thomas');

    await testUtils.setNotReadyForGame(app, jwt, 0);

    expect(spy).toHaveBeenCalledWith('admin', 0);
  });
});

describe('fetching running games', () => {
  it('should fail if user not logged in', async function () {
    const result = await testUtils.getAllRunning(app, 'invalid jwt');

    expect(result.status).toBe(401);
  });

  it('should return games in body', async function () {
    const spy = jest
      .spyOn(gameService, 'getRunningGames')
      .mockImplementation(() => {
        return [];
      });
    const jwt = await testUtils.getLoginToken(app, 'admin', 'admin');
    const result = await testUtils.getAllRunning(app, jwt);

    expect(result.body.games).toBeDefined();
    expect(spy).toHaveBeenCalled();
  });
});

describe('fetching games for user', () => {
  it('should fail if user not logged in', async function () {
    const result = await testUtils.getAllGamesForUser(app, 'invalid jwt');

    expect(result.status).toBe(401);
  });

  it('should return games in body', async function () {
    const spy = jest
      .spyOn(gameService, 'getGamesForUser')
      .mockImplementation(() => {
        return [];
      });
    const jwt = await testUtils.getLoginToken(app, 'admin', 'admin');
    const result = await testUtils.getAllGamesForUser(app, jwt);

    expect(result.body.games).toBeDefined();
    expect(spy).toHaveBeenCalled();
  });
});

describe('beginning spectating a game', () => {
  it('should fail if user not logged in', async function () {
    const result = await testUtils.startSpectatingGame(app, 'invalid jwt', 666);

    expect(result.status).toBe(401);
  });

  it('should catch not found errors', async function () {
    const spy = jest
      .spyOn(gameService, 'beginSpectate')
      .mockReset()
      .mockImplementation((username: string, gameId: number) => {
        throw new ErrNotFound('');
      });
    const jwt = await testUtils.getLoginToken(app, 'admin', 'admin');
    const result = await testUtils.startSpectatingGame(app, jwt, 666);

    expect(result.status).toBe(404);
  });

  it('should return 201 on success', async function () {
    const spy = jest
      .spyOn(gameService, 'beginSpectate')
      .mockReset()
      .mockImplementation(
        async (username: string, gameId: number): Promise<void> => {},
      );
    const jwt = await testUtils.getLoginToken(app, 'admin', 'admin');
    const result = await testUtils.startSpectatingGame(app, jwt, 666);

    expect(result.status).toBe(201);
  });
});

describe('ending spectating a game', () => {
  it('should fail if user not logged in', async function () {
    const result = await testUtils.endSpectatingGame(app, 'invalid jwt', 666);

    expect(result.status).toBe(401);
  });

  it('should catch not found errors', async function () {
    const spy = jest
      .spyOn(gameService, 'endSpectate')
      .mockReset()
      .mockImplementation((username: string, gameId: number) => {
        throw new ErrNotFound('');
      });
    const jwt = await testUtils.getLoginToken(app, 'admin', 'admin');
    const result = await testUtils.endSpectatingGame(app, jwt, 666);

    expect(result.status).toBe(404);
  });

  it('should return 201 on success', async function () {
    const spy = jest
      .spyOn(gameService, 'endSpectate')
      .mockReset()
      .mockImplementation(
        async (username: string, gameId: number): Promise<void> => {},
      );
    const jwt = await testUtils.getLoginToken(app, 'admin', 'admin');
    const result = await testUtils.endSpectatingGame(app, jwt, 666);

    expect(result.status).toBe(200);
  });
});
