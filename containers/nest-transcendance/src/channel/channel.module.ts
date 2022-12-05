import { Module } from '@nestjs/common';
import { ChannelService } from './channel.service';
import { Message } from './channel.entities';

@Module({
  imports: [Message],
  providers: [ChannelService],
  exports: [ChannelService, Message],
})
export class ChannelModule {}
