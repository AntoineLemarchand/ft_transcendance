import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { WsGuard } from '../auth/websocket.auth.guard';
import { Message } from '../channel/channel.entities';

//todo: is cors * a security concern in our case?
@WebSocketGateway(8001, {
  cors: {
    origin: 'http://localhost:3001',
    credentials: true,
  },
})
export class BroadcastingGateway {
  @WebSocketServer()
  server: Server;

  //todo: call database layer and store messages
  //todo: invoke guard to check valid token
  @UseGuards(WsGuard)
  @SubscribeMessage('messageToServer')
  handleMessage(client: Socket, data: string): void {
    const message: Message = JSON.parse(data);
    console.log(
      'Received :>' +
        message.content +
        '< from: >' +
        message.sender +
        '< for channel: ' +
        message.channel,
    );
    this.emitMessage('messageToClient', message);
  }

  //todo: find syntax to differentiate between messages and game states etc
  emitMessage(eventName: string, message: Message) {
    this.server.emit(eventName, JSON.stringify(message));
    // this.server.in('test').emit(eventName, JSON.stringify(message));
  }
}
