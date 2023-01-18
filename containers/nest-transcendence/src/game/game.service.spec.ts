import { Test } from '@nestjs/testing';
import { GameService } from './game.service';
import { UserService } from '../user/user.service';
import { DataSource } from 'typeorm';
import { setupDataSource, TestDatabase } from '../test.databaseFake.utils';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../user/user.entities';
import { Channel, Message } from '../channel/channel.entities';
import { GameModule } from './game.module';
import {
  GameInput,
  GameObject,
  GameOutput,
  GameProgress,
  GameStat,
} from './game.entities';
import { GameObjectRepository } from './game.currentGames.repository';
import { BroadcastingGateway } from '../broadcasting/broadcasting.gateway';
import { Collision, PlayerBar } from './game.logic';

let gameService: GameService;
let userService: UserService;
let dataSource: DataSource;
let currentGames: GameObjectRepository;
let testDataBase: TestDatabase;

beforeAll(async () => {
  testDataBase = await setupDataSource();
  dataSource = testDataBase.dataSource;
});

beforeEach(async () => {
  testDataBase.reset();
  const module = await Test.createTestingModule({
    imports: [GameModule],
  })
    .overrideProvider(getRepositoryToken(GameStat))
    .useValue(dataSource.getRepository(GameStat))
    .overrideProvider(getRepositoryToken(User))
    .useValue(dataSource.getRepository(User))
    .overrideProvider(getRepositoryToken(Channel))
    .useValue(dataSource.getRepository(Channel))
    .compile();
  gameService = module.get<GameService>(GameService);
  userService = module.get<UserService>(UserService);
  currentGames = module.get<GameObjectRepository>(GameObjectRepository);
  await userService.createUser(new User('player1', 'admin'));
  await userService.createUser(new User('player42', 'test'));
  await userService.createUser(new User('outsider', 'password'));
});

describe('setting up a game', () => {
  it('should fail to initiate when given a player twice', async () => {
    await expect(
      async () => await gameService.initGame('player1', 'player1'),
    ).rejects.toThrow();
  });

  it('should fail to initiate with a non existing player', async () => {
    await expect(
      async () => await gameService.initGame('player1', 'player2'),
    ).rejects.toThrowError('all players must be registered users');
    expect(gameService.getOpenGames().length).toBe(0);
  });

  //todo: do we need protection against ddos? -> allow only a limited number of open games

  it('should a GameObject which has not yet started', async function () {
    const result = await gameService.initGame('player1', 'player42');

    expect(result.getProgress()).toBe(GameProgress.INITIALIZED);
    expect(result.getPlayerNames()).toStrictEqual(['player1', 'player42']);
  });

  it('should add a GameObject to the list of open games', async function () {
    await gameService.initGame('player1', 'player42');

    const result: GameObject[] = gameService.getOpenGames();

    expect(result.length).toBe(1);
  });

  it('should put both players in a socket room', async function () {
    const spy = jest.spyOn(BroadcastingGateway.prototype, 'putUserInRoom');

    const game = await gameService.initGame('player1', 'player42');

    expect(spy).toHaveBeenCalledWith('player1', game.getId().toString());
    expect(spy).toHaveBeenCalledWith('player42', game.getId().toString());
  });
});

describe('starting a game', () => {
  it('should fail if the executing user is not one of the players', async () => {
    const gameObject = await gameService.initGame('player1', 'player42');

    await expect(
      async () => await gameService.setReady('outsider', gameObject.getId()),
    ).rejects.toThrow();
  });

  it('should not change the GameObject state unless both players are ready', async () => {
    const gameObject = await gameService.initGame('player1', 'player42');

    await gameService.setReady('player1', gameObject.getId());

    const result = await currentGames.findOne(gameObject.getId());
    expect(result.getProgress()).toBe(GameProgress.INITIALIZED);
  });

  it('should start the game when both players are ready', async () => {
    const spy = jest
      .spyOn(gameService, 'runGame')
      .mockImplementation(jest.fn());
    const gameObject = await gameService.initGame('player1', 'player42');

    await gameService.setReady('player1', gameObject.getId());
    await gameService.setReady('player42', gameObject.getId());

    const result = await currentGames.findOne(gameObject.getId());
    expect(result.getProgress()).toBe(GameProgress.RUNNING);
  });

  it('should not have an effect to run ready twice as same user', async () => {
    const gameObject = await gameService.initGame('player1', 'player42');

    await gameService.setReady('player1', gameObject.getId());
    await gameService.setReady('player1', gameObject.getId());

    const result = await currentGames.findOne(gameObject.getId());
    expect(result.getProgress()).toBe(GameProgress.INITIALIZED);
  });

  it('should call runGame when both players are set ready', async () => {
    const spy = jest
      .spyOn(gameService, 'runGame')
      .mockImplementation(jest.fn());
    const gameObject = await gameService.initGame('player1', 'player42');
    await gameService.setReady('player1', gameObject.getId());
    await gameService.setReady('player42', gameObject.getId());

    expect(spy).toHaveBeenCalled();
  });

  it('should not call runGame when a player is not ready', async () => {
    const spy = jest
      .spyOn(gameService, 'runGame')
      .mockImplementation(jest.fn());
    const gameObject = await gameService.initGame('player1', 'player42');
    await gameService.setReady('player1', gameObject.getId());

    expect(spy).toHaveBeenCalledTimes(0);
  });
});

describe('running a game', () => {
  it('should emit an event in case of goal', async () => {
    const spy = jest
      .spyOn(BroadcastingGateway.prototype, 'emitGameUpdate')
      .mockImplementation(jest.fn());
    const gameObject = new GameObject(0, 'p1', 'p2');
    gameObject.collision = new Collision({ x: 1, y: 1 }, 0, 1000);
    gameObject.setReady('p1');
    gameObject.setReady('p2');
    gameObject.players[0].score = 8;

    await gameService.runGame(gameObject);

    expect(spy).toHaveBeenCalledWith(
      gameObject.getId().toString(),
      new GameOutput([9, 0], GameProgress.RUNNING),
    );
  });

  it('should emit an event once the game is over', async () => {
    const spy = jest
      .spyOn(BroadcastingGateway.prototype, 'emitGameUpdate')
      .mockImplementation(jest.fn());
    const gameObject = new GameObject(0, 'p1', 'p2');
    gameObject.collision = new Collision({ x: 1, y: 1 }, 0, 1000);
    gameObject.players[0].score = 9;

    await gameService.runGame(gameObject);

    expect(spy).toHaveBeenCalledWith(
      gameObject.getId().toString(),
      new GameOutput([10, 0], GameProgress.FINISHED),
    );
  });

	it('should save game once it is finished', async () => {
		const gameObject = new GameObject(0, 'pépé', 'mémé');
		gameObject.players[0].score = 9;

		await gameService.runGame(gameObject);
		
		expect(gameObject.getProgress()).toBe(GameProgress.FINISHED);
		//console.log(await gameService.getGameById(gameObject.getId()));
		expect(
			await gameService.getGameById(gameObject.getId())
		).toBeDefined();
	});

});

describe('updating gameObjects with user input', () => {
  it('should call start moving with direction = 1', async function () {
    const gameObject = await gameService.initGame('player1', 'player42');
    const gameInput = new GameInput(
      'player1',
      'startUp',
      0,
      gameObject.getId(),
    );
    const spy = jest.spyOn(gameObject.players[0].bar, 'startMoving');

    await gameService.processUserInput(gameInput);

    expect(spy).toHaveBeenCalledWith(0, 1);
  });

  it('should call start moving with direction = -1', async function () {
    const gameObject = await gameService.initGame('player1', 'player42');
    const gameInput = new GameInput(
      'player1',
      'startDown',
      0,
      gameObject.getId(),
    );
    const spy = jest.spyOn(gameObject.players[0].bar, 'startMoving');

    await gameService.processUserInput(gameInput);

    expect(spy).toHaveBeenCalledWith(0, -1);
  });

  it('should call end moving', async function () {
    const gameObject = await gameService.initGame('player1', 'player42');
    const gameInput = new GameInput('player1', 'endUp', 0, gameObject.getId());
    const spy = jest.spyOn(gameObject.players[0].bar, 'stopMoving');

    await gameService.processUserInput(gameInput);

    expect(spy).toHaveBeenCalledWith(0);
  });
});
