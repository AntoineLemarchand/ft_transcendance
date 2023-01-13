import { forwardRef, Module } from '@nestjs/common';
import { GameService } from './game.service';
import { UserModule } from '../user/user.module';
import { GameObjectRepository } from './game.currentGames.repository';
import { GameController } from './game.controller';

@Module({
  imports: [forwardRef(() => UserModule)],
  providers: [GameService, GameObjectRepository],
  controllers: [GameController],
})
export class GameModule {}
