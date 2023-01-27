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
import { Socket, Server } from 'socket.io';
import { Bcrypt } from 'bcrypt';

//the mocks are required to test without opening a real Socket.io Gateway on every test
jest.spyOn(Channel.prototype, 'addMessage');
jest.mock('../broadcasting/broadcasting.gateway');
jest.mock('socket.io', () => {
  return {
    Socket: jest.fn().mockImplementation(() => {
      return {
        join: jest.fn().mockImplementation((username: string) => {}),
        leave: jest.fn().mockImplementation((deviceId: string) => {}),
      };
    }),
    Server: jest.fn().mockImplementation(() => {
      return {
        sockets: {
          sockets: new Map<string, Socket>([
            // @ts-ignore
            ['defaultDeviceId', new Socket()],
            // @ts-ignore
            ['deviceId0', new Socket()],
            // @ts-ignore
            ['deviceId1', new Socket()],
          ]),
        },
      };
    }),
  };
});

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
  //since we mocked the Gateway but need the roomhandler we need this
  jest
    .spyOn(BroadcastingGateway.prototype, 'getRoomHandler')
    .mockImplementation(() => {
      return new RoomHandler(new Server());
    });
  roomHandler = gameService.broadcastingGateway.getRoomHandler();
  await app.init();
  await userService.createUser(new User('online user', 'test'));
  await userService.createUser(new User('offline user', 'test'));
});

describe('creating a user', () => {
  it('should increment the user count', async () => {
    const countBefore = (await userService.getAllUsernames()).length;

    await userService.createUser(new User('newUsername', 'newUserPassword'));

    const countAfter = (await userService.getAllUsernames()).length;
    expect(countAfter).toEqual(countBefore + 1);
  });
	it('should hash password', async() => {
		const username = 'hello';
		const password = 'hell0';

		await userService.createUser(new User(username, password));
		const user = await userService.getUser(username);
		expect(user.password).toEqual(
			expect.not.stringContaining(password)
		);
	});
	it('should return true on comparing hashed and plaintext password', async() => {
		const username = 'hello';
		const password = 'hell0';

		await userService.createUser(new User(username, password));
		const user = await userService.getUser(username);
		expect(user.comparePassword(password)).toBeTruthy();
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

    const friends = (
      await (await userService.getUserInfo('executing user'))!.friends
    ).map((element) => element.username);
    expect(friends!.includes('target user')).toBeTruthy();
  });

  it('should return an array of friend names and their statuses', async () => {
    await userService.addFriend('executing user', 'target user');

    const friends = await (await userService.getUserInfo('executing user'))!
      .friends;
    expect(friends[0].status).toStrictEqual('offline');
  });

  it('should return an array of online and offline friends', async () => {
    await userService.createUser(new User('online user', 'password'));
    await userService.createUser(new User('offline user', 'password'));
    await userService.addFriend('executing user', 'online user');
    await userService.addFriend('executing user', 'offline user');
    jest
      .spyOn(RoomHandler.prototype, 'isUserOnline')
      .mockImplementation((username: string) => {
        if (username === 'online user') return true;
        return false;
      });

    const friends = await (await userService.getUserInfo('executing user'))!
      .friends;
    expect(friends[0].status).toStrictEqual('online');
    expect(friends[1].status).toStrictEqual('offline');
  });
});

describe('getting users by name', () => {
  it('should return undefined on not found', async () => {
    await userService.createUser(new User('executing user', 'password'));

    const user = await userService.getUserInfo('nonexisting user');
    expect(user).toBeUndefined();
  });

  it('should return user', async () => {
    await userService.createUser(new User('executing user', 'password'));

    const user = await userService.getUserInfo('executing user');
    expect(user).toBeDefined();
  });
});

describe('getting the user state', () => {
  it('should return offline for a user who has no connected deviceIds', function () {
    const result = userService.getStatus('offline user');

    expect(result).toStrictEqual('offline');
  });

  it('should return online for a user who has one or more connected deviceIds', function () {
    roomHandler.addUserInstance('online user', 'deviceId');
    const result = userService.getStatus('online user');

    expect(result).toStrictEqual('online');
  });

  it('should return inGame for a user who is in a game', function () {
    jest
      .spyOn(gameService, 'getRunningGameForUser')
      .mockImplementation((username: string) => {
        return new GameObject(0, username, '');
      });
    const result = userService.getStatus('online user');

    expect(result).toStrictEqual('inGame');
  });
});
