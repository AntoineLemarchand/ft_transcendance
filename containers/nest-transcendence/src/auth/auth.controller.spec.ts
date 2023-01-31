import { INestApplication, Module } from '@nestjs/common';
import * as testUtils from '../test.request.utils';
import { DataSource } from 'typeorm';
import { setupDataSource, TestDatabase } from '../test.databaseFake.utils';
import { User } from '../typeorm';
import { createTestModule } from '../test.module.utils';
import { UserService } from '../user/user.service';
import { AuthService } from './auth.service';
import { testTwoFactorAuth } from '../test.request.utils';
import { authenticator } from 'otplib';

jest.mock('../broadcasting/broadcasting.gateway');

jest.mock('@nestjs/typeorm', () => {
  const original = jest.requireActual('@nestjs/typeorm');
  original.TypeOrmModule.forRoot = jest
    .fn()
    .mockImplementation(({}) => fakeForRoot);
  @Module({})
  class fakeForRoot {}
  return {
    ...original,
  };
});

describe('AuthController', () => {
  let app: INestApplication;
  let userService: UserService;
  let dataSource: DataSource;
  let testDataBase: TestDatabase;
  let authService: AuthService;

  beforeAll(async () => {
    testDataBase = await setupDataSource();
    dataSource = testDataBase.dataSource;
    const spy = jest
      .spyOn(AuthService.prototype, 'qrCodeStreamPipe')
      .mockImplementation(jest.fn());
  });

  beforeEach(async () => {
    testDataBase.reset();
    app = await createTestModule(dataSource);
    await app.init();
    userService = app.get<UserService>(UserService);
    authService = app.get<AuthService>(AuthService);
    await userService.createUser(new User('Thomas', 'test'));
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

  it('should return 403 on underscore in username', async () => {
    return testUtils
      .signinUser(app, '_illegal_name', 'wrong password')
      .then((response) => expect(response.status).toBe(403));
  });

  it('should return 201 and a token when creating user', async () => {
    return testUtils.signinUser(app, 'JayDee', 'yeah').then((response) => {
      expect(response.status).toBe(201);
      expect(response.body.access_token).toBeDefined();
    });
  });

  it('should return a token on login of a newly created user', async () => {
    await testUtils.signinUser(app, 'JayDee', 'yeah');
    return testUtils.loginUser(app, 'JayDee', 'yeah').then((response) => {
      expect(response.status).toBe(201);
      expect(response.body.access_token).toBeDefined();
    });
  });

  it('should add the welcome channel to newly created user', async () => {
    await testUtils.signinUser(app, 'Ginette', 'camemb3rt');
    const jwt = await testUtils.getLoginToken(app, 'Ginette', 'camemb3rt');

    const result = await testUtils.getUserData(app, jwt, 'Ginette');

    expect(result.status).toBe(200);
    expect(result.body.userInfo).toBeDefined();
    expect(result.body.userInfo.channelNames[0]).toBe('welcome');
  });

  it('should load an image on user signin with image file', async () => {
    const testImage: Buffer = Buffer.from('test image buffer');

    await testUtils.signinUser(app, 'Ginette', 'camemb3rt', testImage);
    const jwt = await testUtils.getLoginToken(app, 'Ginette', 'camemb3rt');
    const result = await testUtils.getUserData(app, jwt, 'Ginette');

    expect(result.body.userInfo.image).toBeDefined();
    expect(result.body.userInfo.imageFormat).toBe('image/png');
  });

  it('should load an empty buffer on user signin without image file', async () => {
    await testUtils.signinUser(app, 'Ginette', 'camemb3rt');
    const jwt = await testUtils.getLoginToken(app, 'Ginette', 'camemb3rt');
    const result = await testUtils.getUserData(app, jwt, 'Ginette');

    expect(result.body.userInfo.image).toBeDefined();
    expect(result.body.userInfo.imageFormat).toBe('');
  });

  //two-factor authentication
  it('should fail to activate if not logged in', async () => {
    const jwt = await testUtils.getLoginToken(
      app,
      'username',
      'wrong password',
    );
    const result = await testUtils.activateTwoFactorAuth(app, jwt);

    expect(result.status).toBe(401);
  });

  it('should call the 2fa activation logic', async () => {
    const spy = jest.spyOn(authService, 'activate2fa');
    await testUtils.signinUser(app, 'Ginette', 'camemb3rt');
    const jwt = await testUtils.getLoginToken(app, 'Ginette', 'camemb3rt');
    await testUtils.activateTwoFactorAuth(app, jwt);

    expect(spy).toHaveBeenCalledWith('Ginette');
  });

  it('should fail to log in with 2fa when not logged in with 1fa', async () => {
    const jwt = await testUtils.getLoginToken(app, 'Ginette', 'camemb3rt');
    const result = await testUtils.logInTwoFactor(app, jwt, 'code2fa');

    expect(result.status).toBe(401);
  });

  it('should call the 2fa login logic', async () => {
    const spy = jest.spyOn(authService, 'logIn2fa');
    await testUtils.signinUser(app, 'Ginette', 'camemb3rt');
    const jwt = await testUtils.getLoginToken(app, 'Ginette', 'camemb3rt');
    await testUtils.logInTwoFactor(app, jwt, 'code');

    expect(spy).toHaveBeenCalledWith('Ginette', 'code');
  });

  it('should return the new jwt token', async () => {
    const spy = jest
      .spyOn(authService, 'logIn2fa')
      .mockImplementation(async (username: string, code: string) => {
        return {access_token: 'faketoken'};
      });
    await testUtils.signinUser(app, 'Ginette', 'camemb3rt');
    const jwt = await testUtils.getLoginToken(app, 'Ginette', 'camemb3rt');
    const result = await testUtils.logInTwoFactor(app, jwt, 'code');

    expect(result.body.access_token).toStrictEqual('faketoken');
  });

  it('should be possible to reach a 2fa protected route when 2fa not activated', async () => {
    await testUtils.signinUser(app, 'Ginette', 'camemb3rt');
    const jwt = await testUtils.getLoginToken(app, 'Ginette', 'camemb3rt');
    const result = await testUtils.testTwoFactorAuth(app, jwt);

    expect(result.status).toBe(200);
  });

  it('should not be possible to reach a 2fa protected route when 2fa activated without code', async () => {
    await testUtils.signinUser(app, 'Ginette', 'camemb3rt');
    const jwt = await testUtils.getLoginToken(app, 'Ginette', 'camemb3rt');
    await testUtils.activateTwoFactorAuth(app, jwt);
    const result = await testUtils.testTwoFactorAuth(app, jwt);

    expect(result.status).toBe(401);
  });

  it('should be possible to reach a 2fa protected route when 2fa activated and code correct', async () => {
    jest.spyOn(authenticator, 'verify').mockImplementation(() => {
      return true;
    });
    await testUtils.signinUser(app, 'Ginette', 'camemb3rt');
    const jwt = await testUtils.getLoginToken(app, 'Ginette', 'camemb3rt');
    await testUtils.activateTwoFactorAuth(app, jwt);
    const jwt2faResult = await testUtils.logInTwoFactor(app, jwt, 'code');
    const jwt2fa = jwt2faResult.body.access_token;
    const result = await testUtils.testTwoFactorAuth(app, jwt2fa);

    expect(result.status).toBe(200);
  });
});
