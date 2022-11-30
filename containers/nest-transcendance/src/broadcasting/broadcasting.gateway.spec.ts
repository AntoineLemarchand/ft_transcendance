import { Test, TestingModule } from '@nestjs/testing';
import { BroadcastingGateway } from './broadcasting.gateway';

describe('BroadcastingGateway', () => {
  let gateway: BroadcastingGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BroadcastingGateway],
    }).compile();

    gateway = module.get<BroadcastingGateway>(BroadcastingGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
