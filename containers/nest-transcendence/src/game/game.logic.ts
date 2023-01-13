import { numbers } from 'pg-mem/types/datatypes';

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

export class MinimalPhysics {
  static calcNewAngle(incomingAngle: number, wallDirection: WallDirection) {
    let result = -incomingAngle + Math.PI;
    if (wallDirection == WallDirection.Horizontal) result += Math.PI;
    if (result < 0) result += 2 * Math.PI;
    if (result >= 2 * Math.PI) result -= 2 * Math.PI;
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
    if (
      Math.pow(result[0].x, 2) + Math.pow(result[0].y, 2) <=
      Math.pow(result[1].x, 2) + Math.pow(result[1].y, 2)
    )
      return result[0];
    return result[1];
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
  }

  getCoordinatesOfImpact() {
    return this.coordinates;
  }

  getTimeUntilImpact() {
    return this.time;
  }
}
