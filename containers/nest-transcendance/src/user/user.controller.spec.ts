import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as testUtils from '../test.utils';
import { AppModule } from '../app.module';
import { BroadcastingGateway } from '../broadcasting/broadcasting.gateway';
import * as request from 'supertest';

describe('UserController', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(BroadcastingGateway)
      .useValue(jest.fn())
      .compile();
    app = module.createNestApplication();
    await app.init();
  });

  it('should return 404 on adding unexisting friend', async () => {
    const jwt = await testUtils.getLoginToken(app, 'Thomas', 'test');

    const result = await testUtils.addFriend(app, jwt, 'non existing user');

    expect(result.status).toBe(404);
  });

  it('should return 401 on adding friend twice', async () => {
    const jwt = await testUtils.getLoginToken(app, 'Thomas', 'test');
    testUtils.signinUser(app, 'JayDee', 'yeah');
    await testUtils.addFriend(app, jwt, 'JayDee');

    const result = await testUtils.addFriend(app, jwt, 'JayDee');
    const friendsList = JSON.parse(
      (await testUtils.getFriends(app, jwt)).body.friends,
    );

    expect(result.status).toBe(401);
    expect(friendsList.length).toBe(1);
  });

  it('should return 201 and add friend', async () => {
    const jwt = await testUtils.getLoginToken(app, 'Thomas', 'test');
    testUtils.signinUser(app, 'JayDee', 'yeah');

    const result = await testUtils.addFriend(app, jwt, 'JayDee');

    expect(result.status).toBe(201);
  });

  it('should return 201 and a list of friends', async () => {
    const jwt = await testUtils.getLoginToken(app, 'Thomas', 'test');
    testUtils.signinUser(app, 'JayDee', 'yeah');
    testUtils.addFriend(app, jwt, 'JayDee');

    const result = await testUtils.getFriends(app, jwt);

    expect(result.status).toBe(200);
    expect(result.body.friends).toBeDefined();
    expect(JSON.parse(result.body.friends).length).toBe(1);
  });

  it('should return 404 when removing nonexistant friend', async () => {
    const jwt = await testUtils.getLoginToken(app, 'Thomas', 'test');
    testUtils.signinUser(app, 'JayDee', 'yeah');
    testUtils.addFriend(app, jwt, 'JayDee');

    const result = await testUtils.removeFriend(app, jwt, 'not my friend');

    expect(result.status).toBe(404);
  });

  it('should return 200 and remove friend', async () => {
    const jwt = await testUtils.getLoginToken(app, 'Thomas', 'test');
    testUtils.signinUser(app, 'JayDee', 'yeah');
    testUtils.addFriend(app, jwt, 'JayDee');

    const result = await testUtils.removeFriend(app, jwt, 'JayDee');
    const friendsList = JSON.parse(
      (await testUtils.getFriends(app, jwt)).body.friends,
    );

    expect(result.status).toBe(200);
    expect(friendsList.length).toBe(0);
  });

  it('should return 404 on non existing user info', async () => {
    const jwt = await testUtils.getLoginToken(app, 'Thomas', 'test');

    const result = await testUtils.getUserData(app, jwt, 'non existing user');

    expect(result.status).toBe(404);
  });

  it('should return 200 and user info on successful query', async () => {
    const jwt = await testUtils.getLoginToken(app, 'Thomas', 'test');

    const result = await testUtils.getUserData(app, jwt, 'Thomas');

    expect(result.status).toBe(200);
    expect(result.body.userInfo).toBeDefined();
    expect(result.body.userInfo.name).toBe('Thomas');
  });

  it('should take username from token if empty query', async () => {
    const jwt = await testUtils.getLoginToken(app, 'Thomas', 'test');

    const result = await testUtils.getUserData(app, jwt, '');

    expect(result.status).toBe(200);
    expect(result.body.userInfo).toBeDefined();
    expect(result.body.userInfo.name).toBe('Thomas');
  });

  it('should return 201 and all user channels', async () => {
    const jwt = await testUtils.getLoginToken(app, 'Thomas', 'test');
    await testUtils.joinChannel(app, jwt, 'newChannelName', 'password');

    const result = await request(app.getHttpServer())
      .get('/user/channels/')
      .set('Authorization', 'Bearer ' + jwt);

    expect(result.status).toBe(200);
    expect(result.body.channels).toBeDefined();
    expect(result.body.channels[0].channelName).toBe('welcome');
    expect(result.body.channels[1].channelName).toBe('newChannelName');
  });

  it('should be subscribed to the welcome channel on creation', async () => {
    const jwt = await testUtils.getLoginToken(app, 'Thomas', 'test');

    const result = await testUtils.getUserData(app, jwt, 'Thomas');

    expect(result.status).toBe(200);
    expect(result.body.userInfo.channelNames.length).toBe(1);
  });
});
