import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Response } from 'supertest';
import * as request from 'supertest';
import { AppModule } from './app.module';
import { AuthService } from './auth/auth.service';
import { AuthModule } from './auth/auth.module';

async function extractBearerToken(loginResponse: Promise<Test>) {
  const jwt: string = await loginResponse.then((response: Response) => {
    return response.body.access_token;
  });
  return jwt;
}

describe('AuthController', () => {
  let app: INestApplication;
  const loginUser = async (username: string, password: string) => {
    return request(app.getHttpServer()).post('/auth/login').send({
      username: username,
      password: password,
    });
  };

  const signinUser = async (username: string, password: string) => {
    return request(app.getHttpServer()).post('/auth/signin').send({
      username: username,
      password: password,
    });
  };

  const getUserData = async (jwt: string) => {
    return request(app.getHttpServer())
      .get('/profile')
      .set('Authorization', 'Bearer ' + jwt);
  };

  const getLoginToken = async (username: string, password: string) => {
    const loginResponse = await loginUser(username, password);
    return await loginResponse.body.access_token;
  };

  const addFriend = async (jwt: string, username: string) => {
    return request(app.getHttpServer())
      .post('/user/friend')
      .set('Authorization', 'Bearer ' + jwt)
      .send({
        username: username,
      });
  };

  const getFriends = async (jwt: string) => {
    return request(app.getHttpServer())
      .get('/user/friend')
      .set('Authorization', 'Bearer ' + jwt);
  };

  const removeFriend = async (jwt: string, username: string) => {
    return request(app.getHttpServer())
      .delete('/user/friend')
      .set('Authorization', 'Bearer ' + jwt)
      .send({
        username: username,
      });
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule, AuthModule],
    }).compile();
    app = module.createNestApplication();
    await app.init();
  });

  //GET
  it('should be possible to get Data with the jwt of login', async () => {
    const jwt = await getLoginToken('Thomas', 'test');

    const result = await getUserData(jwt);

    expect(result.status).toBe(200);
  });

  // FRIENDS
  it('should return 404 on adding unexisting friend', async () => {
    const jwt = await getLoginToken('Thomas', 'test');

    const result = await addFriend(jwt, 'non existing user');

    expect(result.status).toBe(404);
  });

  it('should return 401 on adding friend twice', async () => {
    const jwt = await getLoginToken('Thomas', 'test');
    signinUser('JayDee', 'yeah');
    await addFriend(jwt, 'JayDee');

    const result = await addFriend(jwt, 'JayDee');
    const friendsList = JSON.parse((await getFriends(jwt)).body.friends);

    expect(result.status).toBe(401);
    expect(friendsList.length).toBe(1);
  });

  it('should return 201 and add friend', async () => {
    const jwt = await getLoginToken('Thomas', 'test');
    signinUser('JayDee', 'yeah');

    const result = await addFriend(jwt, 'JayDee');

    expect(result.status).toBe(201);
  });

  it('should return 201 and a list of friends', async () => {
    const jwt = await getLoginToken('Thomas', 'test');
    signinUser('JayDee', 'yeah');
    addFriend(jwt, 'JayDee');

    const result = await getFriends(jwt);

    expect(result.status).toBe(200);
    expect(result.body.friends).toBeDefined();
    expect(JSON.parse(result.body.friends).length).toBe(1);
  });

  it('should return 404 when removing nonexistant friend', async () => {
    const jwt = await getLoginToken('Thomas', 'test');
    signinUser('JayDee', 'yeah');
    addFriend(jwt, 'JayDee');

    const result = await removeFriend(jwt, 'not my friend');

    expect(result.status).toBe(404);
  });

  it('should return 200 and remove friend', async () => {
    const jwt = await getLoginToken('Thomas', 'test');
    signinUser('JayDee', 'yeah');
    addFriend(jwt, 'JayDee');

    const result = await removeFriend(jwt, 'JayDee');
    const friendsList = JSON.parse((await getFriends(jwt)).body.friends);

    expect(result.status).toBe(200);
    expect(friendsList.length).toBe(0);
  });
});
