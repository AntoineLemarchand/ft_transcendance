import { Test } from '@nestjs/testing';
import { Channel, ChannelType, Message } from './channel.entities';
import { ChannelService } from './channel.service';
import { BroadcastingGateway } from '../broadcasting/broadcasting.gateway';
import { ChannelRepository } from './channel.repository.mock';
import { UserService } from '../user/user.service';
import User from '../user/user.entities';

jest.spyOn(Channel.prototype, 'addMessage');
jest.spyOn(BroadcastingGateway.prototype, 'emitMessage');
// jest.spyOn(BroadcastingGateway.prototype, 'addUserToRoom');
jest.mock('../broadcasting/broadcasting.gateway');

let channelService: ChannelService;
let channelRepository: ChannelRepository;
let broadcasting: BroadcastingGateway;
let userService: UserService;
beforeEach(async () => {
  const module = await Test.createTestingModule({
    providers: [
      ChannelService,
      ChannelRepository,
      BroadcastingGateway,
      UserService,
    ],
  }).compile();
  channelService = module.get<ChannelService>(ChannelService);
  channelRepository = module.get<ChannelRepository>(ChannelRepository);
  broadcasting = module.get<BroadcastingGateway>(BroadcastingGateway);
  userService = module.get<UserService>(UserService);
});

function initChannelWithMessage() {
  channelRepository.create('newChannel', 'admin', '');
  const messageToBeSent = new Message();
  messageToBeSent.channel = 'newChannel';
  return messageToBeSent;
}

describe('Sending a message', () => {
  it('should save the message in the repository', async () => {
    const messageToBeSent = initChannelWithMessage();

    channelService.sendMessage(messageToBeSent);

    const result = await channelRepository.findOne('newChannel');
    expect(result.addMessage).toHaveBeenCalled();
  });

  it('should emit the message as event on the gateway', async () => {
    const messageToBeSent = initChannelWithMessage();

    await channelService.sendMessage(messageToBeSent);

    expect(broadcasting.emitMessage).toHaveBeenCalledWith(
      messageToBeSent.channel,
      messageToBeSent,
    );
  });
});

describe('Joining a channel', () => {
  it('should add the channelName to the user', async () => {
    await channelService.joinChannel('Thomas', 'welcom', 'channelPassword');

    const user = (await userService.getUser('Thomas')) as User;
    expect(user.getChannelNames().includes('welcom')).toBeTruthy();
  });

  it('should add the deviceID of the user to all channelNames ', async () => {
    await channelService.joinChannel('Thomas', 'ab', 'channelPassword');

    expect(broadcasting.putUserInRoom).toHaveBeenCalledWith('Thomas', 'ab');
  });

  it('should throw if attempting to join an existing private channel', async () => {
    await userService.createUser(new User('outsider', 'password'));
    await channelService.joinChannel(
      'Thomas',
      'privateChannel',
      '',
      ChannelType.Private,
    );

    await expect(() =>
      channelService.joinChannel('outsider', 'privateChannel', ''),
    ).rejects.toThrow();
  });
});

describe('Administrating a channel', () => {
  it('should prohibit a user to join a channel if he is on the ban list', async () => {
    await userService.createUser(new User('bannedUserName', ''));
    await channelService.joinChannel(
      'Thomas',
      'channelName',
      'channelPassword',
    );
    await channelService.banUserFromChannel(
      'Thomas',
      'bannedUserName',
      'channelName',
    );

    await expect(() =>
      channelService.joinChannel(
        'bannedUserName',
        'channelName',
        'channelPassword',
      ),
    ).rejects.toThrow();
  });

  it('should remove the channel from the user when banned', async () => {
    await userService.createUser(new User('bannedUserName', ''));
    await channelService.joinChannel(
      'Thomas',
      'channelName',
      'channelPassword',
    );
    await channelService.joinChannel(
      'bannedUserName',
      'channelName',
      'channelPassword',
    );
    await channelService.banUserFromChannel(
      'Thomas',
      'bannedUserName',
      'channelName',
    );

    expect(userService.getUser('bannedUserName')?.getChannelNames()).toEqual([
      'welcome',
    ]);
  });

  it('should not be allowed to ban unless admin', async () => {
    await userService.createUser(new User('randomUser', ''));
    await channelService.joinChannel(
      'Thomas',
      'channelName',
      'channelPassword',
    );

    await expect(() =>
      channelService.banUserFromChannel('randomUser', 'Thomas', 'channelName'),
    ).rejects.toThrow();
  });

  it('should add a user on invite', async () => {
    await userService.createUser(new User('randomUser', ''));
    await channelService.joinChannel(
      'Thomas',
      'privateChannel',
      'channelPassword',
      ChannelType.Private,
    );

    await channelService.inviteToChannel(
      'Thomas',
      'randomUser',
      'privateChannel',
    );

    expect(
      await userService
        .getUser('randomUser')
        ?.getChannelNames()
        .includes('privateChannel'),
    ).toBeTruthy();
  });

  it('should throw on invite while not beeing admin', async () => {
    await userService.createUser(new User('randomUser', ''));
    await userService.createUser(new User('anotherRandomUser', ''));
    await channelService.joinChannel(
      'Thomas',
      'privateChannel',
      'channelPassword',
      ChannelType.Private,
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

  it('should throw on invite on non existing channel', async () => {
    await userService.createUser(new User('randomUser', ''));

    await expect(() =>
      channelService.inviteToChannel('Thomas', 'randomUser', 'privateChannel'),
    ).rejects.toThrow();
  });

  it('should unban user on invite', async () => {
    await userService.createUser(new User('randomUser', ''));
    await channelService.joinChannel(
      'Thomas',
      'channelName',
      'channelPassword',
    );
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
      (await channelService.getChannelByName('channelName')).isUserBanned(
        'randomUser',
      ),
    ).toBeFalsy();
  });
});

//todo:
// it('should not add user with wrong password', () => {
// it('should notify other members that user joined', () => {
