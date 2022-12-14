import { Test } from '@nestjs/testing';
import { Channel, Message } from './channel.entities';
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
  channelRepository.create('newChannel', 'admin');
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

    expect(broadcasting.emitMessage).toHaveBeenCalledWith(messageToBeSent.channel, messageToBeSent);
  });

  it('creates the corresponding channel if it does not exist', async () => {
    const messageToBeSent = new Message();
    messageToBeSent.channel = 'nonExistingChannelName';

    await channelService.sendMessage(messageToBeSent);

    const nowExistingChannel = await channelRepository.findOne(
      'nonExistingChannelName',
    );
    expect(nowExistingChannel.addMessage).toHaveBeenCalled();
  });
});

describe('Joining a channel', () => {
  it('should add the channelName to the user', async () => {
    await channelService.joinChannel('Thomas', 'welcom', 'channelPassword');

    const user = (await userService.getUser('Thomas')) as User;
    expect(user.getChannelNames().includes('welcom')).toBeTruthy();
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

    expect(userService.getUser('bannedUserName')?.getChannelNames()).toEqual(['welcome']);
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
});

//todo:
// it('should not add user with wrong password', () => {
// it('should notify other members that user joined', () => {
