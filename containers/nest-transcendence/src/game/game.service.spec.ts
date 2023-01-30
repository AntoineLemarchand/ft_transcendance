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
import { ErrNotFound } from '../exceptions';

Object.defineProperty(performance, 'now', {
  value: jest.fn(),
  configurable: true,
  writable: true,
});

jest.spyOn(performance, 'now').mockImplementationOnce(() => 1);
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
  jest
    .spyOn(GameService.prototype, 'sleepUntil')
    .mockImplementation(async (game: GameObject) => {});
  await userService.createUser(new User('player1', 'admin'));
  await userService.createUser(new User('player42', 'test'));
  await userService.createUser(new User('outsider', 'password'));
});

async function finishAGame(p1: string, p2: string) {
  const gameObject = await gameService.initGame(p1, p2);
  gameObject.collision = new Collision({ x: 1, y: 1 }, 0, 1);
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
    const spy = jest.spyOn(broadcastingGateway, 'putUserInRoom').mockReset();

    const game = await gameService.initGame('player1', 'player42');

    expect(spy).toHaveBeenCalledWith('player1', game.getId().toString());
    expect(spy).toHaveBeenCalledWith('player42', game.getId().toString());
  });

  it('should return the existing game instead of creating a new one for a vs b and b vs a', async function () {
    const game1 = await gameService.initGame('player1', 'player42');
    const game2 = await gameService.initGame('player42', 'player1');

    expect(game1.getId()).toBe(game2.getId());
  });

  it('should return a new game if players have finished the old game', async function () {
    const game1 = await finishAGame('player1', 'player42');
    const game2 = await gameService.initGame('player1', 'player42');

    expect(game1.getId()).not.toBe(game2.getId());
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

  it('should not unset a player readiness once the game has started and throw on trying to do so (1)', async () => {
    jest.spyOn(gameService, 'runGame').mockImplementation(jest.fn());
    const gameObject = await finishAGame('player1', 'player42');

    expect(gameObject.players[0].ready).toBeTruthy();
  });

  it('should not unset a player readiness if not an active player and throw on trying to do so (2)', async () => {
    const gameObject = await gameService.initGame('player1', 'player42');
    await gameService.setReady('player1', gameObject.getId());

    await expect(async () =>
      gameService.unsetReady('outsider', gameObject.getId()),
    ).rejects.toThrow();
    expect(gameObject.players[0].ready).toBeTruthy();
  });

  it('should not unset a player readiness if not an active player and throw on trying to do so (3)', async () => {
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
    gameObject.collision = new Collision({ x: 1, y: 1 }, 0, 1);
    gameObject.players[0].score = 8;

    await gameService.runGame(gameObject);

    expect(spy).toHaveBeenCalledWith(gameObject.getId().toString(), gameObject);
  });

  it('should emit an event once the game is over', async () => {
    const spy = jest
      .spyOn(broadcastingGateway, 'emitGameUpdate')
      .mockImplementation(jest.fn());
    const gameObject = new GameObject(0, 'p1', 'p2');
    gameObject.collision = new Collision({ x: 1, y: 1 }, 0, 1);
    gameObject.players[0].score = 9;

    await gameService.runGame(gameObject);

    expect(spy).toHaveBeenCalledWith(gameObject.getId().toString(), gameObject);
  });

  it('should save game once it is finished', async () => {
    const gameObject = new GameObject(0, 'pépé', 'mémé');
    gameObject.collision = new Collision({ x: 1, y: 1 }, 0, 1);
    gameObject.players[0].score = 9;

    await gameService.runGame(gameObject);

    expect(gameObject.getProgress()).toBe(GameProgress.FINISHED);
    expect(
      (await gameService.getInfoObject(gameObject.getId())).gameStat,
    ).toBeDefined();
    expect(await gameService.getSavedGamesCount()).toBe(1);
  });
});

describe('saved games data', () => {
  it('should not be undefined when game stat repository is empty', async () => {
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
  it('should return last finished game id', async () => {
    const game1 = new GameObject(0, 'pépé', 'mémé');
    const game2 = new GameObject(1, 'hehe', 'haha');
    const game3 = new GameObject(2, 'huhu', 'hihi');

    await gameService.saveGameStat(game1);
    await gameService.saveGameStat(game2);
    await gameService.saveGameStat(game3);

    expect(await gameService.getSavedGamesLastId()).toBe(2);
  });

  it("should return all the player's finished games", async () => {
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

  it("should return all the player's won games", async () => {
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

  it("should return the player's won games count", async () => {
    const game1 = new GameObject(0, 'pépé', 'mémé');
    const game2 = new GameObject(1, 'mémé', 'pépé');
    const game3 = new GameObject(2, 'mémé', 'pépé');

    game1.players[0].score = 10;
    game2.players[1].score = 10;
    game3.players[0].score = 10;

    await gameService.saveGameStat(game1);
    await gameService.saveGameStat(game2);
    await gameService.saveGameStat(game3);

    expect(await gameService.getWonGamesCountByPlayer('pépé')).toBe(2);
  });

  it('should start games ids at 0 when no saved games', async () => {
    const gameObject = await finishAGame('player1', 'player42');
    expect(await gameObject.getId()).toBe(0);
  });

  it('should increment on saved games ids when a new gameObject is created', async () => {
    const game1 = new GameObject(1, 'pépé', 'mémé');
    const game2 = new GameObject(2, 'mémé', 'pépé');

    await gameService.saveGameStat(game1);
    await gameService.saveGameStat(game2);

    const game3 = await finishAGame('player1', 'player42');
    expect(await game3.getId()).toBe(3);
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
    const gameInput = new GameInput('player1', 'startUp', 0, 666);
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

  it('should return undefined if user not in active game', async function () {
    const result = gameService.getRunningGameForUser('player1');

    expect(result).toBeUndefined();
  });

  it('should return active game for user', async function () {
    const gameObject = await gameService.initGame('player1', 'player42');
    await gameService.setReady('player1', gameObject.getId());
    await gameService.setReady('player42', gameObject.getId());

    const result = gameService.getRunningGameForUser('player1');

    expect(result).toBe(gameObject);
  });

  it('should not return non running game for user', async function () {
    const gameObject = await gameService.initGame('player1', 'player42');
    await gameService.setReady('player1', gameObject.getId());

    const result = gameService.getRunningGameForUser('player1');

    expect(result).toBeUndefined();
  });

  it('should return GameObject but no GameStat', async function () {
    const gameObject = await gameService.initGame('player1', 'player42');

    const result = await gameService.getInfoObject(gameObject.getId());

    expect(result.gameObject).toBe(gameObject);
  });
});

describe('spectating a game', () => {
  it('should throw on trying to begin spectating a non existing game', async function () {
    await expect(async () =>
      gameService.beginSpectate('outsider', 666),
    ).rejects.toThrowError(ErrNotFound);
  });

  it('should request the gateway to place the user into the game room when beginning spectating', async function () {
    const gameObject = await gameService.initGame('player1', 'player42');
    const spy = jest.spyOn(broadcastingGateway, 'putUserInRoom').mockReset();

    await gameService.beginSpectate('outsider', gameObject.getId());

    expect(spy).toHaveBeenCalledWith('outsider', gameObject.getId().toString());
  });

  it('should throw on trying to end spectating a non existing game', async function () {
    await expect(async () =>
      gameService.endSpectate('outsider', 666),
    ).rejects.toThrowError(ErrNotFound);
  });

  it('should request the gateway to remove the user into the game room when ending spectating', async function () {
    const gameObject = await gameService.initGame('player1', 'player42');
    const spy = jest
      .spyOn(broadcastingGateway, 'removeUserFromRoom')
      .mockReset();

    await gameService.endSpectate('outsider', gameObject.getId());

    expect(spy).toHaveBeenCalledWith('outsider', gameObject.getId().toString());
  });
});

describe('matchmaking', () => {
  beforeEach(() => {
    jest
      .spyOn(gameService, 'initGame')
      .mockImplementation(async (s1: string, s2: string) => {
        return new GameObject(0, s1, s2);
      });
  });

  it('should not emit a message to the waiting room when only one user in the queue', async function () {
    const spy = jest.spyOn(broadcastingGateway, 'emitMatchMade');
    await gameService.joinMatchMaking('player1');

    expect(spy).not.toHaveBeenCalled();
  });

  it('should emit a message to the waiting room as soon as a second user tries to find a match', async function () {
    const spy = jest.spyOn(broadcastingGateway, 'emitMatchMade');
    jest
      .spyOn(gameService, 'initGame')
      .mockImplementation(async (player1name: string, player2name: string) => {
        return new GameObject(666, 'player1', 'player2');
      });
    await gameService.joinMatchMaking('player1');
    await gameService.joinMatchMaking('player2');

    expect(spy).toHaveBeenCalledWith(666);
  });

  it('should not emit a message to the waiting room when one user in the queue twice', async function () {
    const spy = jest.spyOn(broadcastingGateway, 'emitMatchMade');
    await gameService.joinMatchMaking('player1');
    await gameService.joinMatchMaking('player1');

    expect(spy).not.toHaveBeenCalled();
  });

  it('should emit two messages when creating four games', async function () {
    const spy = jest.spyOn(broadcastingGateway, 'emitMatchMade');
    await gameService.joinMatchMaking('player1');
    await gameService.joinMatchMaking('player2');
    await gameService.joinMatchMaking('player3');
    await gameService.joinMatchMaking('player4');

    expect(spy).toHaveBeenCalledTimes(2);
  });

  it('should put a waiting user in the waiting room on requesting a match', async function () {
    const spy = jest.spyOn(broadcastingGateway, 'putUserInRoom').mockReset();
    await gameService.joinMatchMaking('player1');

    expect(spy).toHaveBeenCalledWith('player1', '_waiting_room_');
  });

  it('should empty the waiting room once a game has created', async function () {
    const spy = jest
      .spyOn(broadcastingGateway, 'removeUserFromRoom')
      .mockReset();
    await gameService.joinMatchMaking('player1');
    await gameService.joinMatchMaking('player42');

    expect(spy).toHaveBeenCalledWith('player1', '_waiting_room_');
    expect(spy).toHaveBeenCalledWith('player42', '_waiting_room_');
  });

  it('should create a game', async function () {
    const spy = jest
      .spyOn(gameService, 'initGame')
      .mockImplementation(async (s1: string, s2: string) => {
        return new GameObject(0, s1, s2);
      });
    await gameService.joinMatchMaking('player1');
    await gameService.joinMatchMaking('player42');

    expect(spy).toHaveBeenCalledWith('player1', 'player42');
  });
});
