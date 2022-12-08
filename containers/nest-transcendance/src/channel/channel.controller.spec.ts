import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as testUtils from '../test.utils';
import { AppModule } from '../app.module';
import * as request from 'supertest';
import { Channel } from './channel.entities';
import { getChannels } from '../test.utils';

jest.mock('../broadcasting/broadcasting.gateway');

let app: INestApplication;

beforeEach(async () => {
  const module = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();
  app = module.createNestApplication();
  await app.init();
});

describe('joining a channel', () => {
  it('should not be allowed to create a channel if the user is not logged in ', async () => {
    const result = await testUtils.addChannel(
      app,
      'invalid token',
      'newChannelName',
    );

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
    const result = await testUtils.addChannel(app, jwt, 'newChannelName');

    expect(result.status).toBe(201);
    expect(
      await testUtils.doesChannelExist(app, jwt, 'newChannelName'),
    ).toBeTruthy();
  });
});

describe('retrieving a channel', () => {
  it('should return 404 on non existing channelname', async () => {
    const jwt = await testUtils.getLoginToken(app, 'Thomas', 'test');

    await request(app.getHttpServer())
      .get('/channel/findOne')
      .set('Authorization', 'Bearer ' + jwt)
      .send({
        channelname: 'nonExistingChannelName',
      }).expect((response) => {expect(response.status).toBe(404)});
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
})

describe('searching channels by name', () => {
  it('should return a list of channel names', async () => {
    const jwt = await testUtils.getLoginToken(app, 'Thomas', 'test');
    await testUtils.addChannel(app, jwt, 'newChannelName1');
    await testUtils.addChannel(app, jwt, 'newChannelName2');
    await testUtils.addChannel(app, jwt, 'otherChannelName1');

    const matchingChannels = await testUtils.getMatchingChannelnames(app, jwt, 'new');

    expect(matchingChannels.length).toBe(2);
    expect(matchingChannels[0]).toBe('newChannelName1');
    expect(matchingChannels[1]).toBe('newChannelName2');
  });
});
