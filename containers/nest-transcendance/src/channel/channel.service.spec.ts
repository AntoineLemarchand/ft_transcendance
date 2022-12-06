import { ChannelRepository } from './channel.repository.mock';
import { Test } from '@nestjs/testing';

describe('getting all messages', () => {
  let channelRepository: ChannelRepository;
  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [ChannelRepository],
    }).compile();
    channelRepository = module.get<ChannelRepository>(ChannelRepository);
  });

  it('should return an empty array on creation', async function () {
    const result = await channelRepository.findAll();
    expect(result).toEqual([]);
  });
});
