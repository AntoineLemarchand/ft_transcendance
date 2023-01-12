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

export function calcNewAngle(
  incomingAngle: number,
  wallDirection: WallDirection,
) {
  let result = -incomingAngle + Math.PI;
  if (wallDirection == WallDirection.Horizontal) result += Math.PI;
  if (result < 0) result += 2 * Math.PI;
  if (result >= 2 * Math.PI) result -= 2 * Math.PI;
  return result;
}

class Collision {
  constructor(
    public coordinates: { x: number; y: number },
    public time: number,
  ) {}
}

function getShortestDistanceToWall(
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

export function getCollisions(origin: { x: number; y: number }, angle: number) {
  const distances = getShortestDistanceToWall(origin, angle);
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

export function getArrival(
  origin: { x: number; y: number },
  angle: number,
  speed: number,
) {
  let x = 1 - origin.x;
  if (Math.cos(angle) < 0) x = 0;
  else x = 1;
  return new Collision({ x: x, y: origin.y }, 0);
}
