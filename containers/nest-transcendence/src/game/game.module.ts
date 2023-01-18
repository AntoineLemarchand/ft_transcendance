import { forwardRef, Module } from '@nestjs/common';
import { GameService } from './game.service';
import { GameStat } from './game.entities';
import { UserModule } from '../user/user.module';
import { GameObjectRepository } from './game.currentGames.repository';
import { GameController } from './game.controller';
import { BroadcastingModule } from '../broadcasting/broadcasting.module';
import { BroadcastingGateway } from '../broadcasting/broadcasting.gateway';
import { ChannelModule } from '../channel/channel.module';
import { AuthModule } from '../auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    forwardRef(() => UserModule),
    forwardRef(() => AuthModule),
    forwardRef(() => BroadcastingModule),
    TypeOrmModule.forFeature([GameStat]),
  ],
  providers: [GameService, GameObjectRepository],
  controllers: [GameController],
  exports: [GameObjectRepository, GameService],
})
export class GameModule {}
