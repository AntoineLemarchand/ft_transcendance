import { RoomHandler } from './broadcasting.roomHandler';
import { Server, Socket } from 'socket.io';

jest.mock('socket.io', () => {
  return {
    Socket: jest.fn().mockImplementation(() => {
      return {
        join: jest.fn().mockImplementation((deviceId: string) => {
          console.log('banbna');
        }),
        Socket: () => {
          console.log('banbna');
        },
      };
    }),
    Server: jest.fn().mockImplementation(() => {
      return {
        in: (l: string) => {
          console.log('banbna');
        },
        // @ts-ignore
        sockets: { sockets: new Map<string, Socket>([['defaultDeviceId', new Socket()]]) },
      };
    }),
  };
});

describe('Connecting to a room', () => {
  it('should add the deviceId to the map', () => {
    const handler = new RoomHandler(new Server({}));

    handler.addUserInstance('username', 'deviceId0');

    const result = handler.getUserInstances('username');
    expect(result[0]).toBe('deviceId0');
  });

  it('should call the server to let the deviceIds join the room', () => {
    const d = new Server();
    const handler = new RoomHandler(d);

    handler.addUserInstance('username', 'defaultDeviceId');

    expect((handler.server.sockets.sockets.get('defaultDeviceId') as Socket).join).toHaveBeenCalled();
  });

  it('should add the deviceId to the map without overriding the other device ids', () => {
    const handler = new RoomHandler(new Server({}));
    handler.addUserInstance('username', 'deviceId0');

    handler.addUserInstance('username', 'deviceId1');

    const result = handler.getUserInstances('username');
    expect(result[0]).toBe('deviceId0');
    expect(result[1]).toBe('deviceId1');
  });

  it('should return an empty list when not found', () => {
    const handler = new RoomHandler(new Server({}));

    const result = handler.getUserInstances('non existing user name');

    expect(result.length).toBe(0);
  });
});

describe('Removing from room', () => {
  it('should remove the specified deviceId', () => {
    const handler = new RoomHandler(new Server({}));
    handler.addUserInstance('username', 'deviceId0');
    handler.addUserInstance('username', 'deviceId1');

    handler.removeUserInstance('username', 'deviceId1');

    const result = handler.getUserInstances('username');
    expect(result[0]).toBe('deviceId0');
    expect(result.length).toBe(1);
  });
});
