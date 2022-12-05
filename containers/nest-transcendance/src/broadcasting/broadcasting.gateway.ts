import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import {JwtAuthGuard} from "../auth/jwt.auth.guard";
import {UseGuards} from "@nestjs/common";
import {WsGuard} from "../auth/websocket.auth.guard";

//todo: how to prevent duplication with react?
export class Message {
  sender: string;
  content: string;
  channel: string;
  constructor() {
    this.sender = '';
    this.channel = '';
    this.content = '';
  }
}

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
  handleMessage(client: any, payload: string): void {
    const message: Message = JSON.parse(payload);
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

  emitMessage(eventName: string, message: Message) {
    this.server.emit(eventName, JSON.stringify(message));
  }
}
