import { Server, Socket } from 'socket.io';

export class RoomHandler {
  constructor(public server: Server) {}

  instanceMap = new Map<string, string[]>();

  addUserInstance(
    username: string,
    deviceId: string,
    registeredRooms?: string[],
  ) {
    const deviceIds: string[] = this.getDeviceIdsFor(username);
    this.instanceMap.set(username, [...deviceIds, deviceId]);
    if (registeredRooms)
      for (const roomName of registeredRooms) {
        this.join(username, roomName);
      }
  }

  getUserInstances(username: string): string[] {
    return this.getDeviceIdsFor(username);
  }

  removeUserInstance(
    username: string,
    deviceId: string,
    roomNames?: string[],
  ) {
    let deviceIds: string[] = this.getDeviceIdsFor(username);
    deviceIds = deviceIds.filter((element) => element != deviceId);
    if (deviceIds.length == 0) this.instanceMap.delete(username);
    else this.instanceMap.set(username, deviceIds);
    if (roomNames)
      for (const roomName of roomNames) {
        this.leave(username, roomName);
      }
  }

  private getDeviceIdsFor(username: string) {
    let deviceIds: string[] = [];
    if (this.instanceMap.has(username))
      deviceIds = this.instanceMap.get(username) as string[];
    return deviceIds;
  }

  async join(username: string, roomName: string) {
    const deviceIds = this.instanceMap.get(username) as string[];
    for (const deviceId of deviceIds)
      (this.server.sockets.sockets.get(deviceId) as Socket).join(roomName);
  }

  leave(username: string, roomName: string) {
    const deviceIds = this.getDeviceIdsFor(username);
    for (const deviceId of deviceIds)
      (this.server.sockets.sockets.get(deviceId) as Socket).leave(roomName);
  }
}