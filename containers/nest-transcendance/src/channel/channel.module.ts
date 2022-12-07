import { Module } from '@nestjs/common';
import { ChannelService } from './channel.service';
import { Message } from './channel.entities';
import { ChannelRepository } from './channel.repository.mock';
import { ChannelController } from './channel.controller';
import { BroadcastingGateway } from '../broadcasting/broadcasting.gateway';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [Message, AuthModule, UserModule],
  providers: [ChannelService, ChannelRepository, BroadcastingGateway],
  exports: [ChannelService, Message],
  controllers: [ChannelController],
})
export class ChannelModule {}
