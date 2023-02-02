import { forwardRef, Module } from '@nestjs/common';
import { ChannelService } from './channel.service';
import { Channel, Message } from './channel.entities';
import { ChannelController } from './channel.controller';
import { BroadcastingGateway } from '../broadcasting/broadcasting.gateway';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../user/user.module';
import { BroadcastingModule } from '../broadcasting/broadcasting.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/user.entities';
import {GameModule} from '../game/game.module';
import {GameService} from '../game/game.service';

@Module({
  imports: [
    Message,
    forwardRef(() => AuthModule),
    forwardRef(() => UserModule),
    forwardRef(() => BroadcastingModule),
    TypeOrmModule.forFeature([Channel]),
  ],
  providers: [ChannelService],
  exports: [ChannelService, Message],
  controllers: [ChannelController],
})
export class ChannelModule {}
