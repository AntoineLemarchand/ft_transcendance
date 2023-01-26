export function isAlmostEqual(v1: number, v2: number, epsilon = 0.0005) {
  if (epsilon == null) {
    epsilon = 0.00001;
  }
  return Math.abs(v1 - v2) < epsilon;
}

export enum WallDirection {
  Vertical,
  Horizontal,
}

export function deg2rad(degrees: number) {
  const pi = Math.PI;
  return degrees * (pi / 180);
}

export function rad2deg(degrees: number) {
  const pi = Math.PI;
  return degrees * (180 / pi);
}

function randomIntFromInterval(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function normalizeAngle(result: number) {
  while (result < 0) result += 2 * Math.PI;
  while (result >= 2 * Math.PI) result -= 2 * Math.PI;
  return result;
}

export class MinimalPhysics {
  static calcNewAngle(incomingAngle: number, wallDirection: WallDirection) {
    let result = -incomingAngle + Math.PI;
    if (wallDirection == WallDirection.Horizontal) result += Math.PI;
    result = normalizeAngle(result);
    return result;
  }

  static getShortestDistanceToWall(
    origin: { x: number; y: number },
    angle: number,
  ) {
    const distances = { x: Infinity, y: Infinity };
    if (Math.cos(angle) != 0) {
      distances.x = Math.cos(angle) < 0 ? -origin.x : 1 - origin.x;
    }
    if (Math.sin(angle) != 0) {
      distances.y = Math.sin(angle) < 0 ? -origin.y : 1 - origin.y;
    }
    return distances;
  }

  static calcCollisionCoordinates(
    origin: { x: number; y: number },
    angle: number,
  ) {
    const distances = MinimalPhysics.getShortestDistanceToWall(origin, angle);
    const result: { x: number; y: number }[] = [];
    if (Math.cos(angle) != 0) {
      result.push({
        x: distances.x + origin.x,
        y: distances.x * Math.tan(angle) + origin.y,
      });
    }
    if (Math.sin(angle) != 0) {
      result.push({
        x: distances.y / Math.tan(angle) + origin.x,
        y: distances.y + origin.y,
      });
    }
    if (result.length === 1) return result[0];
    if (MinimalPhysics.isCoordinateOutsideBoundaries(result[0]))
      return result[1];
    if (MinimalPhysics.isCoordinateOutsideBoundaries(result[1]))
      return result[0];
    if (
      Math.pow(result[0].x, 2) + Math.pow(result[0].y, 2) <=
      Math.pow(result[1].x, 2) + Math.pow(result[1].y, 2)
    )
      return result[0];
    return result[1];
  }
  private static isCoordinateOutsideBoundaries(input: { x: number; y: number }){
    return input.y > 1 || input.x > 1 || input.y < 0 || input.x < 0;
  }

  static getTimeOfCollision(
    origin: { x: number; y: number },
    collision: { x: number; y: number },
    angle: number,
    speed: number,
  ) {
    const distance = Math.sqrt(
      Math.pow(origin.x - collision.x, 2) + Math.pow(origin.y - collision.y, 2),
    );
    return distance / speed;
  }
}

export class PlayerBar {
  movement: { startTimeStamp: number; direction: number };

  constructor(
    private position = { x: 0, y: 0.5 },
    private speed = 0.75,
    private barHeight: number = 0.2,
  ) {
    this.movement = { startTimeStamp: 0, direction: 0 };
  }

  startMoving(timeStamp: number, direction: number) {
    this.movement = { startTimeStamp: timeStamp, direction: direction };
  }

  getPositionAtT(timeStamp: number) {
    const result = {
      x: this.position.x,
      y:
        this.position.y +
        ((this.movement.direction *
          (timeStamp - this.movement.startTimeStamp)) /
          1000) *
          this.speed,
    };
    if (result.y < this.barHeight / 2) result.y = this.barHeight / 2;
    if (result.y > 1 - this.barHeight / 2) result.y = 1 - this.barHeight / 2;
    return result;
  }

  stopMoving(timeStamp: number) {
    this.position = { x: this.position.x, y: this.getPositionAtT(timeStamp).y };
    this.movement.direction = 0;
  }

  isContact(point: { x: number; y: number }) {
    if (this.position.y - this.barHeight / 2 > point.y) return false;
    if (this.position.y + this.barHeight / 2 < point.y) return false;
    return true;
  }
}

export class Collision {
  time = 0;
  constructor(
    private coordinates: { x: number; y: number },
    private angle: number,
    private speed: number,
  ) {}

  update() {
    const oldCoordinates = this.coordinates;
    this.coordinates = MinimalPhysics.calcCollisionCoordinates(
      this.coordinates,
      this.angle,
    );
    this.time = MinimalPhysics.getTimeOfCollision(
      oldCoordinates,
      this.coordinates,
      this.angle,
      this.speed,
    );
    if (this.coordinates.y === 1 || this.coordinates.y === 0)
      this.angle = MinimalPhysics.calcNewAngle(
        this.angle,
        WallDirection.Horizontal,
      );
    if (this.coordinates.x === 1 || this.coordinates.x === 0)
      this.angle = MinimalPhysics.calcNewAngle(
        this.angle,
        WallDirection.Vertical,
      );
  }

  getCoordinates() {
    return this.coordinates;
  }

  getTimeUntilImpact() {
    return this.time;
  }

  reset() {
    this.coordinates = { x: 0.5, y: 0.5 };
    this.angle = deg2rad(randomIntFromInterval(15, 45));
    if (randomIntFromInterval(0, 1)) this.angle *= -1;
    if (randomIntFromInterval(0, 1)) this.angle += Math.PI;
    this.angle = normalizeAngle(this.angle);
    this.time = 0;
  }

  isReset() {
    return this.coordinates.x === 0.5 && this.coordinates.y === 0.5;
  }
}
