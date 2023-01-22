import { Test } from '@nestjs/testing';
import { User } from './user.entities';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { setupDataSource, TestDatabase } from '../test.databaseFake.utils';
import { UserService } from './user.service';
import { ChannelModule } from '../channel/channel.module';
import { INestApplication } from '@nestjs/common';
import { Channel } from '../channel/channel.entities';
import { BroadcastingGateway } from '../broadcasting/broadcasting.gateway';
import { GameObject, GameStat } from '../game/game.entities';
import { GameService } from '../game/game.service';
import { UserModule } from './user.module';
import { RoomHandler } from '../broadcasting/broadcasting.roomHandler';

jest.spyOn(Channel.prototype, 'addMessage');
jest.spyOn(BroadcastingGateway.prototype, 'emitMessage');
jest.mock('../broadcasting/broadcasting.gateway');

let userService: UserService;
let app: INestApplication;
let dataSource: DataSource;
let testDataBase: TestDatabase;
let gameService: GameService;
let roomHandler: RoomHandler;

beforeAll(async () => {
  testDataBase = await setupDataSource();
  dataSource = testDataBase.dataSource;
});

beforeEach(async () => {
  testDataBase.reset();
  const module = await Test.createTestingModule({
    imports: [UserModule],
  })
    .overrideProvider(getRepositoryToken(GameStat))
    .useValue(dataSource.getRepository(GameStat))
    .overrideProvider(getRepositoryToken(User))
    .useValue(dataSource.getRepository(User))
    .overrideProvider(getRepositoryToken(Channel))
    .useValue(dataSource.getRepository(Channel))
    .compile();
  app = module.createNestApplication();
  userService = app.get<UserService>(UserService);
  gameService = app.get<GameService>(GameService);
  roomHandler = app.get<RoomHandler>(RoomHandler);
  await app.init();
  await userService.createUser(new User('Thomas', 'test'));
});

describe('creating a user', () => {
  it('should increment the user count', async () => {
    const countBefore = (await userService.getAllUsernames()).length;

    await userService.createUser(new User('newUsername', 'newUserPassword'));

    const countAfter = (await userService.getAllUsernames()).length;
    expect(countAfter).toEqual(countBefore + 1);
  });
});

describe('deleting a user', () => {
  beforeEach(async () => {
    await userService.createUser(new User('newUsername', 'newUserPassword'));
  });

  it('should decrement the user count', async () => {
    const countBefore = (await userService.getAllUsernames()).length;

    await userService.deleteUser('newUsername');

    const countAfter = (await userService.getAllUsernames()).length;
    expect(countAfter).toEqual(countBefore - 1);
  });
});

describe('making friends', () => {
  beforeEach(async () => {
    await userService.createUser(new User('executing user', 'password'));
    await userService.createUser(new User('target user', 'password'));
  });

  it('should increment the new friend', async () => {
    await userService.addFriend('executing user', 'target user');

    const friends = (await userService.getUser('executing user'))?.friends;
    expect(friends?.includes('target user')).toBeTruthy();
  });

  it('should return an array of friend names and their statuses', async () => {
    await userService.addFriend('executing user', 'target user');

    const friends = await userService.getFriends('executing user');
    expect(friends[0].status).toStrictEqual('offline');
  });

  it('should return an array of online and offline friends', async () => {
    await userService.createUser(new User('online user', 'password'));
    await userService.createUser(new User('offline user', 'password'));
    roomHandler.addUserInstance('online user', 'deviceId');
    await userService.addFriend('executing user', 'online user');
    await userService.addFriend('executing user', 'offline user');

    const friends = await userService.getFriends('executing user');
    expect(friends[0].status).toStrictEqual('online');
    expect(friends[1].status).toStrictEqual('offline');
  });
});

describe('getting users by name', () => {
  it('should return undefined on not found', async () => {
    await userService.createUser(new User('executing user', 'password'));

    const user = await userService.getUser('nonexisting user');
    expect(user).toBeUndefined();
  });

  it('should return user', async () => {
    await userService.createUser(new User('executing user', 'password'));

    const user = await userService.getUser('executing user');
    expect(user).toBeDefined();
  });
});

describe('getting the user state', () => {
  it('should return offline for a user who has no connected deviceIds', function () {
    const result = userService.getStatus('Thomas');

    expect(result).toStrictEqual('offline');
  });

  it('should return online for a user who has one or more connected deviceIds', function () {
    roomHandler.addUserInstance('Thomas', 'deviceId');
    const result = userService.getStatus('Thomas');

    expect(result).toStrictEqual('online');
  });

  it('should return inGame for a user who is in a game', function () {
    jest
      .spyOn(gameService, 'getRunningGameForUser')
      .mockImplementation((username: string) => {
        return new GameObject(0, username, '');
      });
    const result = userService.getStatus('Thomas');

    expect(result).toStrictEqual('inGame');
  });
});
