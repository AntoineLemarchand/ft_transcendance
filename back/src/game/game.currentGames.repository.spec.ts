import { GameObjectRepository } from './game.currentGames.repository';
import { Test } from '@nestjs/testing';

let gameRepository: GameObjectRepository;

beforeEach(async () => {
  const module = await Test.createTestingModule({
    providers: [GameObjectRepository],
  }).compile();
  gameRepository = module.get<GameObjectRepository>(GameObjectRepository);
  gameRepository.clear();
});

async function createAGame() {
  const result = await gameRepository.create('creatorUserName', '');
  return result;
}

describe('creating a game', () => {
  it('should add a game and return a reference to it', async function () {
    const result = await createAGame();

    const allGames = await gameRepository.findAll();
    expect(result.getId()).toEqual(0);
    expect(allGames.length).toBe(1);
  });

  it('should not add a game twice', async function () {
    createAGame();

    gameRepository.create('anotherGuyWithTheSameIdea', '');

    const allGames = await gameRepository.findAll();
    expect(allGames.length).toBe(2);
    expect(allGames[0].getId()).toEqual(0);
  });
});

describe('retrieving games', () => {
  it('should return an empty array on creation', async function () {
    const result = await gameRepository.findAll();
    expect(result).toEqual([]);
  });

  it('should return a list of all games', async () => {
    await createAGame();

    const result = await gameRepository.findAll();

    expect(result.length).toBe(1);
  });

  it('should return the game matching the request name', async () => {
    await createAGame();
    await createAGame();

    const result = await gameRepository.findOne(1);

    expect(result.getId()).toBe(1);
  });
});

describe('removing a game', () => {
  it('removing a non existing game should do nothing', async () => {
    await createAGame();

    await gameRepository.remove(2);
    const result = await gameRepository.findAll();
    expect(result.length).toBe(1);
  });

  it('should remove a game', async () => {
    await createAGame();

    await gameRepository.remove(0);
    const result = await gameRepository.findAll();
    expect(result.length).toBe(0);
  });
});
