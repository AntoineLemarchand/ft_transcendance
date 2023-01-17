import { forwardRef, Module } from '@nestjs/common';
import { GameService } from './game.service';
import { UserModule } from '../user/user.module';
import { GameObjectRepository } from './game.currentGames.repository';
import { GameController } from './game.controller';
import { BroadcastingModule } from '../broadcasting/broadcasting.module';
import { BroadcastingGateway } from '../broadcasting/broadcasting.gateway';
import { ChannelModule } from '../channel/channel.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    forwardRef(() => UserModule),
    forwardRef(() => AuthModule),
    forwardRef(() => BroadcastingModule),
    forwardRef(() => ChannelModule),
  ],
  providers: [GameService, GameObjectRepository],
  controllers: [GameController],
  exports: [GameObjectRepository, GameService],
})
export class GameModule {}
