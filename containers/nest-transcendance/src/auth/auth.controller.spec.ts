import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as testUtils from '../test.utils';
import { AppModule } from '../app.module';

describe('AuthController', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = module.createNestApplication();
    await app.init();
  });

  // LOGIN
  it('should return 401 on wrong password', async () => {
    return testUtils
      .loginUser(app, 'Thomas', 'wrong password')
      .then((response) => expect(response.status).toBe(401));
  });

  it('should return 401 on non existing username', async () => {
    return testUtils
      .loginUser(app, 'non existing user', 'test')
      .then((response) => expect(response.status).toBe(401));
  });

  it('should return 201 and access token on successful login', async () => {
    return testUtils.loginUser(app, 'Thomas', 'test').then((response) => {
      expect(response.status).toBe(201);
      expect(response.body.access_token).toBeDefined();
    });
  });

  // SIGNIN
  it('should return 401 when creating an already existent user', async () => {
    return testUtils
      .signinUser(app, 'Thomas', 'test')
      .then((response) => expect(response.status).toBe(401));
  });

  it('should return 201 and a token when creating user', async () => {
    return testUtils.signinUser(app, 'JayDee', 'yeah').then((response) => {
      expect(response.status).toBe(201);
      expect(response.body.access_token).toBeDefined();
    });
  });

  it('should return a token on login of a newly created user', async () => {
    testUtils.signinUser(app, 'JayDee', 'yeah');
    return testUtils.loginUser(app, 'JayDee', 'yeah').then((response) => {
      expect(response.status).toBe(201);
      expect(response.body.access_token).toBeDefined();
    });
  });
});
