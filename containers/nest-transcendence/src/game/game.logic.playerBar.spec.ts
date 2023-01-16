import { PlayerBar } from './game.logic';
describe('starting the movement of a PlayerBar', () => {
  it('should lower the bar if the direction is negative', () => {
    const playerBar = new PlayerBar({ x: 0, y: 1 }, 1, 0.2);

    playerBar.startMoving(0, -1);

    const positionAtT = playerBar.getPositionAtT(0.1);
    expect(positionAtT.y).toBeCloseTo(0.9);
  });

  it('should raise the bar if the direction is positive', () => {
    const playerBar = new PlayerBar({ x: 0, y: 0 }, 1, 0.2);

    playerBar.startMoving(0, 1);

    const positionAtT = playerBar.getPositionAtT(0.1);
    expect(positionAtT.y).toBeCloseTo(0.1);
  });

  it('should move into negative y', () => {
    const playerBar = new PlayerBar({ x: 0, y: 0 }, 1, 0.2);

    playerBar.startMoving(0, -1);

    const positionAtT = playerBar.getPositionAtT(1);
    expect(positionAtT.y).toBeCloseTo(0);
  });

  it('should never move above y = 1', () => {
    const playerBar = new PlayerBar({ x: 0, y: 1 }, 1, 0.2);

    playerBar.startMoving(0, 1);

    const positionAtT = playerBar.getPositionAtT(1);
    expect(positionAtT.y).toBeCloseTo(1);
  });
});

describe('ending the movement of a PlayerBar', () => {
  it('should make the new position time invariant', () => {
    const playerBar = new PlayerBar({ x: 0, y: 1 }, 1, 0.2);

    playerBar.startMoving(0, -1);
    playerBar.stopMoving(1);

    const positionAtT = playerBar.getPositionAtT(100);
    expect(positionAtT.y).toBeCloseTo(0);
  });
});

describe('calculating a contact', () => {
  it('should return false if a coordinate below the bar', () => {
    const playerBar = new PlayerBar({ x: 0, y: 1 }, 1, 0.2);

    const result = playerBar.isContact({ x: 0, y: 0 });
    expect(result).toBeFalsy();
  });

  it('should return false if a coordinate above the bar', () => {
    const playerBar = new PlayerBar({ x: 0, y: 0 }, 1, 0.2);

    const result = playerBar.isContact({ x: 0, y: 1 });
    expect(result).toBeFalsy();
  });
});
