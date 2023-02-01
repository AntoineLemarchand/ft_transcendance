import {GameObject, GameProgress} from './game.entities';
import { Collision, PlayerBar } from './game.logic';

describe('detecting goals', () => {
  it('should increment the score of player2 when he scored', function () {
    const gameObject = new GameObject(0, 'p1', 'p2');
    gameObject.collision = new Collision({ x: 0.00000001, y: 1 }, 0, 1, 0.01);

    gameObject.executeStep();
    expect(gameObject.players[0].score).toBe(0);
    expect(gameObject.players[1].score).toBe(1);
  });

  it('should not increment any score if no goal scored', function () {
    const gameObject = new GameObject(0, 'p1', 'p2');
    gameObject.collision = new Collision({ x: 0+0.01, y: 0.5 }, 0, 1, 0.01);

    gameObject.executeStep();
    expect(gameObject.players[0].score).toBe(0);
    expect(gameObject.players[1].score).toBe(0);
  });

  it('should increment the score of player1 when he scored', function () {
    const gameObject = new GameObject(0, 'p1', 'p2');
    gameObject.collision = new Collision({ x: 1, y: 1 }, 0, 1, 0.01);

    gameObject.executeStep();
    expect(gameObject.players[0].score).toBe(1);
    expect(gameObject.players[1].score).toBe(0);
  });

  it('should not increment any score if the ball is not on the vertical sides', function () {
    const gameObject = new GameObject(0, 'p1', 'p2');
    gameObject.collision = new Collision({ x: 0.9, y: 1 }, 0, 1, 0.01);

    gameObject.executeStep();
    expect(gameObject.players[0].score).toBe(0);
    expect(gameObject.players[1].score).toBe(0);
  });
});

describe('executing steps', () => {
  it('should calculate the next collision after checking for goals', function () {
    const gameObject = new GameObject(0, 'p1', 'p2');
    gameObject.collision = new Collision({ x: 0.8, y: 1 }, 0, 1, 0.01);

    gameObject.executeStep();

    expect(gameObject.players[0].score).toBe(0);
  });

  it('should increment the score after a goal', function () {
    const gameObject = new GameObject(0, 'p1', 'p2');
    gameObject.collision = new Collision({ x: 0.8, y: 1 }, 0, 1, 0.01);

    gameObject.executeStep();
    gameObject.executeStep();

    expect(gameObject.players[0].score).toBe(1);
  });

  it('should set a game to terminated when the score reaches hundred', function () {
    const gameObject = new GameObject(0, 'p1', 'p2');
    gameObject.collision = new Collision({ x: 1, y: 1 }, 0, 1, 0.01);
    gameObject.players[0].score = 9;

    gameObject.executeStep();

    expect(gameObject.getProgress()).toBe(GameProgress.FINISHED);
  });

  it('should reset the ball to the middle after a goal', function () {
    const gameObject = new GameObject(0, 'p1', 'p2');
    gameObject.collision = new Collision({ x: 1, y: 1 }, 0, 1, 0.01);

    gameObject.executeStep();

    expect(gameObject.collision.getCoordinates().x).toBe(0.5);
    expect(gameObject.collision.getCoordinates().y).toBe(0.5);
  });
});
