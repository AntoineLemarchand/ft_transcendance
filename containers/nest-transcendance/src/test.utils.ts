import { Test } from '@nestjs/testing';
import { Response } from 'supertest';
import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Channel } from './channel/channel.entities';

export async function extractBearerToken(loginResponse: Promise<Test>) {
  const jwt: string = await loginResponse.then((response: Response) => {
    return response.body.access_token;
  });
  return jwt;
}

export const addFriend = async (
  callerModule: INestApplication,
  jwt: string,
  username: string,
) => {
  return request(callerModule.getHttpServer())
    .post('/user/friend')
    .set('Authorization', 'Bearer ' + jwt)
    .send({
      username: username,
    });
};

export const getFriends = async (
  callerModule: INestApplication,
  jwt: string,
) => {
  return request(callerModule.getHttpServer())
    .get('/user/friend')
    .set('Authorization', 'Bearer ' + jwt);
};

export const removeFriend = async (
  callerModule: INestApplication,
  jwt: string,
  username: string,
) => {
  return request(callerModule.getHttpServer())
    .delete('/user/friend')
    .set('Authorization', 'Bearer ' + jwt)
    .send({
      username: username,
    });
};

export const loginUser = async (
  callerModule: INestApplication,
  username: string,
  password: string,
) => {
  return request(callerModule.getHttpServer()).post('/auth/login').send({
    username: username,
    password: password,
  });
};

export const signinUser = async (
  callerModule: INestApplication,
  username: string,
  password: string,
) => {
  return request(callerModule.getHttpServer()).post('/auth/signin').send({
    username: username,
    password: password,
  });
};

export const getLoginToken = async (
  callerModule: INestApplication,
  username: string,
  password: string,
) => {
  const loginResponse = await loginUser(callerModule, username, password);
  return await loginResponse.body.access_token;
};

export const getUserData = async (
  app: INestApplication,
  jwt: string,
  name: string,
) => {
  return request(app.getHttpServer())
    .get('/user/info/' + name)
    .set('Authorization', 'Bearer ' + jwt);
};

export const addChannel = async (
  callerModule: INestApplication,
  jwt: string,
  channelname: string,
) => {
  return request(callerModule.getHttpServer())
    .post('/channel')
    .set('Authorization', 'Bearer ' + jwt)
    .send({
      channelname: channelname,
    });
};

export const getChannels = async (
  callerModule: INestApplication,
  jwt: string,
) => {
  return request(callerModule.getHttpServer())
    .get('/channel')
    .set('Authorization', 'Bearer ' + jwt);
};

export const doesChannelExist = async (
  app: INestApplication,
  jwt: string,
  channelname: string,
) => {
  const response = await getChannels(app, jwt);
  const channels = response.body.channels;
  const allChannels: Channel[] = <Channel[]>JSON.parse(channels);
  const tmp = allChannels.find(
    (channel: any) => channel.channelName == channelname,
  );
  return tmp !== undefined;
};

export async function getMatchingChannels(
  callerModule: INestApplication,
  jwt: string,
  regexString: string,
) {
  const result = await request(callerModule.getHttpServer())
    .get('/channel/search')
    .set('Authorization', 'Bearer ' + jwt)
    .send({
      regexString: regexString,
    });
  const channels = result.body.channels;
  const allChannels: Channel[] = <Channel[]>JSON.parse(channels);
  return allChannels;
}
