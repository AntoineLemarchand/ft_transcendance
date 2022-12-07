import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as testUtils from '../test.utils';
import { AppModule } from '../app.module';

jest.mock('../broadcasting/broadcasting.gateway');

let app: INestApplication;

beforeEach(async () => {
  const module = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();
  app = module.createNestApplication();
  await app.init();
});

describe('ChannelController', () => {
  it('should not be allowed to create a channel if the user is not logged in ', async () => {
    const result = await testUtils.addChannel(app, 'invalid token', 'newChannelName');

    expect(result.status).toBe(401);
  });

  it('should not be allowed to create a channel if the channelname is already taken ', async () => {
    const jwt = await testUtils.getLoginToken(app, 'Thomas', 'test');
    await testUtils.addChannel(app, jwt, 'newChannelName');

    const result = await testUtils.addChannel(app, jwt, 'newChannelName');

    expect(result.status).toBe(401);
  });

  it('should return 201 and create a new channel if correct input is provided', async () => {
    const jwt = await testUtils.getLoginToken(app, 'Thomas', 'test');
    // await testUtils.addChannel(app, jwt, 'newChannelName2');
    const result = await testUtils.addChannel(app, jwt, 'newChannelName');

    expect(result.status).toBe(201);
    expect(await testUtils.doesChannelExist(app, jwt, 'newChannelName')).toBeTruthy();
  });
});
