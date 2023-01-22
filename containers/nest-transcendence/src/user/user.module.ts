import { forwardRef, Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { User } from './user.entities';
import { ChannelModule } from '../channel/channel.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BroadcastingModule } from '../broadcasting/broadcasting.module';
import { GameModule } from '../game/game.module';

@Module({
  controllers: [UserController],
  imports: [
    forwardRef(() => ChannelModule),
    forwardRef(() => GameModule),
    TypeOrmModule.forFeature([User]),
    forwardRef(() => BroadcastingModule),
  ],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
