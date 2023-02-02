import { INestApplication, Module } from '@nestjs/common';
import * as testUtils from '../test.request.utils';
import * as request from 'supertest';
import { DataSource } from 'typeorm';
import { setupDataSource, TestDatabase } from '../test.databaseFake.utils';
import { User } from '../typeorm';
import { UserService } from './user.service';
import { createTestModule } from '../test.module.utils';
import { Server, Socket } from "socket.io";
import { BroadcastingGateway } from "../broadcasting/broadcasting.gateway";
import { RoomHandler } from "../broadcasting/broadcasting.roomHandler";

//the mocks are required to test without opening a real Socket.io Gateway on every test
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
jest
  .spyOn(BroadcastingGateway.prototype, 'getRoomHandler')
  .mockImplementation(() => {
    return new RoomHandler(new Server());
  });

let app: INestApplication;
let userService: UserService;
let jwt: string;

let dataSource: DataSource;
let testDataBase: TestDatabase;

beforeAll(async () => {
  testDataBase = await setupDataSource();
  dataSource = testDataBase.dataSource;
});

beforeEach(async () => {
  testDataBase.reset();
  app = await createTestModule(dataSource);
  await app.init();
  userService = app.get<UserService>(UserService);
  await userService.createUser(new User('Thomas', 'test'));
  jwt = await testUtils.getLoginToken(app, 'Thomas', 'test');
});

describe('Making friends', () => {
  it('should return 404 on adding unexisting friend', async () => {
    const result = await testUtils.addFriend(app, jwt, 'non existing user');

    expect(result.status).toBe(404);
  });

  it('should return 401 on adding friend twice', async () => {
    await testUtils.signinUser(app, 'JayDee', 'yeah');
    await testUtils.addFriend(app, jwt, 'JayDee');

    const response = await testUtils.addFriend(app, jwt, 'JayDee');
    const result = await testUtils.getUserData(app, jwt, 'Thomas');
    const friendsList = result.body.userInfo.friends;

    expect(response.status).toBe(401);
    expect(friendsList.length).toBe(1);
  });

  it('should return 201 and add friend', async () => {
    await testUtils.signinUser(app, 'JayDee', 'yeah');

    const result = await testUtils.addFriend(app, jwt, 'JayDee');

    expect(result.status).toBe(201);
  });

  it('should return 201 and a list of friends', async () => {
    await testUtils.signinUser(app, 'new Friend', 'yeah');
    await testUtils.addFriend(app, jwt, 'new Friend');

    const result = await testUtils.getUserData(app, jwt, 'Thomas');

    expect(result.status).toBe(200);
    expect(result.body.userInfo.friends).toBeDefined();
    expect(result.body.userInfo.friends.length).toBe(1);
  });

  it('should return 404 when removing nonexistant friend', async () => {
    await testUtils.signinUser(app, 'JayDee', 'yeah');
    testUtils.addFriend(app, jwt, 'JayDee');

    const result = await testUtils.removeFriend(app, jwt, 'not my friend');

    expect(result.status).toBe(404);
  });

  it('should return 200 and remove friend', async () => {
    await testUtils.signinUser(app, 'JayDee', 'yeah');
    await testUtils.addFriend(app, jwt, 'JayDee');

    const result = await testUtils.removeFriend(app, jwt, 'JayDee');
    const friendsList = (await testUtils.getUserData(app, jwt, 'JayDee')).body
      .userInfo.friends;

    expect(result.status).toBe(200);
    expect(friendsList.length).toBe(0);
  });
});

describe('Getting user info', () => {
  it('should return 404 on non existing user info', async () => {
    const result = await testUtils.getUserData(app, jwt, 'non existing user');

    expect(result.status).toBe(404);
  });

  it('should return 200 and user info on successful query', async () => {
    const result = await testUtils.getUserData(app, jwt, 'Thomas');

    expect(result.status).toBe(200);
    expect(result.body.userInfo).toBeDefined();
    expect(result.body.userInfo.name).toBe('Thomas');
  });

  it('should take username from token if empty query', async () => {
    const result = await testUtils.getUserData(app, jwt, '');

    expect(result.status).toBe(200);
    expect(result.body.userInfo).toBeDefined();
    expect(result.body.userInfo.name).toBe('Thomas');
  });

  it('should return 201 and all user channels', async () => {
    await testUtils.joinChannel(app, jwt, 'newChannelName', 'password');

    const result = await request(app.getHttpServer())
      .get('/user/channels/')
      .set('Authorization', 'Bearer ' + jwt);

    expect(result.status).toBe(200);
    expect(result.body.channels).toBeDefined();
    expect(result.body.channels[0].channelName).toBe('welcome');
    expect(result.body.channels[1].channelName).toBe('newChannelName');
  });

  it('should return 200 and matching usernames', async () => {
    await testUtils.signinUser(app, 'Tom', 'password');
    await testUtils.signinUser(app, 'Camembert', 'password');

    const result = await request(app.getHttpServer())
      .get('/user/getMatchingNames/T')
      .set('Authorization', 'Bearer ' + jwt);

    expect(result.status).toBe(200);
    expect(result.body.usernames).toBeDefined();
    expect(result.body.usernames[0]).toEqual('Thomas');
    expect(result.body.usernames[1]).toEqual('Tom');
  });

  it('should return 200 and all usernames', async () => {
    await testUtils.signinUser(app, 'Tom', 'password');
    await testUtils.signinUser(app, 'Camembert', 'password');

    const result = await request(app.getHttpServer())
      .get('/user/getMatchingNames/')
      .set('Authorization', 'Bearer ' + jwt);

    expect(result.status).toBe(200);
    expect(result.body.usernames).toBeDefined();
    expect(result.body.usernames[0]).toEqual('Thomas');
    expect(result.body.usernames[1]).toEqual('Tom');
    expect(result.body.usernames[2]).toEqual('Camembert');
  });

  it('should return 200 and an image', async () => {
    const testImage: Buffer = Buffer.from('test image buffer');
    await testUtils.signinUser(app, 'camembert', 'password', testImage);

    const result = await request(app.getHttpServer())
      .get('/user/image/camembert')
      .set('Authorization', 'Bearer ' + jwt);

    expect(result.status).toBe(200);
    expect(result.body).toStrictEqual(Buffer.from('test image buffer'));
  })
<<<<<<< HEAD

  it('should return 200 and set another image', async () => {
    const testImage: Buffer = Buffer.from('test image buffer');

    await request(app.getHttpServer())
      .post('/user/image')
      .attach("image", testImage, "test.png")
      .set('Authorization', 'Bearer ' + jwt);
    const result = await request(app.getHttpServer())
      .get('/user/image/Thomas')
      .set('Authorization', 'Bearer ' + jwt);

    expect(result.status).toBe(200);
    expect(result.body).toStrictEqual(Buffer.from('test image buffer'));
  })
=======
>>>>>>> fixUsername
});

describe('Login', () => {
  it('should be subscribed to the welcome channel on creation', async () => {
    const result = await testUtils.getUserData(app, jwt, 'Thomas');

    expect(result.status).toBe(200);
    expect(result.body.userInfo.channelNames.length).toBe(1);
  });
});

describe('Blocking users', () => {
  it('should add user to the blockedUsers list', async () => {
    await testUtils.signinUser(app, 'Martin', 'yeye');

    const result = await testUtils.blockUser(app, jwt, 'Martin');
    const blockedUsersList = (await testUtils.getBlockedUsers(app, jwt)).body
      .blockedUsers;

    expect(result.status).toBe(201);
    expect(blockedUsersList.length).toBe(1);
  });

  it('should remove user from the blockedUsers list', async () => {
    await testUtils.signinUser(app, 'Martin', 'yeye');

    await testUtils.blockUser(app, jwt, 'Martin');

    const result = await testUtils.unblockUser(app, jwt, 'Martin');
    const blockedUsersList = (await testUtils.getBlockedUsers(app, jwt)).body
      .blockedUsers;

    expect(result.status).toBe(200);
    expect(blockedUsersList.length).toBe(0);
  });
});
