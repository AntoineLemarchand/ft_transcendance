import { Test } from '@nestjs/testing';
import { Channel, Message } from './channel.entities';
import { ChannelService } from './channel.service';
import { BroadcastingGateway } from '../broadcasting/broadcasting.gateway';
import { UserService } from '../user/user.service';
import { User } from '../user/user.entities';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { setupDataSource, TestDatabase } from '../test.databaseFake.utils';
import { ChannelModule } from './channel.module';
import { GameStat } from '../game/game.entities';
import { executionCtx } from "pg-mem/types/utils";
import {RoomHandler} from "../broadcasting/broadcasting.roomHandler";
import {Server} from "socket.io";

jest.spyOn(Channel.prototype, 'addMessage');
jest.spyOn(BroadcastingGateway.prototype, 'emitMessage');
jest.mock('../broadcasting/broadcasting.gateway');
jest.spyOn(global, 'setTimeout').mockImplementation(jest.fn());
jest
  .spyOn(BroadcastingGateway.prototype, 'getRoomHandler')
  .mockImplementation(() => {
    return new RoomHandler(new Server());
  });

let channelService: ChannelService;
let broadcasting: BroadcastingGateway;
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
    imports: [ChannelModule],
  })
    .overrideProvider(getRepositoryToken(GameStat))
    .useValue(dataSource.getRepository(GameStat))
    .overrideProvider(getRepositoryToken(User))
    .useValue(dataSource.getRepository(User))
    .overrideProvider(getRepositoryToken(Channel))
    .useValue(dataSource.getRepository(Channel))
    .compile();
  channelService = module.get<ChannelService>(ChannelService);
  broadcasting = module.get<BroadcastingGateway>(BroadcastingGateway);
  userService = module.get<UserService>(UserService);
  await userService.createUser(new User('admin', 'admin'));
  await userService.createUser(new User('Thomas', 'test'));
  await channelService.joinChannel('admin', 'welcom', '');
  await channelService.joinChannel('admin', 'wlcm', '');
  await channelService.joinChannel('admin', 'ab', '');
});

async function initChannelWithMessage() {
  await channelService.joinChannel('admin', 'newChannel', '');
  const messageToBeSent = new Message();
  messageToBeSent.channel = 'newChannel';
  return messageToBeSent;
}

describe('Sending a message', () => {
  it('should save the message in the repository', async () => {
    const messageToBeSent = await initChannelWithMessage();

    channelService.sendMessage(messageToBeSent);

    const result = await channelService.getChannelByName('newChannel');
    expect(result.addMessage).toHaveBeenCalled();
  });

  it('should emit the message as event on the gateway', async () => {
    const messageToBeSent = await initChannelWithMessage();

    await channelService.sendMessage(messageToBeSent);

    expect(broadcasting.emitMessage).toHaveBeenCalledWith(
      messageToBeSent.channel,
      messageToBeSent,
    );
  });
});

describe('Joining a channel', () => {
  it('should add the channelName to the user', async () => {
    await channelService.joinChannel('Thomas', 'welcom', '');

    const user = (await userService.getUser('Thomas')) as User;
    expect(user.getChannelNames().includes('welcom')).toBeTruthy();
  });

  it('should hash password', async () => {
    const channelName = 'hello';
    const channelPlaintextPass = 'hell0';

    await channelService.joinChannel(
      'Thomas',
      channelName,
      channelPlaintextPass,
    );
    const channel = await channelService.getChannelByName(channelName);
    expect(channel.getPassword()).toEqual(
      expect.not.stringContaining(channelPlaintextPass),
    );
  });

  it('should not be possible to join a channel with the wrong password', async () => {
    await expect(() =>
      channelService.joinChannel('Thomas', 'welcom', 'channelPassword'),
    ).rejects.toThrow();
  });

  it('should add the deviceID of the user to all channelNames ', async () => {
    await channelService.joinChannel('Thomas', 'welcom', '');

    expect(broadcasting.putUserInRoom).toHaveBeenCalledWith('Thomas', 'welcom');
  });

  it('should not be possible to use underscores in names of multi user channels', async () => {
    await expect(() =>
      channelService.joinChannel(
        'Thomas',
        'illegal_channelName',
        'channelPassword',
      ),
    ).rejects.toThrow();
  });

  it('should not be possible to use numbers in names of multi user channels', async () => {
    await expect(() =>
      channelService.joinChannel(
        'Thomas',
        'illegalChannelName69 ',
        'channelPassword',
      ),
    ).rejects.toThrow();
  });

  it('should throw if attempting to join an existing private channel', async () => {
    await userService.createUser(new User('outsider', 'password'));
    await channelService.joinChannel(
      'Thomas',
      'privateChannel',
      '',
      'privateChannel',
    );

    await expect(() =>
      channelService.joinChannel('outsider', 'privateChannel', ''),
    ).rejects.toThrow();
  });
});

describe('direct messaging', () => {
  beforeEach(async () => {
    await userService.createUser(new User('HisFriend', ''));
    await userService.createUser(new User('Thomas', ''));
  });

  afterEach(async () => {
    await userService.deleteUser('HisFriend');
    await userService.deleteUser('Thomas');
  });

  it('should only be possible to use underscores in direct message channels', async () => {
    await expect(() =>
      channelService.joinChannel(
        'Thomas',
        '_directMessageName',
        'channelPassword',
        'directMessage',
      ),
    ).not.toThrow();
  });

  it('should create a channel for direct messaging', async () => {
    await channelService.createDirectMessageChannelFor('Thomas', 'HisFriend');

    expect(
      await channelService.getChannelByName('HisFriend_Thomas'),
    ).toBeDefined();
  });

  it('should create only one channel for direct messaging', async () => {
    const channelCountBefore = (await channelService.getChannels()).length;
    await channelService.createDirectMessageChannelFor('Thomas', 'HisFriend');
    await channelService.createDirectMessageChannelFor('HisFriend', 'Thomas');

    const channelCountAfter = (await channelService.getChannels()).length;
    expect(channelCountAfter).toBe(channelCountBefore + 1);
  });

  it('should invite the target user to the direct message', async () => {
    await channelService.createDirectMessageChannelFor('Thomas', 'HisFriend');

    expect(
      (await await userService.getUser('HisFriend'))
        ?.getChannelNames()
        .includes('HisFriend_Thomas'),
    ).toBeTruthy();
  });

  it('should make the target user an admin', async () => {
    await channelService.createDirectMessageChannelFor('Thomas', 'HisFriend');

    const result = await channelService.getChannelByName('HisFriend_Thomas');
    expect(result?.isAdmin('HisFriend')).toBeTruthy();
  });
});

describe('Administrating a channel', () => {
  beforeEach(async () => {
    await channelService.joinChannel(
      'Thomas',
      'channelName',
      'channelPassword',
    );
    await userService.createUser(new User('randomUser', ''));
  });

  it('should not be allowed for regular users to make other users admin', async () => {
    await expect(() =>
      channelService.makeAdmin('randomUser', 'Thomas', 'channelName'),
    ).rejects.toThrow();
  });

  it('should turn random user into an admin', async () => {
    await channelService.makeAdmin('Thomas', 'randomUser', 'channelName');

    expect(
      (
        (await channelService.getChannelByName('channelName')) as Channel
      ).isAdmin('randomUser'),
    ).toBeTruthy();
  });

  it('should prohibit a user to join a channel if he is on the ban list', async () => {
    await userService.createUser(new User('bannedUsername', 'channelPassword'));
    await channelService.banUserFromChannel(
      'Thomas',
      'bannedUsername',
      'channelName',
    );

    await expect(() =>
      channelService.joinChannel(
        'bannedUsername',
        'channelName',
        'channelPassword',
      ),
    ).rejects.toThrow();
  });

  it('should not be possible to ban an owner', async () => {
    await userService.createUser(new User('newAdmin', ''));
    await channelService.joinChannel(
      'newAdmin',
      'channelName',
      'channelPassword',
    );
    await channelService.makeAdmin('Thomas', 'newAdmin', 'channelName');

    await expect(() =>
      channelService.banUserFromChannel('newAdmin', 'Thomas', 'channelName'),
    ).rejects.toThrow();
  });

  it('should remove the channel from the user when banned', async () => {
    const spy = jest.spyOn(RoomHandler.prototype, 'leave');
    await userService.createUser(new User('bannedUsername', ''));
    await channelService.joinChannel(
      'bannedUsername',
      'channelName',
      'channelPassword',
    );
    await channelService.banUserFromChannel(
      'Thomas',
      'bannedUsername',
      'channelName',
    );

    expect(
      (await userService.getUser('bannedUsername'))?.getChannelNames(),
    ).toEqual(['welcome']);
    expect(spy).toHaveBeenCalledWith('bannedUsername', 'channelName');
  });

  it('should not post any messages when user banned', async () => {
    const spy = jest.spyOn(broadcasting, "emitMessage");
    await userService.createUser(new User('bannedUsername', ''));
    await channelService.joinChannel(
      'bannedUsername',
      'channelName',
      'channelPassword',
    );
    await channelService.banUserFromChannel(
      'Thomas',
      'bannedUsername',
      'channelName',
    );

    const msg = new Message();
    msg.channel = "channelName";
    msg.sender = "bannedUsername";
    msg.content = "test";
    await channelService.sendMessage(msg);

    expect(spy).not.toHaveBeenCalled();
  });

  it('should not be allowed to ban unless admin', async () => {
    await expect(() =>
      channelService.banUserFromChannel('randomUser', 'Thomas', 'channelName'),
    ).rejects.toThrow();
  });

  it('should add a user on invite', async () => {
    await channelService.joinChannel(
      'Thomas',
      'privateChannel',
      'channelPassword',
      'privateChannel',
    );

    await channelService.inviteToChannel(
      'Thomas',
      'randomUser',
      'privateChannel',
    );

    expect(
      await (await userService.getUser('randomUser'))
        ?.getChannelNames()
        .includes('privateChannel'),
    ).toBeTruthy();
  });

  it('should throw on invite while not beeing admin', async () => {
    await userService.createUser(new User('anotherRandomUser', ''));
    await channelService.joinChannel(
      'Thomas',
      'privateChannel',
      'channelPassword',
      'privateChannel',
    );
    await channelService.inviteToChannel(
      'Thomas',
      'randomUser',
      'privateChannel',
    );

    await expect(() =>
      channelService.inviteToChannel(
        'randomUser',
        'anotherRandomUser',
        'privateChannel',
      ),
    ).rejects.toThrow();
  });

  it('should throw if trying to change the password without being an admin', async () => {
    await expect(
      async () =>
        await channelService.setPassword('Thomas', 'newPassword', 'welcom'),
    ).rejects.toThrow();
  });

  it('should change the password', async () => {
    await channelService.setPassword('admin', 'newPassword', 'welcome');

    expect(
      (await channelService.getChannelByName('welcome')).comparePassword(
        'newPassword',
      ),
    ).toBeTruthy();
  });

  it('should ignore password of welcome channel', async () => {
    await channelService.setPassword('admin', 'newPassword', 'welcome');
    await userService.createUser(new User('does not know the', 'password'));
  });

  it('should throw if trying mute to a member without being an admin', async () => {
    await expect(
      async () =>
        await channelService.muteMemberForMinutes(
          'Thomas',
          'mutedUsername',
          15,
          'welcom',
        ),
    ).rejects.toThrow();
  });

  it('should throw if trying mute the owner', async () => {
    await expect(
      async () =>
        await channelService.muteMemberForMinutes(
          'admin',
          'admin',
          15,
          'welcom',
        ),
    ).rejects.toThrow();
  });

  it('should throw if trying to mute a non member user', async () => {
    await expect(
      async () =>
        await channelService.muteMemberForMinutes(
          'admin',
          'nonExistingUsername',
          15,
          'welcom',
        ),
    ).rejects.toThrow();
  });

  it('should throw if trying to mute a non member user', async () => {
    await userService.createUser(new User('mutedUsername', ''));

    await expect(
      async () =>
        await channelService.muteMemberForMinutes(
          'admin',
          'mutedUsername',
          15,
          'welcom',
        ),
    ).rejects.toThrow();
  });

  it('should return true when a user has been muted', async () => {
    const channel = new Channel('channelName', 'admin');

    channel.muteUser('username', 15);

    expect(channel.isUserMuted('username')).toBeTruthy();
  });

  it('should return false after timeout', async () => {
    const channel = new Channel('channelName', 'admin');

    channel.muteUser('username', 0);

    expect(channel.isUserMuted('username')).toBeFalsy();
  });

  it('should return false if user never has been muted', async () => {
    const channel = new Channel('channelName', 'admin');

    expect(channel.isUserMuted('username')).toBeFalsy();
  });

  it('should throw on invite on non existing channel', async () => {
    await expect(() =>
      channelService.inviteToChannel(
        'Thomas',
        'randomUser',
        'non existing channel name',
      ),
    ).rejects.toThrow();
  });

  it('should unban user on invite', async () => {
    await channelService.joinChannel(
      'randomUser',
      'channelName',
      'channelPassword',
    );
    await channelService.banUserFromChannel(
      'Thomas',
      'randomUser',
      'channelName',
    );

    await channelService.inviteToChannel('Thomas', 'randomUser', 'channelName');
    expect(
      (
        (await channelService.getChannelByName('channelName')) as Channel
      ).isUserBanned('randomUser'),
    ).toBeFalsy();
  });
});
