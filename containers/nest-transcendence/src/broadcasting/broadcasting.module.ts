import { forwardRef, Module } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { ChannelModule } from '../channel/channel.module';
import { AuthModule } from '../auth/auth.module';
import { GameModule } from '../game/game.module';
import {BroadcastingGateway} from "./broadcasting.gateway";

@Module({
  imports: [
    forwardRef(() => UserModule),
    forwardRef(() => ChannelModule),
    forwardRef(() => AuthModule),
    forwardRef(() => GameModule),
  ],
  providers: [BroadcastingGateway],
  exports: [BroadcastingGateway],
})
export class BroadcastingModule {}
