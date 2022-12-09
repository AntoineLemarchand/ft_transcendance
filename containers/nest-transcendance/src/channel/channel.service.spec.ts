import { Test } from '@nestjs/testing';
import { Channel, Message } from './channel.entities';
import { ChannelService } from './channel.service';
import { BroadcastingGateway } from '../broadcasting/broadcasting.gateway';
import { ChannelRepository } from './channel.repository.mock';
import { UserService } from '../user/user.service';
jest.spyOn(Channel.prototype, 'addMessage');
jest.spyOn(BroadcastingGateway.prototype, 'emitMessage');
jest.mock('../broadcasting/broadcasting.gateway');

let channelService: ChannelService;
let channelRepository: ChannelRepository;
let broadcasting: BroadcastingGateway;
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

    expect(broadcasting.emitMessage).toHaveBeenCalled();
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
  });

  //todo:
  // it('should create a channel when trying to join a non existing ', () => {
  // it('should not add banned usernames to a channel', () => {
  // it('should not add user with wrong password', () => {
  // it('should notify other members that user joined', () => {
});
