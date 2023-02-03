import { INestApplication, Module } from '@nestjs/common';
import * as testUtils from '../test.request.utils';
import { createDirectMessage, inviteToChannel } from '../test.request.utils';
import * as request from 'supertest';
import { Channel } from './channel.entities';
import { UserService } from '../user/user.service';
import { ChannelService } from './channel.service';
import { DataSource } from 'typeorm';
import { setupDataSource, TestDatabase } from '../test.databaseFake.utils';
import { createTestModule } from '../test.module.utils';
import { User } from '../user/user.entities';
import {BroadcastingGateway} from "../broadcasting/broadcasting.gateway";
import {RoomHandler} from "../broadcasting/broadcasting.roomHandler";
import {Server} from "socket.io";

jest.mock('../broadcasting/broadcasting.gateway');
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
let channelService: ChannelService;
let dataSource: DataSource;
let testDataBase: TestDatabase;

beforeAll(async () => {
  testDataBase = await setupDataSource();
  dataSource = testDataBase.dataSource;
});
beforeEach(async () => {
  testDataBase.reset();
  app = await createTestModule(dataSource);
  userService = app.get<UserService>(UserService);
  channelService = app.get<ChannelService>(ChannelService);
  await app.init();
  await userService.createUser(new User('admin', 'admin'));
  await userService.createUser(new User('Thomas', 'test'));
});

describe('joining a channel', () => {
  it('should not be allowed to create a channel if the user is not logged in ', async () => {
    const result = await testUtils.joinChannel(
      app,
      'invalid token',
      'newChannelName',
    );

    expect(result.status).toBe(401);
  });

  it('should return 201 and create a new channel if correct input is provided', async () => {
    const jwt = await testUtils.getLoginToken(app, 'Thomas', 'test');

    const result = await testUtils.joinChannel(app, jwt, 'newChannelName');

    expect(result.status).toBe(201);
    expect(
      await testUtils.doesChannelExist(app, jwt, 'newChannelName'),
    ).toBeTruthy();
  });

  it('should make nonempty password obligatory for others to join', async () => {
    const jwt = await testUtils.getLoginToken(app, 'Thomas', 'test');
    await testUtils.createUserAndJoinToChannel(
      app,
      'lambdaUsername',
      'newChannelName',
      'channelPassword',
    );

    const result = await testUtils.joinChannel(app, jwt, 'newChannelName');

    expect(result.status).toBe(401);
  });

  it('should create a private Channel when joining first', async () => {
    const jwtCreator = await testUtils.getLoginToken(app, 'Thomas', 'test');
    await testUtils.joinChannel(
      app,
      jwtCreator,
      'privateChannel',
      '',
      'privateChannel',
    );
    const jwtJoiner = (await testUtils.signinUser(app, 'outsider', 'password'))
      .body.access_token;

    const result = await testUtils.joinChannel(
      app,
      jwtJoiner,
      'privateChannel',
    );

    expect(result.status).toBe(401);
  });

  it('should add people to private channels on invite', async () => {
    const jwt = await testUtils.getLoginToken(app, 'Thomas', 'test');
    await testUtils.joinChannel(
      app,
      jwt,
      'privateChannel',
      '',
      'privateChannel',
    );
    await testUtils.signinUser(app, 'outsider', 'password');

    // extract that
    const result = await inviteToChannel(
      app,
      jwt,
      'privateChannel',
      'outsider',
    );

    expect(result.status).toBe(201);
    expect(
      (await userService.getUser('outsider'))
        ?.getChannelNames()
        .includes('privateChannel'),
    ).toBeTruthy();
  });

  it('should return 401 when inviting people to private channels and not admin', async () => {
    const jwtCreator = await testUtils.getLoginToken(app, 'Thomas', 'test');
    await testUtils.joinChannel(
      app,
      jwtCreator,
      'privateChannel',
      '',
      'privateChannel',
    );
    const jwtJoiner = (await testUtils.signinUser(app, 'outsider', 'password'))
      .body.access_token;

    const result = await testUtils.joinChannel(
      app,
      jwtJoiner,
      'privateChannel',
      '',
    );

    expect(result.status).toBe(401);
  });

  it('should return the new channel on join', async () => {
    const jwt = await testUtils.getLoginToken(app, 'Thomas', 'test');

    const result = await testUtils.joinChannel(app, jwt, 'newChannelName');

    expect(result.status).toBe(201);
    expect(result.body.channel).toBeDefined();
  });

  it('should return 409 when already joined', async () => {
    const jwt = await testUtils.getLoginToken(app, 'Thomas', 'test');

    await testUtils.joinChannel(app, jwt, 'newChannelName', 'default');
    const result = await testUtils.joinChannel(app, jwt, 'newChannelName');

    expect(result.status).toBe(409);
  });

});

describe('leaving a channel', () => {
  it('should return 200 when leaving the channel and remove from channel',
     async () => {
    await testUtils.signinUser(app, 'testUser', 'testPassword');
    const jwtOwner = await testUtils.getLoginToken(app, 'Thomas', 'test');
    const jwt = await testUtils.getLoginToken(app, 'testUser', 'testPassword');
    await testUtils.joinChannel(app, jwtOwner, 'newChannelName', 'default');
    await testUtils.joinChannel(app, jwt, 'newChannelName', 'default');

    const result = await request(app.getHttpServer())
      .delete('/channel/join')
      .set('Authorization', 'Bearer ' + jwt)
      .send({channelName: 'newChannelName'})

    expect(result.status).toBe(200);
    expect(
      (await userService.getUser('testUser'))!
        .getChannelNames()
        .includes('newChannelName'),
    ).toBeFalsy();
  });

  it('should return 401 when leaving non existing channel', async () => {
    const jwt = await testUtils.getLoginToken(app, 'testUser', 'testPassword');
    const result = await request(app.getHttpServer())
      .delete('/channel/join')
      .set('Authorization', 'Bearer ' + jwt)
      .send({channelName: 'newChannelName'})

    expect(result.status).toBe(401);
  });

  it('should return 401 when leaving as the owner', async () => {
    const jwt = await testUtils.getLoginToken(app, 'Thomas', 'test');
    await testUtils.joinChannel(app, jwt, 'newChannelName', 'default');

    const result = await request(app.getHttpServer())
      .delete('/channel/join')
      .set('Authorization', 'Bearer ' + jwt)
      .send({channelName: 'newChannelName'})

    expect(result.status).toBe(401);
  });
});

describe('creating a direct message channel', () => {
  it('should call the creation function', async () => {
    const spy = jest.spyOn(channelService, 'createDirectMessageChannelFor');
    const jwt = await testUtils.getLoginToken(app, 'Thomas', 'test');
    await testUtils.signinUser(app, 'Receiver', 'password');

    const result = await createDirectMessage(app, jwt, 'Receiver');

    expect(result.status).toBe(201);
    expect(spy).toBeCalledWith('Thomas', 'Receiver');
  });
});

describe('retrieving a channel', () => {
  it('should return 404 on non existing channelName', async () => {
    const jwt = await testUtils.getLoginToken(app, 'Thomas', 'test');

    await request(app.getHttpServer())
      .get('/channel/findOne/nonExistingChannelName')
      .set('Authorization', 'Bearer ' + jwt)
      .expect((response) => {
        expect(response.status).toBe(404);
      });
  });

  it('should return the channel matching the request', async () => {
    const jwt = await testUtils.getLoginToken(app, 'Thomas', 'test');

    const result: Channel = (await testUtils.getChannelByName(
      app,
      jwt,
      'welcome',
    )) as Channel;

    expect(result.getName()).toBe('welcome');
  });
});

describe('searching channels by name', () => {
  it('should return a list of channel names', async () => {
    const jwt = await testUtils.getLoginToken(app, 'Thomas', 'test');
    await testUtils.joinChannel(app, jwt, 'newChannelNameA', 'default');
    await testUtils.joinChannel(app, jwt, 'newChannelNameB', 'default');
    await testUtils.joinChannel(app, jwt, 'otherChannelNameC', 'default');

    const matchingChannels = await testUtils.getMatchingChannelNames(
      app,
      jwt,
      'new',
    );

    expect(matchingChannels.length).toBe(2);
    expect(matchingChannels[0]).toBe('newChannelNameA');
    expect(matchingChannels[1]).toBe('newChannelNameB');
  });

  it('should return the names of all joined channels', async () => {
    const jwt = await testUtils.getLoginToken(app, 'Thomas', 'test');
    await testUtils.joinChannel(app, jwt, 'newChannelName1', 'default');
    await testUtils.joinChannel(app, jwt, 'newChannelName2', 'default');
    await testUtils.joinChannel(app, jwt, 'otherChannelName1', 'default');

    const matchingChannels = await testUtils.getMatchingChannelNames(
      app,
      jwt,
      '',
    );

    expect(matchingChannels.length).toEqual(
      (await channelService.getChannels()).length,
    );
  });
});

describe('administrating a channel', () => {
  it('should return 401 if not authorized to execute administrator tasks', async () => {
    const jwt = await testUtils.getLoginToken(app, 'Thomas', 'test');
    const spy = jest.spyOn(channelService, 'banUserFromChannel');
    const response = await testUtils.banFromChannel(
      app,
      jwt,
      'welcome',
      'bannedUsername',
    );

    expect(response.status).toBe(401);
    expect(spy).toHaveBeenCalledWith('Thomas', 'bannedUsername', 'welcome');
  });

  it('should return 401 if not authorized to make someone else admin', async () => {
    const spy = jest.spyOn(channelService, 'makeAdmin');
    const jwt = await testUtils.getLoginToken(app, 'Thomas', 'test');

    const response = await testUtils.addChannelAdmin(
      app,
      jwt,
      'adminCandidate',
      'welcome',
    );

    expect(response.status).toBe(401);
    expect(spy).toHaveBeenCalledWith('Thomas', 'adminCandidate', 'welcome');
  });

  it('should return 401 if not authorized to change the channel password', async () => {
    const spy = jest.spyOn(channelService, 'setPassword');
    const jwt = await testUtils.getLoginToken(app, 'Thomas', 'test');

    const response = await testUtils.changeChannelPassword(
      app,
      jwt,
      'newPassword',
      'welcome',
    );

    expect(response.status).toBe(401);
    expect(spy).toHaveBeenCalledWith('Thomas', 'newPassword', 'welcome');
  });

  it('should return 201 when changing the channel password', async () => {
    const spy = jest.spyOn(channelService, 'setPassword');
    const jwt = await testUtils.getLoginToken(app, 'admin', 'admin');

    const response = await testUtils.changeChannelPassword(
      app,
      jwt,
      'newPassword',
      'welcome',
    );

    expect(response.status).toBe(201);
    expect(spy).toHaveBeenCalledWith('admin', 'newPassword', 'welcome');
  });

  it('should return 201 when making someone else admin', async () => {
    const jwt = await testUtils.getLoginToken(app, 'admin', 'admin');
    const response = await testUtils.addChannelAdmin(
      app,
      jwt,
      'adminCandidate',
      'welcome',
    );

    expect(response.status).toBe(201);
  });

  it('should return 201 and the admins', async () => {
    const jwt = await testUtils.getLoginToken(app, 'admin', 'admin');

    const response = await testUtils.getChannelAdmins(app, jwt, 'welcome');

    const adminNames = response.body.adminNames;
    expect(response.status).toBe(200);
    expect(adminNames).toStrictEqual(['admin']);
  });

  it('should return 401 if not authorized to mute a member', async () => {
    const spy = jest.spyOn(channelService, 'muteMemberForMinutes');
    const jwt = await testUtils.getLoginToken(app, 'Thomas', 'test');

    const response = await testUtils.muteUser(
      app,
      jwt,
      'mutedUsername',
      'welcome',
      15,
    );

    expect(response.status).toBe(401);
    expect(spy).toHaveBeenCalledWith('Thomas', 'mutedUsername', 15, 'welcome');
  });

  it('should return 404 if muted user is not a member', async () => {
    const spy = jest.spyOn(channelService, 'muteMemberForMinutes');
    const jwt = await testUtils.getLoginToken(app, 'admin', 'admin');

    const response = await testUtils.muteUser(
      app,
      jwt,
      'mutedUsername',
      'welcome',
      15,
    );

    expect(response.status).toBe(404);
    expect(spy).toHaveBeenCalledWith('admin', 'mutedUsername', 15, 'welcome');
  });

  it('should return 200 if muted a member', async () => {
    const spy = jest.spyOn(channelService, 'muteMemberForMinutes');
    const jwt = await testUtils.getLoginToken(app, 'admin', 'admin');

    const response = await testUtils.muteUser(
      app,
      jwt,
      'Thomas',
      'welcome',
      15,
    );

    expect(response.status).toBe(201);
    expect(spy).toHaveBeenCalledWith('admin', 'Thomas', 15, 'welcome');
  });

  it('should return 200 on success and remove member from channel', async () => {
    const jwt = await testUtils.createUserAndJoinToChannel(
      app,
      'Karsten',
      'KarstensChannel',
      'channelPassword',
    );
    await testUtils.createUserAndJoinToChannel(
      app,
      'bannedUsername',
      'KarstensChannel',
      'channelPassword',
    );

    const response = await testUtils.banFromChannel(
      app,
      jwt,
      'KarstensChannel',
      'bannedUsername',
    );

    expect(response.status).toBe(200);
    expect(
      (await userService.getUser('bannedUsername'))?.getChannelNames(),
    ).toEqual(['welcome']);
  });
});
