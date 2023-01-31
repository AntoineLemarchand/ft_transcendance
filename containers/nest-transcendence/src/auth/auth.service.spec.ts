import { Test } from '@nestjs/testing';
import { BroadcastingGateway } from '../broadcasting/broadcasting.gateway';
import { UserService } from '../user/user.service';
import { User } from '../user/user.entities';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { setupDataSource, TestDatabase } from '../test.databaseFake.utils';
import { GameStat } from '../game/game.entities';
import { GameModule } from '../game/game.module';
import { AuthModule } from './auth.module';
import { ChannelService } from '../channel/channel.service';
import { Channel } from '../channel/channel.entities';
import { AuthService } from './auth.service';
import { authenticator } from 'otplib';
import { JwtTwoFaStrategy } from './auth.2fa.strategy';
import { ErrUnAuthorized } from '../exceptions';
import { asSingleQName } from 'pg-mem/types/utils';
import { ExtractJwt } from 'passport-jwt';
import fromAuthHeaderWithScheme = ExtractJwt.fromAuthHeaderWithScheme;

jest.spyOn(Channel.prototype, 'addMessage');
jest.spyOn(BroadcastingGateway.prototype, 'emitMessage');
jest.mock('../broadcasting/broadcasting.gateway');

let jwtTwoFaStrategy: JwtTwoFaStrategy;
let userService: UserService;
let dataSource: DataSource;
let testDataBase: TestDatabase;
let authService: AuthService;

beforeAll(async () => {
  testDataBase = await setupDataSource();
  dataSource = testDataBase.dataSource;
  jest.spyOn(authenticator, 'generateSecret').mockImplementation(() => {
    return 'this is a 2fa secret';
  });
  jest
    .spyOn(authenticator, 'keyuri')
    .mockImplementation((username: string, app: string, secret: string) => {
      return 'this url is for the QR-code';
    });
});

beforeEach(async () => {
  testDataBase.reset();
  const module = await Test.createTestingModule({
    imports: [AuthModule],
  })
    .overrideProvider(getRepositoryToken(GameStat))
    .useValue(dataSource.getRepository(GameStat))
    .overrideProvider(getRepositoryToken(User))
    .useValue(dataSource.getRepository(User))
    .overrideProvider(getRepositoryToken(Channel))
    .useValue(dataSource.getRepository(Channel))
    .compile();
  jwtTwoFaStrategy = module.get<JwtTwoFaStrategy>(JwtTwoFaStrategy);
  userService = module.get<UserService>(UserService);
  authService = module.get<AuthService>(AuthService);
});

describe('creating users', () => {
  it('should not have 2fa on creation', async function () {
    const username = 'test';
    await authService.createUser({ username: username, password: 'fromage' });

    const newUser = await userService.getUser(username);
    expect(newUser.secret2fa).toStrictEqual('');
  });
});

describe('activating 2fa', () => {
  it('should define the secret', async function () {
    const username = 'test';
    await authService.createUser({ username: username, password: 'fromage' });
    await authService.activate2fa(username);

    const newUser = (await userService.getUser(username)) as User;
    expect(newUser.secret2fa).toStrictEqual('this is a 2fa secret');
  });

  it('should return the otpAuthUrl', async function () {
    const username = 'test';
    await authService.createUser({ username: username, password: 'fromage' });
    const result = await authService.activate2fa(username);

    expect(result).toStrictEqual('this url is for the QR-code');
  });
});

describe('logging in with 2fa', () => {
  beforeEach(async () => {
    jest
      .spyOn(authenticator, 'verify')
      .mockImplementation((opts: { token: string; secret: string }) => {
        return opts.token === 'correct code';
      });
    await authService.createUser({ username: 'username', password: 'empty' });
    await authService.activate2fa('username');
  });

  it('should throw if the challenge fails', async function () {
    await expect(async () =>
      authService.logIn2fa('username', 'wrong code'),
    ).rejects.toThrowError(ErrUnAuthorized);
  });

  it('should generate an updated jwt if the challenge succeeded', async function () {
    const result = await authService.logIn2fa('username', 'correct code');

    expect(result).toBeDefined();
  });

  it('should call the function that generates an updated jwt if the challenge succeeded', async function () {
    const spy = jest
      .spyOn(authService, 'generateJwt')
      .mockImplementation(async () => {
        return { access_token: 'faketoken' };
      });
    await authService.logIn2fa('username', 'correct code');

    expect(spy).toHaveBeenCalledWith({
      user: {
        hasSucceeded2Fa: true,
        name: 'username',
      },
    });
  });
});

describe('validating 2fa', () => {
  it('should fail to validate when 2fa enabled but without having sent the 2fa validation', async function () {
    const username = 'test';
    await authService.createUser({ username: username, password: 'fromage' });
    await authService.activate2fa(username);
    const decryptedJwt = { username: username };

    await expect(async () =>
      jwtTwoFaStrategy.validate(decryptedJwt),
    ).rejects.toThrow();
  });

  it('should validate with disabled 2fa', async function () {
    const username = 'test';
    await authService.createUser({ username: username, password: 'fromage' });
    const decryptedJwt = { user: { name: username } };

    const result = await jwtTwoFaStrategy.validate(decryptedJwt);
    const newUser = (await userService.getUser(username)) as User;
    expect(result).toStrictEqual(newUser);
  });

  it('should validate with enabled 2fa and correct code', async function () {
    const username = 'test';
    await authService.createUser({ username: username, password: 'fromage' });
    await authService.activate2fa(username);
    const decryptedJwt = { user: { name: username, hasSucceeded2Fa: true } };

    const result = await jwtTwoFaStrategy.validate(decryptedJwt);
    const newUser = (await userService.getUser(username)) as User;
    expect(result).toStrictEqual(newUser);
  });
});
