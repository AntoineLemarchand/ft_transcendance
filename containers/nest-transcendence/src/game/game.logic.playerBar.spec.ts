import { PlayerBar } from './game.logic';
describe('starting the movement of a PlayerBar', () => {
  it('should lower the bar if the direction is negative', () => {
    const playerBar = new PlayerBar({ x: 0, y: 1 }, 1, 0.2);

    playerBar.startMoving(0, -1);

    const positionAtT = playerBar.getPositionAtT(100);
    expect(positionAtT.y).toBeCloseTo(0.9);
  });

  it('should raise the bar if the direction is positive', () => {
    const playerBar = new PlayerBar({ x: 0, y: 0 }, 1, 0.2);

    playerBar.startMoving(0, 1);

    const positionAtT = playerBar.getPositionAtT(100);
    expect(positionAtT.y).toBeCloseTo(0.1);
  });

  it('should never let any part of the bar leave the screen on bottom', () => {
    const playerBar = new PlayerBar({ x: 0, y: 0 }, 1, 0.2);

    playerBar.startMoving(0, -1);

    const positionAtT = playerBar.getPositionAtT(1);
    expect(positionAtT.y).toBeCloseTo(0.1);
  });

  it('should never let any part of the bar leave the screen on top', () => {
    const playerBar = new PlayerBar({ x: 0, y: 1 }, 1, 0.2);

    playerBar.startMoving(0, 1);

    const positionAtT = playerBar.getPositionAtT(1);
    expect(positionAtT.y).toBeCloseTo(0.9);
  });

  it('should move the bar -0.5 when travelling five second with speed 0.1', () => {
    const playerBar = new PlayerBar({ x: 0, y: 1 }, 0.1, 0.2);

    playerBar.startMoving(0, -1);
    playerBar.stopMoving(5000);

    expect(playerBar.getPositionAtT(10000).y).toBeCloseTo(0.5);
  });
});

describe('ending the movement of a PlayerBar', () => {
  it('should make the new position time invariant', () => {
    const playerBar = new PlayerBar({ x: 0, y: 1 }, 1, 0.2);

    playerBar.startMoving(0, -1);
    playerBar.stopMoving(100);

    const positionAtT = playerBar.getPositionAtT(10000000);
    expect(positionAtT.y).toBeCloseTo(0.9);
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
