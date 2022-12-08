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
  callerModule: INestApplication,
  jwt: string,
  name: string,
) => {
  return request(callerModule.getHttpServer())
    .get('/user/info/' + name)
    .set('Authorization', 'Bearer ' + jwt);
};

export const addChannel = async (
  callerModule: INestApplication,
  jwt: string,
  channelname: string,
) => {
  return request(callerModule.getHttpServer())
    .post('/channel/join')
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
    .get('/channel/findAll')
    .set('Authorization', 'Bearer ' + jwt);
};

export const doesChannelExist = async (
  callerModule: INestApplication,
  jwt: string,
  channelname: string,
) => {
  const response = await getChannels(callerModule, jwt);
  const channels = response.body.channels;
  const allChannels: Channel[] = <Channel[]>JSON.parse(channels);
  const tmp = allChannels.find(
    (channel: any) => channel.channelName == channelname,
  );
  return tmp !== undefined;
};

export async function getMatchingChannelnames(
  callerModule: INestApplication,
  jwt: string,
  regexString: string,
) {
  const result = await request(callerModule.getHttpServer())
    .get('/channel/getMatchingNames')
    .set('Authorization', 'Bearer ' + jwt)
    .send({
      regexString: regexString,
    });
  const channelnames = result.body.channels;
  const allChannels = <string[]>JSON.parse(channelnames);
  return allChannels;
}

export async function getChannelByName(
  callerModule: INestApplication,
  jwt: string,
  channelname: string,
): Promise<Channel | undefined> {
  const raw = await request(callerModule.getHttpServer())
    .get('/channel/findOne/' + channelname)
    .set('Authorization', 'Bearer ' + jwt);
  const fromJson = JSON.parse(raw.body.channel);
  let result = Object.create(Channel.prototype);
  Object.assign(result, fromJson);
  return result;
}
