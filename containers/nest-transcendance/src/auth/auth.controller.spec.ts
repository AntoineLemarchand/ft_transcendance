import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { Response } from 'supertest';
import * as request from 'supertest';
import { AuthModule } from './auth.module';

describe('AuthController', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [AuthModule],
    }).compile();
    app = module.createNestApplication();
    await app.init();
  });

  const loginUser = async (username: string, password: string) => {
    return request(app.getHttpServer()).post('/login').send({
      username: username,
      password: password,
    });
  };

  const signinUser = async (username: string, password: string) => {
    return request(app.getHttpServer()).post('/signin').send({
      username: username,
      password: password,
    });
  };

  const getLoginToken = async (username: string, password: string) => {
    const loginResponse = await loginUser(username, password);
    return await loginResponse.body.access_token;
  };

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
});
