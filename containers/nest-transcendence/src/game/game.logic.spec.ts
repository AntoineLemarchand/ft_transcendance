import {
  calcNewAngle,
  deg2rad,
  getArrival,
  getCollisions,
  rad2deg,
  WallDirection,
} from './game.logic';
describe('calculate new angle', () => {
  it('should return the correct angle for wall on right, comming from below', () => {
    const incommingAngle = deg2rad(30);

    const result: number = calcNewAngle(incommingAngle, WallDirection.Vertical);

    expect(rad2deg(result)).toBeCloseTo(150);
  });

  it('should return the correct angle for wall on right, comming from above', () => {
    const incommingAngle = deg2rad(330);

    const result: number = calcNewAngle(incommingAngle, WallDirection.Vertical);

    expect(rad2deg(result)).toBeCloseTo(210);
  });

  it('should return the correct angle for wall on left, comming from below', () => {
    const incommingAngle = deg2rad(150);

    const result: number = calcNewAngle(incommingAngle, WallDirection.Vertical);

    expect(rad2deg(result)).toBeCloseTo(30);
  });

  it('should return the correct angle for wall on left, comming from above', () => {
    const incommingAngle = deg2rad(210);

    const result: number = calcNewAngle(incommingAngle, WallDirection.Vertical);

    expect(rad2deg(result)).toBeCloseTo(330);
  });

  it('should return the correct angle for wall above, comming from left', () => {
    const incommingAngle = deg2rad(30);

    const result: number = calcNewAngle(
      incommingAngle,
      WallDirection.Horizontal,
    );

    expect(rad2deg(result)).toBeCloseTo(330);
  });

  it('should return the correct angle for wall above, comming from right', () => {
    const incommingAngle = deg2rad(150);

    const result: number = calcNewAngle(
      incommingAngle,
      WallDirection.Horizontal,
    );

    expect(rad2deg(result)).toBeCloseTo(210);
  });

  it('should return the correct angle for wall below, comming from left', () => {
    const incommingAngle = deg2rad(330);

    const result: number = calcNewAngle(
      incommingAngle,
      WallDirection.Horizontal,
    );

    expect(rad2deg(result)).toBeCloseTo(30);
  });

  it('should return the correct angle for wall below, comming from right', () => {
    const incommingAngle = deg2rad(210);

    const result: number = calcNewAngle(
      incommingAngle,
      WallDirection.Horizontal,
    );

    expect(rad2deg(result)).toBeCloseTo(150);
  });
});

describe('Calculate Next Point', () => {});

describe('get collision', () => {
  it('should return a point on the right', () => {
    const origin = { x: 0, y: 0.5 };
    const angle = 0;

    const result = getCollisions(origin, angle);
    expect(result.x).toBeCloseTo(1);
    expect(result.y).toBeCloseTo(0.5);
  });

  it('should return a point on the left', () => {
    const origin = { x: 1, y: 0.5 };
    const angle = deg2rad(180);

    const result = getCollisions(origin, angle);
    expect(result.x).toBeCloseTo(0);
    expect(result.y).toBeCloseTo(0.5);
  });

  it('should return a point on the left from middle', () => {
    const origin = { x: 0.5, y: 0.5 };
    const angle = deg2rad(180);

    const result = getCollisions(origin, angle);
    expect(result.x).toBeCloseTo(0);
    expect(result.y).toBeCloseTo(0.5);
  });

  it('should return a point on the right from middle', () => {
    const origin = { x: 0.5, y: 0.5 };
    const angle = deg2rad(0);

    const result = getCollisions(origin, angle);
    expect(result.x).toBeCloseTo(1);
    expect(result.y).toBeCloseTo(0.5);
  });

  it('should return closest collision', () => {
    const origin = { x: 0.5, y: 0.5 };
    const angle = deg2rad(60);

    const result = getCollisions(origin, angle);
    expect(result.x).toBeCloseTo(0.7886751);
    expect(result.y).toBeCloseTo(1);
  });

  it('should return a point above the origin', () => {
    const origin = { x: 0.5, y: 0 };
    const angle = deg2rad(90);

    const result = getCollisions(origin, angle);
    expect(result.x).toBeCloseTo(0.5);
    expect(result.y).toBeCloseTo(1);
  });

  it('should return a point below the origin', () => {
    const origin = { x: 0.5, y: 1 };
    const angle = deg2rad(270);

    const result = getCollisions(origin, angle);
    expect(result.x).toBeCloseTo(0.5);
    expect(result.y).toBeCloseTo(0);
  });

  it('should return a point below the origin', () => {
    const origin = { x: 0.5, y: 0.5 };
    const angle = deg2rad(270);

    const result = getCollisions(origin, angle);
    expect(result.x).toBeCloseTo(0.5);
    expect(result.y).toBeCloseTo(0);
  });

  it('should return a point above the origin', () => {
    const origin = { x: 0.5, y: 0.5 };
    const angle = deg2rad(90);

    const result = getCollisions(origin, angle);
    expect(result.x).toBeCloseTo(0.5);
    expect(result.y).toBeCloseTo(1);
  });

  it('should return collision with wall above', () => {
    const origin = { x: 0.5, y: 0.5 };
    const angle = deg2rad(60);

    const result = getCollisions(origin, angle);
    expect(result.x).toBeCloseTo(0.7886751);
    expect(result.y).toBeCloseTo(1);
  });

  it('should return collision with wall above', () => {
    const origin = { x: 0.5, y: 0.5 };
    const angle = deg2rad(15);

    const result = getCollisions(origin, angle);
    expect(result.x).toBeCloseTo(1);
    expect(result.y).toBeCloseTo(0.6339746);
  });
});
