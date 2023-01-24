import { Test } from '@nestjs/testing';
import { GameService } from './game.service';
import { UserService } from '../user/user.service';
import { DataSource } from 'typeorm';
import { setupDataSource, TestDatabase } from '../test.databaseFake.utils';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../user/user.entities';
import { Channel, Message } from '../channel/channel.entities';
import { GameModule } from './game.module';
import { GameInput, GameObject, GameProgress, GameStat } from './game.entities';
import { GameObjectRepository } from './game.currentGames.repository';
import { BroadcastingGateway } from '../broadcasting/broadcasting.gateway';
import { Collision } from './game.logic';

jest.mock('../broadcasting/broadcasting.gateway');

let gameService: GameService;
let userService: UserService;
let dataSource: DataSource;
let currentGames: GameObjectRepository;
let testDataBase: TestDatabase;
let broadcastingGateway: BroadcastingGateway;

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
  broadcastingGateway = module.get<BroadcastingGateway>(BroadcastingGateway);
  await userService.createUser(new User('player1', 'admin'));
  await userService.createUser(new User('player42', 'test'));
  await userService.createUser(new User('outsider', 'password'));
});

async function finishAGame(p1: string, p2: string) {
  const gameObject = await gameService.initGame(p1, p2);
  gameObject.collision = new Collision({ x: 1, y: 1 }, 0, 1000);
  await gameService.setReady(p2, gameObject.getId());
  await gameService.runGame(gameObject);
  // do not put before run game, else await will not work
  await gameService.setReady(p1, gameObject.getId());
  return gameObject;
}

describe('setting up a game', () => {
  it('should fail to initiate when given a player twice', async () => {
    await expect(
      async () => await gameService.initGame('player1', 'player1'),
    ).rejects.toThrow();
  });

  it('should fail to initiate with a non existing player', async () => {
    await expect(
      async () => await gameService.initGame('player1', 'player2'),
    ).rejects.toThrow();
    expect(gameService.getRunningGames().length).toBe(0);
  });

  it('should a GameObject which has not yet started', async function () {
    const result = await gameService.initGame('player1', 'player42');

    expect(result.getProgress()).toBe(GameProgress.INITIALIZED);
    expect(result.getPlayerNames()).toStrictEqual(['player1', 'player42']);
  });

  it('should put both players in a socket room', async function () {
    const spy = jest.spyOn(broadcastingGateway, 'putUserInRoom');

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

  it('should unset a player readiness', async () => {
    const gameObject = await gameService.initGame('player1', 'player42');
    await gameService.setReady('player1', gameObject.getId());
    await gameService.unsetReady('player1', gameObject.getId());

    expect(gameObject.players[0].ready).toBeFalsy();
  });

  it('should not unset a player readiness once the game has started and throw on trying to do so', async () => {
    jest.spyOn(gameService, 'runGame').mockImplementation(jest.fn());
    const gameObject = await finishAGame('player1', 'player42');

    expect(gameObject.players[0].ready).toBeTruthy();
  });

  it('should not unset a player readiness if not an active player and throw on trying to do so', async () => {
    const gameObject = await gameService.initGame('player1', 'player42');
    await gameService.setReady('player1', gameObject.getId());

    await expect(async () =>
      gameService.unsetReady('outsider', gameObject.getId()),
    ).rejects.toThrow();
    expect(gameObject.players[0].ready).toBeTruthy();
  });

  it('should not unset a player readiness if not an active player and throw on trying to do so', async () => {
    const gameObject = await finishAGame('player1', 'player42');
    expect(gameObject.getProgress()).toBe(GameProgress.FINISHED);

    await gameService.unsetReady('player1', gameObject.getId());
    expect(gameObject.getProgress()).toBe(GameProgress.FINISHED);

    await gameService.setReady('player1', gameObject.getId());
    expect(gameObject.getProgress()).toBe(GameProgress.FINISHED);
  });
});

describe('running a game', () => {
  it('should emit an event in case of goal', async () => {
    const spy = jest
      .spyOn(broadcastingGateway, 'emitGameUpdate')
      .mockImplementation(jest.fn());
    const gameObject = new GameObject(0, 'p1', 'p2');
    gameObject.collision = new Collision({ x: 1, y: 1 }, 0, 1000);
    gameObject.players[0].score = 8;

    await gameService.runGame(gameObject);

    expect(spy).toHaveBeenCalledWith(gameObject.getId().toString(), gameObject);
  });

  it('should emit an event once the game is over', async () => {
    const spy = jest
      .spyOn(broadcastingGateway, 'emitGameUpdate')
      .mockImplementation(jest.fn());
    const gameObject = new GameObject(0, 'p1', 'p2');
    gameObject.collision = new Collision({ x: 1, y: 1 }, 0, 1000);
    gameObject.players[0].score = 9;

    await gameService.runGame(gameObject);

    expect(spy).toHaveBeenCalledWith(gameObject.getId().toString(), gameObject);
  });

  it('should save game once it is finished', async () => {
    const gameObject = new GameObject(0, 'pépé', 'mémé');
    gameObject.collision = new Collision({ x: 1, y: 1 }, 0, 1000);
    gameObject.players[0].score = 9;

    await gameService.runGame(gameObject);

    expect(gameObject.getProgress()).toBe(GameProgress.FINISHED);
    expect(await gameService.getSavedGameById(gameObject.getId())).toBeDefined();
    expect(await gameService.getSavedGamesCount()).toBe(1);
    expect(await gameService.getSavedGamesLastId()).toBe(0);
  });
});

describe('saved games data', () => {
	it('should not be undefined when game stat repository is empty', async() => {
		expect(await gameService.getSavedGamesCount()).toBe(0);
		expect(await gameService.getSavedGamesLastId()).toBe(0);
	});
  
	it('should return all the finished games', async () => {
    const game1 = new GameObject(0, 'pépé', 'mémé');
    const game2 = new GameObject(1, 'hehe', 'haha');
    const game3 = new GameObject(2, 'huhu', 'hihi');

    game1.players[0].score = 10;
    game2.players[1].score = 10;
    game3.players[0].score = 10;

    await gameService.saveGameStat(game1);
    await gameService.saveGameStat(game2);
    await gameService.saveGameStat(game3);

    expect(await gameService.getSavedGames()).toBeDefined();
    expect(await gameService.getSavedGamesCount()).toBe(3);
  });
	
	it('should return all the player\'s finished games', async () => {
    const game1 = new GameObject(0, 'pépé', 'mémé');
    const game2 = new GameObject(1, 'mémé', 'pépé');
    const game3 = new GameObject(2, 'huhu', 'hihi');

    game1.players[0].score = 10;
    game2.players[1].score = 10;
    game3.players[0].score = 10;

    await gameService.saveGameStat(game1);
    await gameService.saveGameStat(game2);
    await gameService.saveGameStat(game3);

		expect(await gameService.getSavedGamesByPlayer('pépé')).toBeDefined();
  });
	
  it('should return all the player\'s won games', async () => {
    const game1 = new GameObject(0, 'pépé', 'mémé');
    const game2 = new GameObject(1, 'mémé', 'pépé');
    const game3 = new GameObject(2, 'mémé', 'pépé');

    game1.players[0].score = 10;
    game2.players[1].score = 10;
    game3.players[0].score = 10;

    await gameService.saveGameStat(game1);
    await gameService.saveGameStat(game2);
    await gameService.saveGameStat(game3);

		expect(await gameService.getWonGamesByPlayer('pépé')).toBeDefined();
  });
});

describe('updating gameObjects with user input', () => {
  it('should throw to update a game when not active player', async function () {
    const gameObject = await gameService.initGame('player1', 'player42');
    const gameInput = new GameInput(
      'outsider',
      'startUp',
      0,
      gameObject.getId(),
    );
    const p1Spy = jest.spyOn(gameObject.players[0].bar, 'startMoving');
    const p2Spy = jest.spyOn(gameObject.players[1].bar, 'startMoving');

    await expect(
      async () => await gameService.processUserInput(gameInput),
    ).rejects.toThrow();

    expect(p1Spy).toHaveBeenCalledTimes(0);
    expect(p2Spy).toHaveBeenCalledTimes(0);
  });

  it('should throw to update a non existing game', async function () {
    const gameObject = await gameService.initGame('player1', 'player42');
    const gameInput = new GameInput(
      'player1',
      'startUp',
      0,
      666,
    );
    await expect(
      async () => await gameService.processUserInput(gameInput),
    ).rejects.toThrow();
  });

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

  it('should send an updateGame message', async function () {
    const spy = jest
      .spyOn(broadcastingGateway, 'emitGameUpdate')
      .mockImplementation(jest.fn());
    const gameObject = await gameService.initGame('player1', 'player42');
    const gameInput = new GameInput('player1', 'endUp', 0, gameObject.getId());

    await gameService.processUserInput(gameInput);

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith(gameObject.getId().toString(), gameObject);
  });
});

describe('game info', () => {
  beforeEach(async () => {
    jest.spyOn(GameService.prototype, 'runGame').mockImplementation(jest.fn());
  });

  afterEach(async () => {
    jest.spyOn(GameService.prototype, 'runGame').mockRestore();
  });

  it('should add a GameObject to the list of running games only when both players ready', async function () {
    const gameObject = await gameService.initGame('player1', 'player42');
    await gameService.setReady(gameObject.players[0].name, gameObject.getId());
    await gameService.setReady(gameObject.players[1].name, gameObject.getId());

    const result: GameObject[] = gameService.getRunningGames();

    expect(result.length).toBe(1);
  });

  it('should return all running games', async function () {
    const gameObject = await gameService.initGame('player1', 'player42');
    await gameService.setReady('player1', gameObject.getId());
    await gameService.setReady('player42', gameObject.getId());
    await gameService.initGame('player1', 'player42');

    const result = gameService.getRunningGames();

    expect(result.length).toBe(1);
  });

  it('should return all games for user', async function () {
    const gameObject = await gameService.initGame('player1', 'player42');
    await gameService.setReady('player1', gameObject.getId());
    await gameService.setReady('player42', gameObject.getId());
    await gameService.initGame('player1', 'outsider');

    const result = gameService.getGamesForUser('player1');

    expect(result.length).toBe(2);
  });
});
