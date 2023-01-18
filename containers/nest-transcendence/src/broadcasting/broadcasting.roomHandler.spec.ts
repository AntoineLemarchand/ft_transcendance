import { RoomHandler } from './broadcasting.roomHandler';
import { Server, Socket } from 'socket.io';

jest.mock('socket.io', () => {
  return {
    Socket: jest.fn().mockImplementation(() => {
      return {
        join: jest.fn().mockImplementation((username: string) => {}),
        leave: jest.fn().mockImplementation((deviceId: string) => {}),
      };
    }),
    Server: jest.fn().mockImplementation(() => {
      return {
        sockets: {
          sockets: new Map<string, Socket>([
            // @ts-ignore
            ['defaultDeviceId', new Socket()],
            // @ts-ignore
            ['deviceId0', new Socket()],
            // @ts-ignore
            ['deviceId1', new Socket()],
          ]),
        },
      };
    }),
  };
});

describe('Connecting a new device', () => {
  it('should add the deviceId to the map', () => {
    const handler = new RoomHandler(new Server({}));

    handler.addUserInstance('username', 'deviceId0');

    const result = handler.getUserInstances('username');
    expect(result[0]).toBe('deviceId0');
  });

  it('should add the deviceId to the map without overriding the other device ids', () => {
    const handler = new RoomHandler(new Server({}));
    handler.addUserInstance('username', 'deviceId0');

    handler.addUserInstance('username', 'deviceId1');

    const result = handler.getUserInstances('username');
    expect(result[0]).toBe('deviceId0');
    expect(result[1]).toBe('deviceId1');
  });

  it('should join the new deviceId to all the given rooms', () => {
    const handler = new RoomHandler(new Server({}));
    const spy = jest.spyOn(handler, 'join');

    handler.addUserInstance('username', 'deviceId0', [
      'roomName1',
      'roomName2',
      'roomName3',
    ]);

    expect(spy.mock.calls).toEqual([
      ['username', 'roomName1'],
      ['username', 'roomName2'],
      ['username', 'roomName3'],
    ]);
  });

  it('should return an empty list when not found', () => {
    const handler = new RoomHandler(new Server({}));

    const result = handler.getUserInstances('non existing user name');

    expect(result.length).toBe(0);
  });
});

describe('Joining a room', () => {
  it('should call the server to let the deviceIds join the room', async () => {
    const handler = new RoomHandler(new Server());
    handler.addUserInstance('username', 'deviceId0');
    handler.addUserInstance('username', 'deviceId1');

    handler.join('username', 'roomName');

    expect(
      (handler.server.sockets.sockets.get('deviceId0') as Socket).join,
    ).toHaveBeenCalledWith('roomName');
    expect(
      (handler.server.sockets.sockets.get('deviceId1') as Socket).join,
    ).toHaveBeenCalledWith('roomName');
  });
});

describe('Removing deviceId', () => {
  it('should remove the specified deviceId from all rooms', async () => {
    const handler = new RoomHandler(new Server({}));
    const spy = jest.spyOn(handler, 'leave');
    handler.addUserInstance('username', 'deviceId0');
    handler.addUserInstance('username', 'deviceId1');

    handler.removeUserInstance('username', 'deviceId1', [
      'roomName1',
      'roomName2',
    ]);

    const result = handler.getUserInstances('username');
    expect(result[0]).toBe('deviceId0');
    expect(result.length).toBe(1);
    expect(spy.mock.calls).toEqual([
      ['username', 'roomName1'],
      ['username', 'roomName2'],
    ]);
  });
});

describe('Removing from room', () => {
  it('should call leave on removing deviceId', async () => {
    const handler = new RoomHandler(new Server());
    handler.addUserInstance('username', 'deviceId0');
    handler.addUserInstance('username', 'deviceId1');

    handler.leave('username', 'roomName');

    expect(
      (handler.server.sockets.sockets.get('deviceId1') as Socket).leave,
    ).toHaveBeenCalledWith('roomName');
  });
  it('should do nothing if calling leave on an offline device', async () => {
    const handler = new RoomHandler(new Server());

    handler.leave('non existing user name', 'non existing room');
  });
});

describe('Derriving user log status from connections', () => {
  it('should return false for offline user', function () {
    const handler = new RoomHandler(new Server());
    handler.addUserInstance('username', '');
    handler.removeUserInstance('username', '');

    expect(handler.isUserOnline('username')).toBeFalsy();
  });

  it('should return false for offline user', function () {
    const handler = new RoomHandler(new Server());
    handler.addUserInstance('username', '');

    expect(handler.isUserOnline('username')).toBeTruthy();
  });
});
