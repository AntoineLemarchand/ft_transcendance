import { INestApplication, Module } from '@nestjs/common';
import * as testUtils from '../test.request.utils';
import { UserService } from '../user/user.service';
import { DataSource } from 'typeorm';
import { setupDataSource, TestDatabase } from '../test.databaseFake.utils';
import { createTestModule } from '../test.module.utils';
import { User } from '../user/user.entities';
import { GameService } from './game.service';
import { GameObjectRepository } from './game.currentGames.repository';

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

beforeAll(async () => {
  testDataBase = await setupDataSource();
  dataSource = testDataBase.dataSource;
});
beforeEach(async () => {
  testDataBase.reset();
  app = await createTestModule(dataSource);
  userService = app.get<UserService>(UserService);
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

  it('should return successfully', async () => {
    const jwt = await testUtils.getLoginToken(app, 'admin', 'admin');
    const result = await testUtils.initGame(app, jwt, 'Thomas');

    expect(result.status).toBe(201);
  });

  it('should call the appropriate service ', async () => {
    const spy = jest.spyOn(GameService.prototype, 'initGame');
    const jwt = await testUtils.getLoginToken(app, 'admin', 'admin');

    await testUtils.initGame(app, jwt, 'Thomas');

    expect(spy).toHaveBeenCalledWith('admin', 'Thomas');
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
    const spy = jest.spyOn(GameService.prototype, 'setReady');
    const jwt = await testUtils.getLoginToken(app, 'admin', 'admin');
    await testUtils.initGame(app, jwt, 'Thomas');

    await testUtils.setReadyForGame(app, jwt, 0);

    expect(spy).toHaveBeenCalledWith('admin', 0);
  });
});
