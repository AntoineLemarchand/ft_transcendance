import { forwardRef, Module } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { ChannelModule } from '../channel/channel.module';
import { AuthModule } from '../auth/auth.module';
import { GameModule } from '../game/game.module';
import { BroadcastingGateway } from './broadcasting.gateway';
import { RoomHandler } from './broadcasting.roomHandler';
import { Server } from "socket.io";

@Module({
  imports: [
    forwardRef(() => UserModule),
    forwardRef(() => ChannelModule),
    forwardRef(() => AuthModule),
    forwardRef(() => GameModule),
  ],
  providers: [BroadcastingGateway, RoomHandler, Server],
  exports: [BroadcastingGateway, RoomHandler],
})
export class BroadcastingModule {}
