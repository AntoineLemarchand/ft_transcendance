import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from './app.module';
import { AuthModule } from './auth/auth.module';
import * as testUtils from './test.utils';

describe('AppController', () => {
  let app: INestApplication;
  const loginUser = async (username: string, password: string) => {
    return request(app.getHttpServer()).post('/auth/login').send({
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
      imports: [AppModule, AuthModule],
    }).compile();
    app = module.createNestApplication();
    await app.init();
  });

  //GET
  it('should be possible to get Data with the jwt of login', async () => {
    const jwt = await testUtils.getLoginToken(app, 'Thomas', 'test');

    const result = await getUserData(jwt);

    expect(result.status).toBe(200);
  });
});
