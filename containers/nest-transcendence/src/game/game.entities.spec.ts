import {GameObject} from "./game.entities";
import {Collision, PlayerBar} from "./game.logic";

describe('detecting goals', () => {
  it('should return the name of player2 when he scored', function () {
    const gameObject = new GameObject(0, 'p1', 'p2');
    gameObject.collision = new Collision({ x: 0.00000001, y: 1 }, 0, 1);

    const result = gameObject.calcScorer();
    expect(result).toStrictEqual('p2');
  });

  it('should return undefined if no goal scored', function () {
    const gameObject = new GameObject(0, 'p1', 'p2');
    gameObject.collision = new Collision({ x: 0, y: 0.5 }, 0, 1);

    const result = gameObject.calcScorer();
    expect(result).toBe(undefined);
  });

  it('should return the name of player1 when he scored', function () {
    const gameObject = new GameObject(0, 'p1', 'p2');
    gameObject.collision = new Collision({ x: 1, y: 1 }, 0, 1);

    const result = gameObject.calcScorer();
    expect(result).toStrictEqual('p1');
  });

  it('should return undefined if the ball is not on the vertical sides', function () {
    const gameObject = new GameObject(0, 'p1', 'p2');
    gameObject.collision = new Collision({ x: 0.9, y: 1 }, 0, 1);

    const result = gameObject.calcScorer();
    expect(result).toStrictEqual(undefined);
  });
})