import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { forwardRef, Inject, UseGuards } from '@nestjs/common';
import { WsGuard } from '../auth/websocket.auth.guard';
import { Message } from '../channel/channel.entities';
import { ChannelService } from '../channel/channel.service';
import { RoomHandler } from './broadcasting.roomHandler';
import { UserService } from '../user/user.service';
import { environment } from '../utils/environmentParser';
import { GameInput, GameObject } from '../game/game.entities';
import { GameService } from '../game/game.service';

//todo: is cors * a security concern in our case?
@WebSocketGateway(8001, {
  cors: {
    origin: ['http://' + environment.SERVER_URL, 'http://localhost'],
    credentials: true,
  },
})
export class BroadcastingGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
  @WebSocketServer()
  server: Server;
  private roomHandler: RoomHandler;

  constructor(
    @Inject(forwardRef(() => ChannelService))
    private channelService: ChannelService,
    @Inject(forwardRef(() => UserService))
    private userService: UserService,
    @Inject(forwardRef(() => GameService))
    private gameService: GameService,
  ) {
    this.roomHandler = new RoomHandler(this.server);
  }

  @UseGuards(WsGuard)
  @SubscribeMessage('messageToServer')
  handleMessage(client: Socket, data: string): void {
    let message: Message;
    try {
      message = JSON.parse(data);
      message.sender = this.getUsernameFromToken(client);
      this.channelService.sendMessage(message);
    } catch (e) {
      console.log('message to server erroneous');
    }
  }

  @UseGuards(WsGuard)
  @SubscribeMessage('gameUpdateToServer')
  handleGameInput(client: Socket, data: string): void {
    let input: GameInput;
    try {
      input = JSON.parse(data);
      input.username = this.getUsernameFromToken(client);
      this.gameService.processUserInput(input);
    } catch (e) {
      console.log('message to server erroneous');
    }
  }

  emitMessage(roomName: string, message: Message) {
    this.server.in(roomName).emit('messageToClient', JSON.stringify(message));
  }

  emitGameUpdate(roomName: string, update: GameObject) {
    this.server.in(roomName).emit('gameUpdateToClient', JSON.stringify(update));
  }

  emitMatchMade(player1name: string, player2name: string) {
    this.server
      .in('_waiting_room_')
      .emit('emitMatchMadeToClient', [player1name, player2name]);
  }

  async handleConnection(client: Socket) {
    const username = this.getUsernameFromToken(client);
    const roomNames: string[] = (await (
      await this.userService.getUser(username)
    )?.getChannelNames()) as string[];
    const runningGame = this.gameService.getRunningGameForUser(username);
    if (runningGame)
      roomNames.push(runningGame.getId().toString());
    this.roomHandler.addUserInstance(username, client.id, roomNames);
  }

  async handleDisconnect(client: Socket) {
    const username = this.getUsernameFromToken(client);
    const roomNames: string[] = (await (
      await this.userService.getUser(username)
    )?.getChannelNames()) as string[];
    const runningGame = this.gameService.getRunningGameForUser(username);
    if (runningGame)
      roomNames.push(runningGame.getId().toString());
    this.roomHandler.removeUserInstance(username, client.id, roomNames);
  }

  async putUserInRoom(username: string, roomName: string) {
    await this.roomHandler.join(username, roomName);
  }

  async removeUserFromRoom(username: string, roomName: string) {
    await this.roomHandler.leave(username, roomName);
  }

  private getUsernameFromToken(client: Socket) {
    try {
      return JSON.parse(
        atob((client.handshake.query.auth as string).split('.')[1]),
      ).user.name;
    } catch (e) {
      console.log('not properly encoded token');
    }
  }

  afterInit(server: any): any {
    this.roomHandler = new RoomHandler(this.server);
  }

  getRoomHandler() {
    return this.roomHandler;
  }
}
