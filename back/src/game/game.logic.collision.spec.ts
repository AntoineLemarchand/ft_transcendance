import {
  deg2rad,
  rad2deg,
  WallDirection,
  MinimalPhysics,
  Collision,
} from './game.logic';
describe('calculate new angle', () => {
  it('should return the correct angle for wall on right, comming from below', () => {
    const incommingAngle = deg2rad(30);

    const result: number = MinimalPhysics.calcNewAngle(
      incommingAngle,
      WallDirection.Vertical,
    );

    expect(rad2deg(result)).toBeCloseTo(150);
  });

  it('should return the correct angle for wall on right, comming from above', () => {
    const incommingAngle = deg2rad(330);

    const result: number = MinimalPhysics.calcNewAngle(
      incommingAngle,
      WallDirection.Vertical,
    );

    expect(rad2deg(result)).toBeCloseTo(210);
  });

  it('should return the correct angle for wall on left, comming from below', () => {
    const incommingAngle = deg2rad(150);

    const result: number = MinimalPhysics.calcNewAngle(
      incommingAngle,
      WallDirection.Vertical,
    );

    expect(rad2deg(result)).toBeCloseTo(30);
  });

  it('should return the correct angle for wall on left, comming from above', () => {
    const incommingAngle = deg2rad(210);

    const result: number = MinimalPhysics.calcNewAngle(
      incommingAngle,
      WallDirection.Vertical,
    );

    expect(rad2deg(result)).toBeCloseTo(330);
  });

  it('should return the correct angle for wall above, comming from left', () => {
    const incommingAngle = deg2rad(30);

    const result: number = MinimalPhysics.calcNewAngle(
      incommingAngle,
      WallDirection.Horizontal,
    );

    expect(rad2deg(result)).toBeCloseTo(330);
  });

  it('should return the correct angle for wall above, comming from right', () => {
    const incommingAngle = deg2rad(150);

    const result: number = MinimalPhysics.calcNewAngle(
      incommingAngle,
      WallDirection.Horizontal,
    );

    expect(rad2deg(result)).toBeCloseTo(210);
  });

  it('should return the correct angle for wall below, comming from left', () => {
    const incommingAngle = deg2rad(330);

    const result: number = MinimalPhysics.calcNewAngle(
      incommingAngle,
      WallDirection.Horizontal,
    );

    expect(rad2deg(result)).toBeCloseTo(30);
  });

  it('should return the correct angle for wall below, comming from right', () => {
    const incommingAngle = deg2rad(210);

    const result: number = MinimalPhysics.calcNewAngle(
      incommingAngle,
      WallDirection.Horizontal,
    );

    expect(rad2deg(result)).toBeCloseTo(150);
  });
});

describe('calculating the point of collision', () => {
  it('should return a point on the right', () => {
    const origin = { x: 0, y: 0.5 };
    const angle = 0;
    const speed = 1;
    const collision = new Collision(origin, angle, speed);
    collision.update();

    const result = collision.getCoordinates();
    expect(result.x).toBeCloseTo(1);
    expect(result.y).toBeCloseTo(0.5);
  });

  it('should return a point on the left', () => {
    const origin = { x: 1, y: 0.5 };
    const angle = deg2rad(180);
    const speed = 1;
    const collision = new Collision(origin, angle, speed);
    collision.update();

    const result = collision.getCoordinates();
    expect(result.x).toBeCloseTo(0);
    expect(result.y).toBeCloseTo(0.5);
  });

  it('should return a point on the left from middle', () => {
    const origin = { x: 0.5, y: 0.5 };
    const angle = deg2rad(180);
    const speed = 1;
    const collision = new Collision(origin, angle, speed);
    collision.update();

    const result = collision.getCoordinates();
    expect(result.x).toBeCloseTo(0);
    expect(result.y).toBeCloseTo(0.5);
  });

  it('should return a point on the right from middle', () => {
    const origin = { x: 0.5, y: 0.5 };
    const angle = deg2rad(0);
    const speed = 1;
    const collision = new Collision(origin, angle, speed);
    collision.update();

    const result = collision.getCoordinates();
    expect(result.x).toBeCloseTo(1);
    expect(result.y).toBeCloseTo(0.5);
  });

  it('should return closest collision', () => {
    const origin = { x: 0.5, y: 0.5 };
    const angle = deg2rad(60);
    const speed = 1;
    const collision = new Collision(origin, angle, speed);
    collision.update();

    const result = collision.getCoordinates();
    expect(result.x).toBeCloseTo(0.7886751);
    expect(result.y).toBeCloseTo(1);
  });

  it('should return a point above the origin', () => {
    const origin = { x: 0.5, y: 0 };
    const angle = deg2rad(90);
    const speed = 1;
    const collision = new Collision(origin, angle, speed);
    collision.update();

    const result = collision.getCoordinates();
    expect(result.x).toBeCloseTo(0.5);
    expect(result.y).toBeCloseTo(1);
  });

  it('should return a point below the origin', () => {
    const origin = { x: 0.5, y: 1 };
    const angle = deg2rad(270);
    const speed = 1;
    const collision = new Collision(origin, angle, speed);
    collision.update();

    const result = collision.getCoordinates();
    expect(result.x).toBeCloseTo(0.5);
    expect(result.y).toBeCloseTo(0);
  });

  it('should return a point below the origin', () => {
    const origin = { x: 0.5, y: 0.5 };
    const angle = deg2rad(270);
    const speed = 1;
    const collision = new Collision(origin, angle, speed);
    collision.update();

    const result = collision.getCoordinates();
    expect(result.x).toBeCloseTo(0.5);
    expect(result.y).toBeCloseTo(0);
  });

  it('should return upper corner', () => {
    const origin = { x: 0.5, y: 0.5 };
    const angle = deg2rad(45);
    const speed = 1;
    const collision = new Collision(origin, angle, speed);
    collision.update();

    const result = collision.getCoordinates();
    expect(result.x).toBeCloseTo(1);
    expect(result.y).toBeCloseTo(1);
  });

  it('should return a point above the origin', () => {
    const origin = { x: 0.5, y: 0.5 };
    const angle = deg2rad(90);
    const speed = 1;
    const collision = new Collision(origin, angle, speed);
    collision.update();

    const result = collision.getCoordinates();
    expect(result.x).toBeCloseTo(0.5);
    expect(result.y).toBeCloseTo(1);
  });

  it('should return collision with wall above', () => {
    const origin = { x: 0.5, y: 0.5 };
    const angle = deg2rad(60);
    const speed = 1;
    const collision = new Collision(origin, angle, speed);
    collision.update();

    const result = collision.getCoordinates();
    expect(result.x).toBeCloseTo(0.7886751);
    expect(result.y).toBeCloseTo(1);
  });

  it('should return collision with wall above', () => {
    const origin = { x: 0.5, y: 0.5 };
    const angle = deg2rad(15);
    const speed = 1;
    const collision = new Collision(origin, angle, speed);
    collision.update();

    const result = collision.getCoordinates();
    expect(result.x).toBeCloseTo(1);
    expect(result.y).toBeCloseTo(0.6339746);
  });

  it('should work for consecutive calls', () => {
    const origin = { x: 0.5, y: 0.5 };
    const angle = Math.atan(0.5 / 0.25);
    const speed = 1;
    const collision = new Collision(origin, angle, speed);

    collision.update();

    let result = collision.getCoordinates();
    expect(result.x).toBeCloseTo(0.75);
    expect(result.y).toBeCloseTo(1);

    collision.update();

    result = collision.getCoordinates();
    expect(result.x).toBeCloseTo(1);
    expect(result.y).toBeCloseTo(0.5);

    collision.update();

    result = collision.getCoordinates();
    expect(result.x).toBeCloseTo(0.75);
    expect(result.y).toBeCloseTo(0);
  });
});

describe('calculating the time until the next collision', () => {
  it('should take one second to travel the distance one with the speed of one per second', function () {
    const origin = { x: 0, y: 0.5 };
    const angle = 0;
    const speed = 1;
    const collision = new Collision(origin, angle, speed);
    collision.update();

    const result = collision.getTimeUntilImpact();

    expect(result).toBeCloseTo(1);
  });

  it('should take half a second to travel the distance a half with the speed of one per second', function () {
    const origin = { x: 0.5, y: 0.5 };
    const angle = 0;
    const speed = 1;
    const collision = new Collision(origin, angle, speed);
    collision.update();

    const result = collision.getTimeUntilImpact();

    expect(result).toBeCloseTo(0.5);
  });

  it('should calculate the correct distance for a diagonal case', function () {
    const origin = { x: 0.5, y: 0.5 };
    const angle = deg2rad(45);
    const speed = 1;
    const collision = new Collision(origin, angle, speed);
    collision.update();

    const result = collision.getTimeUntilImpact();

    expect(result).toBeCloseTo(0.707107);
  });

  it('should calc an ETA of nearly zero', function () {
    const origin = { x: 0.5, y: 0.5 };
    const angle = deg2rad(45);
    const speed = 10000000000;
    const collision = new Collision(origin, angle, speed);
    collision.update();

    const result = collision.getTimeUntilImpact();

    expect(result).toBeCloseTo(0);
  });
});

describe('resetting a collision', () => {
  it('should put into the middle', function () {
    const origin = { x: 1, y: 1 };
    const angle = deg2rad(45);
    const speed = 1;
    const collision = new Collision(origin, angle, speed);

    collision.reset();

    expect(collision.getCoordinates()).toEqual({ x: 0.5, y: 0.5 });
  });
});
