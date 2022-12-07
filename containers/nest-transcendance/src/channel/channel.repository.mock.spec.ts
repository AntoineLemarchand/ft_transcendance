import { ChannelRepository } from './channel.repository.mock';
import { Test } from '@nestjs/testing';
import { Message } from './channel.entities';

let channelRepository: ChannelRepository;

beforeEach(async () => {
  const module = await Test.createTestingModule({
    providers: [ChannelRepository],
  }).compile();
  channelRepository = module.get<ChannelRepository>(ChannelRepository);
  channelRepository.clear();
});

async function createAChannel(channelname = 'channelName') {
  const result = await channelRepository.create(channelname, 'creatorUserName');
  return result;
}

describe('creating a channel', () => {
  it('should add a channel and return a reference to it', async function () {
    const result = await createAChannel();

    const allChannels = await channelRepository.findAll();
    expect(result.getAdmins()[0]).toEqual('creatorUserName');
    expect(allChannels.length).toBe(1);
  });

  it('should not add a channel twice', async function () {
    createAChannel();

    channelRepository
      .create('channelName', 'anotherGuyWithTheSameIdea')
      .catch(() => {});

    const allChannels = await channelRepository.findAll();
    expect(allChannels.length).toBe(1);
    expect(allChannels[0].getAdmins()[0]).toEqual('creatorUserName');
  });
});

describe('getting all channels', () => {
  it('should return an empty array on creation', async function () {
    const result = await channelRepository.findAll();
    expect(result).toEqual([]);
  });

  it('should return a none empty array when a channel is inserted', async () => {
    await createAChannel();
    const result = await channelRepository.findAll();
    expect(result.length).toBe(1);
  });
});

describe('removing a channel', () => {
  it('removing a non existing channel should do nothing', async () => {
    await createAChannel();

    await channelRepository.remove('nonexistingchannel');
    const result = await channelRepository.findAll();
    expect(result.length).toBe(1);
  });

  it('should remove a channel', async () => {
    await createAChannel();

    await channelRepository.remove('channelName');
    const result = await channelRepository.findAll();
    expect(result.length).toBe(0);
  });
});

describe('finding all channels', () => {
  it('should update channel content when a message is added', async () => {
    await createAChannel('a');
    await createAChannel('aab');
    await createAChannel('aaab');
    await createAChannel('y');

    expect((await channelRepository.findMatching('a')).length).toBe(3);
    expect((await channelRepository.findMatching('y')).length).toBe(1);
  });
});

describe('updating a channel', () => {
  it('should return all channels containing the search expression', async () => {
    await createAChannel();

    await channelRepository.addMessageToChannel('channelName', new Message());
    const result = await channelRepository.findOne('channelName');
    expect(result.getMessages().length).toBe(1);
  });
});
