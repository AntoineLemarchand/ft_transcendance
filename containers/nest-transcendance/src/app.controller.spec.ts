import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from './app.module';
import { response } from 'express';

async function extractBearerToken(loginResponse: supertest.Test) {
  const jwt: string = await loginResponse.then((response) => {
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

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = module.createNestApplication();
    await app.init();
  });

  // LOGIN
  it('should return 401 on wrong password', async () => {
    return loginUser('Thomas', 'wrong password').then((response) =>
      expect(response.status).toBe(401),
    );
  });

  it('should return 401 on non existing username', async () => {
    return loginUser('non existing user', 'test').then((response) =>
      expect(response.status).toBe(401),
    );
  });

  it('should return 201 and access token on successful login', async () => {
    return loginUser('Thomas', 'test').then((response) => {
      expect(response.status).toBe(201);
      expect(response.body.access_token).toBeDefined();
    });
  });

  // SIGNIN
  it('should return 401 when creating an already existent user', async () => {
    return signinUser('Thomas', 'test').then((response) =>
      expect(response.status).toBe(401),
    );
  });

  it('should return 201 and a token when creating user', async () => {
    return signinUser('JayDee', 'yeah').then((response) => {
      expect(response.status).toBe(201);
      expect(response.body.access_token).toBeDefined();
    });
  });

  it('should return a token on login of a newly created user', async () => {
    signinUser('JayDee', 'yeah');
    return loginUser('JayDee', 'yeah').then((response) => {
      expect(response.status).toBe(201);
      expect(response.body.access_token).toBeDefined();
    });
  });

  //GET
  it('should be possible to get Data with the jwt of login', async () => {
    const loginResponse = loginUser('Thomas', 'test');
    const jwt = await extractBearerToken(loginResponse);

    const result = getUserData(jwt);

    return result.then((response) => {
      expect(response.status).toBe(200);
    });
  });
});
